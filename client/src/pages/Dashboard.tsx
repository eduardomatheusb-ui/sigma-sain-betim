import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Users, Briefcase, ClipboardList, AlertCircle, TrendingUp, School, Download, CheckCircle2, Clock } from "lucide-react";

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

const WEEKLY_STATUS_LABEL: Record<string, string> = {
  updated: "Atualizada",
  pending: "Pendente",
  with_vacancy: "Com vaga",
  with_leave: "Com afastamento",
};

const WEEKLY_STATUS_CLASS: Record<string, string> = {
  updated: "bg-green-100 text-green-700 hover:bg-green-100",
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  with_vacancy: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  with_leave: "bg-orange-100 text-orange-700 hover:bg-orange-100",
};

const ATTENDANT_STATUS_LABEL: Record<string, string> = {
  active: "Ativo(a)",
  inactive: "Inativo(a)",
  on_leave: "Licença médica",
  temp_leave: "Afastamento",
  dismissed: "Desligado(a)",
  substituted: "Substituído(a)",
  vacancy: "Vaga em aberto",
};

const ATTENDANT_STATUS_CLASS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  on_leave: "bg-yellow-100 text-yellow-800",
  temp_leave: "bg-orange-100 text-orange-800",
  dismissed: "bg-red-100 text-red-800",
  substituted: "bg-purple-100 text-purple-800",
  vacancy: "bg-blue-100 text-blue-800",
  inactive: "bg-gray-100 text-gray-700",
};

// Fluxo de uso do sistema
const FLOW_STEPS = [
  "A escola acessa com login próprio e encontra o quadro da semana anterior já carregado.",
  "O responsável confirma os registros sem alteração e edita apenas o que mudou.",
  "O sistema permite incluir novo atendente, aluno, troca de vínculo ou vaga em aberto.",
  "Alterações como licença, atestado, substituição e desligamento ficam registradas com data e justificativa.",
  "Ao enviar, a Secretaria recebe tudo em painel único e pode validar, acompanhar ou cobrar pendências.",
];

// Relatórios possíveis
const REPORTS = [
  "Relatório semanal por escola",
  "Relatório de atendentes ativos e afastados",
  "Relatório de vagas e novas demandas",
  "Histórico por aluno",
  "Histórico por atendente",
  "Escolas pendentes de envio",
  "Mapa geral da rede por território",
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: schoolPanel = [] } = trpc.schools.panel.useQuery();
  const { data: alerts = [] } = trpc.schools.alerts.useQuery();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Apenas administradores da SAIN podem acessar o dashboard gerencial.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const totalSchools = (stats as any)?.totalSchools ?? 0;
  const updatedSchools = schoolPanel.filter((s: any) => s.weeklyStatus === "updated").length;
  const pendingSchools = schoolPanel.filter((s: any) => !s.weeklyStatus || s.weeklyStatus === "pending").length;

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Secretaria Adjunta de Inclusão</p>
          <h1 className="text-2xl font-bold mt-1">Painel da Secretaria</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Acompanhamento em tempo real das escolas atualizadas, pendentes, afastamentos, vagas e novas demandas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Exportar relatório
          </Button>
        </div>
      </div>

      {/* Métricas principais — 6 cards como no protótipo */}
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

      {/* Layout principal: painel de escolas + sidebar */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Painel geral das escolas */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Painel geral das escolas</CardTitle>
              <CardDescription>Visão consolidada dos quadros enviados e das situações que exigem monitoramento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Filtros */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Buscar escola, aluno ou atendente..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Todas as situações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as situações</SelectItem>
                    <SelectItem value="updated">Atualizada</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="with_vacancy">Com vaga</SelectItem>
                    <SelectItem value="with_leave">Com afastamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de escolas */}
              {filteredSchools.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  {schoolPanel.length === 0
                    ? "Nenhuma escola cadastrada ainda. Acesse o módulo Escolas para cadastrar."
                    : "Nenhuma escola encontrada com os filtros aplicados."}
                </div>
              ) : (
                filteredSchools.map((school: any) => (
                  <div key={school.id} className="rounded-xl border p-4 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-base">{school.name}</h3>
                        {school.responsible && (
                          <p className="text-xs text-muted-foreground">Responsável pelo envio: {school.responsible}</p>
                        )}
                        {school.lastWeeklyUpdate && (
                          <p className="text-xs text-muted-foreground">Última atualização: {formatDateTime(school.lastWeeklyUpdate)}</p>
                        )}
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
                              {["Atendente", "Aluno(s)", "Situação", "Registro da semana"].map(h => (
                                <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {school.attendants.map((a: any) => (
                              <tr key={a.id} className="border-t hover:bg-muted/10">
                                <td className="px-3 py-2 font-medium">{a.name}</td>
                                <td className="px-3 py-2 text-muted-foreground">{a.linkedStudents || "—"}</td>
                                <td className="px-3 py-2">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ATTENDANT_STATUS_CLASS[a.status] ?? "bg-gray-100 text-gray-700"}`}>
                                    {ATTENDANT_STATUS_LABEL[a.status] ?? a.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">{a.changeType || "—"}</td>
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

        {/* Sidebar: alertas, fluxo, relatórios */}
        <div className="space-y-4">
          {/* Alertas da semana */}
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
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    {alert}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Fluxo de uso */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Fluxo de uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {FLOW_STEPS.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <p className="text-muted-foreground pt-0.5">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Relatórios possíveis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Relatórios disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {REPORTS.map(r => (
                  <li key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* KPIs secundários */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumo geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total de alunos", value: stats?.totalStudents ?? 0, color: "" },
                { label: "Atendimentos pendentes", value: stats?.pendingAttendances ?? 0, color: "text-amber-600" },
                { label: "Demandas externas", value: stats?.externalDemands ?? 0, color: "text-red-500" },
                { label: "Total de atendentes", value: (stats as any)?.totalMediators ?? 0, color: "" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
