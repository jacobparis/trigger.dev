import { ulid } from "ulidx";
import { z } from "zod";
import { Prettify } from "../types";
import { addMissingVersionField } from "./addMissingVersionField";
import { ErrorWithStackSchema, SchemaErrorSchema } from "./errors";
import { EventFilterSchema, EventRuleSchema } from "./eventFilter";
import { ConnectionAuthSchema, IntegrationConfigSchema } from "./integrations";
import { DeserializedJsonSchema, SerializableJsonSchema } from "./json";
import { DisplayPropertySchema, StyleSchema } from "./properties";
import {
  CronMetadataSchema,
  IntervalMetadataSchema,
  RegisterDynamicSchedulePayloadSchema,
  ScheduleMetadataSchema,
} from "./schedules";
import { CachedTaskSchema, ServerTaskSchema, TaskSchema } from "./tasks";
import { EventSpecificationSchema, TriggerMetadataSchema } from "./triggers";
import { RunStatusSchema } from "./runs";
import { JobRunStatusRecordSchema } from "./statuses";
import { RequestFilterSchema } from "./requestFilter";

const UpdateTriggerSourceBodyV1Schema = z.object({
  registeredEvents: z.array(z.string()),
  secret: z.string().optional(),
  data: SerializableJsonSchema.optional(),
});
type UpdateTriggerSourceBodyV1 = z.infer<typeof UpdateTriggerSourceBodyV1Schema>;

const UpdateTriggerSourceBodyV2Schema = z.object({
  secret: z.string().optional(),
  data: SerializableJsonSchema.optional(),
  options: z
    .object({
      event: z.array(z.string()),
    })
    .and(z.record(z.string(), z.array(z.string())).optional()),
});
type UpdateTriggerSourceBodyV2 = z.infer<typeof UpdateTriggerSourceBodyV2Schema>;

const UpdateWebhookBodySchema = z.discriminatedUnion("active", [
  z.object({
    active: z.literal(false),
  }),
  z.object({
    active: z.literal(true),
    config: z.record(z.string().array()),
  }),
]);

type UpdateWebhookBody = z.infer<typeof UpdateWebhookBodySchema>;

const RegisterHTTPTriggerSourceBodySchema = z.object({
  type: z.literal("HTTP"),
  url: z.string().url(),
});

const RegisterSMTPTriggerSourceBodySchema = z.object({
  type: z.literal("SMTP"),
});

const RegisterSQSTriggerSourceBodySchema = z.object({
  type: z.literal("SQS"),
});

const RegisterSourceChannelBodySchema = z.discriminatedUnion("type", [
  RegisterHTTPTriggerSourceBodySchema,
  RegisterSMTPTriggerSourceBodySchema,
  RegisterSQSTriggerSourceBodySchema,
]);

const REGISTER_WEBHOOK = "dev.trigger.webhook.register";
const DELIVER_WEBHOOK_REQUEST = "dev.trigger.webhook.deliver";

const RegisterWebhookSourceSchema = z.object({
  key: z.string(),
  params: z.any(),
  config: z.any(),
  active: z.boolean(),
  secret: z.string(),
  url: z.string(),
  data: DeserializedJsonSchema.optional(),
  clientId: z.string().optional(),
});

type RegisterWebhookSource = z.infer<typeof RegisterWebhookSourceSchema>;

const RegisterWebhookPayloadSchema = z.object({
  active: z.boolean(),
  params: z.any().optional(),
  config: z.object({
    current: z.record(z.string().array()),
    desired: z.record(z.string().array()),
  }),
  // from HTTP Endpoint
  url: z.string(),
  secret: z.string(),
});

type RegisterWebhookPayload = z.infer<typeof RegisterWebhookPayloadSchema>;

const REGISTER_SOURCE_EVENT_V1 = "dev.trigger.source.register";
const REGISTER_SOURCE_EVENT_V2 = "dev.trigger.source.register.v2";

const RegisterTriggerSourceSchema = z.object({
  key: z.string(),
  params: z.any(),
  active: z.boolean(),
  secret: z.string(),
  data: DeserializedJsonSchema.optional(),
  channel: RegisterSourceChannelBodySchema,
  clientId: z.string().optional(),
});

type RegisterTriggerSource = z.infer<typeof RegisterTriggerSourceSchema>;

const SourceEventOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

type SourceEventOption = z.infer<typeof SourceEventOptionSchema>;

const RegisterSourceEventSchemaV1 = z.object({
  /** The id of the source */
  id: z.string(),
  source: RegisterTriggerSourceSchema,
  events: z.array(z.string()),
  missingEvents: z.array(z.string()),
  orphanedEvents: z.array(z.string()),
  dynamicTriggerId: z.string().optional(),
});

type RegisterSourceEventV1 = z.infer<typeof RegisterSourceEventSchemaV1>;

const RegisteredOptionsDiffSchema = z.object({
  desired: z.array(z.string()),
  missing: z.array(z.string()),
  orphaned: z.array(z.string()),
});

