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
import { PermissionsAdmin } from "./pages/PermissionsAdmin";
import Reports from "./pages/Reports";
import FarolGestao from "@/pages/FarolGestao";
import FarolDashboard from "@/pages/FarolDashboard";
import FarolAssessores from "@/pages/FarolAssessores";
import CaseDetail from "@/pages/CaseDetail";
import FarolAuditDashboard from "@/pages/FarolAuditDashboard";
import Cadastros from "./pages/Cadastros";
import DashboardGerencial from "./pages/DashboardGerencial";
import MeusCasos from "./pages/MeusCasos";
import { useAuth } from "@/_core/hooks/useAuth";

/** Componente que protege rotas exclusivas do admin */
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }
  return <Component />;
}

/** Componente que protege rotas do Farol e Demandas Externas (admin, craei_assessor ou coordinator) */
function SainAssessorRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  const allowed = ["admin", "craei_assessor", "coordinator"];
  if (!user || !allowed.includes(user.role)) {
    return <Redirect to="/" />;
  }
  return <Component />;
}

/** Componente que protege rotas de profissional externo */
function ExternalProfessionalRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || (user.role !== "admin" && user.role !== "craei_assessor")) {
    return <Redirect to="/" />;
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
      <Route path="/usuarios">{() => <AdminRoute component={Users} />}</Route>
      <Route path="/permissoes">{() => <AdminRoute component={PermissionsAdmin} />}</Route>
      {/* Rotas para admin e craei_assessor */}
      <Route path="/demandas">{() => <SainAssessorRoute component={ExternalDemands} />}</Route>
      <Route path="/demandas-externas">{() => <SainAssessorRoute component={ExternalDemands} />}</Route>
      <Route path="/demandas-externas/nova">{() => <SainAssessorRoute component={ExternalDemands} />}</Route>
      <Route path="/demandas-externas/arquivadas">{() => <SainAssessorRoute component={ExternalDemands} />}</Route>
      <Route path="/relatorios">{() => <SainAssessorRoute component={Reports} />}</Route>
      <Route path="/farol">{() => <SainAssessorRoute component={FarolGestao} />}</Route>
      <Route path="/farol/assessores">{() => <AdminRoute component={FarolAssessores} />}</Route>
      <Route path="/farol/dashboard">{() => <SainAssessorRoute component={FarolDashboard} />}</Route>
      <Route path="/farol/casos/:caseId">{() => <SainAssessorRoute component={CaseDetail} />}</Route>
      <Route path="/farol/auditoria">{() => <SainAssessorRoute component={FarolAuditDashboard} />}</Route>
      {/* Rota para profissional externo */}
      <Route path="/farol/meus-casos">{() => <ExternalProfessionalRoute component={MeusCasos} />}</Route>
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
