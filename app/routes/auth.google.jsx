import { redirect } from "remix";
import { authenticator } from "~/services/auth.server";

export let loader = () => redirect("/login");

export let action = ({ request }) => {
  return authenticator.authenticate("google", request);
};
