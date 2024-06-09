import { UseDataFunctionReturn } from "remix-typedjson";
import invariant from "tiny-invariant";
import type { loader } from "~/routes/_app.orgs.$organizationSlug.projects.$projectParam.jobs.$jobParam/route";
import { useChanged } from "./useChanged";
import { UIMatch } from "@remix-run/react";
import { useTypedMatchesData } from "./useTypedMatchData";

type MatchedJob = UseDataFunctionReturn<typeof loader>["job"];

const jobMatchId =
  "routes/_app.orgs.$organizationSlug.projects.$projectParam.jobs.$jobParam";

function useOptionalJob(matches?: UIMatch[]) {
  const routeMatch = useTypedMatchesData<typeof loader>({
    id: jobMatchId,
    matches,
  });

  if (!routeMatch) {
    return undefined;
  }

  return routeMatch.job;
}

function useJob(matches?: UIMatch[]) {
  const job = useOptionalJob(matches);
  invariant(job, "Job must be defined");
  return job;
}

export const useJobChanged = (action: (org: MatchedJob | undefined) => void) => {
  useChanged(useOptionalJob, action);
};
