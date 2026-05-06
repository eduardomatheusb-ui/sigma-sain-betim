/**
 * Environment Variables Validation and Safe Access
 * 
 * This module validates and provides safe access to VITE_ variables.
 * If a required variable is missing, it throws an error with a clear message
 * instead of silently failing or causing "Invalid URL" errors.
 */

interface EnvConfig {
  VITE_OAUTH_PORTAL_URL: string;
  VITE_APP_ID: string;
  VITE_FRONTEND_FORGE_API_URL: string;
  VITE_FRONTEND_FORGE_API_KEY: string;
}

/**
 * Validate that a URL is valid and has https:// protocol
 */
function validateUrl(url: string | undefined, name: string): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    throw new Error(
      `Missing or invalid environment variable: ${name}. ` +
      `Please configure ${name} in Netlify Settings → Environment variables.`
    );
  }

  // Ensure URL has protocol
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(
      `Invalid URL for ${name}: "${url}". ` +
      `URL must start with https:// or http://`
    );
  }

  return url;
}

/**
 * Validate that a string is not empty
 */
function validateString(value: string | undefined, name: string): string {
  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Missing or invalid environment variable: ${name}. ` +
      `Please configure ${name} in Netlify Settings → Environment variables.`
    );
  }

  return value;
}

/**
 * Get validated environment configuration
 * Throws error if any required variable is missing or invalid
 */
export function getEnvConfig(): EnvConfig {
  return {
    VITE_OAUTH_PORTAL_URL: validateUrl(
      import.meta.env.VITE_OAUTH_PORTAL_URL,
      "VITE_OAUTH_PORTAL_URL"
    ),
    VITE_APP_ID: validateString(
      import.meta.env.VITE_APP_ID,
      "VITE_APP_ID"
    ),
    VITE_FRONTEND_FORGE_API_URL: validateUrl(
      import.meta.env.VITE_FRONTEND_FORGE_API_URL,
      "VITE_FRONTEND_FORGE_API_URL"
    ),
    VITE_FRONTEND_FORGE_API_KEY: validateString(
      import.meta.env.VITE_FRONTEND_FORGE_API_KEY,
      "VITE_FRONTEND_FORGE_API_KEY"
    ),
  };
}

/**
 * Check if environment is properly configured
 * Returns true if all required variables are present and valid
 */
export function isEnvConfigured(): boolean {
  try {
    getEnvConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get error message if environment is not properly configured
 */
export function getEnvConfigError(): string | null {
  try {
    getEnvConfig();
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return "Unknown environment configuration error";
  }
}
