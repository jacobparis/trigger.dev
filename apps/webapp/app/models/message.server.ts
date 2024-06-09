import { json, Session } from "@remix-run/node";
import { createCookieSessionStorage } from "@remix-run/node";
import { redirect } from "remix-typedjson";
import { env } from "~/env.server";

export type ToastMessage = {
  message: string;
  type: "success" | "error";
  options: Required<ToastMessageOptions>;
};

type ToastMessageOptions = {
  /** Ephemeral means it disappears after a delay, defaults to true */
  ephemeral?: boolean;
};

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

export const { commitSession, getSession } = createCookieSessionStorage({
  cookie: {
    name: "__message",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [env.SESSION_SECRET],
    secure: env.NODE_ENV === "production",
  },
});

function setSuccessMessage(
  session: Session,
  message: string,
  options?: ToastMessageOptions
) {
  session.flash("toastMessage", {
    message,
    type: "success",
    options: {
      ephemeral: options?.ephemeral ?? true,
    },
  } as ToastMessage);
}

function setErrorMessage(session: Session, message: string, options?: ToastMessageOptions) {
  session.flash("toastMessage", {
    message,
    type: "error",
    options: {
      ephemeral: options?.ephemeral ?? true,
    },
  } as ToastMessage);
}

async function setRequestErrorMessage(
  request: Request,
  message: string,
  options?: ToastMessageOptions
) {
  const session = await getSession(request.headers.get("cookie"));

  setErrorMessage(session, message, options);

  return session;
}

async function setRequestSuccessMessage(
  request: Request,
  message: string,
  options?: ToastMessageOptions
) {
  const session = await getSession(request.headers.get("cookie"));

  setSuccessMessage(session, message, options);

  return session;
}

async function setToastMessageCookie(session: Session) {
  return {
    "Set-Cookie": await commitSession(session, {
      expires: new Date(Date.now() + ONE_YEAR),
    }),
  };
}

async function jsonWithSuccessMessage(
  data: any,
  request: Request,
  message: string,
  options?: ToastMessageOptions
) {
  const session = await getSession(request.headers.get("cookie"));

  setSuccessMessage(session, message, options);

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + ONE_YEAR),
      }),
    },
  });
}

async function jsonWithErrorMessage(
  data: any,
  request: Request,
  message: string,
  options?: ToastMessageOptions
) {
  const session = await getSession(request.headers.get("cookie"));

  setErrorMessage(session, message, options);

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + ONE_YEAR),
      }),
    },
  });
}

export async function redirectWithSuccessMessage(
  path: string,
  request: Request,
  message: string,
  options?: ToastMessageOptions
) {
  const session = await getSession(request.headers.get("cookie"));

  setSuccessMessage(session, message, options);

  return redirect(path, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + ONE_YEAR),
      }),
    },
  });
}

export async function redirectWithErrorMessage(
  path: string,
  request: Request,
  message: string,
  options?: ToastMessageOptions
) {
  const session = await getSession(request.headers.get("cookie"));

  setErrorMessage(session, message, options);

  return redirect(path, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + ONE_YEAR),
      }),
    },
  });
}

export async function redirectBackWithErrorMessage(
  request: Request,
  message: string,
  options?: ToastMessageOptions
) {
  const url = new URL(request.url);
  return redirectWithErrorMessage(url.pathname, request, message, options);
}

async function redirectBackWithSuccessMessage(
  request: Request,
  message: string,
  options?: ToastMessageOptions
) {
  const url = new URL(request.url);
  return redirectWithSuccessMessage(url.pathname, request, message, options);
}