type RegisteredOptionsDiff = Prettify<z.infer<typeof RegisteredOptionsDiffSchema>>;

const RegisterSourceEventOptionsSchema = z
  .object({
    event: RegisteredOptionsDiffSchema,
  })
  .and(z.record(z.string(), RegisteredOptionsDiffSchema));

type RegisterSourceEventOptions = z.infer<typeof RegisterSourceEventOptionsSchema>;

const RegisterSourceEventSchemaV2 = z.object({
  /** The id of the source */
  id: z.string(),
  source: RegisterTriggerSourceSchema,
  options: RegisterSourceEventOptionsSchema,
  dynamicTriggerId: z.string().optional(),
});

type RegisterSourceEventV2 = z.infer<typeof RegisterSourceEventSchemaV2>;

const TriggerSourceSchema = z.object({
  id: z.string(),
  key: z.string(),
});

const HttpSourceResponseMetadataSchema = DeserializedJsonSchema;
type HttpSourceResponseMetadata = z.infer<typeof HttpSourceResponseMetadataSchema>;

const HandleTriggerSourceSchema = z.object({
  key: z.string(),
  secret: z.string(),
  data: z.any(),
  params: z.any(),
  auth: ConnectionAuthSchema.optional(),
  metadata: HttpSourceResponseMetadataSchema.optional(),
});

type HandleTriggerSource = z.infer<typeof HandleTriggerSourceSchema>;

type TriggerSource = z.infer<typeof TriggerSourceSchema>;

const HttpSourceRequestHeadersSchema = z.object({
  "x-ts-key": z.string(),
  "x-ts-dynamic-id": z.string().optional(),
  "x-ts-secret": z.string(),
  "x-ts-data": z.string().transform((s) => JSON.parse(s)),
  "x-ts-params": z.string().transform((s) => JSON.parse(s)),
  "x-ts-http-url": z.string(),
  "x-ts-http-method": z.string(),
  "x-ts-http-headers": z.string().transform((s) => z.record(z.string()).parse(JSON.parse(s))),
  "x-ts-auth": z
    .string()
    .optional()
    .transform((s) => {
      if (s === undefined) return;
      const json = JSON.parse(s);
      return ConnectionAuthSchema.parse(json);
    }),
  "x-ts-metadata": z
    .string()
    .optional()
    .transform((s) => {
      if (s === undefined) return;
      const json = JSON.parse(s);
      return DeserializedJsonSchema.parse(json);
    }),
});

type HttpSourceRequestHeaders = z.output<typeof HttpSourceRequestHeadersSchema>;

const HttpEndpointRequestHeadersSchema = z.object({
  "x-ts-key": z.string(),
  "x-ts-http-url": z.string(),
  "x-ts-http-method": z.string(),
  "x-ts-http-headers": z.string().transform((s) => z.record(z.string()).parse(JSON.parse(s))),
});

const WebhookSourceRequestHeadersSchema = z.object({
  "x-ts-key": z.string(),
  "x-ts-dynamic-id": z.string().optional(),
  "x-ts-secret": z.string(),
  "x-ts-params": z.string().transform((s) => JSON.parse(s)),
  "x-ts-http-url": z.string(),
  "x-ts-http-method": z.string(),
  "x-ts-http-headers": z.string().transform((s) => z.record(z.string()).parse(JSON.parse(s))),
});

type WebhookSourceRequestHeaders = z.output<typeof WebhookSourceRequestHeadersSchema>;

const PongSuccessResponseSchema = z.object({
  ok: z.literal(true),
  triggerVersion: z.string().optional(),
  triggerSdkVersion: z.string().optional(),
});

const PongErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  triggerVersion: z.string().optional(),
  triggerSdkVersion: z.string().optional(),
});

const PongResponseSchema = z.discriminatedUnion("ok", [
  PongSuccessResponseSchema,
  PongErrorResponseSchema,
]);

type PongResponse = z.infer<typeof PongResponseSchema>;

const ValidateSuccessResponseSchema = z.object({
  ok: z.literal(true),
  endpointId: z.string(),
  triggerVersion: z.string().optional(),
});

const ValidateErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  triggerVersion: z.string().optional(),
});

const ValidateResponseSchema = z.discriminatedUnion("ok", [
  ValidateSuccessResponseSchema,
  ValidateErrorResponseSchema,
]);

type ValidateResponse = z.infer<typeof ValidateResponseSchema>;

const QueueOptionsSchema = z.object({
  name: z.string(),
  maxConcurrent: z.number().optional(),
});

type QueueOptions = z.infer<typeof QueueOptionsSchema>;

const ConcurrencyLimitOptionsSchema = z.object({
  id: z.string(),
  limit: z.number(),
});

const JobMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  event: EventSpecificationSchema,
  trigger: TriggerMetadataSchema,
  integrations: z.record(IntegrationConfigSchema),
  internal: z.boolean().default(false),
  enabled: z.boolean(),
  startPosition: z.enum(["initial", "latest"]),
  preprocessRuns: z.boolean(),
  concurrencyLimit: ConcurrencyLimitOptionsSchema.or(z.number().int().positive()).optional(),
});

type JobMetadata = z.infer<typeof JobMetadataSchema>;

const SourceMetadataV1Schema = z.object({
  version: z.literal("1"),
  channel: z.enum(["HTTP", "SQS", "SMTP"]),
  integration: IntegrationConfigSchema,
  key: z.string(),
  params: z.any(),
  events: z.array(z.string()),
  registerSourceJob: z
    .object({
      id: z.string(),
      version: z.string(),
    })
    .optional(),
});

type SourceMetadataV1 = z.infer<typeof SourceMetadataV1Schema>;

const SourceMetadataV2Schema = z.object({
  version: z.literal("2"),
  channel: z.enum(["HTTP", "SQS", "SMTP"]),
  integration: IntegrationConfigSchema,
  key: z.string(),
  params: z.any(),
  options: z.record(z.array(z.string())),
  registerSourceJob: z
    .object({
      id: z.string(),
      version: z.string(),
    })
    .optional(),
});

type SourceMetadataV2 = z.infer<typeof SourceMetadataV2Schema>;

const SourceMetadataSchema = z.preprocess(
  addMissingVersionField,
  z.discriminatedUnion("version", [SourceMetadataV1Schema, SourceMetadataV2Schema])
);

type SourceMetadata = Prettify<z.infer<typeof SourceMetadataSchema>>;

const WebhookMetadataSchema = z.object({
  key: z.string(),
  params: z.any(),
  config: z.record(z.array(z.string())),
  integration: IntegrationConfigSchema,
  httpEndpoint: z.object({
    id: z.string(),
  }),
});

type WebhookMetadata = z.infer<typeof WebhookMetadataSchema>;

const WebhookContextMetadataSchema = z.object({
  params: z.any(),
  config: z.record(z.string().array()),
  secret: z.string(),
});

type WebhookContextMetadata = z.infer<typeof WebhookContextMetadataSchema>;

const DynamicTriggerEndpointMetadataSchema = z.object({
  id: z.string(),
  jobs: z.array(JobMetadataSchema.pick({ id: true, version: true })),
  registerSourceJob: z
    .object({
      id: z.string(),
      version: z.string(),
    })
    .optional(),
});

type DynamicTriggerEndpointMetadata = z.infer<typeof DynamicTriggerEndpointMetadataSchema>;

const HttpEndpointMetadataSchema = z.object({
  id: z.string(),
  version: z.string(),
  enabled: z.boolean(),
  title: z.string().optional(),
  icon: z.string().optional(),
  properties: z.array(DisplayPropertySchema).optional(),
  event: EventSpecificationSchema,
  immediateResponseFilter: RequestFilterSchema.optional(),
  skipTriggeringRuns: z.boolean().optional(),
  source: z.string(),
});

type HttpEndpointMetadata = z.infer<typeof HttpEndpointMetadataSchema>;

const IndexEndpointResponseSchema = z.object({
  jobs: z.array(JobMetadataSchema),
  sources: z.array(SourceMetadataSchema),
  webhooks: z.array(WebhookMetadataSchema).optional(),
  dynamicTriggers: z.array(DynamicTriggerEndpointMetadataSchema),
  dynamicSchedules: z.array(RegisterDynamicSchedulePayloadSchema),
  httpEndpoints: z.array(HttpEndpointMetadataSchema).optional(),
});

type IndexEndpointResponse = z.infer<typeof IndexEndpointResponseSchema>;

const EndpointIndexErrorSchema = z.object({
  message: z.string(),
  raw: z.any().optional(),
});

type EndpointIndexError = z.infer<typeof EndpointIndexErrorSchema>;

const IndexEndpointStatsSchema = z.object({
  jobs: z.number(),
  sources: z.number(),
  webhooks: z.number().optional(),
  dynamicTriggers: z.number(),
  dynamicSchedules: z.number(),
  disabledJobs: z.number().default(0),
  httpEndpoints: z.number().default(0),
});

type IndexEndpointStats = z.infer<typeof IndexEndpointStatsSchema>;

function parseEndpointIndexStats(stats: unknown): IndexEndpointStats | undefined {
  if (stats === null || stats === undefined) {
    return;
  }
  return IndexEndpointStatsSchema.parse(stats);
}

const GetEndpointIndexResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("PENDING"),
    updatedAt: z.coerce.date(),
  }),
  z.object({
    status: z.literal("STARTED"),
    updatedAt: z.coerce.date(),
  }),
  z.object({
    status: z.literal("SUCCESS"),
    stats: IndexEndpointStatsSchema,
    updatedAt: z.coerce.date(),
  }),
  z.object({
    status: z.literal("FAILURE"),
    error: EndpointIndexErrorSchema,
    updatedAt: z.coerce.date(),
  }),
]);

