import * as actionlib from '@lukka/action-lib'
import * as baseUtilLib from '@lukka/base-util-lib'
import * as core from '@actions/core';
import * as vcpkgAction from './vcpkg-action';
import axios, { isAxiosError } from 'axios';


async function validateSubscription(): Promise<void> {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`

  try {
    await axios.get(API_URL, {timeout: 3000})
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      core.error(
        'Subscription is not valid. Reach out to support@stepsecurity.io'
      )
      process.exit(1)
    } else {
      core.info('Timeout or API not reachable. Continuing to next step.')
    }
  }
}

async function main(): Promise<void> {
  await validateSubscription()
  try {
    const actionLib = new actionlib.ActionLib();
    const baseUtil = new baseUtilLib.BaseUtilLib(actionLib);
    const action = new vcpkgAction.VcpkgAction(baseUtil);
    await action.run();
    core.info('run-vcpkg action execution succeeded');
    process.exitCode = 0;
  } catch (err) {
    const error: Error = err as Error;
    if (error?.stack) {
      core.info(error.stack);
    }
    const errorAsString = (err as Error)?.message ?? "undefined error";
    core.setFailed(`run-vcpkg action execution failed: ${errorAsString}`);
    process.exitCode = -1000;
  }
}

// Main entry point of the task.
main().catch(error => console.error("main() failed!", error));
