import serverless from "serverless-http";
import { createExpressApp } from "./index";

const app = createExpressApp();

export const handler = serverless(app);
export default handler;
