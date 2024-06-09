import { z } from "zod";

const PRIMARY_VARIANT = "primary";

const Variant = z.enum([PRIMARY_VARIANT]);
type Variant = z.infer<typeof Variant>;

const AccessoryItem = z.object({
  text: z.string(),
  variant: z.string().optional(),
  url: z.string().optional(),
});

const Accessory = z.object({
  items: z.array(AccessoryItem),
  style: z.enum(["codepath"]).optional(),
});

export type Accessory = z.infer<typeof Accessory>;

const TaskEventStyle = z
  .object({
    icon: z.string().optional(),
    variant: Variant.optional(),
    accessory: Accessory.optional(),
  })
  .default({
    icon: undefined,
    variant: undefined,
  });

type TaskEventStyle = z.infer<typeof TaskEventStyle>;
