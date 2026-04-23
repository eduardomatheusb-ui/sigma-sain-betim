import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  UserX,
  UserCheck,
  UserMinus,
  AlertTriangle,
  School,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";
import { InfoTooltip } from "@/components/InfoTooltip";

const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#14b8a6", "#6366f1",
  "#84cc16", "#a855f7",
];

const SHIFT_LABELS: Record<string, string> = {
  full: "Integral",
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};

const STATUS_LABELS: Record<string, string> = {
  with_attendant: "Com atendente",
  without_attendant: "Sem atendente",
  awaiting_substitution: "Aguardando substituição",
  partially_attended: "Parcialmente atendido",
};

// Textos dos tooltips de ajuda contextual
const TOOLTIPS = {
  withAttendant:
    "Quantidade de alunos que atualmente possuem mediador ou atendente vinculado no sistema.",
  withoutAttendant:
    "Quantidade de alunos cadastrados que ainda não possuem mediador ou atendente vinculado.",
  activeAttendants:
    "Total de mediadores ativos no sistema. Esta contagem considera profissionais únicos, sem repetir o mesmo mediador em mais de um aluno.",
  inactiveAttendants:
    "Total de mediadores cadastrados que estão inativos no momento.",
  afastados:
    "Total de mediadores temporariamente afastados, em licença ou situação semelhante.",
  vagas:
    "Total de registros de vaga em aberto para mediação, quando esse status estiver sendo utilizado.",
  openDemands:
    "Quantidade de demandas que ainda não tiveram atendimento vinculado ou solução concluída.",
  schoolsWithDeficit:
    "Total de escolas que possuem pelo menos um aluno sem atendimento no momento.",
  coverageRate:
    "Percentual de alunos com atendimento em relação ao total de alunos cadastrados no sistema.",
  pendingSubstitutions:
    "Quantidade de casos em que há necessidade de substituição de mediador ainda não concluída.",
  topEMs:
    "Lista das 10 escolas municipais com maior demanda por atendimento, considerando principalmente alunos sem atendimento, demandas em aberto e déficit de cobertura.",
  topCIMs:
    "Lista dos 10 CIMs com maior demanda por atendimento, considerando principalmente alunos sem atendimento, demandas em aberto e déficit de cobertura.",
  colSemAtendimento:
    "Quantidade de alunos da unidade que ainda não possuem atendimento.",
  colAbertas:
    "Quantidade de demandas ainda em aberto na unidade.",
  colDeficit:
    "Indicador sintético da necessidade de atendimento da unidade, calculado a partir da demanda não coberta.",
  disabilityChart:
    "Mostra a distribuição dos alunos por deficiência, transtorno ou condição informada no cadastro.",
  ageChart:
    "Mostra a distribuição dos alunos por faixa etária.",
  shiftChart:
    "Mostra a distribuição dos alunos por turno de atendimento ou escolarização.",
};

type StatsInput = {
  schoolId?: number;
  schoolType?: "all" | "EM" | "CIM" | "other";
  shift?: "all" | "morning" | "afternoon" | "full" | "evening";
};

