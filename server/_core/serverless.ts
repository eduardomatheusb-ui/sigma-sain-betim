/**
 * Netlify Functions Serverless Handler
 * 
 * This module exports a handler compatible with Netlify Functions.
 * It wraps the Express app to work in a serverless environment without
 * requiring server.listen() or port binding.
 * 
 * Netlify will call this handler for every request to /api/* and /.netlify/functions/index/*
 */

import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";

// Create Express app once (reused across function invocations)
let app: express.Express | null = null;

function createApp(): express.Express {
  const newApp = express();

  // Configure body parser with larger size limit for file uploads
  newApp.use(express.json({ limit: "50mb" }));
  newApp.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Register custom routes
  registerStorageProxy(newApp);
  registerOAuthRoutes(newApp);

  // tRPC API
  newApp.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Serve static files (production mode)
  serveStatic(newApp);

  return newApp;
}

/**
 * Netlify Functions Handler
 * 
 * This is called by Netlify for every request.
 * The request/response objects are standard Node.js HTTP objects.
 */
export async function handler(
  req: express.Request,
  res: express.Response
): Promise<void> {
  // Create app once and reuse (lazy initialization)
  if (!app) {
    app = createApp();
  }

  // Handle the request through Express
  app(req, res);
}

/**
 * Default export for Netlify Functions
 * Some Netlify configurations expect a default export
 */
export default handler;
