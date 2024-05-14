import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals, type ServerBuild } from "@remix-run/node";
import type { Server as EngineServer } from "engine.io";

import { env } from "./app/env.server";

import { registryProxy } from "./app/v3/registryProxy.server";
import { apiRateLimiter } from "./app/services/apiRateLimit.server";
import { socketIo } from "./app/v3/handleSocketIo.server";
import { wss } from "./app/v3/handleWebsockets.server";

installGlobals();
main();

export default async function main() {
  const MODE = env.NODE_ENV;

  const viteDevServer =
    MODE === "production"
      ? undefined
      : await import("vite").then((vite) =>
          vite.createServer({
            server: { middlewareMode: true },
          })
        );

  const app = express();

  if (process.env.DISABLE_COMPRESSION !== "1") {
    app.use(compression());
  }

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  if (viteDevServer) {
    app.use(viteDevServer.middlewares);
  } else {
    // Remix fingerprints its assets so we can cache forever.
    app.use("/assets", express.static("build/client/assets", { immutable: true, maxAge: "1y" }));
    // Everything else (like favicon.ico) is cached for an hour. You may want to be
    // more aggressive with this caching.
    app.use(express.static("build/client", { maxAge: "1h" }));
  }

  app.get(["/img/*", "/favicons/*"], (req, res) => {
    // if we made it past the express.static for these, then we're missing something.
    // So we'll just send a 404 and won't bother calling other middleware.
    return res.status(404).send("Not found");
  });

  app.use(morgan("tiny"));

  process.title = "node webapp-server";

  const port = process.env.REMIX_APP_PORT || process.env.PORT || 3000;

  if (process.env.HTTP_SERVER_DISABLED !== "true") {
    if (registryProxy && process.env.ENABLE_REGISTRY_PROXY === "true") {
      console.log(`🐳 Enabling container registry proxy to ${registryProxy.origin}`);

      // Adjusted to match /v2 and any subpath under /v2
      app.all("/v2/*", async (req, res) => {
        await registryProxy?.call(req, res);
      });

      // This might also be necessary if you need to explicitly match /v2 as well
      app.all("/v2", async (req, res) => {
        await registryProxy?.call(req, res);
      });
    }

    app.use((req, res, next) => {
      // helpful headers:
      res.set("Strict-Transport-Security", `max-age=${60 * 60 * 24 * 365 * 100}`);

      // /clean-urls/ -> /clean-urls
      if (req.path.endsWith("/") && req.path.length > 1) {
        const query = req.url.slice(req.path.length);
        const safepath = req.path.slice(0, -1).replace(/\/+/g, "/");
        res.redirect(301, safepath + query);
        return;
      }
      next();
    });

    if (process.env.DASHBOARD_AND_API_DISABLED !== "true") {
      app.use(apiRateLimiter);

      app.all(
        "*",
        createRequestHandler({
          getLoadContext: (_: any, res: any) => ({
            serverBuild: getBuild(),
          }),
          build: getBuild,
          mode: MODE,
        })
      );
    } else {
      // we need to do the health check here at /healthcheck
      app.get("/healthcheck", (req, res) => {
        res.status(200).send("OK");
      });
    }

    const server = app.listen(port, () => {
      console.log(`✅ server ready: http://localhost:${port} [NODE_ENV: ${MODE}]`);

      // if (MODE === "development") {
      //   broadcastDevReady(build)
      //     .then(() => logDevReady(build))
      //     .catch(console.error);
      // }
    });

    server.keepAliveTimeout = 65 * 1000;

    process.on("SIGTERM", () => {
      server.close((err) => {
        if (err) {
          console.error("Error closing express server:", err);
        } else {
          console.log("Express server closed gracefully.");
        }
      });
    });

    // socketIo?.io.attach(server);
    server.removeAllListeners("upgrade"); // prevent duplicate upgrades from listeners created by io.attach()

    server.on("upgrade", async (req, socket, head) => {
      console.log(
        `Attemping to upgrade connection at url ${req.url} with headers: ${JSON.stringify(
          req.headers
        )}`
      );

      socket.on("error", (err) => {
        console.error("Connection upgrade error:", err);
      });

      const url = new URL(req.url ?? "", "http://localhost");

      // Upgrade socket.io connection
      if (url.pathname.startsWith("/socket.io/")) {
        console.log(`Socket.io client connected, upgrading their connection...`);

        // https://github.com/socketio/socket.io/issues/4693
        (socketIo?.io.engine as EngineServer).handleUpgrade(req, socket, head);
        return;
      }

      // Only upgrade the connecting if the path is `/ws`
      if (url.pathname !== "/ws") {
        // Setting the socket.destroy() error param causes an error event to be emitted which needs to be handled with socket.on("error") to prevent uncaught exceptions.
        socket.destroy(
          new Error(
            "Cannot connect because of invalid path: Please include `/ws` in the path of your upgrade request."
          )
        );
        return;
      }

      console.log(`Client connected, upgrading their connection...`);

      // Handle the WebSocket connection
      wss?.handleUpgrade(req, socket, head, (ws) => {
        wss?.emit("connection", ws, req);
      });
    });
  } else {
    await getBuild();
    console.log(`✅ app ready (skipping http server)`);
  }

  async function getBuild() {
    const build = viteDevServer
      ? viteDevServer.ssrLoadModule("virtual:remix/server-build")
      : // @ts-ignore this should exist before running the server
        // but it may not exist just yet.
        await import("./build/server/index.js");
    // not sure how to make this happy 🤷‍♂️
    return build as unknown as ServerBuild;
  }
}
