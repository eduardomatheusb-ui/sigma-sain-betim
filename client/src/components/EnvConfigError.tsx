/**
 * Environment Configuration Error Display
 * 
 * Shows a clear error message when required environment variables are missing
 * or invalid, instead of letting the app crash with "Invalid URL" errors.
 */

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnvConfigErrorProps {
  error: string;
}

export function EnvConfigError({ error }: EnvConfigErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-background">
      <div className="flex flex-col items-center w-full max-w-2xl p-8">
        <AlertTriangle
          size={48}
          className="text-destructive mb-6 flex-shrink-0"
        />

        <h2 className="text-2xl font-bold mb-4 text-center">
          Configuration Error
        </h2>

        <p className="text-base mb-6 text-center text-muted-foreground">
          The application cannot start because required environment variables are missing or invalid.
        </p>

        <div className="p-4 w-full rounded bg-muted border border-destructive/20 mb-6">
          <p className="text-sm font-mono text-destructive whitespace-break-spaces">
            {error}
          </p>
        </div>

        <div className="p-4 w-full rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-100 mb-3 font-semibold">
            ✓ How to Fix:
          </p>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
            <li>Go to Netlify Dashboard → Your Site → Settings</li>
            <li>Click "Environment variables"</li>
            <li>Add the missing variables with correct values</li>
            <li>Trigger a new deploy</li>
          </ol>
        </div>

        <div className="p-4 w-full rounded bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-100 mb-3 font-semibold">
            ⚠ Required Variables:
          </p>
          <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 font-mono">
            <li>• VITE_OAUTH_PORTAL_URL</li>
            <li>• VITE_APP_ID</li>
            <li>• VITE_FRONTEND_FORGE_API_URL</li>
            <li>• VITE_FRONTEND_FORGE_API_KEY</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
