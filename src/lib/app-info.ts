// @ts-expect-error this module has no types. we'll keep the anys self-contained to this file.
import AppInfoParser from "app-info-parser";

type AppType = "apple" | "android";

interface AppInfoBase {
  type: AppType;
  icon: string; // base64 encoded icon
  id: string;
  name: string;
  version: string;
  build: string;
}

interface AppleAppInfo extends AppInfoBase {
  type: "apple";
}

interface AndroidAppInfo extends AppInfoBase {
  type: "android";
}

export type AppInfo = AppleAppInfo | AndroidAppInfo;

export const parseAppInfo = async (path: string): Promise<AppInfo> => {
  const parser = new AppInfoParser(path);
  const parsed = await parser.parse();

  const { icon } = parsed;

  if (parsed["CFBundleIdentifier"]) {
    return {
      icon,
      type: "apple",
      name: parsed["CFBundleName"],
      id: parsed["CFBundleIdentifier"],
      version: parsed["CFBundleShortVersionString"],
      build: parsed["CFBundleVersion"],
    } as AppleAppInfo;
  } else if (parsed["package"]) {
    return {
      icon,
      type: "android",
      name: parsed["application"]["label"][0],
      id: parsed["package"],
      version: parsed["versionName"],
      build: `${parsed["versionCode"]}`,
    } as AndroidAppInfo;
  } else {
    throw new Error("Unknown application bundle type");
  }
};
