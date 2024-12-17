import { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { S3SyncClient } from "s3-sync-client";
import mime from "mime-types";
import urlJoin from "url-join";
import { Copier } from "./index.js";

interface S3CopierOptions {
  baseUrl?: string;
  destinationFolder: string;
  bucket?: string;
  region?: string;
}

export const createS3Copier = ({
  baseUrl: inputBaseUrl,
  destinationFolder,
  bucket,
  region,
}: S3CopierOptions): Copier => {
  if (!bucket) {
    throw new Error("bucket is required for the S3 destination");
  }

  if (!region) {
    throw new Error("region is required for the S3 destination");
  }

  const baseUrl = urlJoin(
    inputBaseUrl ?? `https://${bucket}.s3.${region}.amazonaws.com`,
    destinationFolder,
  );

  const client = new S3Client({ region });
  const { sync } = new S3SyncClient({ client });

  return {
    baseUrl,
    copy: async (dir: string) =>
      <void>(
        (<unknown>(
          await sync(dir, urlJoin("s3:///", bucket, destinationFolder), {
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
          })
        ))
      ),
  };
};
