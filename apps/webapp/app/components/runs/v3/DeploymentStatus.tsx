import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { WorkerDeploymentStatus } from "@trigger.dev/database";
import assertNever from "assert-never";
import { Spinner } from "~/components/primitives/Spinner";
import { cn } from "~/utils/cn";

export function DeploymentStatus({
  status,
  className,
}: {
  status: WorkerDeploymentStatus;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-1", className)}>
      <DeploymentStatusIcon status={status} className="h-4 w-4" />
      <DeploymentStatusLabel status={status} />
    </span>
  );
}

function DeploymentStatusLabel({ status }: { status: WorkerDeploymentStatus }) {
  return (
    <span className={deploymentStatusClassNameColor(status)}>{deploymentStatusTitle(status)}</span>
  );
}

function DeploymentStatusIcon({
  status,
  className,
}: {
  status: WorkerDeploymentStatus;
  className: string;
}) {
  switch (status) {
    case "PENDING":
    case "BUILDING":
    case "DEPLOYING":
      return <Spinner className={cn(deploymentStatusClassNameColor(status), className)} />;
    case "DEPLOYED":
      return <CheckCircleIcon className={cn(deploymentStatusClassNameColor(status), className)} />;
    case "CANCELED":
      return <NoSymbolIcon className={cn(deploymentStatusClassNameColor(status), className)} />;
    case "FAILED":
      return <XCircleIcon className={cn(deploymentStatusClassNameColor(status), className)} />;
    case "TIMED_OUT":
      return (
        <ExclamationTriangleIcon
          className={cn(deploymentStatusClassNameColor(status), className)}
        />
      );
    default: {
      assertNever(status);
    }
  }
}

function deploymentStatusClassNameColor(status: WorkerDeploymentStatus): string {
  switch (status) {
    case "PENDING":
    case "BUILDING":
    case "DEPLOYING":
      return "text-pending";
    case "TIMED_OUT":
    case "CANCELED":
      return "text-charcoal-500";
    case "DEPLOYED":
      return "text-success";
    case "FAILED":
      return "text-error";
    default: {
      assertNever(status);
    }
  }
}

function deploymentStatusTitle(status: WorkerDeploymentStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending…";
    case "BUILDING":
      return "Building…";
    case "DEPLOYING":
      return "Deploying…";
    case "DEPLOYED":
      return "Deployed";
    case "CANCELED":
      return "Canceled";
    case "TIMED_OUT":
      return "Timed out";
    case "FAILED":
      return "Failed";
    default: {
      assertNever(status);
    }
  }
}
