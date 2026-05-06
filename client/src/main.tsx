import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import superjson from "superjson";
import App from "./App";
import { EnvConfigError } from "./components/EnvConfigError";
import { getLoginUrl } from "./const";
import { getEnvConfigError } from "@/lib/env";
import "./index.css";

// Check environment configuration at startup
const envError = getEnvConfigError();
if (envError) {
  // Environment is not properly configured
  // Show error message instead of letting app crash
  createRoot(document.getElementById("root")!).render(
    <EnvConfigError error={envError} />
  );
} else {
  // Environment is properly configured, proceed with normal app initialization
  const queryClient = new QueryClient();

  const redirectToLoginIfUnauthorized = (error: unknown) => {
    if (!(error instanceof TRPCClientError)) return;
    if (typeof window === "undefined") return;

    const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

    if (!isUnauthorized) return;

    window.location.href = getLoginUrl();
  };

  /** Exibe toast amigável quando o servidor retorna TOO_MANY_REQUESTS (rate limit) */
  const handleRateLimitError = (error: unknown) => {
    if (!(error instanceof TRPCClientError)) return;
    const data = (error as TRPCClientError<any>).data;
    if (data?.code === "TOO_MANY_REQUESTS") {
      toast.warning(
        "Muitas requisições em pouco tempo. Aguarde alguns instantes e tente novamente.",
        { duration: 5000, id: "rate-limit" }
      );
    }
  };

  queryClient.getQueryCache().subscribe(event => {
    if (event.type === "updated" && event.action.type === "error") {
      const error = event.query.state.error;
      redirectToLoginIfUnauthorized(error);
      handleRateLimitError(error);
      console.error("[API Query Error]", error);
    }
  });

  queryClient.getMutationCache().subscribe(event => {
    if (event.type === "updated" && event.action.type === "error") {
      const error = event.mutation.state.error;
      redirectToLoginIfUnauthorized(error);
      handleRateLimitError(error);
      console.error("[API Mutation Error]", error);
    }
  });

  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
        fetch(input, init) {
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
          });
        },
      }),
    ],
  });

  createRoot(document.getElementById("root")!).render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
