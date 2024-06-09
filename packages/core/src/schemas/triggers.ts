import { z } from "zod";
import { EventFilterSchema, EventRuleSchema } from "./eventFilter";
import { DisplayPropertySchema } from "./properties";
import { ScheduleMetadataSchema } from "./schedules";

const EventExampleSchema = z.object({
  id: z.string(),
  icon: z.string().optional(),
  name: z.string(),
  payload: z.any(),
});

type EventExample = z.infer<typeof EventExampleSchema>;

export const EventSpecificationSchema = z.object({
  name: z.string().or(z.array(z.string())),
  title: z.string(),
  source: z.string(),
  icon: z.string(),
  filter: EventFilterSchema.optional(),
  properties: z.array(DisplayPropertySchema).optional(),
  schema: z.any().optional(),
  examples: z.array(EventExampleSchema).optional(),
});

const DynamicTriggerMetadataSchema = z.object({
  type: z.literal("dynamic"),
  id: z.string(),
});

const TriggerHelpSchema = z.object({
  noRuns: z
    .object({
      text: z.string(),
      link: z.string().optional(),
    })
    .optional(),
});

const StaticTriggerMetadataSchema = z.object({
  type: z.literal("static"),
  title: z.union([z.string(), z.array(z.string())]),
  properties: z.array(DisplayPropertySchema).optional(),
  rule: EventRuleSchema,
  link: z.string().optional(),
  help: TriggerHelpSchema.optional(),
});

const InvokeTriggerMetadataSchema = z.object({
  type: z.literal("invoke"),
});

const ScheduledTriggerMetadataSchema = z.object({
  type: z.literal("scheduled"),
  schedule: ScheduleMetadataSchema,
});

export const TriggerMetadataSchema = z.discriminatedUnion("type", [
  DynamicTriggerMetadataSchema,
  StaticTriggerMetadataSchema,
  ScheduledTriggerMetadataSchema,
  InvokeTriggerMetadataSchema,
]);

type TriggerMetadata = z.infer<typeof TriggerMetadataSchema>;
