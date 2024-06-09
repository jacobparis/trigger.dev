import { z } from "zod";
import { SerializableJsonSchema } from "./json";
import { RunStatusSchema } from "./runs";

const StatusUpdateStateSchema = z.union([
  z.literal("loading"),
  z.literal("success"),
  z.literal("failure"),
]);
type StatusUpdateState = z.infer<typeof StatusUpdateStateSchema>;

const StatusUpdateDataSchema = z.record(SerializableJsonSchema);
type StatusUpdateData = z.infer<typeof StatusUpdateDataSchema>;

const StatusUpdateSchema = z.object({
  label: z.string().optional(),
  state: StatusUpdateStateSchema.optional(),
  data: StatusUpdateDataSchema.optional(),
});
type StatusUpdate = z.infer<typeof StatusUpdateSchema>;

const InitalStatusUpdateSchema = StatusUpdateSchema.required({ label: true });
type InitialStatusUpdate = z.infer<typeof InitalStatusUpdateSchema>;

const StatusHistorySchema = z.array(StatusUpdateSchema);
type StatusHistory = z.infer<typeof StatusHistorySchema>;

export const JobRunStatusRecordSchema = InitalStatusUpdateSchema.extend({
  key: z.string(),
  history: StatusHistorySchema,
});

export type JobRunStatusRecord = z.infer<typeof JobRunStatusRecordSchema>;
