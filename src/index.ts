import { Command, Option } from "@commander-js/extra-typings";
import packageJson from "../package.json" assert { type: "json" };
import { parseAppInfo } from "./lib/app-info.js";
import { buildSite } from "./lib/site/index.js";
import { withDir } from "tmp-promise";
import { createS3Copier } from "./lib/copy/s3.js";
import { Copier } from "./lib/copy/index.js";

const program = new Command()
  .name(packageJson.name)
  .version(packageJson.version)
  .argument("<path>", "Path to the .ipa or .apk file to distribute")
  .addOption(
    new Option(
      "-d, --destination <destination>",
      "Destination for the built website",
    )
      .choices(["s3"] as const)
      .makeOptionMandatory(),
  )
  .action(async (path, { destination }) => {
    const info = await parseAppInfo(path);

    const { baseUrl, copy }: Copier = (() => {
      switch (destination) {
        case "s3":
          return createS3Copier(info.id);
      }
    })();

    await withDir(
      async ({ path: outDir }) => {
        await buildSite({ outDir, info, ipaOrApkPath: path, baseUrl });
        await copy(outDir);
      },
      {
        unsafeCleanup: true,
      },
    );
  });

program.parse(process.argv);
