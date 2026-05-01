import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Info, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function FarolAssessores() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Load advisors (read-only)
  const { data: advisors = [], isLoading } = trpc.farol.listAdvisors.useQuery({});

  // Load all cases to show case count per advisor
  const { data: cases = [] } = trpc.farol.listCases.useQuery({});

  const filteredAdvisors = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return advisors.filter((a: any) =>
      (a.nome ?? "").toLowerCase().includes(q) ||
      (a.email ?? "").toLowerCase().includes(q) ||
      (a.cargo ?? "").toLowerCase().includes(q)
    );
  }, [advisors, searchTerm]);

  // Count open cases per advisor
  const caseCountByAdvisor = useMemo(() => {
    const map: Record<number, number> = {};
    for (const c of cases as any[]) {
      if (c.advisorId) {
        map[c.advisorId] = (map[c.advisorId] ?? 0) + 1;
      }
    }
    return map;
  }, [cases]);

  const metrics = useMemo(() => ({
    total: advisors.length,
    ativos: advisors.filter((a: any) => a.active).length,
    comCasos: advisors.filter((a: any) => caseCountByAdvisor[a.id] > 0).length,
  }), [advisors, caseCountByAdvisor]);

  if (!user || !["admin", "sain_assessor"].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Users className="w-12 h-12 text-muted-foreground opacity-30" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Acesso Restrito</h2>
          <p className="text-muted-foreground mt-1">Esta área é exclusiva para administradores e assessores SAIN.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Assessores</h1>
            <p className="text-sm text-muted-foreground">Relatório de responsáveis técnicos vinculados aos casos de Acompanhamento</p>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <strong>Cadastro de assessores:</strong> O cadastro de novos assessores é feito na página{" "}
          <Link href="/usuarios" className="underline font-medium hover:text-blue-900">
            Gestão de Usuários
          </Link>
          , ao criar um usuário com perfil <em>Assessor SAIN</em> ou <em>Profissional Externo</em>.
          Este relatório exibe apenas os responsáveis já cadastrados e seus casos vinculados.
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Assessores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assessores Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Com Casos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.comCasos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, e-mail ou cargo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo / Função</TableHead>
              <TableHead>Regional</TableHead>
              <TableHead>Casos vinculados</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando assessores...
                </TableCell>
              </TableRow>
            ) : filteredAdvisors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {advisors.length === 0
                    ? "Nenhum assessor cadastrado. Crie usuários com perfil Assessor SAIN ou Profissional Externo em Gestão de Usuários."
                    : "Nenhum assessor encontrado com os filtros aplicados."}
                </TableCell>
              </TableRow>
            ) : (
              filteredAdvisors.map((advisor: any) => {
                const count = caseCountByAdvisor[advisor.id] ?? 0;
                return (
                  <TableRow key={advisor.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{advisor.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{advisor.email ?? "—"}</TableCell>
                    <TableCell>{advisor.cargo ?? "—"}</TableCell>
                    <TableCell>{advisor.regional ?? "—"}</TableCell>
                    <TableCell>
                      {count > 0 ? (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                          {count} {count === 1 ? "caso" : "casos"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sem casos</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={advisor.active
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                      }>
                        {advisor.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