type GetEndpointIndexResponse = z.infer<typeof GetEndpointIndexResponseSchema>;

const EndpointHeadersSchema = z.object({
  "trigger-version": z.string().optional(),
  "trigger-sdk-version": z.string().optional(),
});

const ExecuteJobRunMetadataSchema = z.object({
  successSubscription: z.boolean().optional(),
  failedSubscription: z.boolean().optional(),
});

const ExecuteJobHeadersSchema = EndpointHeadersSchema.extend({
  "x-trigger-run-metadata": z
    .preprocess((val) => typeof val === "string" && JSON.parse(val), ExecuteJobRunMetadataSchema)
    .optional(),
});

const RawEventSchema = z.object({
  /** The `name` property must exactly match any subscriptions you want to
      trigger. */
  name: z.string(),
  /** The `payload` property will be sent to any matching Jobs and will appear
      as the `payload` param of the `run()` function. You can leave this
      parameter out if you just want to trigger a Job without any input data. */
  payload: z.any(),
  /** The optional `context` property will be sent to any matching Jobs and will
      be passed through as the `context.event.context` param of the `run()`
      function. This is optional but can be useful if you want to pass through
      some additional context to the Job. */
  context: z.any().optional(),
  /** The `id` property uniquely identify this particular event. If unset it
      will be set automatically using `ulid`. */
  id: z.string().default(() => ulid()),
  /** This is optional, it defaults to the current timestamp. Usually you would
      only set this if you have a timestamp that you wish to pass through, e.g.
      you receive a timestamp from a service and you want the same timestamp to
      be used in your Job. */
  timestamp: z.coerce.date().optional(),
  /** This is optional, it defaults to "trigger.dev". It can be useful to set
      this as you can filter events using this in the `eventTrigger()`. */
  source: z.string().optional(),
  /** This is optional, it defaults to "JSON". If your event is actually a request,
      with a url, headers, method and rawBody you can use "REQUEST" */
  payloadType: z.union([z.literal("JSON"), z.literal("REQUEST")]).optional(),
});

type RawEvent = z.infer<typeof RawEventSchema>;

/** The event you wish to send to Trigger a Job */
type SendEvent = z.input<typeof RawEventSchema>;

/** The event that was sent */
const ApiEventLogSchema = z.object({
  /** The `id` of the event that was sent.
   */
  id: z.string(),
  /** The `name` of the event that was sent. */
  name: z.string(),
  /** The `payload` of the event that was sent */
  payload: DeserializedJsonSchema,
  /** The `context` of the event that was sent. Is `undefined` if no context was
      set when sending the event. */
  context: DeserializedJsonSchema.optional().nullable(),
  /** The `timestamp` of the event that was sent */
  timestamp: z.coerce.date(),
  /** The timestamp when the event will be delivered to any matching Jobs. Is
      `undefined` if `deliverAt` or `deliverAfter` wasn't set when sending the
      event. */
  deliverAt: z.coerce.date().optional().nullable(),
  /** The timestamp when the event was delivered. Is `undefined` if `deliverAt`
      or `deliverAfter` were set when sending the event. */
  deliveredAt: z.coerce.date().optional().nullable(),
  /** The timestamp when the event was cancelled. Is `undefined` if the event
   * wasn't cancelled. */
  cancelledAt: z.coerce.date().optional().nullable(),
});

type ApiEventLog = z.infer<typeof ApiEventLogSchema>;

/** Options to control the delivery of the event */
const SendEventOptionsSchema = z.object({
  /** An optional Date when you want the event to trigger Jobs. The event will
      be sent to the platform immediately but won't be acted upon until the
      specified time. */
  deliverAt: z.coerce.date().optional(),
  /** An optional number of seconds you want to wait for the event to trigger
      any relevant Jobs. The event will be sent to the platform immediately but
      won't be delivered until after the elapsed number of seconds. */
  deliverAfter: z.number().int().optional(),
  /** This optional param will be used by Trigger.dev Connect, which
      is coming soon. */
  accountId: z.string().optional(),
});

const SendEventBodySchema = z.object({
  event: RawEventSchema,
  options: SendEventOptionsSchema.optional(),
});

const SendBulkEventsBodySchema = z.object({
  events: RawEventSchema.array(),
  options: SendEventOptionsSchema.optional(),
});

type SendEventBody = z.infer<typeof SendEventBodySchema>;
type SendEventOptions = z.infer<typeof SendEventOptionsSchema>;

const DeliverEventResponseSchema = z.object({
  deliveredAt: z.string().datetime(),
});

type DeliverEventResponse = z.infer<typeof DeliverEventResponseSchema>;

const RuntimeEnvironmentTypeSchema = z.enum([
  "PRODUCTION",
  "STAGING",
  "DEVELOPMENT",
  "PREVIEW",
]);

export type RuntimeEnvironmentType = z.infer<typeof RuntimeEnvironmentTypeSchema>;

