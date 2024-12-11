import { S3Client } from "@aws-sdk/client-s3";
import { S3SyncClient } from "s3-sync-client";
import { getEnvRequired } from "../env.js";
import urlJoin from "url-join";

export const createS3Copier = (destinationFolder: string) => {
  const bucket = getEnvRequired("S3_BUCKET");
  const region = getEnvRequired("AWS_REGION");
  const baseUrl = urlJoin(
    `https://${bucket}.s3-website-${region}.amazonaws.com`,
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
            },
          )
        ))
      ),
  };
};
