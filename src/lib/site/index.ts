import { build, PluginOption, UserConfig } from "vite";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import tailwind from "tailwindcss";
import { createHtmlPlugin as html } from "vite-plugin-html";
import { viteStaticCopy as copy } from "vite-plugin-static-copy";
import { AppInfo } from "../app-info.js";
import { createManifest } from "./manifest.js";
import urlJoin from "url-join";
import file from "./plugin/generate-file/index.js";
import autoprefixer from "autoprefixer";

interface BuildOptions extends Pick<UserConfig, "customLogger"> {
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
  ...rest
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
    ...rest,
    root: resolveProjectFile(),
    base: "",
    build: {
      outDir,
      emptyOutDir: true,
    },
    logLevel: rest.customLogger ? "info" : "silent",
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
          tailwind({
            content: {
              files: [resolveProjectFile("index.html")],
              relative: false,
            },
          }),
          autoprefixer(),
        ],
      },
    },
  });
};

const resolveArtifact = (...components: string[]) =>
  join("artifacts", ...components);

const resolveProjectFile = (...components: string[]) =>
  resolve(dirname(fileURLToPath(import.meta.url)), "./project", ...components);
