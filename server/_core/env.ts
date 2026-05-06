export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  ownerName: process.env.OWNER_NAME ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  cpfEncryptionKey: process.env.CPF_ENCRYPTION_KEY ?? "",
};

export const REQUIRED_SERVER_ENV_KEYS = [
  "DATABASE_URL",
  "OAUTH_SERVER_URL",
  "JWT_SECRET",
  "OWNER_OPEN_ID",
  "OWNER_NAME",
  "BUILT_IN_FORGE_API_URL",
  "BUILT_IN_FORGE_API_KEY",
  "VITE_APP_ID",
] as const;

type ServerEnvKey = (typeof REQUIRED_SERVER_ENV_KEYS)[number];

function getServerEnvRecord() {
  return {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "",
    OWNER_OPEN_ID: process.env.OWNER_OPEN_ID ?? "",
    OWNER_NAME: process.env.OWNER_NAME ?? "",
    BUILT_IN_FORGE_API_URL: process.env.BUILT_IN_FORGE_API_URL ?? "",
    BUILT_IN_FORGE_API_KEY: process.env.BUILT_IN_FORGE_API_KEY ?? "",
    VITE_APP_ID: process.env.VITE_APP_ID ?? "",
  } satisfies Record<ServerEnvKey, string>;
}

export function getMissingServerEnvKeys(
  keys: readonly ServerEnvKey[] = REQUIRED_SERVER_ENV_KEYS
) {
  const envRecord = getServerEnvRecord();
  return keys.filter(key => envRecord[key].trim().length === 0);
}

export function assertServerEnv(
  keys: readonly ServerEnvKey[],
  context: string
) {
  const missingKeys = getMissingServerEnvKeys(keys);

  if (missingKeys.length === 0) {
    return;
  }

  throw new Error(
    `[Env] Missing required backend variables for ${context}: ${missingKeys.join(", ")}`
  );
}
