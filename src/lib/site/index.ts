import { build } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "tailwindcss";
import { createHtmlPlugin as html } from "vite-plugin-html";
import { viteStaticCopy as copy } from "vite-plugin-static-copy";
import { AppInfo } from "../app-info.js";

interface BuildOptions {
  ipaOrApkPath: string;
  outDir: string;
  info: AppInfo;
}

export const buildSite = async ({ outDir, info, ipaOrApkPath }: BuildOptions) =>
  build({
    root: resolveProjectFile(),
    logLevel: "info",
    build: {
      outDir,
      emptyOutDir: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: ipaOrApkPath,
            dest: "artifacts",
          },
        ],
      }),
      html({
        minify: true,
        inject: {
          data: info,
        },
      }),
    ],
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            content: {
              files: [resolveProjectFile("index.html")],
              relative: false,
            },
          }),
        ],
      },
    },
  });

const resolveProjectFile = (...components: string[]) =>
  resolve(dirname(fileURLToPath(import.meta.url)), "./project", ...components);