const RunSourceContextSchema = z.object({
  id: z.string(),
  metadata: z.any(),
});

type RunSourceContext = z.infer<typeof RunSourceContextSchema>;

const AutoYieldConfigSchema = z.object({
  startTaskThreshold: z.number(),
  beforeExecuteTaskThreshold: z.number(),
  beforeCompleteTaskThreshold: z.number(),
  afterCompleteTaskThreshold: z.number(),
});

type AutoYieldConfig = z.infer<typeof AutoYieldConfigSchema>;

const RunJobBodySchema = z.object({
  event: ApiEventLogSchema,
  job: z.object({
    id: z.string(),
    version: z.string(),
  }),
  run: z.object({
    id: z.string(),
    isTest: z.boolean(),
    isRetry: z.boolean().default(false),
    startedAt: z.coerce.date(),
  }),
  environment: z.object({
    id: z.string(),
    slug: z.string(),
    type: RuntimeEnvironmentTypeSchema,
  }),
  organization: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
  }),
  project: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    })
    .optional(),
  account: z
    .object({
      id: z.string(),
      metadata: z.any(),
    })
    .optional(),
  source: RunSourceContextSchema.optional(),
  tasks: z.array(CachedTaskSchema).optional(),
  cachedTaskCursor: z.string().optional(),
  noopTasksSet: z.string().optional(),
  connections: z.record(ConnectionAuthSchema).optional(),
  yieldedExecutions: z.string().array().optional(),
  runChunkExecutionLimit: z.number().optional(),
  autoYieldConfig: AutoYieldConfigSchema.optional(),
});

type RunJobBody = z.infer<typeof RunJobBodySchema>;

const RunJobErrorSchema = z.object({
  status: z.literal("ERROR"),
  error: ErrorWithStackSchema,
  task: TaskSchema.optional(),
});

type RunJobError = z.infer<typeof RunJobErrorSchema>;

const RunJobYieldExecutionErrorSchema = z.object({
  status: z.literal("YIELD_EXECUTION"),
  key: z.string(),
});

type RunJobYieldExecutionError = z.infer<typeof RunJobYieldExecutionErrorSchema>;

const AutoYieldMetadataSchema = z.object({
  location: z.string(),
  timeRemaining: z.number(),
  timeElapsed: z.number(),
  limit: z.number().optional(),
});

type AutoYieldMetadata = z.infer<typeof AutoYieldMetadataSchema>;

const RunJobAutoYieldExecutionErrorSchema = AutoYieldMetadataSchema.extend({
  status: z.literal("AUTO_YIELD_EXECUTION"),
});

type RunJobAutoYieldExecutionError = Prettify<
  z.infer<typeof RunJobAutoYieldExecutionErrorSchema>
>;

const RunJobAutoYieldWithCompletedTaskExecutionErrorSchema = z.object({
  status: z.literal("AUTO_YIELD_EXECUTION_WITH_COMPLETED_TASK"),
  id: z.string(),
  properties: z.array(DisplayPropertySchema).optional(),
  output: z.string().optional(),
  data: AutoYieldMetadataSchema,
});

type RunJobAutoYieldWithCompletedTaskExecutionError = z.infer<
  typeof RunJobAutoYieldWithCompletedTaskExecutionErrorSchema
>;

const RunJobAutoYieldRateLimitErrorSchema = z.object({
  status: z.literal("AUTO_YIELD_RATE_LIMIT"),
  reset: z.coerce.number(),
});

type RunJobAutoYieldRateLimitError = z.infer<typeof RunJobAutoYieldRateLimitErrorSchema>;

const RunJobInvalidPayloadErrorSchema = z.object({
  status: z.literal("INVALID_PAYLOAD"),
  errors: z.array(SchemaErrorSchema),
});

type RunJobInvalidPayloadError = z.infer<typeof RunJobInvalidPayloadErrorSchema>;

const RunJobUnresolvedAuthErrorSchema = z.object({
  status: z.literal("UNRESOLVED_AUTH_ERROR"),
  issues: z.record(z.object({ id: z.string(), error: z.string() })),
});

type RunJobUnresolvedAuthError = z.infer<typeof RunJobUnresolvedAuthErrorSchema>;

const RunJobResumeWithTaskSchema = z.object({
  status: z.literal("RESUME_WITH_TASK"),
  task: TaskSchema,
});

type RunJobResumeWithTask = z.infer<typeof RunJobResumeWithTaskSchema>;

const RunJobRetryWithTaskSchema = z.object({
  status: z.literal("RETRY_WITH_TASK"),
  task: TaskSchema,
  error: ErrorWithStackSchema,
  retryAt: z.coerce.date(),
});

type RunJobRetryWithTask = z.infer<typeof RunJobRetryWithTaskSchema>;

const RunJobCanceledWithTaskSchema = z.object({
  status: z.literal("CANCELED"),
  task: TaskSchema,
});

type RunJobCanceledWithTask = z.infer<typeof RunJobCanceledWithTaskSchema>;

