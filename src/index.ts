import { Command, Option } from "@commander-js/extra-typings";
import packageJson from "../package.json" assert { type: "json" };
import { parseAppInfo } from "./lib/app-info.js";
import { buildSite } from "./lib/site/index.js";
import { withDir } from "tmp-promise";
import { createS3Copier } from "./lib/copy/s3.js";
import { Copier } from "./lib/copy/index.js";
import { createFolderCopier } from "./lib/copy/folder.js";
import { logProgress } from "./lib/terminal.js";
import kleur from "kleur";

const program = new Command()
  .name(packageJson.name)
  .version(packageJson.version)
  .argument("<path>", "Path to the .ipa or .apk file to distribute")
  .addOption(
    new Option(
      "-d, --destination <destination>",
      "Destination for the built website",
    )
      .choices(["s3", "folder"] as const)
      .makeOptionMandatory(),
  )
  .action(async (path, { destination }) => {
    const info = await logProgress("Parsing build archive", parseAppInfo(path));
    console.log(
      `➤ Detected ${kleur.bold().blue(info.type)} app: ${kleur.bold().green(info.name)} ${kleur.gray(`(${info.id})`)}`,
    );

    const { baseUrl, copy }: Copier = (() => {
      switch (destination) {
        case "s3":
          return createS3Copier(info.id);
        case "folder":
          return createFolderCopier();
      }
    })();

    await withDir(
      async ({ path: outDir }) => {
        await logProgress(
          "Building static site",
          buildSite({
            outDir,
            info,
            ipaOrApkPath: path,
            baseUrl,
          }),
        );
        console.log(
          `➤ Built static site to temp folder: ${kleur.gray(outDir)}`,
        );

        await logProgress(`Copying site to ${destination}`, copy(outDir));
        console.log(
          `➤ ${kleur.bold().green("Success!")} Visit ${kleur.blue(baseUrl)}`,
        );
      },
      {
        unsafeCleanup: true,
      },
    );
  });

program.parse(process.argv);
