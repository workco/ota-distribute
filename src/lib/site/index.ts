import { build, PluginOption } from "vite";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "tailwindcss";
import { createHtmlPlugin as html } from "vite-plugin-html";
import { viteStaticCopy as copy } from "vite-plugin-static-copy";
import { AppInfo } from "../app-info.js";
import { createManifest } from "./manifest.js";
import urlJoin from "url-join";
import file from "./plugin/generate-file/index.js";

interface BuildOptions {
  ipaOrApkPath: string;
  outDir: string;
  info: AppInfo;
  baseUrl: string;
}

export const buildSite = async ({
  outDir,
  info,
  ipaOrApkPath,
  baseUrl,
}: BuildOptions) => {
  const extraPlugins: PluginOption[] = [];

  const buildArtifact = resolveArtifact(basename(ipaOrApkPath));
  let buildUrl = urlJoin(baseUrl, buildArtifact);

  if (info.type === "apple") {
    const manifestArtifact = resolveArtifact("manifest.plist");

    extraPlugins.push(
      file({
        content: createManifest({ info, ipaUrl: buildUrl }),
        output: manifestArtifact,
      }),
    );

    buildUrl = `itms-services://?action=download-manifest&url=${urlJoin(baseUrl, manifestArtifact)}`;
  }

  await build({
    root: resolveProjectFile(),
    base: "",
    build: {
      outDir,
      emptyOutDir: true,
    },
    plugins: [
      ...extraPlugins,
      copy({
        targets: [
          {
            src: ipaOrApkPath,
            dest: resolveArtifact(),
          },
        ],
      }),
      html({
        minify: true,
        inject: {
          data: {
            ...info,
            buildUrl,
          },
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

const resolveArtifact = (...components: string[]) =>
  join("artifacts", ...components);

const resolveProjectFile = (...components: string[]) =>
  resolve(dirname(fileURLToPath(import.meta.url)), "./project", ...components);
