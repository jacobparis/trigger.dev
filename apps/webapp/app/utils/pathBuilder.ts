import type {
  BackgroundWorkerTask,
  EventRecord,
  Integration,
  TaskRun,
  TriggerHttpEndpoint,
  TriggerSource,
  Webhook,
  WorkerDeployment,
} from "@trigger.dev/database";
import { z } from "zod";
import { TaskRunListSearchFilters } from "~/components/runs/v3/RunFilters";
import { Job } from "~/models/job.server";
import type { Organization } from "~/models/organization.server";
import type { Project } from "~/models/project.server";
import { objectToSearchParams } from "./searchParams";

type OrgForPath = Pick<Organization, "slug">;
type ProjectForPath = Pick<Project, "slug">;
type JobForPath = Pick<Job, "slug">;
type RunForPath = Pick<Job, "id">;
type IntegrationForPath = Pick<Integration, "slug">;
type TriggerForPath = Pick<TriggerSource, "id">;
type EventForPath = Pick<EventRecord, "id">;
type WebhookForPath = Pick<Webhook, "id">;
type HttpEndpointForPath = Pick<TriggerHttpEndpoint, "key">;
type TaskForPath = Pick<BackgroundWorkerTask, "friendlyId">;
type v3RunForPath = Pick<TaskRun, "friendlyId">;
type v3SpanForPath = Pick<TaskRun, "spanId">;
type DeploymentForPath = Pick<WorkerDeployment, "shortCode">;

const OrganizationParamsSchema = z.object({
  organizationSlug: z.string(),
});

export const ProjectParamSchema = OrganizationParamsSchema.extend({
  projectParam: z.string(),
});

const JobParamsSchema = ProjectParamSchema.extend({
  jobParam: z.string(),
});

const RunParamsSchema = JobParamsSchema.extend({
  runParam: z.string(),
});

const TaskParamsSchema = RunParamsSchema.extend({
  taskParam: z.string(),
});

const IntegrationClientParamSchema = OrganizationParamsSchema.extend({
  clientParam: z.string(),
});

const TriggerSourceParamSchema = ProjectParamSchema.extend({
  triggerParam: z.string(),
});

const EventParamSchema = ProjectParamSchema.extend({
  eventParam: z.string(),
});

const TriggerSourceRunParamsSchema = TriggerSourceParamSchema.extend({
  runParam: z.string(),
});

const TriggerSourceRunTaskParamsSchema = TriggerSourceRunParamsSchema.extend({
  taskParam: z.string(),
});

const HttpEndpointParamSchema = ProjectParamSchema.extend({
  httpEndpointParam: z.string(),
});

//v3
export const v3TaskParamsSchema = ProjectParamSchema.extend({
  taskParam: z.string(),
});

export const v3RunParamsSchema = ProjectParamSchema.extend({
  runParam: z.string(),
});

export const v3SpanParamsSchema = v3RunParamsSchema.extend({
  spanParam: z.string(),
});

const v3DeploymentParams = ProjectParamSchema.extend({
  deploymentParam: z.string(),
});

const v3ScheduleParams = ProjectParamSchema.extend({
  scheduleParam: z.string(),
});

function trimTrailingSlash(path: string) {
  return path.replace(/\/$/, "");
}

function parentPath(path: string) {
  const trimmedTrailingSlash = trimTrailingSlash(path);
  const lastSlashIndex = trimmedTrailingSlash.lastIndexOf("/");
  return trimmedTrailingSlash.substring(0, lastSlashIndex);
}

export function rootPath() {
  return `/`;
}

export function accountPath() {
  return `/account`;
}

export function personalAccessTokensPath() {
  return `/account/tokens`;
}

export function invitesPath() {
  return `/invites`;
}

export function confirmBasicDetailsPath() {
  return `/confirm-basic-details`;
}

export function acceptInvitePath(token: string) {
  return `/invite-accept?token=${token}`;
}

export function resendInvitePath() {
  return `/invite-resend`;
}

export function logoutPath() {
  return `/logout`;
}

export function revokeInvitePath() {
  return `/invite-revoke`;
}

// Org
export function organizationPath(organization: OrgForPath) {
  return `/orgs/${organizationParam(organization)}`;
}

export function newOrganizationPath() {
  return `/orgs/new`;
}

function selectPlanPath(organization: OrgForPath) {
  return `${organizationPath(organization)}/select-plan`;
}

export function organizationTeamPath(organization: OrgForPath) {
  return `${organizationPath(organization)}/team`;
}

