import { z } from "zod";

const MISSING_CONNECTION_NOTIFICATION = "dev.trigger.notifications.missingConnection";

const MISSING_CONNECTION_RESOLVED_NOTIFICATION =
  "dev.trigger.notifications.missingConnectionResolved";

const CommonMissingConnectionNotificationPayloadSchema = z.object({
  id: z.string(),
  client: z.object({
    id: z.string(),
    title: z.string(),
    scopes: z.array(z.string()),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
  authorizationUrl: z.string(),
});

const MissingDeveloperConnectionNotificationPayloadSchema =
  CommonMissingConnectionNotificationPayloadSchema.extend({
    type: z.literal("DEVELOPER"),
  });

const MissingExternalConnectionNotificationPayloadSchema =
  CommonMissingConnectionNotificationPayloadSchema.extend({
    type: z.literal("EXTERNAL"),
    account: z.object({
      id: z.string(),
      metadata: z.any(),
    }),
  });

const MissingConnectionNotificationPayloadSchema = z.discriminatedUnion("type", [
  MissingDeveloperConnectionNotificationPayloadSchema,
  MissingExternalConnectionNotificationPayloadSchema,
]);

type MissingConnectionNotificationPayload = z.infer<
  typeof MissingConnectionNotificationPayloadSchema
>;

const CommonMissingConnectionNotificationResolvedPayloadSchema = z.object({
  id: z.string(),
  client: z.object({
    id: z.string(),
    title: z.string(),
    scopes: z.array(z.string()),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    integrationIdentifier: z.string(),
    integrationAuthMethod: z.string(),
  }),
  expiresAt: z.coerce.date(),
});

const MissingDeveloperConnectionResolvedNotificationPayloadSchema =
  CommonMissingConnectionNotificationResolvedPayloadSchema.extend({
    type: z.literal("DEVELOPER"),
  });

const MissingExternalConnectionResolvedNotificationPayloadSchema =
  CommonMissingConnectionNotificationResolvedPayloadSchema.extend({
    type: z.literal("EXTERNAL"),
    account: z.object({
      id: z.string(),
      metadata: z.any(),
    }),
  });

const MissingConnectionResolvedNotificationPayloadSchema = z.discriminatedUnion("type", [
  MissingDeveloperConnectionResolvedNotificationPayloadSchema,
  MissingExternalConnectionResolvedNotificationPayloadSchema,
]);

type MissingConnectionResolvedNotificationPayload = z.infer<
  typeof MissingConnectionResolvedNotificationPayloadSchema
>;
