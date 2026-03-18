import assert from "assert";
import ky from "ky";

export async function getLatestCommit(url: string) {
  const html = await ky.get(url, { retry: 5 }).text();
  const commit = html.match(/\/commit\/(\w+)/)?.[1];
  return commit;
}

export function ensure<T>(arg: T): NonNullable<T> {
  assert(arg);
  return arg;
}