export function inviteTeamMemberPath(organization: OrgForPath) {
  return `${organizationPath(organization)}/invite`;
}

export function organizationBillingPath(organization: OrgForPath) {
  return `${organizationPath(organization)}/billing`;
}

export function organizationSettingsPath(organization: OrgForPath) {
  return `${organizationPath(organization)}/settings`;
}

export function organizationIntegrationsPath(organization: OrgForPath) {
  return `${organizationPath(organization)}/integrations`;
}

function usagePath(organization: OrgForPath) {
  return `${organizationPath(organization)}/billing`;
}

function stripePortalPath(organization: OrgForPath) {
  return `/resources/${organization.slug}/subscription/portal`;
}

export function plansPath(organization: OrgForPath) {
  return `${organizationPath(organization)}/billing/plans`;
}

function subscribedPath(organization: OrgForPath) {
  return `${organizationPath(organization)}/subscribed`;
}

function organizationParam(organization: OrgForPath) {
  return organization.slug;
}

// Project
export function projectPath(organization: OrgForPath, project: ProjectForPath) {
  return `/orgs/${organizationParam(organization)}/projects/${projectParam(project)}`;
}

export function projectRunsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/runs`;
}

export function projectSetupPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup`;
}

function projectSetupNextjsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup/nextjs`;
}

function projectSetupRemixPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup/remix`;
}

function projectSetupExpressPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup/express`;
}

function projectSetupRedwoodPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup/redwood`;
}

function projectSetupNuxtPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup/nuxt`;
}

function projectSetupSvelteKitPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup/sveltekit`;
}

function projectSetupFastifyPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup/fastify`;
}

function projectSetupAstroPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup/astro`;
}

function projectSetupNestjsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/setup/nestjs`;
}

function projectJobsPath(organization: OrgForPath, project: ProjectForPath) {
  return projectPath(organization, project);
}

export function projectTriggersPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/triggers`;
}

export function projectEventsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/events`;
}

export function projectSettingsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/settings`;
}

function projectEventPath(
  organization: OrgForPath,
  project: ProjectForPath,
  event: EventForPath
) {
  return `${projectEventsPath(organization, project)}/${event.id}`;
}

export function projectHttpEndpointsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/http-endpoints`;
}
function projectHttpEndpointPath(
  organization: OrgForPath,
  project: ProjectForPath,
  httpEndpoint: HttpEndpointForPath
) {
  return `${projectHttpEndpointsPath(organization, project)}/${httpEndpoint.key}`;
}

export function projectEnvironmentsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectPath(organization, project)}/environments`;
}

function projectStreamingPath(id: string) {
  return `/resources/projects/${id}/jobs/stream`;
}

function projectEnvironmentsStreamingPath(
  organization: OrgForPath,
  project: ProjectForPath
) {
  return `${projectEnvironmentsPath(organization, project)}/stream`;
}

function endpointStreamingPath(environment: { id: string }) {
  return `/resources/environments/${environment.id}/endpoint/stream`;
}

export function newProjectPath(organization: OrgForPath) {
  return `${organizationPath(organization)}/projects/new`;
}

function projectParam(project: ProjectForPath) {
  return project.slug;
}

//v3 project
export function v3ProjectPath(organization: OrgForPath, project: ProjectForPath) {
  return `/orgs/${organizationParam(organization)}/projects/v3/${projectParam(project)}`;
}

export function v3TasksStreamingPath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3ProjectPath(organization, project)}/tasks/stream`;
}

export function v3ApiKeysPath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3ProjectPath(organization, project)}/apikeys`;
}

export function v3EnvironmentVariablesPath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3ProjectPath(organization, project)}/environment-variables`;
}

function v3NewEnvironmentVariablesPath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3EnvironmentVariablesPath(organization, project)}/new`;
}

export function v3ProjectAlertsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3ProjectPath(organization, project)}/alerts`;
}

function v3NewProjectAlertPath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3ProjectAlertsPath(organization, project)}/new`;
}

function v3NewProjectAlertPathConnectToSlackPath(
  organization: OrgForPath,
  project: ProjectForPath
) {
  return `${v3ProjectAlertsPath(organization, project)}/new/connect-to-slack`;
}

export function v3TestPath(
  organization: OrgForPath,
  project: ProjectForPath,
  environmentSlug?: string
) {
  return `${v3ProjectPath(organization, project)}/test${
    environmentSlug ? `?environment=${environmentSlug}` : ""
  }`;
}

