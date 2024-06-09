import { z } from "zod";

const TaskRunBuiltInError = z.object({
  type: z.literal("BUILT_IN_ERROR"),
  name: z.string(),
  message: z.string(),
  stackTrace: z.string(),
});

type TaskRunBuiltInError = z.infer<typeof TaskRunBuiltInError>;

const TaskRunCustomErrorObject = z.object({
  type: z.literal("CUSTOM_ERROR"),
  raw: z.string(),
});

type TaskRunCustomErrorObject = z.infer<typeof TaskRunCustomErrorObject>;

const TaskRunStringError = z.object({
  type: z.literal("STRING_ERROR"),
  raw: z.string(),
});

type TaskRunStringError = z.infer<typeof TaskRunStringError>;

export const TaskRunErrorCodes = {
  COULD_NOT_FIND_EXECUTOR: "COULD_NOT_FIND_EXECUTOR",
  COULD_NOT_FIND_TASK: "COULD_NOT_FIND_TASK",
  CONFIGURED_INCORRECTLY: "CONFIGURED_INCORRECTLY",
  TASK_ALREADY_RUNNING: "TASK_ALREADY_RUNNING",
  TASK_EXECUTION_FAILED: "TASK_EXECUTION_FAILED",
  TASK_EXECUTION_ABORTED: "TASK_EXECUTION_ABORTED",
  TASK_PROCESS_EXITED_WITH_NON_ZERO_CODE: "TASK_PROCESS_EXITED_WITH_NON_ZERO_CODE",
  TASK_PROCESS_SIGKILL_TIMEOUT: "TASK_PROCESS_SIGKILL_TIMEOUT",
  TASK_RUN_CANCELLED: "TASK_RUN_CANCELLED",
  TASK_OUTPUT_ERROR: "TASK_OUTPUT_ERROR",
  HANDLE_ERROR_ERROR: "HANDLE_ERROR_ERROR",
  GRACEFUL_EXIT_TIMEOUT: "GRACEFUL_EXIT_TIMEOUT",
} as const;

const TaskRunInternalError = z.object({
  type: z.literal("INTERNAL_ERROR"),
  code: z.enum([
    "COULD_NOT_FIND_EXECUTOR",
    "COULD_NOT_FIND_TASK",
    "CONFIGURED_INCORRECTLY",
    "TASK_ALREADY_RUNNING",
    "TASK_EXECUTION_FAILED",
    "TASK_EXECUTION_ABORTED",
    "TASK_PROCESS_EXITED_WITH_NON_ZERO_CODE",
    "TASK_PROCESS_SIGKILL_TIMEOUT",
    "TASK_RUN_CANCELLED",
    "TASK_OUTPUT_ERROR",
    "HANDLE_ERROR_ERROR",
    "GRACEFUL_EXIT_TIMEOUT",
    "TASK_RUN_HEARTBEAT_TIMEOUT",
  ]),
  message: z.string().optional(),
});

type TaskRunInternalError = z.infer<typeof TaskRunInternalError>;

export const TaskRunError = z.discriminatedUnion("type", [
  TaskRunBuiltInError,
  TaskRunCustomErrorObject,
  TaskRunStringError,
  TaskRunInternalError,
]);

export type TaskRunError = z.infer<typeof TaskRunError>;

const TaskRun = z.object({
  id: z.string(),
  payload: z.string(),
  payloadType: z.string(),
  context: z.any(),
  tags: z.array(z.string()),
  isTest: z.boolean().default(false),
  createdAt: z.coerce.date(),
  idempotencyKey: z.string().optional(),
});

type TaskRun = z.infer<typeof TaskRun>;

const TaskRunExecutionTask = z.object({
  id: z.string(),
  filePath: z.string(),
  exportName: z.string(),
});

type TaskRunExecutionTask = z.infer<typeof TaskRunExecutionTask>;

const TaskRunExecutionAttempt = z.object({
  id: z.string(),
  number: z.number(),
  startedAt: z.coerce.date(),
  backgroundWorkerId: z.string(),
  backgroundWorkerTaskId: z.string(),
  status: z.string(),
});

type TaskRunExecutionAttempt = z.infer<typeof TaskRunExecutionAttempt>;

const TaskRunExecutionEnvironment = z.object({
  id: z.string(),
  slug: z.string(),
  type: z.enum(["PRODUCTION", "STAGING", "DEVELOPMENT", "PREVIEW"]),
});

type TaskRunExecutionEnvironment = z.infer<typeof TaskRunExecutionEnvironment>;

const TaskRunExecutionOrganization = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
});

type TaskRunExecutionOrganization = z.infer<typeof TaskRunExecutionOrganization>;

const TaskRunExecutionProject = z.object({
  id: z.string(),
  ref: z.string(),
  slug: z.string(),
  name: z.string(),
});

type TaskRunExecutionProject = z.infer<typeof TaskRunExecutionProject>;

const TaskRunExecutionQueue = z.object({
  id: z.string(),
  name: z.string(),
});

type TaskRunExecutionQueue = z.infer<typeof TaskRunExecutionQueue>;

const TaskRunExecutionBatch = z.object({
  id: z.string(),
});

export const TaskRunExecution = z.object({
  task: TaskRunExecutionTask,
  attempt: TaskRunExecutionAttempt,
  run: TaskRun,
  queue: TaskRunExecutionQueue,
  environment: TaskRunExecutionEnvironment,
  organization: TaskRunExecutionOrganization,
  project: TaskRunExecutionProject,
  batch: TaskRunExecutionBatch.optional(),
});

export type TaskRunExecution = z.infer<typeof TaskRunExecution>;

export const TaskRunContext = z.object({
  task: TaskRunExecutionTask,
  attempt: TaskRunExecutionAttempt.omit({
    backgroundWorkerId: true,
    backgroundWorkerTaskId: true,
  }),
  run: TaskRun.omit({ payload: true, payloadType: true }),
  queue: TaskRunExecutionQueue,
  environment: TaskRunExecutionEnvironment,
  organization: TaskRunExecutionOrganization,
  project: TaskRunExecutionProject,
  batch: TaskRunExecutionBatch.optional(),
});

export type TaskRunContext = z.infer<typeof TaskRunContext>;

export const TaskRunExecutionRetry = z.object({
  timestamp: z.number(),
  delay: z.number(),
  error: z.unknown().optional(),
});

export type TaskRunExecutionRetry = z.infer<typeof TaskRunExecutionRetry>;

export const TaskRunFailedExecutionResult = z.object({
  ok: z.literal(false),
  id: z.string(),
  error: TaskRunError,
  retry: TaskRunExecutionRetry.optional(),
  skippedRetrying: z.boolean().optional(),
});

export type TaskRunFailedExecutionResult = z.infer<typeof TaskRunFailedExecutionResult>;

const TaskRunSuccessfulExecutionResult = z.object({
  ok: z.literal(true),
  id: z.string(),
  output: z.string().optional(),
  outputType: z.string(),
});

type TaskRunSuccessfulExecutionResult = z.infer<typeof TaskRunSuccessfulExecutionResult>;

export const TaskRunExecutionResult = z.discriminatedUnion("ok", [
  TaskRunSuccessfulExecutionResult,
  TaskRunFailedExecutionResult,
]);

export type TaskRunExecutionResult = z.infer<typeof TaskRunExecutionResult>;

export const BatchTaskRunExecutionResult = z.object({
  id: z.string(),
  items: TaskRunExecutionResult.array(),
});

export type BatchTaskRunExecutionResult = z.infer<typeof BatchTaskRunExecutionResult>;
