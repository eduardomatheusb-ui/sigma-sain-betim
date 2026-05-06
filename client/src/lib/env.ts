const REQUIRED_CLIENT_ENV_KEYS = [
  "VITE_OAUTH_PORTAL_URL",
  "VITE_APP_ID",
  "VITE_FRONTEND_FORGE_API_URL",
  "VITE_FRONTEND_FORGE_API_KEY",
] as const;

type ClientEnvKey = (typeof REQUIRED_CLIENT_ENV_KEYS)[number];

type ClientEnv = {
  oauthPortalUrl: string;
  appId: string;
  frontendForgeApiUrl: string;
  frontendForgeApiKey: string;
};

function readClientEnvRecord() {
  return {
    VITE_OAUTH_PORTAL_URL: import.meta.env.VITE_OAUTH_PORTAL_URL?.trim() ?? "",
    VITE_APP_ID: import.meta.env.VITE_APP_ID?.trim() ?? "",
    VITE_FRONTEND_FORGE_API_URL:
      import.meta.env.VITE_FRONTEND_FORGE_API_URL?.trim() ?? "",
    VITE_FRONTEND_FORGE_API_KEY:
      import.meta.env.VITE_FRONTEND_FORGE_API_KEY?.trim() ?? "",
  } satisfies Record<ClientEnvKey, string>;
}

function getMissingClientEnvKeys() {
  const envRecord = readClientEnvRecord();
  return REQUIRED_CLIENT_ENV_KEYS.filter(key => envRecord[key].length === 0);
}

export function hasMissingClientEnv() {
  return getMissingClientEnvKeys().length > 0;
}

export function getClientEnvError() {
  const missingKeys = getMissingClientEnvKeys();

  if (missingKeys.length === 0) {
    return "";
  }

  return [
    "Missing required frontend environment variables:",
    ...missingKeys.map(key => `- ${key}`),
    "",
    "Configure these variables in Netlify before redeploying.",
  ].join("\n");
}

export function getClientEnv(): ClientEnv {
  const envRecord = readClientEnvRecord();
  const missingKeys = getMissingClientEnvKeys();

  if (missingKeys.length > 0) {
    throw new Error(getClientEnvError());
  }

  return {
    oauthPortalUrl: envRecord.VITE_OAUTH_PORTAL_URL,
    appId: envRecord.VITE_APP_ID,
    frontendForgeApiUrl: envRecord.VITE_FRONTEND_FORGE_API_URL,
    frontendForgeApiKey: envRecord.VITE_FRONTEND_FORGE_API_KEY,
  };
}
