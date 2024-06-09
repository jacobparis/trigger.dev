import { Link, Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { redirect, typedjson } from "remix-typedjson";
import { RouteErrorDisplay } from "~/components/ErrorDisplay";
import { AppContainer, MainCenteredContainer } from "~/components/layout/AppLayout";
import { clearRedirectTo, commitSession } from "~/services/redirectTo.server";
import { requireUser } from "~/services/session.server";
import { confirmBasicDetailsPath } from "~/utils/pathBuilder";

export default function App() {
  return (
    <div>
      <div>
        <Link to="/good"> Good link </Link>
        <Link to="/bad"> Bad link </Link>
      </div>
      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <>
      <AppContainer>
        <MainCenteredContainer>
          <RouteErrorDisplay />
        </MainCenteredContainer>
      </AppContainer>
    </>
  );
}
