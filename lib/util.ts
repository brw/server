import assert from "assert";
import { ContainerServiceArgs } from "./service/service";
import { output } from "@pulumi/pulumi";
import ky from "ky";

export function convertLabels(labels: Record<string, string | number | undefined>) {
  return Object.entries(labels).map(([label, value]) => {
    if (value === undefined) {
      throw Error(`value for label "${label}" was undefined`);
    }
    return { label, value: value.toString() };
  });
}

export function convertEnvs(envs: ContainerServiceArgs["envs"]) {
  return output(envs).apply((envs) =>
    Object.entries(envs ?? {}).map(
      ([env, value]) => `${env}=${Array.isArray(value) ? value.join(",") : value}`,
    ),
  );
}

export async function getLatestCommit(url: string) {
  const html = await ky.get(url, { retry: 5 }).text();
  const commit = html.match(/\/commit\/(\w+)/)?.[1];
  return commit;
}

export function ensure<T>(arg: T): NonNullable<T> {
  assert(arg);
  return arg;
}
