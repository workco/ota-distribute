import { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { S3SyncClient } from "s3-sync-client";
import { getEnvRequired } from "../env.js";
import mime from "mime-types";
import urlJoin from "url-join";
import { Copier } from "./index.js";

interface S3CopierOptions {
  baseUrl?: string;
  destinationFolder: string;
}

export const createS3Copier = ({
  baseUrl: inputBaseUrl,
  destinationFolder,
}: S3CopierOptions): Copier => {
  const bucket = getEnvRequired("S3_BUCKET");
  const region = getEnvRequired("AWS_REGION");
  const baseUrl = urlJoin(
    inputBaseUrl ?? `https://${bucket}.s3.${region}.amazonaws.com`,
    destinationFolder,
  );

  const client = new S3Client();
  const { sync } = new S3SyncClient({ client });

  return {
    baseUrl,
    copy: async (dir: string) =>
      <void>(
        (<unknown>(
          await sync(
            dir,
            urlJoin("s3:///", getEnvRequired("S3_BUCKET"), destinationFolder),
            {
              del: true,
              deleteExcluded: true,
              commandInput: (
                syncCommandInput: Partial<PutObjectCommandInput>,
              ) => ({
                ...syncCommandInput,
                ContentType: syncCommandInput.Key
                  ? mime.lookup(syncCommandInput.Key) || undefined
                  : undefined,
              }),
            },
          )
        ))
      ),
  };
};
