import { DnsRecord } from "@pulumi/cloudflare";
import { Image } from "@pulumi/docker-build";
import { getEnv } from "~lib/env";
import { confMount, nvmeMount } from "~lib/service/mounts";
import { ContainerService } from "~lib/service/service";
import { getLatestCommit } from "~lib/util";

const knotImage = new Image(
  "knot",
  {
    tags: ["knot:latest"],
    context: {
      // location: "https://tangled.org/tangled.org/knot-docker.git",
      location: "https://tangled.org/bas.sh/knot-docker.git#spindle",
    },
    target: "knot",
    buildArgs: {
      BUILDKIT_CONTEXT_KEEP_GIT_DIR: "true",
    },
    exports: [
      {
        docker: {},
      },
    ],
    push: false,
    buildOnPreview: false,
  },
  {
    replacementTrigger: await getLatestCommit(
      "https://tangled.org/bas.sh/knot-docker/commits/spindle",
    ),
  },
);

export const knotService = new ContainerService("knot", {
  localImage: knotImage.digest,
  servicePort: 5555,
  ports: [22],
  mounts: [confMount("knot", "/app"), nvmeMount("knot", "/home/git/repositories")],
  volumes: [{ volumeName: "knot-keys", containerPath: "/etc/ssh/keys" }],
  envs: {
    KNOT_SERVER_HOSTNAME: "knot.bas.sh",
    KNOT_SERVER_OWNER: getEnv("ATPROTO_DID"),
    KNOT_SERVER_DB_PATH: "/app/knotserver.db",
    KNOT_SERVER_INTERNAL_LISTEN_ADDR: "localhost:5444",
  },
});

export const knotDnsRecord = new DnsRecord("knot", {
  zoneId: getEnv("CLOUDFLARE_ZONE_ID"),
  name: "knot",
  ttl: 1,
  type: "CNAME",
  content: "haring.bas.sh",
  proxied: false,
});
