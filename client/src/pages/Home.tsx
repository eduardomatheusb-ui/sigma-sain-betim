import { useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, Briefcase, ClipboardList, AlertCircle, GraduationCap, ArrowRight, Calendar, School, CheckCircle2, Clock } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

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
            <h1 className="text-3xl font-bold text-foreground mb-2">NEXUS</h1>
            <p className="text-muted-foreground mb-2">Plataforma de Gestão e Articulação da Rede de Inclusão</p>
            <p className="text-sm text-muted-foreground mb-8">
              SEMED/SAIN — Prefeitura Municipal de Betim
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

  const role = user?.role;

  if (role === "admin") return <AdminHome userName={user?.name || ""} />;
  if (role === "sain_assessor") return <SainAssessorHome userName={user?.name || ""} />;
  if (role === "external_professional") return <ExternalProfessionalHome userName={user?.name || ""} />;
  return <SchoolHome userName={user?.name || ""} />;
}

function AdminHome({ userName }: { userName: string }) {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: schoolPanel = [] } = trpc.schools.panel.useQuery();
  const { data: alerts = [] } = trpc.schools.alerts.useQuery();

  const updatedSchools = schoolPanel.filter((s: any) => s.weeklyStatus === "updated").length;
  const pendingSchools = schoolPanel.filter((s: any) => !s.weeklyStatus || s.weeklyStatus === "pending").length;

  const metrics = [
    { label: "Total de Alunos", value: stats?.totalStudents ?? 0, icon: <GraduationCap className="w-5 h-5 text-primary" />, href: "/alunos" },
    { label: "Mediadores Ativos", value: (stats as any)?.activeMediators ?? 0, icon: <Users className="w-5 h-5 text-blue-600" />, href: "/mediadores" },
    { label: "Escolas Atualizadas", value: updatedSchools, icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, href: "/dashboard" },
    { label: "Escolas Pendentes", value: pendingSchools, icon: <Clock className="w-5 h-5 text-amber-600" />, href: "/dashboard" },
    { label: "Atend. Pendentes", value: stats?.pendingAttendances ?? 0, icon: <ClipboardList className="w-5 h-5 text-orange-600" />, href: "/atendimentos" },
    { label: "Vagas em Aberto", value: (stats as any)?.vacancies ?? 0, icon: <AlertCircle className="w-5 h-5 text-red-500" />, href: "/dashboard" },
  ];

  const quickActions = [
    { label: "Painel da Secretaria", desc: "Visao consolidada de todas as escolas", href: "/dashboard", icon: <School className="w-5 h-5" /> },
    { label: "Gestao de Alunos", desc: "Cadastrar e acompanhar alunos", href: "/alunos", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "Mediadores", desc: "Gerenciar atendentes e vinculos", href: "/mediadores", icon: <Users className="w-5 h-5" /> },
    { label: "Atendimentos", desc: "Registrar e consultar atendimentos", href: "/atendimentos", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Relatorios", desc: "Gerar relatorios e exportar dados", href: "/relatorios", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Escolas", desc: "Cadastro e gestao de unidades", href: "/escolas", icon: <School className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Secretaria Municipal de Educação</p>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Secretaria Adjunta de Inclusão</p>
        <h1 className="text-2xl font-bold mt-1">Bem-vindo, {userName}!</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do sistema NEXUS</p>
      </div>

      {/* Metricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map(m => (
          <Link key={m.label} href={m.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">{m.icon}<p className="text-xs text-muted-foreground">{m.label}</p></div>
                <p className="text-2xl font-bold">{m.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Acoes rapidas + Alertas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Acesso rapido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map(a => (
                  <Link key={a.label} href={a.href}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition cursor-pointer group">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">{a.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{a.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" /> Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum alerta no momento.</p>
              ) : (
                alerts.slice(0, 5).map((alert: string, i: number) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
                    {alert}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumo geral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Total de escolas", value: (stats as any)?.totalSchools ?? 0 },
                { label: "Total de mediadores", value: (stats as any)?.totalMediators ?? 0 },
                { label: "Demandas externas", value: stats?.externalDemands ?? 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SchoolHome({ userName }: { userName: string }) {
  const { user } = useAuth();
  const { data: mediatorsData } = trpc.mediators.listBySchool.useQuery();
  // Usar demands.list (tabela correta com 1.122 alunos) em vez de students.listBySchool (tabela vazia)
  const { data: demandsData = [] } = trpc.demands.list.useQuery();
  const studentsList = useMemo(() => {
    if (!user?.schoolId) return demandsData;
    return demandsData.filter((d: any) => d.schoolId === user.schoolId);
  }, [demandsData, user?.schoolId]);
  const { data: attendancesData } = trpc.attendances.listBySchool.useQuery();
  const mediators = mediatorsData || [];
  const attendancesList = attendancesData || [];

  const activeMediators = mediators.filter((m: any) => m.status === "active").length;
  const inactiveMediators = mediators.length - activeMediators;
  const pendingAttendances = attendancesList.filter((a: any) => a.status === "pending").length;

  const quickActions = [
    { label: "Quadro Semanal", desc: "Enviar atualizacao semanal", href: "/cadastros", icon: <Calendar className="w-5 h-5" /> },
    { label: "Alunos", desc: "Cadastrar e gerenciar alunos", href: "/alunos", icon: <GraduationCap className="w-5 h-5" /> },
    { label: "Mediadores", desc: "Gerenciar atendentes", href: "/mediadores", icon: <Users className="w-5 h-5" /> },
    { label: "Atendimentos", desc: "Registrar atendimentos", href: "/atendimentos", icon: <ClipboardList className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo, {userName}!</h1>
        <p className="text-sm text-muted-foreground mt-1">Painel da sua escola</p>
      </div>

      {/* Metricas da escola */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Alunos", value: studentsList.length, icon: <GraduationCap className="w-5 h-5 text-primary" /> },
          { label: "Mediadores Ativos", value: activeMediators, icon: <Users className="w-5 h-5 text-green-600" /> },
          { label: "Mediadores Inativos", value: inactiveMediators, icon: <Users className="w-5 h-5 text-red-500" /> },
          { label: "Atend. Pendentes", value: pendingAttendances, icon: <ClipboardList className="w-5 h-5 text-amber-600" /> },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">{m.icon}<p className="text-xs text-muted-foreground">{m.label}</p></div>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Acoes rapidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acesso rapido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(a => (
              <Link key={a.label} href={a.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition cursor-pointer group">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{a.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ultimos mediadores */}
      {mediators.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mediadores da escola</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Alunos vinculados</th>
                  </tr>
                </thead>
                <tbody>
                  {mediators.slice(0, 8).map((m: any) => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="px-4 py-2 font-medium">{m.name}</td>
                      <td className="px-4 py-2">
                        <Badge className={m.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {m.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{m.linkedStudents || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Home para Assessor SAIN
// ─────────────────────────────────────────────────────────────────────────────
function SainAssessorHome({ userName }: { userName: string }) {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: alerts = [] } = trpc.schools.alerts.useQuery();
  const { data: farolCases = [] } = trpc.farol.listCases.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const ativos = (farolCases as any[]).filter((c: any) => c.situacao === "Ativo").length;
  const urgentes = (farolCases as any[]).filter((c: any) => c.alerta).length;

  const quickActions = [
    { label: "Farol da Gestão", desc: "Acompanhar casos intersetoriais", href: "/farol/gestao", icon: <Briefcase className="w-5 h-5" /> },
    { label: "Assessores", desc: "Gerenciar profissionais externos", href: "/farol/assessores", icon: <Users className="w-5 h-5" /> },
    { label: "Auditoria", desc: "Histórico de ações no sistema", href: "/farol/auditoria", icon: <ClipboardList className="w-5 h-5" /> },
    { label: "Relatórios", desc: "Gerar relatórios e exportar dados", href: "/relatorios", icon: <GraduationCap className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Secretaria Adjunta de Inclusão</p>
        <h1 className="text-2xl font-bold mt-1">Bem-vindo, {userName}!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Painel do Assessor SAIN
          <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">Assessor SAIN</Badge>
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total de Alunos", value: stats?.totalStudents ?? 0, icon: <GraduationCap className="w-5 h-5 text-primary" /> },
          { label: "Casos no Farol", value: (farolCases as any[]).length, icon: <Briefcase className="w-5 h-5 text-blue-600" /> },
          { label: "Casos Ativos", value: ativos, icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
          { label: "Alertas", value: urgentes, icon: <AlertCircle className="w-5 h-5 text-red-500" /> },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">{m.icon}<p className="text-xs text-muted-foreground">{m.label}</p></div>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações rápidas + Alertas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Acesso rápido</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map(a => (
                  <Link key={a.label} href={a.href}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition cursor-pointer group">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">{a.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{a.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum alerta no momento.</p>
            ) : (
              alerts.slice(0, 5).map((alert: string, i: number) => (
                <div key={i} className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">{alert}</div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Home para Profissional Externo
// ─────────────────────────────────────────────────────────────────────────────
function ExternalProfessionalHome({ userName }: { userName: string }) {
  const { data: meusCasos = [], isLoading } = trpc.farol.getMeusCasos.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const ativos = (meusCasos as any[]).filter((c: any) => c.situacao === "Ativo").length;
  const aguardando = (meusCasos as any[]).filter((c: any) => c.status === "Aguardando retorno").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">SAIN — Prefeitura de Betim</p>
        <h1 className="text-2xl font-bold mt-1">Bem-vindo, {userName}!</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Painel do Profissional Externo
          <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">Profissional Externo</Badge>
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Meus Casos", value: (meusCasos as any[]).length, icon: <Briefcase className="w-5 h-5 text-primary" /> },
          { label: "Ativos", value: ativos, icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
          { label: "Aguardando", value: aguardando, icon: <Clock className="w-5 h-5 text-amber-600" /> },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">{m.icon}<p className="text-xs text-muted-foreground">{m.label}</p></div>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Acesso rápido */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Acesso rápido</CardTitle></CardHeader>
        <CardContent>
          <Link href="/meus-casos">
            <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition cursor-pointer group">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Briefcase className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Meus Casos</p>
                <p className="text-xs text-muted-foreground">Ver todos os casos sob minha responsabilidade</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Casos recentes */}
      {!isLoading && (meusCasos as any[]).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Casos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Protocolo</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Estudante</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {(meusCasos as any[]).slice(0, 5).map((c: any) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{c.numeroCaso}</td>
                      <td className="px-4 py-2 font-medium">{c.nomeEstudante}</td>
                      <td className="px-4 py-2">
                        <Badge variant="outline" className="text-xs">{c.status}</Badge>
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">
                        {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("pt-BR") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && (meusCasos as any[]).length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum caso atribuído</p>
            <p className="text-sm mt-1">Entre em contato com a equipe SAIN para verificar seu cadastro como assessor.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
