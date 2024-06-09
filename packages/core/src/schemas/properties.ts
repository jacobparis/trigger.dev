import { z } from "zod";

/** A property that is displayed in the logs */
export const DisplayPropertySchema = z.object({
  /** The label for the property */
  label: z.string(),
  /** The value of the property */
  text: z.string(),
  /** The URL to link to when the property is clicked */
  url: z.string().optional(),
  /** The URL to a list of images to display next to the property */
  imageUrl: z.array(z.string()).optional(),
});

const DisplayPropertiesSchema = z.array(DisplayPropertySchema);

type DisplayProperty = z.infer<typeof DisplayPropertySchema>;

export const StyleSchema = z.object({
  /** The style, `normal` or `minimal` */
  style: z.enum(["normal", "minimal"]),
  /** A variant of the style. */
  variant: z.string().optional(),
});

type Style = z.infer<typeof StyleSchema>;
type StyleName = Style["style"];
