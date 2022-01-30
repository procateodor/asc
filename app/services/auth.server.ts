import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GoogleStrategy } from "remix-auth-google";

import { login, loginGoogle } from "~/db.server";

import { sessionStorage } from "~/services/session.server";

export let authenticator = new Authenticator<any>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => await login(form)),
  "user-pass"
);

authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async ({ profile }) =>
      await loginGoogle({
        email: profile.emails[0].value,
        name: profile.displayName,
      })
  )
);
