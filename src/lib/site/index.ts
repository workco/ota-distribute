import { build } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "tailwindcss";
import { createHtmlPlugin } from "vite-plugin-html";
import { AppInfo } from "../app-info.js";

interface BuildOptions {
  outDir: string;
  info: AppInfo;
}

export const buildSite = async ({ outDir, info }: BuildOptions) => {
  console.log(resolveProjectFile("index.html"));
  return await build({
    root: resolveProjectFile(),
    logLevel: "info",
    build: {
      emptyOutDir: true,
      rollupOptions: {
        output: {
          dir: outDir,
        },
      },
    },
    plugins: [
      createHtmlPlugin({
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
};

const resolveProjectFile = (...components: string[]) =>
  resolve(dirname(fileURLToPath(import.meta.url)), "./project", ...components);
