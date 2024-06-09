import { PrismaClient, Prisma } from "@trigger.dev/database";
import invariant from "tiny-invariant";
import { env } from "./env.server";
import { singleton } from "./utils/singleton";
import { isValidDatabaseUrl } from "./utils/db";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type PrismaClientOrTransaction = PrismaClient | PrismaTransactionClient;

export const prisma = singleton("prisma", getClient);

function getClient() {
  const { DATABASE_URL } = process.env;
  invariant(typeof DATABASE_URL === "string", "DATABASE_URL env var not set");

  const databaseUrl = extendQueryParams(DATABASE_URL, {
    connection_limit: env.DATABASE_CONNECTION_LIMIT.toString(),
    pool_timeout: env.DATABASE_POOL_TIMEOUT.toString(),
  });

  console.log(`🔌 setting up prisma client to ${redactUrlSecrets(databaseUrl)}`);

  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl.href,
      },
    },
    log: [
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "info",
      },
      {
        emit: "stdout",
        level: "warn",
      },
      // {
      //   emit: "stdout",
      //   level: "query",
      // },
      // {
      //   emit: "event",
      //   level: "query",
      // },
    ],
  });

  // client.$on("query", (e) => {
  //   console.log(`Query tooks ${e.duration}ms`, {
  //     query: e.query,
  //     params: e.params,
  //     duration: e.duration,
  //   });
  // });

  // connect eagerly
  client.$connect();

  console.log(`🔌 prisma client connected`);

  return client;
}

function extendQueryParams(hrefOrUrl: string | URL, queryParams: Record<string, string>) {
  const url = new URL(hrefOrUrl);
  const query = url.searchParams;

  for (const [key, val] of Object.entries(queryParams)) {
    query.set(key, val);
  }

  url.search = query.toString();

  return url;
}

function redactUrlSecrets(hrefOrUrl: string | URL) {
  const url = new URL(hrefOrUrl);
  url.password = "";
  return url.href;
}

export type { PrismaClient } from "@trigger.dev/database";

function getDatabaseSchema() {
  if (!isValidDatabaseUrl(env.DATABASE_URL)) {
    throw new Error("Invalid Database URL");
  }

  const databaseUrl = new URL(env.DATABASE_URL);
  const schemaFromSearchParam = databaseUrl.searchParams.get("schema");

  if (!schemaFromSearchParam) {
    console.debug("❗ database schema unspecified, will default to `public` schema");
    return "public";
  }

  return schemaFromSearchParam;
}
