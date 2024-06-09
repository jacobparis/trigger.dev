import { Span } from "@opentelemetry/api";
import { TriggerTracer } from "./tracer";
import { apiClientManager } from "./apiClientManager-api";

type IOPacket = {
  data?: string | undefined;
  dataType: string;
};

export async function conditionallyImportPacket(
  packet: IOPacket,
  tracer?: TriggerTracer
): Promise<IOPacket> {
  if (packet.dataType !== "application/store") {
    return packet;
  }

  if (!tracer) {
    return await importPacket(packet);
  } else {
    const result = await tracer.startActiveSpan(
      "store.downloadPayload",
      async (span) => {
        return await importPacket(packet, span);
      },
      {
        attributes: {
          "$style.icon": "cloud-download",
        },
      }
    );

    return result ?? packet;
  }
}

async function importPacket(packet: IOPacket, span?: Span): Promise<IOPacket> {
  if (!packet.data) {
    return packet;
  }

  if (!apiClientManager.client) {
    return packet;
  }

  return packet;
}
