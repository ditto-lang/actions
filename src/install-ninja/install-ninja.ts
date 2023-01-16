import * as path from "path";
import * as fs from "fs";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

export type ReleaseVersion = string;
export type Platform = "linux" | "mac" | "win";

export type Inputs = {
  releaseVersion: ReleaseVersion;
  platform: Platform;
};

type Outputs = {
  which: string;
};

function isValidNinjaPlatform(platform: string): platform is Platform {
  return ["linux", "mac", "win"].includes(platform);
}

function detectPlatform(): Platform | null {
  switch (process.platform) {
    case "win32":
      return "win";
    case "linux":
      return "linux";
    case "darwin":
      return "mac";
    default:
      return null;
  }
}

function getPlatformInput(): Platform {
  const input = core.getInput("platform");
  if (!input) {
    const detected = detectPlatform();
    if (detected === null) {
      throw new Error(`Unable to detect platform: ${process.platform}`);
    }
    return detected;
  }
  if (isValidNinjaPlatform(input)) {
    return input;
  }
  throw new Error(
    `Invalid platform input: ${input} (expected one of "linux", "mac" or "win")`
  );
}

function getInputs(): Inputs {
  const releaseVersion = core.getInput("release-version");
  const platform = getPlatformInput();
  return {
    releaseVersion,
    platform,
  };
}

function doInstall(dir: string, binPath: string, symlinkPath: string) {
  fs.chmodSync(binPath, 755);
  // Make sure that both `ninja` and `ninja.exe` are available to every OS
  // for simplicity (don't need to switch on OS, just call one or the other in
  // all cases)
  fs.symlinkSync(binPath, symlinkPath);
  core.addPath(dir);
  core.info(`ninja installed to: ${dir}`);
}

function install(dir: string, platform: Platform): Outputs {
  const [binPath, symlinkPath] =
    platform === "win"
      ? [path.join(dir, "ninja.exe"), path.join(dir, "ninja")]
      : [path.join(dir, "ninja"), path.join(dir, "ninja.exe")];
  doInstall(dir, binPath, symlinkPath);
  return { which: binPath };
}

export async function run(
  { platform, releaseVersion }: Inputs,
  toolName: string = "ninja",
  destDir: string = "ninja-release"
): Promise<Outputs> {
  const cachedDir = tc.find(toolName, releaseVersion);
  if (cachedDir) {
    // Cache hit
    core.info("Cache hit, restoring previous install");
    return install(cachedDir, platform);
  }

  // No cache hit, download...
  const url = `https://github.com/ninja-build/ninja/releases/download/${releaseVersion}/ninja-${platform}.zip`;

  core.info(`Downloading ninja from: ${url}`);
  const downloadedZip = await tc.downloadTool(url);
  const extractedDir = await tc.extractZip(downloadedZip, destDir);
  const freshCachedDir = await tc.cacheDir(
    extractedDir,
    toolName,
    releaseVersion
  );
  return install(freshCachedDir, platform);
}

export async function main(): Promise<void> {
  try {
    const inputs = getInputs();
    const outputs = await run(inputs);
    for (const [name, value] of Object.entries(outputs)) {
      core.setOutput(name, value);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(`Error: ${error}`);
    }
  }
}
