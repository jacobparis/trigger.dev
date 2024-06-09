import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { ExternalScripts } from "remix-utils/external-scripts";
import tailwindStylesheetUrl from "~/tailwind.css?url";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

function App() {
  return (
    <>
      <html lang="en" className="h-full">
        <head>
          <Meta />
          <Links />
        </head>
        <body className="bg-darkBackground h-full overflow-hidden">
          <Outlet />
          <ScrollRestoration />
          <ExternalScripts />
          <Scripts />
        </body>
      </html>
    </>
  );
}

export default App;
