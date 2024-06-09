import { formatDuration } from "@trigger.dev/core/v3";
import { RunListAppliedFilters, RunListItem } from "~/presenters/v3/RunListPresenter.server";

export function TaskRunsTable() {
  return (
    <span>
      {formatDuration(new Date("2024-05-01"), new Date(), {
        style: "short",
      })}
    </span>
  );
}
