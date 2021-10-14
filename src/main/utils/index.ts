import { app, nativeTheme } from "electron";
import is from "electron-is";
import path from "path";
import fs from "fs";

export function getLogPath() {
  return app.getPath("logs");
}

export function getSessionPath() {
  return path.resolve(app.getPath("userData"), "./download.session");
}

export function getUserDataPath() {
  return app.getPath("userData");
}

export function getUserDownloadsPath() {
  return app.getPath("downloads");
}

export function isValidKey(
  key: string | number,
  object: object
): key is keyof typeof object {
  return key in object;
}

export function transformConfig(config: object) {
  const result = [];
  for (const [k, v] of Object.entries(config)) {
    if (v !== "") {
      result.push(`--${k}=${v}`);
    }
  }
  return result;
}

export function moveAppToApplicationsFolder(errorMsg = "") {
  return new Promise((resolve, reject) => {
    try {
      const result = app.moveToApplicationsFolder();
      if (result) {
        resolve(result);
      } else {
        reject(new Error(errorMsg));
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function splitArgv(argv: string[]) {
  const args: string[] = [];
  const extra: { [key: string]: string } = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const kv = arg.split("=");
      const key = kv[0];
      const value = kv[1] || "1";
      extra[key] = value;
      continue;
    }
    args.push(arg);
  }
  return { args, extra };
}
