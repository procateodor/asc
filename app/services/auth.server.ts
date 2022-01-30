import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { login } from "~/db.server";

import { sessionStorage } from "~/services/session.server";

export let authenticator = new Authenticator<any>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => await login(form)),
  "user-pass"
);
