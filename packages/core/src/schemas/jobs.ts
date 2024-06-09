import { z } from "zod";

const CancelRunsForJobSchema = z.object({
  cancelledRunIds: z.array(z.string()),
  failedToCancelRunIds: z.array(z.string()),
});

type CancelRunsForJob = z.infer<typeof CancelRunsForJobSchema>;
