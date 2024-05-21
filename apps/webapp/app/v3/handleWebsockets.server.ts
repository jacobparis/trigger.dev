import { IncomingMessage } from "node:http";
import type { WebSocket } from "ws";
import { authenticateApiKey } from "~/services/apiAuth.server";
import { logger } from "~/services/logger.server";
import { singleton } from "../utils/singleton";
import { AuthenticatedSocketConnection } from "./authenticatedSocketConnection.server";
import { Gauge } from "prom-client";
import { metricsRegister } from "~/metrics.server";
import { wss } from "~/socket.server";

let authenticatedConnections: Map<string, AuthenticatedSocketConnection>;

export function initializeWebSocketServer() {
  return singleton("wss:register", () => {
    wss.on("connection", handleWebSocketConnection);

    authenticatedConnections = new Map();

    new Gauge({
      name: "dev_authenticated_connections",
      help: "Number of authenticated dev connections",
      collect() {
        this.set(authenticatedConnections.size);
      },
      registers: [metricsRegister],
    });

    return wss;
  });
}

async function handleWebSocketConnection(ws: WebSocket, req: IncomingMessage) {
  logger.debug("Handle websocket connection", {
    ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
  });

  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string") {
    ws.close(1008, "Missing Authorization header");
    return;
  }

  const [authType, apiKey] = authHeader.split(" ");

  if (authType !== "Bearer" || !apiKey) {
    ws.close(1008, "Invalid Authorization header");
    return;
  }

  const authenticationResult = await authenticateApiKey(apiKey);

  if (!authenticationResult) {
    ws.close(1008, "Invalid API key");
    return;
  }

  const authenticatedEnv = authenticationResult.environment;

  const authenticatedConnection = new AuthenticatedSocketConnection(
    ws,
    authenticatedEnv,
    req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "unknown"
  );

  authenticatedConnections.set(authenticatedConnection.id, authenticatedConnection);

  authenticatedConnection.onClose.attachOnce((closeEvent) => {
    logger.debug("Websocket closed", {
      closeEvent,
      authenticatedConnectionId: authenticatedConnection.id,
    });

    authenticatedConnections.delete(authenticatedConnection.id);
  });

  await authenticatedConnection.initialize();
}
