/**
 * Netlify Functions Serverless Handler
 * 
 * Uses serverless-http to adapt Express app to Netlify Functions.
 * This is the official pattern recommended by Netlify for Express apps.
 * 
 * Reference: https://docs.netlify.com/functions/overview/
 */

import serverless from "serverless-http";
import { createExpressApp } from "./index";

// Create Express app once (reused across function invocations)
const app = createExpressApp();

// Adapt Express app to Netlify Functions using serverless-http
export const handler = serverless(app);

// Default export for compatibility
export default handler;
