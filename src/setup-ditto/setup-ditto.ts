import * as core from "@actions/core";
import * as io from "@actions/io";
import {
  Inputs,
  Platform as DittoPlatform,
  getInputs as getInstallDittoInputs,
  run as runInstallDitto,
} from "../install-ditto/install-ditto";
import {
  Platform as NinjaPlatform,
  run as runInstallNinja,
} from "../install-ninja/install-ninja";

type Outputs = {
  whichDitto: string;
  whichNinja: string;
};

function getInputs(): Inputs {
  const inputs = getInstallDittoInputs();
  return inputs;
}

function dittoPlatformToNinjaPlatform(platform: DittoPlatform): NinjaPlatform {
  switch (platform) {
    case "linux":
      return "linux";
    case "macos":
      return "mac";
    case "windows":
      return "win";
  }
}

async function installThings(inputs: Inputs): Promise<Outputs> {
  const { which: whichNinja } = await runInstallNinja({
    platform: dittoPlatformToNinjaPlatform(inputs.platform),
    releaseVersion: "v1.10.2",
  });
  const { which: whichDitto } = await runInstallDitto(inputs);
  return { whichDitto, whichNinja };
}

export async function main(): Promise<void> {
  try {
    const inputs = getInputs();
    const { whichDitto, whichNinja } = await installThings(inputs);
    // Set env vars
    core.exportVariable("DITTO_NINJA", whichNinja);
    const cacheDir = ".ditto-cache";
    await io.mkdirP(cacheDir);
    core.exportVariable("DITTO_CACHE", cacheDir);
    // Set outputs
    core.setOutput("which", whichDitto);
    core.setOutput("cache-dir", cacheDir);
    core.setOutput("which-ninja", whichNinja);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(`Error: ${error}`);
    }
  }
}
