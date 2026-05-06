import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import superjson from "superjson";
import { getClientEnvError, hasMissingClientEnv } from "@/lib/env";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

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

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element '#root' was not found");
}

if (hasMissingClientEnv()) {
  createRoot(rootElement).render(
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
          Configuração incompleta
        </p>
        <h1 className="mt-3 text-2xl font-bold">Variáveis do frontend ausentes</h1>
        <p className="mt-3 text-sm text-slate-300">
          O aplicativo não foi inicializado porque faltam variáveis `VITE_`
          obrigatórias no ambiente do build.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950/70 p-4 text-sm text-amber-200">
          {getClientEnvError()}
        </pre>
      </div>
    </div>
  );
} else {
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

  createRoot(rootElement).render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
