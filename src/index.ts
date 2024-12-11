import { Command } from "@commander-js/extra-typings";
import packageJson from "../package.json";
import { parseAppInfo } from "./lib/app-info.js";
import { buildSite } from "./lib/site/index.js";
import { mkdir } from "fs/promises";

const program = new Command()
  .name(packageJson.name)
  .version(packageJson.version)
  .argument("<path>", "Path to the .ipa or .apk file to distribute")
  .requiredOption("-o, --out-dir <path>", "Output directory")
  .action(async (path, { outDir }) => {
    const info = await parseAppInfo(path);
    // Create the output directory if it does not exist
    await mkdir(outDir, { recursive: true });

    await buildSite({ outDir, info, ipaOrApkPath: path });
  });

program.parse(process.argv);
