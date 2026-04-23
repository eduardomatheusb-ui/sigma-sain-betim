import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Briefcase, ClipboardList, AlertCircle, TrendingUp, School, Download, CheckCircle2, Clock, UserCheck, UserX, GraduationCap, Calendar, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Link } from "wouter";

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

const WEEKLY_STATUS_LABEL: Record<string, string> = {
  updated: "Atualizada", pending: "Pendente",
  with_vacancy: "Com vaga", with_leave: "Com afastamento",
};
const WEEKLY_STATUS_CLASS: Record<string, string> = {
  updated: "bg-green-100 text-green-700 hover:bg-green-100",
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  with_vacancy: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  with_leave: "bg-orange-100 text-orange-700 hover:bg-orange-100",
};
const ATTENDANT_STATUS_LABEL: Record<string, string> = {
  active: "Ativo(a)", inactive: "Inativo(a)", on_leave: "Licenca medica",
  temp_leave: "Afastamento", dismissed: "Desligado(a)",
  substituted: "Substituido(a)", vacancy: "Vaga em aberto",
};
const ATTENDANT_STATUS_CLASS: Record<string, string> = {
  active: "bg-green-100 text-green-800", on_leave: "bg-yellow-100 text-yellow-800",
  temp_leave: "bg-orange-100 text-orange-800", dismissed: "bg-red-100 text-red-800",
  substituted: "bg-purple-100 text-purple-800", vacancy: "bg-blue-100 text-blue-800",
  inactive: "bg-gray-100 text-gray-700",
};

const FLOW_STEPS = [
  "A escola acessa com login proprio e encontra o quadro da semana anterior ja carregado.",
  "O responsavel confirma os registros sem alteracao e edita apenas o que mudou.",
  "O sistema permite incluir novo atendente, aluno, troca de vinculo ou vaga em aberto.",
  "Alteracoes como licenca, atestado, substituicao e desligamento ficam registradas com data e justificativa.",
  "Ao enviar, a Secretaria recebe tudo em painel unico e pode validar, acompanhar ou cobrar pendencias.",
];