const RunJobSuccessSchema = z.object({
  status: z.literal("SUCCESS"),
  output: DeserializedJsonSchema.optional(),
});

type RunJobSuccess = z.infer<typeof RunJobSuccessSchema>;

const RunJobErrorResponseSchema = z.union([
  RunJobAutoYieldExecutionErrorSchema,
  RunJobAutoYieldWithCompletedTaskExecutionErrorSchema,
  RunJobYieldExecutionErrorSchema,
  RunJobAutoYieldRateLimitErrorSchema,
  RunJobErrorSchema,
  RunJobUnresolvedAuthErrorSchema,
  RunJobInvalidPayloadErrorSchema,
  RunJobResumeWithTaskSchema,
  RunJobRetryWithTaskSchema,
  RunJobCanceledWithTaskSchema,
]);

type RunJobErrorResponse = z.infer<typeof RunJobErrorResponseSchema>;

const RunJobResumeWithParallelTaskSchema = z.object({
  status: z.literal("RESUME_WITH_PARALLEL_TASK"),
  task: TaskSchema,
  childErrors: z.array(RunJobErrorResponseSchema),
});

type RunJobResumeWithParallelTask = z.infer<typeof RunJobResumeWithParallelTaskSchema>;

const RunJobResponseSchema = z.discriminatedUnion("status", [
  RunJobAutoYieldExecutionErrorSchema,
  RunJobAutoYieldWithCompletedTaskExecutionErrorSchema,
  RunJobYieldExecutionErrorSchema,
  RunJobAutoYieldRateLimitErrorSchema,
  RunJobErrorSchema,
  RunJobUnresolvedAuthErrorSchema,
  RunJobInvalidPayloadErrorSchema,
  RunJobResumeWithTaskSchema,
  RunJobResumeWithParallelTaskSchema,
  RunJobRetryWithTaskSchema,
  RunJobCanceledWithTaskSchema,
  RunJobSuccessSchema,
]);

type RunJobResponse = z.infer<typeof RunJobResponseSchema>;

const PreprocessRunBodySchema = z.object({
  event: ApiEventLogSchema,
  job: z.object({
    id: z.string(),
    version: z.string(),
  }),
  run: z.object({
    id: z.string(),
    isTest: z.boolean(),
  }),
  environment: z.object({
    id: z.string(),
    slug: z.string(),
    type: RuntimeEnvironmentTypeSchema,
  }),
  organization: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
  }),
  account: z
    .object({
      id: z.string(),
      metadata: z.any(),
    })
    .optional(),
});

type PreprocessRunBody = z.infer<typeof PreprocessRunBodySchema>;

const PreprocessRunResponseSchema = z.object({
  abort: z.boolean(),
  properties: z.array(DisplayPropertySchema).optional(),
});

type PreprocessRunResponse = z.infer<typeof PreprocessRunResponseSchema>;

const CreateRunResponseOkSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    id: z.string(),
  }),
});

const CreateRunResponseErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});

const CreateRunResponseBodySchema = z.discriminatedUnion("ok", [
  CreateRunResponseOkSchema,
  CreateRunResponseErrorSchema,
]);

type CreateRunResponseBody = z.infer<typeof CreateRunResponseBodySchema>;

export const RedactStringSchema = z.object({
  __redactedString: z.literal(true),
  strings: z.array(z.string()),
  interpolations: z.array(z.string()),
});

type RedactString = z.infer<typeof RedactStringSchema>;

const LogMessageSchema = z.object({
  level: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]),
  message: z.string(),
  data: SerializableJsonSchema.optional(),
});

type LogMessage = z.infer<typeof LogMessageSchema>;

type ClientTask = z.infer<typeof TaskSchema>;
type CachedTask = z.infer<typeof CachedTaskSchema>;

const RedactSchema = z.object({
  paths: z.array(z.string()),
});

export const RetryOptionsSchema = z.object({
  /** The maximum number of times to retry the request. */
  limit: z.number().optional(),
  /** The exponential factor to use when calculating the next retry time. */
  factor: z.number().optional(),
  /** The minimum amount of time to wait before retrying the request. */
  minTimeoutInMs: z.number().optional(),
  /** The maximum amount of time to wait before retrying the request. */
  maxTimeoutInMs: z.number().optional(),
  /** Whether to randomize the retry time. */
  randomize: z.boolean().optional(),
});

export type RetryOptions = z.infer<typeof RetryOptionsSchema>;