export function v3TestTaskPath(
  organization: OrgForPath,
  project: ProjectForPath,
  task: TaskForPath,
  environmentSlug: string
) {
  return `${v3TestPath(organization, project)}/tasks/${
    task.friendlyId
  }?environment=${environmentSlug}`;
}

export function v3RunsPath(
  organization: OrgForPath,
  project: ProjectForPath,
  filters?: TaskRunListSearchFilters
) {
  const searchParams = objectToSearchParams(filters);
  const query = searchParams ? `?${searchParams.toString()}` : "";
  return `${v3ProjectPath(organization, project)}/runs${query}`;
}

export function v3RunPath(organization: OrgForPath, project: ProjectForPath, run: v3RunForPath) {
  return `${v3RunsPath(organization, project)}/${run.friendlyId}`;
}

export function v3RunSpanPath(
  organization: OrgForPath,
  project: ProjectForPath,
  run: v3RunForPath,
  span: v3SpanForPath
) {
  return `${v3RunPath(organization, project, run)}?span=${span.spanId}`;
}

export function v3TraceSpanPath(
  organization: OrgForPath,
  project: ProjectForPath,
  traceId: string,
  spanId: string
) {
  return `${v3ProjectPath(organization, project)}/traces/${traceId}/spans/${spanId}`;
}

export function v3RunStreamingPath(
  organization: OrgForPath,
  project: ProjectForPath,
  run: v3RunForPath
) {
  return `${v3RunPath(organization, project, run)}/stream`;
}

export function v3SchedulesPath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3ProjectPath(organization, project)}/schedules`;
}

function v3SchedulePath(
  organization: OrgForPath,
  project: ProjectForPath,
  schedule: { friendlyId: string }
) {
  return `${v3ProjectPath(organization, project)}/schedules/${schedule.friendlyId}`;
}

function v3EditSchedulePath(
  organization: OrgForPath,
  project: ProjectForPath,
  schedule: { friendlyId: string }
) {
  return `${v3ProjectPath(organization, project)}/schedules/edit/${schedule.friendlyId}`;
}

function v3NewSchedulePath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3ProjectPath(organization, project)}/schedules/new`;
}

export function v3ProjectSettingsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3ProjectPath(organization, project)}/settings`;
}

export function v3DeploymentsPath(organization: OrgForPath, project: ProjectForPath) {
  return `${v3ProjectPath(organization, project)}/deployments`;
}

function v3DeploymentPath(
  organization: OrgForPath,
  project: ProjectForPath,
  deployment: DeploymentForPath
) {
  return `${v3DeploymentsPath(organization, project)}/${deployment.shortCode}`;
}

// Integration
function integrationClientPath(organization: OrgForPath, client: IntegrationForPath) {
  return `${organizationIntegrationsPath(organization)}/${clientParam(client)}`;
}

function integrationClientConnectionsPath(
  organization: OrgForPath,
  client: IntegrationForPath
) {
  return `${integrationClientPath(organization, client)}/connections`;
}

function integrationClientScopesPath(organization: OrgForPath, client: IntegrationForPath) {
  return `${integrationClientPath(organization, client)}/scopes`;
}

function clientParam(integration: IntegrationForPath) {
  return integration.slug;
}

// Triggers
function projectScheduledTriggersPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectTriggersPath(organization, project)}/scheduled`;
}

function externalTriggerPath(
  organization: OrgForPath,
  project: ProjectForPath,
  trigger: TriggerForPath
) {
  return `${projectTriggersPath(organization, project)}/external/${triggerSourceParam(trigger)}`;
}

function externalTriggerRunsParentPath(
  organization: OrgForPath,
  project: ProjectForPath,
  trigger: TriggerForPath
) {
  return `${externalTriggerPath(organization, project, trigger)}/runs`;
}

function externalTriggerRunPath(
  organization: OrgForPath,
  project: ProjectForPath,
  trigger: TriggerForPath,
  run: RunForPath
) {
  return `${externalTriggerRunsParentPath(organization, project, trigger)}/${run.id}`;
}

function externalTriggerRunStreamingPath(
  organization: OrgForPath,
  project: ProjectForPath,
  trigger: TriggerForPath,
  run: RunForPath
) {
  return `${externalTriggerRunPath(organization, project, trigger, run)}/stream`;
}

function triggerSourceParam(trigger: TriggerForPath) {
  return trigger.id;
}

function projectWebhookTriggersPath(organization: OrgForPath, project: ProjectForPath) {
  return `${projectTriggersPath(organization, project)}/webhooks`;
}

