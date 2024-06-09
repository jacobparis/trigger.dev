import { z } from "zod";
import { RunStatusSchema } from "./runs";

const GetEventSchema = z.object({
  /** The event id */
  id: z.string(),
  /** The event name */
  name: z.string(),
  /** When the event was created */
  createdAt: z.coerce.date(),
  /** When the event was last updated */
  updatedAt: z.coerce.date(),
  /** The runs that were triggered by the event */
  runs: z.array(
    z.object({
      /** The Run id */
      id: z.string(),
      /** The Run status */
      status: RunStatusSchema,
      /** When the run started */
      startedAt: z.coerce.date().optional().nullable(),
      /** When the run completed */
      completedAt: z.coerce.date().optional().nullable(),
    })
  ),
});

type GetEvent = z.infer<typeof GetEventSchema>;

const CancelRunsForEventSchema = z.object({
  cancelledRunIds: z.array(z.string()),
  failedToCancelRunIds: z.array(z.string()),
});

type CancelRunsForEvent = z.infer<typeof CancelRunsForEventSchema>;