const RunTaskOptionsSchema = z.object({
  /** The name of the Task is required. This is displayed on the Task in the logs. */
  name: z.string().optional(),
  /** The Task will wait and only start at the specified Date  */
  delayUntil: z.coerce.date().optional(),
  /** Retry options */
  retry: RetryOptionsSchema.optional(),
  /** The icon for the Task, it will appear in the logs.
   *  You can use the name of a company in lowercase, e.g. "github".
   *  Or any icon name that [Tabler Icons](https://tabler-icons.io/) supports. */
  icon: z.string().optional(),
  /** The key for the Task that you want to appear in the logs */
  displayKey: z.string().optional(),
  /** A description of the Task */
  description: z.string().optional(),
  /** Properties that are displayed in the logs */
  properties: z.array(DisplayPropertySchema).optional(),
  /** The input params to the Task, will be displayed in the logs  */
  params: z.any(),
  /** The style of the log entry. */
  style: StyleSchema.optional(),
  /** Allows you to expose a `task.callbackUrl` to use in your tasks. Enabling this feature will cause the task to return the data sent to the callbackUrl instead of the usual async callback result. */
  callback: z
    .object({
      /** Causes the task to wait for and return the data of the first request sent to `task.callbackUrl`. */
      enabled: z.boolean(),
      /** Time to wait for the first request to `task.callbackUrl`. Default: One hour. */
      timeoutInSeconds: z.number(),
    })
    .partial()
    .optional(),
  /** Allows you to link the Integration connection in the logs. This is handled automatically in integrations.  */
  connectionKey: z.string().optional(),
  /** An operation you want to perform on the Trigger.dev platform, current only "fetch", "fetch-response", and "fetch-poll" is supported. If you wish to `fetch` use [`io.backgroundFetch()`](https://trigger.dev/docs/sdk/io/backgroundfetch) instead. */
  operation: z.enum(["fetch", "fetch-response", "fetch-poll"]).optional(),
  /** A No Operation means that the code won't be executed. This is used internally to implement features like [io.wait()](https://trigger.dev/docs/sdk/io/wait).  */
  noop: z.boolean().default(false),
  redact: RedactSchema.optional(),
  parallel: z.boolean().optional(),
});

type RunTaskOptions = z.input<typeof RunTaskOptionsSchema>;

type OverridableRunTaskOptions = Pick<
  RunTaskOptions,
  "retry" | "delayUntil" | "description"
>;

const RunTaskBodyInputSchema = RunTaskOptionsSchema.extend({
  idempotencyKey: z.string(),
  parentId: z.string().optional(),
});

type RunTaskBodyInput = z.infer<typeof RunTaskBodyInputSchema>;

const RunTaskBodyOutputSchema = RunTaskBodyInputSchema.extend({
  properties: z.array(DisplayPropertySchema.partial()).optional(),
  params: DeserializedJsonSchema.optional().nullable(),
  callback: z
    .object({
      enabled: z.boolean(),
      timeoutInSeconds: z.number().default(3600),
    })
    .optional(),
});

type RunTaskBodyOutput = z.infer<typeof RunTaskBodyOutputSchema>;

const RunTaskResponseWithCachedTasksBodySchema = z.object({
  task: ServerTaskSchema,
  cachedTasks: z
    .object({
      tasks: z.array(CachedTaskSchema),
      cursor: z.string().optional(),
    })
    .optional(),
});

type RunTaskResponseWithCachedTasksBody = z.infer<
  typeof RunTaskResponseWithCachedTasksBodySchema
>;

const CompleteTaskBodyInputSchema = RunTaskBodyInputSchema.pick({
  properties: true,
  description: true,
  params: true,
}).extend({
  output: SerializableJsonSchema.optional().transform((v) =>
    v ? DeserializedJsonSchema.parse(JSON.parse(JSON.stringify(v))) : {}
  ),
});

type CompleteTaskBodyInput = Prettify<z.input<typeof CompleteTaskBodyInputSchema>>;
type CompleteTaskBodyOutput = z.infer<typeof CompleteTaskBodyInputSchema>;

const CompleteTaskBodyV2InputSchema = RunTaskBodyInputSchema.pick({
  properties: true,
  description: true,
  params: true,
}).extend({
  output: z.string().optional(),
});

type CompleteTaskBodyV2Input = Prettify<z.input<typeof CompleteTaskBodyV2InputSchema>>;

const FailTaskBodyInputSchema = z.object({
  error: ErrorWithStackSchema,
});

type FailTaskBodyInput = z.infer<typeof FailTaskBodyInputSchema>;

const NormalizedRequestSchema = z.object({
  headers: z.record(z.string()),
  method: z.string(),
  query: z.record(z.string()),
  url: z.string(),
  body: z.any(),
});

type NormalizedRequest = z.infer<typeof NormalizedRequestSchema>;

const NormalizedResponseSchema = z.object({
  status: z.number(),
  body: z.any(),
  headers: z.record(z.string()).optional(),
});

type NormalizedResponse = z.infer<typeof NormalizedResponseSchema>;

const HttpSourceResponseSchema = z.object({
  response: NormalizedResponseSchema,
  events: z.array(RawEventSchema),
  metadata: HttpSourceResponseMetadataSchema.optional(),
});

const WebhookDeliveryResponseSchema = z.object({
  response: NormalizedResponseSchema,
  verified: z.boolean(),
  error: z.string().optional(),
});

