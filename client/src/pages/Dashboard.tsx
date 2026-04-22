import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Briefcase, ClipboardList, AlertCircle, TrendingUp } from "lucide-react";

const COLORS = ["#004B99", "#9AC331", "#FF6B6B", "#4ECDC4"];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = trpc.dashboard.stats.useQuery();

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores da SAIN podem acessar o dashboard gerencial.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Dados de exemplo para gráficos
  const attendancesBySchool = [
    { name: "Escola 1", atendimentos: 45 },
    { name: "Escola 2", atendimentos: 38 },
    { name: "Escola 3", atendimentos: 52 },
    { name: "Escola 4", atendimentos: 41 },
  ];

  const attendancesByMonth = [
    { month: "Jan", atendimentos: 120 },
    { month: "Fev", atendimentos: 135 },
    { month: "Mar", atendimentos: 148 },
    { month: "Abr", atendimentos: 165 },
  ];

  const demandsStatus = [
    { name: "Resolvidas", value: 45 },
    { name: "Em Andamento", value: 28 },
    { name: "Pendentes", value: 12 },
  ];

  const mediatorLoad = [
    { name: "0-5 atendimentos", count: 8 },
    { name: "6-10 atendimentos", count: 12 },
    { name: "11-15 atendimentos", count: 6 },
    { name: "16+ atendimentos", count: 4 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Gerencial</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral de indicadores e acompanhamento da rede
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Com necessidades especiais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Mediadores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeMediators || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Profissionais em atividade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Atendimentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingAttendances || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando realização</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Demandas Externas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.externalDemands || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Solicitações em aberto</p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs adicionais do Quadro de Atendentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Total de Atendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats as any)?.totalMediators || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Cadastrados na rede</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
              Afastamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{(stats as any)?.onLeave || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Licenças e afastamentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              Vagas em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{(stats as any)?.vacancies || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Postos sem atendente</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atendimentos por Escola */}
        <Card>
          <CardHeader>
            <CardTitle>Atendimentos por Escola</CardTitle>
            <CardDescription>
              Distribuição de atendimentos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendancesBySchool}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="atendimentos" fill="#004B99" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atendimentos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Atendimentos</CardTitle>
            <CardDescription>
              Evolução mensal de atendimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendancesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="atendimentos" stroke="#004B99" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status de Demandas */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Demandas Externas</CardTitle>
            <CardDescription>
              Distribuição por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demandsStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demandsStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Carga de Mediadores */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Carga de Mediadores</CardTitle>
            <CardDescription>
              Quantidade de atendimentos por profissional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mediatorLoad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#9AC331" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Atendimento</p>
              <p className="text-2xl font-bold mt-1">87%</p>
              <p className="text-xs text-green-600 mt-1">↑ 5% em relação ao mês anterior</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio de Resolução</p>
              <p className="text-2xl font-bold mt-1">4.2 dias</p>
              <p className="text-xs text-green-600 mt-1">↓ 0.8 dias em relação ao mês anterior</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Satisfação Média</p>
              <p className="text-2xl font-bold mt-1">8.5/10</p>
              <p className="text-xs text-green-600 mt-1">↑ 0.3 pontos em relação ao mês anterior</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
