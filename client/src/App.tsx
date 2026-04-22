import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Schools from "./pages/Schools";
import Students from "./pages/Students";
import Mediators from "./pages/Mediators";
import Attendances from "./pages/Attendances";
import ExternalDemands from "./pages/ExternalDemands";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Cadastros from "./pages/Cadastros";
import DashboardGerencial from "./pages/DashboardGerencial";
import { useAuth } from "@/_core/hooks/useAuth";

/** Componente que protege rotas exclusivas do admin */
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/alunos" component={Students} />
      <Route path="/mediadores" component={Mediators} />
      <Route path="/cadastros" component={Cadastros} />
      <Route path="/dashboard-gerencial" component={DashboardGerencial} />
      {/* Rotas exclusivas do admin */}
      <Route path="/escolas">{() => <AdminRoute component={Schools} />}</Route>
      <Route path="/atendimentos" component={Attendances} />
      <Route path="/demandas">{() => <AdminRoute component={ExternalDemands} />}</Route>
      <Route path="/usuarios">{() => <AdminRoute component={Users} />}</Route>
      <Route path="/relatorios">{() => <AdminRoute component={Reports} />}</Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <DashboardLayout>
            <Router />
          </DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