type WebhookDeliveryResponse = z.infer<typeof WebhookDeliveryResponseSchema>;

const RegisterTriggerBodySchemaV1 = z.object({
  rule: EventRuleSchema,
  source: SourceMetadataV1Schema,
});

type RegisterTriggerBodyV1 = z.infer<typeof RegisterTriggerBodySchemaV1>;

const RegisterTriggerBodySchemaV2 = z.object({
  rule: EventRuleSchema,
  source: SourceMetadataV2Schema,
  accountId: z.string().optional(),
});

type RegisterTriggerBodyV2 = z.infer<typeof RegisterTriggerBodySchemaV2>;

const InitializeTriggerBodySchema = z.object({
  id: z.string(),
  params: z.any(),
  accountId: z.string().optional(),
  metadata: z.any().optional(),
});

type InitializeTriggerBody = z.infer<typeof InitializeTriggerBodySchema>;

const RegisterCommonScheduleBodySchema = z.object({
  /** A unique id for the schedule. This is used to identify and unregister the schedule later. */
  id: z.string(),
  /** Any additional metadata about the schedule. */
  metadata: z.any(),
  /** An optional Account ID to associate with runs triggered by this schedule */
  accountId: z.string().optional(),
});

const RegisterIntervalScheduleBodySchema =
  RegisterCommonScheduleBodySchema.merge(IntervalMetadataSchema);

type RegisterIntervalScheduleBody = z.infer<typeof RegisterIntervalScheduleBodySchema>;

const InitializeCronScheduleBodySchema =
  RegisterCommonScheduleBodySchema.merge(CronMetadataSchema);

type RegisterCronScheduleBody = z.infer<typeof InitializeCronScheduleBodySchema>;

const RegisterScheduleBodySchema = z.discriminatedUnion("type", [
  RegisterIntervalScheduleBodySchema,
  InitializeCronScheduleBodySchema,
]);

type RegisterScheduleBody = z.infer<typeof RegisterScheduleBodySchema>;

const RegisterScheduleResponseBodySchema = z.object({
  id: z.string(),
  schedule: ScheduleMetadataSchema,
  metadata: z.any(),
  active: z.boolean(),
});

type RegisterScheduleResponseBody = z.infer<typeof RegisterScheduleResponseBodySchema>;

const CreateExternalConnectionBodySchema = z.object({
  accessToken: z.string(),
  type: z.enum(["oauth2"]),
  scopes: z.array(z.string()).optional(),
  metadata: z.any(),
});

type CreateExternalConnectionBody = z.infer<typeof CreateExternalConnectionBodySchema>;

const GetRunStatusesSchema = z.object({
  run: z.object({ id: z.string(), status: RunStatusSchema, output: z.any().optional() }),
  statuses: z.array(JobRunStatusRecordSchema),
});
type GetRunStatuses = z.infer<typeof GetRunStatusesSchema>;

const InvokeJobResponseSchema = z.object({
  id: z.string(),
});

const InvokeJobRequestBodySchema = z.object({
  payload: z.any(),
  context: z.any().optional(),
  options: z
    .object({
      accountId: z.string().optional(),
      callbackUrl: z.string().optional(),
    })
    .optional(),
});

type InvokeJobRequestBody = z.infer<typeof InvokeJobRequestBodySchema>;

const InvokeOptionsSchema = z.object({
  accountId: z.string().optional(),
  idempotencyKey: z.string().optional(),
  context: z.any().optional(),
  callbackUrl: z.string().optional(),
});

type InvokeOptions = z.infer<typeof InvokeOptionsSchema>;

const EphemeralEventDispatcherRequestBodySchema = z.object({
  url: z.string(),
  name: z.string().or(z.array(z.string())),
  source: z.string().optional(),
  filter: EventFilterSchema.optional(),
  contextFilter: EventFilterSchema.optional(),
  accountId: z.string().optional(),
  timeoutInSeconds: z
    .number()
    .int()
    .positive()
    .min(10)
    .max(60 * 60 * 24 * 365)
    .default(3600),
});

type EphemeralEventDispatcherRequestBody = z.infer<
  typeof EphemeralEventDispatcherRequestBodySchema
>;

const EphemeralEventDispatcherResponseBodySchema = z.object({
  id: z.string(),
});

type EphemeralEventDispatcherResponseBody = z.infer<
  typeof EphemeralEventDispatcherResponseBodySchema
>;

const KeyValueStoreResponseBodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("DELETE"),
    key: z.string(),
    deleted: z.boolean(),
  }),
  z.object({
    action: z.literal("GET"),
    key: z.string(),
    value: z.string().optional(),
  }),
  z.object({
    action: z.literal("HAS"),
    key: z.string(),
    has: z.boolean(),
  }),
  z.object({
    action: z.literal("SET"),
    key: z.string(),
    value: z.string().optional(),
  }),
]);

type KeyValueStoreResponseBody = z.infer<typeof KeyValueStoreResponseBodySchema>;
