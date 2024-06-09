import { z } from "zod";

const ExceptionEventProperties = z.object({
  type: z.string().optional(),
  message: z.string().optional(),
  stacktrace: z.string().optional(),
});

type ExceptionEventProperties = z.infer<typeof ExceptionEventProperties>;

const ExceptionSpanEvent = z.object({
  name: z.literal("exception"),
  time: z.coerce.date(),
  properties: z.object({
    exception: ExceptionEventProperties,
  }),
});

type ExceptionSpanEvent = z.infer<typeof ExceptionSpanEvent>;

const CancellationSpanEvent = z.object({
  name: z.literal("cancellation"),
  time: z.coerce.date(),
  properties: z.object({
    reason: z.string(),
  }),
});

type CancellationSpanEvent = z.infer<typeof CancellationSpanEvent>;

const OtherSpanEvent = z.object({
  name: z.string(),
  time: z.coerce.date(),
  properties: z.record(z.unknown()),
});

type OtherSpanEvent = z.infer<typeof OtherSpanEvent>;

const SpanEvent = z.union([ExceptionSpanEvent, CancellationSpanEvent, OtherSpanEvent]);

type SpanEvent = z.infer<typeof SpanEvent>;

const SpanEvents = z.array(SpanEvent);

type SpanEvents = z.infer<typeof SpanEvents>;

function isExceptionSpanEvent(event: SpanEvent): event is ExceptionSpanEvent {
  return event.name === "exception";
}

function isCancellationSpanEvent(event: SpanEvent): event is CancellationSpanEvent {
  return event.name === "cancellation";
}

const SpanMessagingEvent = z.object({
  system: z.string().optional(),
  client_id: z.string().optional(),
  operation: z.enum(["publish", "create", "receive", "deliver"]),
  message: z.any(),
  destination: z.string().optional(),
});

type SpanMessagingEvent = z.infer<typeof SpanMessagingEvent>;
