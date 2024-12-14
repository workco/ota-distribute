import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

export interface GenerateFile {
  output: string;
  content: string;
}

export type Options = GenerateFile | GenerateFile[];

let distPath: string;
const generateFileMap = new Map<string, GenerateFile>();

function normalizeOption(option: GenerateFile): GenerateFile {
  return {
    output: option.output,
    content: option.content,
  };
}

function generateFile(option: GenerateFile): void {
  const filePath = resolve(distPath, option.output);
  ensureDirectoryExistence(filePath);
  writeFileSync(filePath, option.content, { flag: "w" });
}

function PluginGenerateFile(options: Options): Plugin {
  return {
    name: "vite-plugin-generate-file",
    configResolved(resolvedConfig: ResolvedConfig) {
      distPath = resolve(resolvedConfig.root, resolvedConfig.build.outDir);

      if (Array.isArray(options)) {
        options.forEach((option) => {
          const normalizedOption = normalizeOption(option);
          generateFileMap.set(normalizedOption.output, normalizedOption);
        });
      } else {
        const normalizedOption = normalizeOption(options);
        generateFileMap.set(normalizedOption.output, normalizedOption);
      }
    },
    closeBundle() {
      if (this.meta.watchMode) {
        return;
      }
      for (const option of generateFileMap.values()) {
        generateFile(option);
      }
    },
  };
}

export default PluginGenerateFile;

function ensureDirectoryExistence(filePath: string): void {
  const dn = dirname(filePath);
  if (existsSync(dn)) {
    return;
  }
  ensureDirectoryExistence(dn);
  mkdirSync(dn);
}
