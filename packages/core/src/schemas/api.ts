import { ulid } from "ulidx";
import { z } from "zod";
import { addMissingVersionField } from "./addMissingVersionField";
import { ErrorWithStackSchema, SchemaErrorSchema } from "./errors";
import { IntegrationConfigSchema } from "./integrations";
import { DeserializedJsonSchema } from "./json";
import { DisplayPropertySchema, StyleSchema } from "./properties";
import { CronMetadataSchema, IntervalMetadataSchema } from "./schedules";
import { TaskSchema } from "./tasks";
import { EventSpecificationSchema, TriggerMetadataSchema } from "./triggers";
import { RequestFilterSchema } from "./requestFilter";

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

const RegisterTriggerSourceSchema = z.object({
  key: z.string(),
  params: z.any(),
  active: z.boolean(),
  secret: z.string(),
  data: DeserializedJsonSchema.optional(),
  channel: RegisterSourceChannelBodySchema,
  clientId: z.string().optional(),
});

const RegisteredOptionsDiffSchema = z.object({
  desired: z.array(z.string()),
  missing: z.array(z.string()),
  orphaned: z.array(z.string()),
});

const RegisterSourceEventOptionsSchema = z
  .object({
    event: RegisteredOptionsDiffSchema,
  })
  .and(z.record(z.string(), RegisteredOptionsDiffSchema));

const HttpSourceResponseMetadataSchema = DeserializedJsonSchema;

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

const SourceMetadataSchema = z.preprocess(
  addMissingVersionField,
  z.discriminatedUnion("version", [SourceMetadataV1Schema, SourceMetadataV2Schema])
);

const WebhookMetadataSchema = z.object({
  key: z.string(),
  params: z.any(),
  config: z.record(z.array(z.string())),
  integration: IntegrationConfigSchema,
  httpEndpoint: z.object({
    id: z.string(),
  }),
});

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

const EndpointIndexErrorSchema = z.object({
  message: z.string(),
  raw: z.any().optional(),
});

const IndexEndpointStatsSchema = z.object({
  jobs: z.number(),
  sources: z.number(),
  webhooks: z.number().optional(),
  dynamicTriggers: z.number(),
  dynamicSchedules: z.number(),
  disabledJobs: z.number().default(0),
  httpEndpoints: z.number().default(0),
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

const RuntimeEnvironmentTypeSchema = z.enum(["PRODUCTION", "STAGING", "DEVELOPMENT", "PREVIEW"]);

export type RuntimeEnvironmentType = z.infer<typeof RuntimeEnvironmentTypeSchema>;

const RunSourceContextSchema = z.object({
  id: z.string(),
  metadata: z.any(),
});

const AutoYieldConfigSchema = z.object({
  startTaskThreshold: z.number(),
  beforeExecuteTaskThreshold: z.number(),
  beforeCompleteTaskThreshold: z.number(),
  afterCompleteTaskThreshold: z.number(),
});

const RunJobErrorSchema = z.object({
  status: z.literal("ERROR"),
  error: ErrorWithStackSchema,
  task: TaskSchema.optional(),
});

const RunJobYieldExecutionErrorSchema = z.object({
  status: z.literal("YIELD_EXECUTION"),
  key: z.string(),
});

const AutoYieldMetadataSchema = z.object({
  location: z.string(),
  timeRemaining: z.number(),
  timeElapsed: z.number(),
  limit: z.number().optional(),
});

const RunJobAutoYieldExecutionErrorSchema = AutoYieldMetadataSchema.extend({
  status: z.literal("AUTO_YIELD_EXECUTION"),
});

const RunJobAutoYieldWithCompletedTaskExecutionErrorSchema = z.object({
  status: z.literal("AUTO_YIELD_EXECUTION_WITH_COMPLETED_TASK"),
  id: z.string(),
  properties: z.array(DisplayPropertySchema).optional(),
  output: z.string().optional(),
  data: AutoYieldMetadataSchema,
});

const RunJobAutoYieldRateLimitErrorSchema = z.object({
  status: z.literal("AUTO_YIELD_RATE_LIMIT"),
  reset: z.coerce.number(),
});

const RunJobInvalidPayloadErrorSchema = z.object({
  status: z.literal("INVALID_PAYLOAD"),
  errors: z.array(SchemaErrorSchema),
});

const RunJobUnresolvedAuthErrorSchema = z.object({
  status: z.literal("UNRESOLVED_AUTH_ERROR"),
  issues: z.record(z.object({ id: z.string(), error: z.string() })),
});

const RunJobResumeWithTaskSchema = z.object({
  status: z.literal("RESUME_WITH_TASK"),
  task: TaskSchema,
});

const RunJobRetryWithTaskSchema = z.object({
  status: z.literal("RETRY_WITH_TASK"),
  task: TaskSchema,
  error: ErrorWithStackSchema,
  retryAt: z.coerce.date(),
});

const RunJobCanceledWithTaskSchema = z.object({
  status: z.literal("CANCELED"),
  task: TaskSchema,
});

const RunJobSuccessSchema = z.object({
  status: z.literal("SUCCESS"),
  output: DeserializedJsonSchema.optional(),
});

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

const RunJobResumeWithParallelTaskSchema = z.object({
  status: z.literal("RESUME_WITH_PARALLEL_TASK"),
  task: TaskSchema,
  childErrors: z.array(RunJobErrorResponseSchema),
});

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

export const RedactStringSchema = z.object({
  __redactedString: z.literal(true),
  strings: z.array(z.string()),
  interpolations: z.array(z.string()),
});

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

const RunTaskBodyInputSchema = RunTaskOptionsSchema.extend({
  idempotencyKey: z.string(),
  parentId: z.string().optional(),
});

const NormalizedResponseSchema = z.object({
  status: z.number(),
  body: z.any(),
  headers: z.record(z.string()).optional(),
});

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

const InitializeCronScheduleBodySchema = RegisterCommonScheduleBodySchema.merge(CronMetadataSchema);
