import { build, PluginOption } from "vite";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "tailwindcss";
import { createHtmlPlugin as html } from "vite-plugin-html";
import { viteStaticCopy as copy } from "vite-plugin-static-copy";
import file from "vite-plugin-generate-file";
import { AppInfo } from "../app-info.js";
import { createManifest } from "./manifest.js";
import urlJoin from "url-join";

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
        type: "template",
        template: "./plaintext.ejs",
        output: manifestArtifact,
        data: {
          // pass buildUrl before we change it to the itms protocol url
          content: createManifest({ info, ipaUrl: buildUrl }),
        },
      }),
    );

    buildUrl = `itms-services://?action=download-manifest&url=${urlJoin(baseUrl, manifestArtifact)}`;
  }

  await build({
    root: resolveProjectFile(),
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
            dest: buildArtifact,
          },
        ],
      }),
      html({
        minify: true,
        inject: {
          data: {
            ...info,
            baseUrl,
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
