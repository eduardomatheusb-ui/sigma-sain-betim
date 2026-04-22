import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Students from "./pages/Students";
import Mediators from "./pages/Mediators";
import Attendances from "./pages/Attendances";
import ExternalDemands from "./pages/ExternalDemands";
import Users from "./pages/Users";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/alunos"} component={Students} />
      <Route path={"/mediadores"} component={Mediators} />
      <Route path={"/atendimentos"} component={Attendances} />
      <Route path={"/demandas"} component={ExternalDemands} />
      <Route path={"/usuarios"} component={Users} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
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
