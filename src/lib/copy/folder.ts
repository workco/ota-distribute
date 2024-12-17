import { Copier } from "./index.js";
import fs from "node:fs/promises";

interface FolderCopierOptions {
  baseUrl?: string;
  outDir?: string;
}

export const createFolderCopier = ({
  baseUrl,
  outDir,
}: FolderCopierOptions): Copier => ({
  baseUrl,
  copy: async (dir) => {
    if (!outDir) {
      throw new Error("outDir is required for the folder destination");
    }
    await fs.rm(outDir, { recursive: true, force: true });
    await fs.mkdir(outDir, { recursive: true });
    await fs.cp(dir, outDir, { recursive: true });
  },
});