function webhookTriggerPath(
  organization: OrgForPath,
  project: ProjectForPath,
  webhook: WebhookForPath
) {
  return `${projectTriggersPath(organization, project)}/webhooks/${webhookSourceParam(webhook)}`;
}

function webhookTriggerRunsParentPath(
  organization: OrgForPath,
  project: ProjectForPath,
  webhook: WebhookForPath
) {
  return `${webhookTriggerPath(organization, project, webhook)}/runs`;
}

function webhookTriggerRunPath(
  organization: OrgForPath,
  project: ProjectForPath,
  webhook: WebhookForPath,
  run: RunForPath
) {
  return `${webhookTriggerRunsParentPath(organization, project, webhook)}/${run.id}`;
}

function webhookTriggerRunStreamingPath(
  organization: OrgForPath,
  project: ProjectForPath,
  webhook: WebhookForPath,
  run: RunForPath
) {
  return `${webhookTriggerRunPath(organization, project, webhook, run)}/stream`;
}

function webhookDeliveryPath(
  organization: OrgForPath,
  project: ProjectForPath,
  webhook: WebhookForPath
) {
  return `${webhookTriggerPath(organization, project, webhook)}/delivery`;
}

function webhookTriggerDeliveryRunsParentPath(
  organization: OrgForPath,
  project: ProjectForPath,
  webhook: WebhookForPath
) {
  return `${webhookTriggerRunsParentPath(organization, project, webhook)}/delivery`;
}

function webhookTriggerDeliveryRunPath(
  organization: OrgForPath,
  project: ProjectForPath,
  webhook: WebhookForPath,
  run: RunForPath
) {
  return `${webhookTriggerDeliveryRunsParentPath(organization, project, webhook)}/${run.id}`;
}

function webhookTriggerDeliveryRunStreamingPath(
  organization: OrgForPath,
  project: ProjectForPath,
  webhook: WebhookForPath,
  run: RunForPath
) {
  return `${webhookTriggerDeliveryRunPath(organization, project, webhook, run)}/stream`;
}

function webhookSourceParam(webhook: WebhookForPath) {
  return webhook.id;
}

// Job
function jobPath(organization: OrgForPath, project: ProjectForPath, job: JobForPath) {
  return `${projectPath(organization, project)}/jobs/${jobParam(job)}`;
}

function jobTestPath(organization: OrgForPath, project: ProjectForPath, job: JobForPath) {
  return `${jobPath(organization, project, job)}/test`;
}

function jobTriggerPath(organization: OrgForPath, project: ProjectForPath, job: JobForPath) {
  return `${jobPath(organization, project, job)}/trigger`;
}

function jobSettingsPath(
  organization: OrgForPath,
  project: ProjectForPath,
  job: JobForPath
) {
  return `${jobPath(organization, project, job)}/settings`;
}

function jobParam(job: JobForPath) {
  return job.slug;
}

// Run
function jobRunsParentPath(
  organization: OrgForPath,
  project: ProjectForPath,
  job: JobForPath
) {
  return `${jobPath(organization, project, job)}/runs`;
}

export function runPath(
  organization: OrgForPath,
  project: ProjectForPath,
  job: JobForPath,
  run: RunForPath
) {
  return `${jobRunsParentPath(organization, project, job)}/${runParam(run)}`;
}

function jobRunDashboardPath(
  organization: OrgForPath,
  project: ProjectForPath,
  job: JobForPath,
  run: RunForPath
) {
  return runTriggerPath(runPath(organization, project, job, run));
}

function runStreamingPath(
  organization: OrgForPath,
  project: ProjectForPath,
  job: JobForPath,
  run: RunForPath
) {
  return `${runPath(organization, project, job, run)}/stream`;
}

function runParam(run: RunForPath) {
  return run.id;
}

// Task
function runTaskPath(runPath: string, taskId: string) {
  return `${runPath}/tasks/${taskId}`;
}

// Event
function runTriggerPath(runPath: string) {
  return `${runPath}/trigger`;
}

// Event
function runCompletedPath(runPath: string) {
  return `${runPath}/completed`;
}

// Docs
function docsRoot() {
  return "https://trigger.dev/docs";
}

export function docsPath(path: string) {
  return `${docsRoot()}/${path}`;
}

function docsIntegrationPath(api: string) {
  return `${docsRoot()}/integrations/apis/${api}`;
}

function docsCreateIntegration() {
  return `${docsRoot()}/integrations/create`;
}

//api
function apiReferencePath(apiSlug: string) {
  return `https://trigger.dev/apis/${apiSlug}`;
}