const REPORTS = [
  "Relatorio semanal por escola", "Relatorio de atendentes ativos e afastados",
  "Relatorio de vagas e novas demandas", "Historico por aluno",
  "Historico por atendente", "Escolas pendentes de envio",
];

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  return <SchoolDashboard />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mediatorStatusFilter, setMediatorStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all_time");
  const { data: stats } = trpc.dashboard.stats.useQuery({
    period: periodFilter as "current_week" | "last_week" | "current_month" | "all_time",
    unitType: typeFilter,
    mediatorStatus: mediatorStatusFilter,
  });
  const { data: schoolPanel = [] } = trpc.schools.panel.useQuery();
  const { data: alerts = [] } = trpc.schools.alerts.useQuery();
  const { data: weeklyStatusData, refetch: refetchWeeklyStatus } = trpc.quadroAAP.weeklyStatus.useQuery();
  const sendReminderMutation = trpc.quadroAAP.sendWeeklyReminder.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Lembrete enviado com sucesso!");
      refetchWeeklyStatus();
    },
    onError: (err) => {
      toast.error("Erro ao enviar lembrete: " + err.message);
    },
  });;

  const filteredSchools = useMemo(() => {
    return schoolPanel.filter((school: any) => {
      const matchSearch = school.name.toLowerCase().includes(search.toLowerCase()) ||
        (school.responsible ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (school.attendants ?? []).some((a: any) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          (a.linkedStudents ?? "").toLowerCase().includes(search.toLowerCase())
        );
      const matchStatus = statusFilter === "all" || school.weeklyStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [schoolPanel, search, statusFilter]);

  const totalSchools = (stats as any)?.totalSchools ?? 0;
  const updatedSchools = schoolPanel.filter((s: any) => s.weeklyStatus === "updated").length;
  const pendingSchools = schoolPanel.filter((s: any) => !s.weeklyStatus || s.weeklyStatus === "pending").length;
  const studentsWithMediator = (stats as any)?.studentsWithMediator ?? 0;
  const studentsWithoutMediator = (stats as any)?.studentsWithoutMediator ?? 0;
  // Indicadores de compartilhamento
  const sharedMediators = (stats as any)?.sharedMediators ?? 0;
  const studentsInSharedCare = (stats as any)?.studentsInSharedCare ?? 0;
  const mediators1Student = (stats as any)?.mediators1Student ?? 0;
  const mediators2Students = (stats as any)?.mediators2Students ?? 0;
  const mediators3PlusStudents = (stats as any)?.mediators3PlusStudents ?? 0;
  const avgStudentsPerMediator = (stats as any)?.avgStudentsPerMediator ?? 0;
  const coverageRate = (stats as any)?.coverageRate ?? 0;
  const emRanking = (stats as any)?.emRanking ?? [];
  const cimRanking = (stats as any)?.cimRanking ?? [];
  const byDisability = (stats as any)?.byDisability ?? [];
  const byShift = (stats as any)?.byShift ?? [];
  const byInactivity = (stats as any)?.byInactivity ?? [];

  const CHART_COLORS = ["#004B99", "#9AC331", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#14B8A6"];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Secretaria Adjunta de Inclusao</p>
          <h1 className="text-2xl font-bold mt-1">Painel da Secretaria</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Acompanhamento em tempo real das escolas atualizadas, pendentes, afastamentos, vagas e novas demandas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Exportar relatorio
          </Button>
        </div>
      </div>

      {/* Filtros Avançados */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 bg-muted p-3 rounded-lg">
        <span className="text-sm font-medium">Filtros:</span>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_week">Semana Atual</SelectItem>
            <SelectItem value="last_week">Última Semana</SelectItem>
            <SelectItem value="current_month">Mês Atual</SelectItem>
            <SelectItem value="all_time">Todo o Período</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo de Unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="EM">EM</SelectItem>
            <SelectItem value="CIM">CIM</SelectItem>
            <SelectItem value="CMEI">CMEI</SelectItem>
          </SelectContent>
        </Select>
        <Select value={mediatorStatusFilter} onValueChange={setMediatorStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status Mediador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="on_leave">Afastados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Escolas", value: totalSchools, icon: <School className="w-5 h-5 text-primary" /> },
          { label: "Atualizadas", value: updatedSchools, icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
          { label: "Pendentes", value: pendingSchools, icon: <Clock className="w-5 h-5 text-amber-600" /> },
          { label: "Atendentes ativos", value: (stats as any)?.activeMediators ?? 0, icon: <Users className="w-5 h-5 text-blue-600" /> },
          { label: "Afastados", value: (stats as any)?.onLeave ?? 0, icon: <TrendingUp className="w-5 h-5 text-orange-600" /> },
          { label: "Vagas", value: (stats as any)?.vacancies ?? 0, icon: <AlertCircle className="w-5 h-5 text-red-500" /> },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">{m.icon}<p className="text-xs text-muted-foreground">{m.label}</p></div>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alunos com/sem atendente + Taxa de Cobertura */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-green-600 opacity-80" />
              <div>
                <p className="text-xs text-muted-foreground">Alunos com atendente</p>
                <p className="text-2xl font-bold">{studentsWithMediator}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <UserX className="w-8 h-8 text-red-500 opacity-80" />
              <div>
                <p className="text-xs text-muted-foreground">Alunos sem atendente</p>
                <p className="text-2xl font-bold">{studentsWithoutMediator}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-80" />
              <div>
                <p className="text-xs text-muted-foreground">Taxa de cobertura</p>
                <p className="text-2xl font-bold">{coverageRate}%</p>
                <p className="text-xs text-muted-foreground">alunos com atendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de Atendimento Compartilhado */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            Atendimento Compartilhado
          </CardTitle>
          <p className="text-xs text-muted-foreground">Atendentes que atendem mais de um aluno simultaneamente</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold text-amber-700">{sharedMediators}</p>
              <p className="text-xs text-muted-foreground mt-1">Atendentes compartilhados</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold text-amber-700">{studentsInSharedCare}</p>
              <p className="text-xs text-muted-foreground mt-1">Alunos em atend. compartilhado</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{avgStudentsPerMediator}</p>
              <p className="text-xs text-muted-foreground mt-1">Média alunos/atendente</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground mb-2">Distribuição de carga</p>
              <div className="space-y-1 text-left">
                <div className="flex justify-between text-xs">
                  <span>1 aluno</span>
                  <span className="font-semibold">{mediators1Student}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>2 alunos</span>
                  <span className="font-semibold text-amber-600">{mediators2Students}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>3+ alunos</span>
                  <span className="font-semibold text-red-600">{mediators3PlusStudents}</span>
                </div>
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-2xl font-bold text-blue-700">{coverageRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">Cobertura de alunos</p>
              <p className="text-xs text-blue-600 mt-1">{studentsWithMediator} de {studentsWithMediator + studentsWithoutMediator}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lembrete semanal */}
      <Card className={weeklyStatusData && weeklyStatusData.pending > 0 ? "border-amber-300 bg-amber-50" : "border-green-300 bg-green-50"}>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className={"w-6 h-6 flex-shrink-0 " + (weeklyStatusData && weeklyStatusData.pending > 0 ? "text-amber-600" : "text-green-600")} />
              <div>
                <p className={"font-semibold " + (weeklyStatusData && weeklyStatusData.pending > 0 ? "text-amber-800" : "text-green-800")}>
                  Quadros semanais — semana {weeklyStatusData?.weekReference || "atual"}
                </p>
                <p className={"text-sm " + (weeklyStatusData && weeklyStatusData.pending > 0 ? "text-amber-700" : "text-green-700")}>
                  {weeklyStatusData
                    ? `${weeklyStatusData.sent} de ${weeklyStatusData.total} escolas enviaram o quadro esta semana. ${weeklyStatusData.pending > 0 ? `${weeklyStatusData.pending} pendente(s).` : "Todas atualizadas!"}`
                    : "Carregando status semanal..."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={weeklyStatusData && weeklyStatusData.pending > 0 ? "border-amber-400 text-amber-800 hover:bg-amber-100" : "border-green-400 text-green-800 hover:bg-green-100"}
              disabled={sendReminderMutation.isPending || !weeklyStatusData || weeklyStatusData.pending === 0}
              onClick={() => sendReminderMutation.mutate()}
            >
              <Bell className="w-4 h-4 mr-2" />
              {sendReminderMutation.isPending ? "Enviando..." : weeklyStatusData?.pending === 0 ? "Todas enviaram" : `Enviar lembrete (${weeklyStatusData?.pending ?? 0})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Graficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Alunos por tipo de deficiencia</CardTitle></CardHeader>
          <CardContent>
            {byDisability.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Sem dados cadastrados ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byDisability.slice(0, 8)} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip /><Bar dataKey="value" fill="#004B99" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Alunos por turno</CardTitle></CardHeader>
          <CardContent>
            {byShift.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Sem dados cadastrados ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byShift} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: { name: string; percent: number }) => name + " " + (percent * 100).toFixed(0) + "%"}>
                    {byShift.map((_: any, idx: number) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Motivos de afastamento</CardTitle></CardHeader>
          <CardContent>
            {byInactivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Sem afastamentos registrados.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byInactivity.slice(0, 6)} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip /><Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      {(emRanking.length > 0 || cimRanking.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {emRanking.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top 10 EMs com mais demanda</CardTitle>
                <CardDescription>Vagas em aberto + afastamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={emRanking} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={160} />
                    <Tooltip /><Bar dataKey="demand" fill="#EF4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          {cimRanking.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top 10 CIMs com mais demanda</CardTitle>
                <CardDescription>Vagas em aberto + afastamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={cimRanking} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={160} />
                    <Tooltip /><Bar dataKey="demand" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Painel de escolas */}
      <div className="border-t pt-4"><h2 className="text-lg font-semibold mb-4">Painel de Escolas</h2></div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Painel geral das escolas</CardTitle>
              <CardDescription>Visao consolidada dos quadros enviados e das situacoes que exigem monitoramento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input placeholder="Buscar escola, aluno ou atendente..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Todas as situacoes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as situacoes</SelectItem>
                    <SelectItem value="updated">Atualizada</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="with_vacancy">Com vaga</SelectItem>
                    <SelectItem value="with_leave">Com afastamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filteredSchools.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  {schoolPanel.length === 0 ? "Nenhuma escola cadastrada ainda." : "Nenhuma escola encontrada com os filtros aplicados."}
                </div>
              ) : (
                filteredSchools.map((school: any) => (
                  <div key={school.id} className="rounded-xl border p-4 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-base">{school.name}</h3>
                        {school.responsible && <p className="text-xs text-muted-foreground">Responsavel: {school.responsible}</p>}
                        {school.lastWeeklyUpdate && <p className="text-xs text-muted-foreground">Ultima atualizacao: {formatDateTime(school.lastWeeklyUpdate)}</p>}
                      </div>
                      <Badge className={WEEKLY_STATUS_CLASS[school.weeklyStatus ?? "pending"] ?? "bg-gray-100 text-gray-700"}>
                        {WEEKLY_STATUS_LABEL[school.weeklyStatus ?? "pending"] ?? "Pendente"}
                      </Badge>
                    </div>
                    {school.attendants && school.attendants.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border">
                        <table className="min-w-full text-xs">
                          <thead className="bg-muted/40">
                            <tr>
                              {["Atendente", "Aluno(s)", "Situacao", "Registro da semana"].map(h => (
                                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {school.attendants.map((a: any) => (
                              <tr key={a.id} className="border-t hover:bg-muted/10">
                                <td className="px-3 py-2 font-medium">{a.name}</td>
                                <td className="px-3 py-2 text-muted-foreground">{a.linkedStudents || "-"}</td>
                                <td className="px-3 py-2">
                                  <span className={"inline-flex rounded-full px-2 py-0.5 text-xs font-medium " + (ATTENDANT_STATUS_CLASS[a.status] ?? "bg-gray-100 text-gray-700")}>
                                    {ATTENDANT_STATUS_LABEL[a.status] ?? a.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">{a.changeType || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Nenhum atendente cadastrado nesta escola.</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Alertas da semana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum alerta no momento.</p>
              ) : (
                alerts.map((alert: string, i: number) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">{alert}</div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Fluxo de uso</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {FLOW_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</div>
                  <p className="text-muted-foreground pt-0.5">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Relatorios disponiveis</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {REPORTS.map(r => (
                  <li key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-primary" />{r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Resumo geral</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total de alunos", value: stats?.totalStudents ?? 0, color: "" },
                { label: "Atendimentos pendentes", value: stats?.pendingAttendances ?? 0, color: "text-amber-600" },
                { label: "Demandas externas", value: stats?.externalDemands ?? 0, color: "text-red-500" },
                { label: "Total de atendentes", value: (stats as any)?.totalMediators ?? 0, color: "" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={"text-lg font-bold " + item.color}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHOOL DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function SchoolDashboard() {
  const { user } = useAuth();
  const { data: mediatorsData = [] } = trpc.mediators.listBySchool.useQuery();
  const { data: studentsData = [] } = trpc.students.listBySchool.useQuery();
  const { data: attendancesData = [] } = trpc.attendances.listBySchool.useQuery();
  const { data: schools = [] } = trpc.schools.list.useQuery();

  const userSchool = useMemo(() => {
    if (!user?.schoolId) return null;
    return schools.find((s: any) => s.id === user.schoolId) || null;
  }, [schools, user?.schoolId]);

  const activeMediators = mediatorsData.filter((m: any) => m.status === "active").length;
  const inactiveMediators = mediatorsData.filter((m: any) => m.status !== "active").length;
  const pendingAttendances = attendancesData.filter((a: any) => a.status === "pending").length;
  const weeklyStatus = (userSchool as any)?.weeklyStatus;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mediatorsData.forEach((m: any) => {
      const s = m.status || "unknown";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: ATTENDANT_STATUS_LABEL[name] || name,
      value,
    }));
  }, [mediatorsData]);

  const CHART_COLORS = ["#004B99", "#9AC331", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Painel da Escola</h1>
        <p className="text-sm text-muted-foreground mt-1">{(userSchool as any)?.name || "Carregando..."}</p>
      </div>

      {/* Status do quadro semanal */}
      <Card className={weeklyStatus === "updated" ? "border-green-300 bg-green-50" : "border-yellow-300 bg-yellow-50"}>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {weeklyStatus === "updated" ? (
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              ) : (
                <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              )}
              <div>
                <p className={"font-semibold " + (weeklyStatus === "updated" ? "text-green-800" : "text-yellow-800")}>
                  {weeklyStatus === "updated" ? "Quadro semanal enviado" : "Quadro semanal pendente"}
                </p>
                <p className={"text-sm " + (weeklyStatus === "updated" ? "text-green-700" : "text-yellow-700")}>
                  {weeklyStatus === "updated"
                    ? "Ultimo envio: " + ((userSchool as any)?.lastWeeklyUpdate ? formatDateTime((userSchool as any).lastWeeklyUpdate) : "-")
                    : "Acesse o Quadro Semanal para enviar a atualizacao desta semana."}
                </p>
              </div>
            </div>
            <Link href="/cadastros">
              <Button className={weeklyStatus === "updated" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-yellow-600 hover:bg-yellow-700 text-white"}>
                <Calendar className="h-4 w-4 mr-2" />
                {weeklyStatus === "updated" ? "Ver quadro" : "Enviar quadro"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Metricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Alunos cadastrados", value: studentsData.length, icon: <GraduationCap className="w-5 h-5 text-primary" /> },
          { label: "Mediadores ativos", value: activeMediators, icon: <Users className="w-5 h-5 text-green-600" /> },
          { label: "Mediadores inativos", value: inactiveMediators, icon: <Users className="w-5 h-5 text-red-500" /> },
          { label: "Atend. pendentes", value: pendingAttendances, icon: <ClipboardList className="w-5 h-5 text-amber-600" /> },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">{m.icon}<p className="text-xs text-muted-foreground">{m.label}</p></div>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Distribuicao de status dos mediadores */}
        {statusCounts.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Status dos mediadores</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: { name: string; percent: number }) => name + " " + (percent * 100).toFixed(0) + "%"}>
                    {statusCounts.map((_: any, idx: number) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Lista de mediadores */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mediadores da escola ({mediatorsData.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {mediatorsData.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhum mediador cadastrado. Acesse a aba Mediadores para cadastrar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Nome</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">Alunos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediatorsData.slice(0, 10).map((m: any) => (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-muted/10">
                        <td className="px-4 py-2 font-medium">{m.name}</td>
                        <td className="px-4 py-2">
                          <span className={"inline-flex rounded-full px-2 py-0.5 text-xs font-medium " + (ATTENDANT_STATUS_CLASS[m.status] ?? "bg-gray-100 text-gray-700")}>
                            {ATTENDANT_STATUS_LABEL[m.status] ?? m.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">{m.linkedStudents || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acoes rapidas */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Acesso rapido</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Quadro Semanal", desc: "Enviar atualizacao", href: "/cadastros", icon: <Calendar className="w-5 h-5" /> },
              { label: "Alunos", desc: "Cadastrar e gerenciar", href: "/alunos", icon: <GraduationCap className="w-5 h-5" /> },
              { label: "Mediadores", desc: "Gerenciar atendentes", href: "/mediadores", icon: <Users className="w-5 h-5" /> },
            ].map(a => (
              <Link key={a.label} href={a.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition cursor-pointer">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">{a.icon}</div>
                  <div>
                    <p className="font-medium text-sm">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
