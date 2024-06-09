import {
  ProjectAlertChannel,
  ProjectAlertChannelType,
  ProjectAlertType,
} from "@trigger.dev/database";
import assertNever from "assert-never";
import { z } from "zod";
import { env } from "~/env.server";
import {
  ProjectAlertEmailProperties,
  ProjectAlertWebhookProperties,
} from "~/models/projectAlert.server";
import { decryptSecret } from "~/services/secrets/secretStore.server";

const ApiAlertType = z.enum(["attempt_failure", "deployment_failure", "deployment_success"]);

type ApiAlertType = z.infer<typeof ApiAlertType>;

const ApiAlertEnvironmentType = z.enum(["STAGING", "PRODUCTION"]);

type ApiAlertEnvironmentType = z.infer<typeof ApiAlertEnvironmentType>;

const ApiAlertChannel = z.enum(["email", "webhook"]);

type ApiAlertChannel = z.infer<typeof ApiAlertChannel>;

const ApiAlertChannelData = z.object({
  email: z.string().optional(),
  url: z.string().optional(),
  secret: z.string().optional(),
});

type ApiAlertChannelData = z.infer<typeof ApiAlertChannelData>;

export const ApiCreateAlertChannel = z.object({
  alertTypes: ApiAlertType.array(),
  name: z.string(),
  channel: ApiAlertChannel,
  channelData: ApiAlertChannelData,
  deduplicationKey: z.string().optional(),
  environmentTypes: ApiAlertEnvironmentType.array().default(["STAGING", "PRODUCTION"]),
});

export type ApiCreateAlertChannel = z.infer<typeof ApiCreateAlertChannel>;

const ApiAlertChannelObject = z.object({
  id: z.string(),
  name: z.string(),
  alertTypes: ApiAlertType.array(),
  channel: ApiAlertChannel,
  channelData: ApiAlertChannelData,
  deduplicationKey: z.string().optional(),
});

type ApiAlertChannelObject = z.infer<typeof ApiAlertChannelObject>;

export class ApiAlertChannelPresenter {
  public static async alertChannelToApi(
    alertChannel: ProjectAlertChannel
  ): Promise<ApiAlertChannelObject> {
    return {
      id: alertChannel.friendlyId,
      name: alertChannel.name,
      alertTypes: alertChannel.alertTypes.map((type) => this.alertTypeToApi(type)),
      channel: this.alertChannelTypeToApi(alertChannel.type),
      channelData: await channelDataFromProperties(alertChannel.type, alertChannel.properties),
      deduplicationKey: alertChannel.userProvidedDeduplicationKey
        ? alertChannel.deduplicationKey
        : undefined,
    };
  }

  public static alertTypeToApi(alertType: ProjectAlertType): ApiAlertType {
    switch (alertType) {
      case "TASK_RUN_ATTEMPT":
        return "attempt_failure";
      case "DEPLOYMENT_FAILURE":
        return "deployment_failure";
      case "DEPLOYMENT_SUCCESS":
        return "deployment_success";
      default:
        assertNever(alertType);
    }
  }

  public static alertTypeFromApi(alertType: ApiAlertType): ProjectAlertType {
    switch (alertType) {
      case "attempt_failure":
        return "TASK_RUN_ATTEMPT";
      case "deployment_failure":
        return "DEPLOYMENT_FAILURE";
      case "deployment_success":
        return "DEPLOYMENT_SUCCESS";
      default:
        assertNever(alertType);
    }
  }

  public static alertChannelTypeToApi(type: ProjectAlertChannelType): ApiAlertChannel {
    switch (type) {
      case "EMAIL":
        return "email";
      case "WEBHOOK":
        return "webhook";
      case "SLACK":
        throw new Error("Slack channels are not supported");
      default:
        assertNever(type);
    }
  }
}

async function channelDataFromProperties(
  type: ProjectAlertChannelType,
  properties: ProjectAlertChannel["properties"]
): Promise<ApiAlertChannelData> {
  if (!properties) {
    return {};
  }

  switch (type) {
    case "EMAIL":
      return ProjectAlertEmailProperties.parse(properties);
    case "WEBHOOK":
      const { url, secret } = ProjectAlertWebhookProperties.parse(properties);

      return {
        url,
        secret: await decryptSecret(env.ENCRYPTION_KEY, secret),
      };
    case "SLACK":
      throw new Error("Slack channels are not supported");
    default:
      assertNever(type);
  }
}
