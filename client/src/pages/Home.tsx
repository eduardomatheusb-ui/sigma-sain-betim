import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, ClipboardList, AlertCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-primary/10 rounded-lg">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">SIGMA</h1>
            <p className="text-muted-foreground mb-2">Sistema Integrado de Gestão</p>
            <p className="text-sm text-muted-foreground mb-8">
              Mediadores e Atendimentos — SAIN/Betim
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="w-full">
                Entrar no Sistema
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === "admin"
              ? "Dashboard Gerencial - SAIN"
              : "Painel da Escola"}
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          Sair
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">Carregando...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mediadores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">Carregando...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atendimentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">Carregando...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Demandas Externas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">Carregando...</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Módulos Principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Módulos do Sistema</CardTitle>
              <CardDescription>
                Acesse os principais módulos através da barra lateral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition">
                  <Users className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">Alunos</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cadastro e acompanhamento
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition">
                  <Briefcase className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">Mediadores</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gestão de profissionais
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition">
                  <ClipboardList className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">Atendimentos</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registro e histórico
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition">
                  <AlertCircle className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold text-sm">Demandas</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Solicitações externas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Usuário */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Nome</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Email</p>
                <p className="font-medium text-sm">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Perfil</p>
                <p className="font-medium capitalize">
                  {user?.role === "admin" ? "Administrador SAIN" : "Usuário de Escola"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
