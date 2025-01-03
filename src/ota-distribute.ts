#!/usr/bin/env node

import { Command, Option } from "@commander-js/extra-typings";
import { parseAppInfo } from "./lib/app-info.js";
import { buildSite } from "./lib/site/index.js";
import { withDir } from "tmp-promise";
import { createS3Copier } from "./lib/copy/s3.js";
import { Copier } from "./lib/copy/index.js";
import { createFolderCopier } from "./lib/copy/folder.js";
import { logProgress } from "./lib/terminal.js";
import kleur from "kleur";

const program = new Command()
  .name("ota-distribute")
  .description(`© ${new Date().getFullYear()} Work & Co. All rights reserved.`)
  .argument("<path>", "Path to the .ipa or .apk file to distribute")
  .addOption(
    new Option(
      "-d, --destination <destination>",
      "Destination for the built website",
    )
      .choices(["s3", "folder"] as const)
      .makeOptionMandatory(),
  )
  .option("-b, --base-url <baseUrl>", "Base URL for the website")
  .option("-o, --out-dir <outDir>", "Output directory for the built website")
  .option("-ab, --aws-bucket <bucket>", "S3 bucket name")
  .addOption(
    new Option(
      "-ar, --aws-region <awsRegion>",
      "AWS region for the S3 bucket",
    ).env("AWS_REGION"),
  )
  .action(
    async (
      path,
      { destination, baseUrl: inputBaseUrl, outDir, awsBucket, awsRegion },
    ) => {
      const info = await logProgress(
        "Parsing build archive",
        parseAppInfo(path),
      );
      console.log(
        `➤ Detected ${kleur.bold().blue(info.type)} app: ${kleur.bold().green(info.name)} ${kleur.gray(`(${info.id})`)}`,
      );

      const { baseUrl, copy }: Copier = (() => {
        switch (destination) {
          case "s3":
            return createS3Copier({
              destinationFolder: info.id,
              baseUrl: inputBaseUrl,
              bucket: awsBucket,
              region: awsRegion,
            });
          case "folder":
            return createFolderCopier({
              baseUrl: inputBaseUrl,
              outDir,
            });
        }
      })();

      if (!baseUrl) {
        throw new Error(
          "-b / --base-url is required for the chosen destination",
        );
      }

      await withDir(
        async ({ path: temporaryBuildPath }) => {
          await logProgress(
            "Building static site",
            buildSite({
              outDir: temporaryBuildPath,
              info,
              ipaOrApkPath: path,
              baseUrl,
            }),
          );
          console.log(
            `➤ Built static site to temp folder: ${kleur.gray(temporaryBuildPath)}`,
          );

          await logProgress(
            `Copying site to ${destination}`,
            copy(temporaryBuildPath),
          );
          console.log(
            `➤ ${kleur.bold().green("Success!")} Visit ${kleur.blue(baseUrl)}`,
          );
        },
        {
          unsafeCleanup: true,
        },
      );
    },
  );

program.parse(process.argv);