export default function DashboardGerencial() {
  const [filters, setFilters] = useState<StatsInput>({
    schoolType: "all",
    shift: "all",
  });
  const [appliedFilters, setAppliedFilters] = useState<StatsInput>({
    schoolType: "all",
    shift: "all",
  });

  const { data: schools = [] } = trpc.schools.list.useQuery();
  const { data: stats, isLoading, refetch } = trpc.demands.stats.useQuery(appliedFilters);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    refetch();
  };

  // Dados para gráfico de deficiências
  const disabilityData = useMemo(() => {
    if (!stats?.disabilityCount) return [];
    return Object.entries(stats.disabilityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name: name.length > 30 ? name.slice(0, 30) + "…" : name, value }));
  }, [stats]);

  // Dados para gráfico de turnos
  const shiftData = useMemo(() => {
    if (!stats?.shiftCount) return [];
    return Object.entries(stats.shiftCount)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: SHIFT_LABELS[key] || key, value }));
  }, [stats]);

  // Dados para gráfico de situação
  const statusData = useMemo(() => {
    if (!stats?.statusCount) return [];
    return Object.entries(stats.statusCount)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: STATUS_LABELS[key] || key, value }));
  }, [stats]);

  const metricCards = [
    {
      title: "ALUNOS COM ATENDENTE",
      value: stats?.withAttendant ?? "—",
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
      tooltip: TOOLTIPS.withAttendant,
    },
    {
      title: "ALUNOS SEM ATENDENTE",
      value: stats?.withoutAttendant ?? "—",
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
      tooltip: TOOLTIPS.withoutAttendant,
    },
    {
      title: "ATENDENTES ATIVOS",
      value: stats?.activeAttendants ?? "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      tooltip: TOOLTIPS.activeAttendants,
    },
    {
      title: "ATENDENTES INATIVOS",
      value: stats?.inactiveAttendants ?? "—",
      icon: UserMinus,
      color: "text-orange-600",
      bg: "bg-orange-50",
      tooltip: TOOLTIPS.inactiveAttendants,
    },
    {
      title: "DEMANDAS EM ABERTO",
      value: stats ? stats.withoutAttendant + stats.awaitingSubstitution : "—",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      tooltip: TOOLTIPS.openDemands,
    },
    {
      title: "ESCOLAS COM FALTA DE ATENDENTE",
      value: stats?.schoolsWithDeficit ?? "—",
      icon: School,
      color: "text-purple-600",
      bg: "bg-purple-50",
      tooltip: TOOLTIPS.schoolsWithDeficit,
    },
    {
      title: "TAXA DE COBERTURA",
      value: stats ? `${stats.coverageRate}%` : "—",
      icon: TrendingUp,
      color: "text-teal-600",
      bg: "bg-teal-50",
      tooltip: TOOLTIPS.coverageRate,
    },
    {
      title: "SUBSTITUIÇÕES PENDENTES",
      value: stats?.awaitingSubstitution ?? "—",
      icon: Clock,
      color: "text-pink-600",
      bg: "bg-pink-50",
      tooltip: TOOLTIPS.pendingSubstitutions,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Filtros do Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Escola</label>
              <Select
                value={filters.schoolId?.toString() || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, schoolId: v === "all" ? undefined : parseInt(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as escolas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as escolas</SelectItem>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo de unidade</label>
              <Select
                value={filters.schoolType || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, schoolType: v as StatsInput["schoolType"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="EM">EM (Escola Municipal)</SelectItem>
                  <SelectItem value="CIM">CIM (Centro de Educação Infantil)</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Turno</label>
              <Select
                value={filters.shift || "all"}
                onValueChange={(v) =>
                  setFilters({ ...filters, shift: v as StatsInput["shift"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="full">Integral</SelectItem>
                  <SelectItem value="morning">Manhã</SelectItem>
                  <SelectItem value="afternoon">Tarde</SelectItem>
                  <SelectItem value="evening">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleApplyFilters} className="w-full" disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <Card key={card.title} className={`${card.bg} border-0`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide leading-tight">
                      {card.title}
                    </p>
                    <InfoTooltip text={card.tooltip} position="top" />
                  </div>
                  <p className={`text-3xl font-bold mt-1 ${card.color}`}>
                    {isLoading ? "..." : card.value}
                  </p>
                </div>
                <card.icon className={`h-8 w-8 ${card.color} opacity-70 shrink-0 ml-2`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 EMs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Top 10 EMs com maior demanda</CardTitle>
              <InfoTooltip text={TOOLTIPS.topEMs} position="top" />
            </div>
            <p className="text-xs text-muted-foreground">
              Ordenado por: 1) alunos sem atendente, 2) demandas em aberto.
            </p>
          </CardHeader>
          <CardContent>
            {!stats?.topEMs || stats.topEMs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ESCOLA</TableHead>
                    <TableHead className="text-center">
                      <span className="inline-flex items-center gap-1">
                        SEM ATENDENTE
                        <InfoTooltip text={TOOLTIPS.colSemAtendimento} position="top" size={12} />
                      </span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="inline-flex items-center gap-1">
                        ABERTAS
                        <InfoTooltip text={TOOLTIPS.colAbertas} position="top" size={12} />
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topEMs.map((em, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">{em.name}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 font-semibold">{em.withoutAttendant}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-yellow-600 font-semibold">{em.open}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top 10 CIMs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Top 10 CIMs com maior demanda</CardTitle>
              <InfoTooltip text={TOOLTIPS.topCIMs} position="top" />
            </div>
            <p className="text-xs text-muted-foreground">
              Ordenado por: 1) alunos sem atendente, 2) demandas em aberto.
            </p>
          </CardHeader>
          <CardContent>
            {!stats?.topCIMs || stats.topCIMs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ESCOLA</TableHead>
                    <TableHead className="text-center">
                      <span className="inline-flex items-center gap-1">
                        SEM ATENDENTE
                        <InfoTooltip text={TOOLTIPS.colSemAtendimento} position="top" size={12} />
                      </span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="inline-flex items-center gap-1">
                        ABERTAS
                        <InfoTooltip text={TOOLTIPS.colAbertas} position="top" size={12} />
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topCIMs.map((cim, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">{cim.name}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 font-semibold">{cim.withoutAttendant}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-yellow-600 font-semibold">{cim.open}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Deficiências */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Deficiência / Transtorno</CardTitle>
              <InfoTooltip text={TOOLTIPS.disabilityChart} position="top" />
            </div>
          </CardHeader>
          <CardContent>
            {disabilityData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={disabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {disabilityData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend
                    formatter={(value) => <span className="text-xs">{value}</span>}
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Situação do Atendimento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Situação do Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          index === 0 ? "#22c55e" :
                          index === 1 ? "#ef4444" :
                          index === 2 ? "#f59e0b" : "#3b82f6"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Turno */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Distribuição por Turno</CardTitle>
              <InfoTooltip text={TOOLTIPS.shiftChart} position="top" />
            </div>
          </CardHeader>
          <CardContent>
            {shiftData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={shiftData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Alunos" radius={[4, 4, 0, 0]}>
                    {shiftData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Faixa Etária */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Faixa Etária</CardTitle>
              <InfoTooltip text={TOOLTIPS.ageChart} position="top" />
            </div>
          </CardHeader>
          <CardContent>
            {!stats ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível.</p>
            ) : (() => {
              const ageData = Object.entries(stats.ageCount || {}).map(([name, value]) => ({ name, value }));
              return ageData.every(d => d.value === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={ageData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {ageData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </CardContent>
        </Card>

        {/* Gráfico de Motivo de Inatividade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Motivo de Inatividade</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível.</p>
            ) : (() => {
              const inactData = Object.entries(stats.inactivityCount || {}).map(([name, value]) => ({ name, value }));
              return inactData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum atendente inativo registrado.</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={inactData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="value" name="Atendentes" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </CardContent>
        </Card>

        {/* Resumo geral */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Resumo Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : !stats ? (
              <p className="text-sm text-muted-foreground">Nenhum dado disponível.</p>
            ) : (
              <>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground">Total de registros</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Com atendente</span>
                    <InfoTooltip text={TOOLTIPS.withAttendant} position="right" size={12} />
                  </div>
                  <span className="font-semibold text-green-600">{stats.withAttendant}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Sem atendente</span>
                    <InfoTooltip text={TOOLTIPS.withoutAttendant} position="right" size={12} />
                  </div>
                  <span className="font-semibold text-red-600">{stats.withoutAttendant}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Aguardando substituição</span>
                    <InfoTooltip text={TOOLTIPS.pendingSubstitutions} position="right" size={12} />
                  </div>
                  <span className="font-semibold text-yellow-600">{stats.awaitingSubstitution}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Atendentes ativos</span>
                    <InfoTooltip text={TOOLTIPS.activeAttendants} position="right" size={12} />
                  </div>
                  <span className="font-semibold text-blue-600">{stats.activeAttendants}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Atendentes inativos</span>
                    <InfoTooltip text={TOOLTIPS.inactiveAttendants} position="right" size={12} />
                  </div>
                  <span className="font-semibold text-orange-600">{stats.inactiveAttendants}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold">Taxa de cobertura</span>
                    <InfoTooltip text={TOOLTIPS.coverageRate} position="right" size={12} />
                  </div>
                  <span className={`font-bold text-lg ${stats.coverageRate >= 80 ? "text-green-600" : stats.coverageRate >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                    {stats.coverageRate}%
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
