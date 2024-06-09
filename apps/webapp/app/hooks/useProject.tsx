import { UIMatch } from "@remix-run/react";
import { UseDataFunctionReturn } from "remix-typedjson";
import invariant from "tiny-invariant";
import type { loader as orgLoader } from "~/routes/_app.orgs.$organizationSlug/route";
import { useChanged } from "./useChanged";
import { useTypedMatchesData } from "./useTypedMatchData";
import { organizationMatchId } from "./useOrganizations";

type MatchedProject = UseDataFunctionReturn<typeof orgLoader>["project"];

function useOptionalProject(matches?: UIMatch[]) {
  const routeMatch = useTypedMatchesData<typeof orgLoader>({
    id: organizationMatchId,
    matches,
  });

  return routeMatch?.project;
}

function useProject(matches?: UIMatch[]) {
  const project = useOptionalProject(matches);
  invariant(project, "Project must be defined");
  return project;
}

export const useProjectChanged = (action: (org: MatchedProject | undefined) => void) => {
  useChanged(useOptionalProject, action);
};
