export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getEnvConfig } from "@/lib/env";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  // Validate environment variables before using them
  const config = getEnvConfig();
  
  const oauthPortalUrl = config.VITE_OAUTH_PORTAL_URL;
  const appId = config.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  // Construct URL safely - oauthPortalUrl is already validated
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
