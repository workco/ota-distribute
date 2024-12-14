import { Copier } from "./index.js";
import fs from "node:fs/promises";
import { getEnvRequired } from "../env.js";

export const createFolderCopier = (): Copier => {
  return {
    baseUrl: getEnvRequired("BASE_URL"),
    copy: async (dir) => {
      const destination = getEnvRequired("OUTPUT_FOLDER");
      await fs.mkdir(destination, { recursive: true });
      await fs.cp(dir, destination, { recursive: true });
    },
  };
};
