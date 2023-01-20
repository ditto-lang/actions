import * as path from "path";
import * as fs from "fs";
import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

export type ReleaseVersion = string;
export type Platform = "linux" | "macos" | "windows";

export type Inputs = {
  releaseVersion: ReleaseVersion;
  platform: Platform;
};

type Outputs = {
  which: string;
};

function isValidNinjaPlatform(platform: string): platform is Platform {
  return ["linux", "macos", "windows"].includes(platform);
}

function detectPlatform(): Platform | null {
  switch (process.platform) {
    case "win32":
      return "windows";
    case "linux":
      return "linux";
    case "darwin":
      return "macos";
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
    `Invalid platform input: ${input} (expected one of "linux", "macos" or "windows")`
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
  // Make sure that both `ditto` and `ditto.exe` are available to every OS
  // for simplicity (don't need to switch on OS, just call one or the other in
  // all cases)
  fs.symlinkSync(binPath, symlinkPath);
  core.addPath(dir);
  core.info(`ditto installed to: ${dir}`);
}

function install(dir: string, platform: Platform): Outputs {
  const [binPath, symlinkPath] =
    platform === "windows"
      ? [path.join(dir, "ditto.exe"), path.join(dir, "ditto")]
      : [path.join(dir, "ditto"), path.join(dir, "ditto.exe")];
  doInstall(dir, binPath, symlinkPath);
  return { which: binPath };
}

export async function run(
  { platform, releaseVersion }: Inputs,
  toolName: string = "ditto",
  destDir: string = "ditto-release"
): Promise<Outputs> {
  const cachedDir = tc.find(toolName, releaseVersion);
  if (cachedDir) {
    // Cache hit
    core.info("Cache hit, restoring previous install");
    return install(cachedDir, platform);
  }

  // No cache hit, download...
  const url = `https://github.com/ditto-lang/ditto/releases/download/${releaseVersion}/ditto-${platform}.zip`;

  core.info(`Downloading ditto from: ${url}`);
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
