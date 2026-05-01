import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  "Novo": "bg-blue-100 text-blue-800 border-blue-200",
  "Em acompanhamento": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Aguardando retorno": "bg-orange-100 text-orange-800 border-orange-200",
  "Encaminhado": "bg-purple-100 text-purple-800 border-purple-200",
  "Resolvido": "bg-green-100 text-green-800 border-green-200",
  "Encerrado": "bg-gray-100 text-gray-800 border-gray-200",
};

const SITUACAO_COLORS: Record<string, string> = {
  "Ativo": "bg-green-100 text-green-800 border-green-200",
  "Inativo": "bg-gray-100 text-gray-800 border-gray-200",
  "Arquivado": "bg-slate-100 text-slate-800 border-slate-200",
  "Suspenso": "bg-red-100 text-red-800 border-red-200",
};

export default function MeusCasos() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const { data: casos = [], isLoading, refetch } = trpc.farol.getMeusCasos.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return casos;
    const q = search.toLowerCase();
    return casos.filter(c =>
      c.nomeEstudante?.toLowerCase().includes(q) ||
      c.numeroCaso?.toLowerCase().includes(q) ||
      c.escola?.toLowerCase().includes(q) ||
      c.regional?.toLowerCase().includes(q)
    );
  }, [casos, search]);

  // Métricas
  const totalCasos = casos.length;
  const ativos = casos.filter(c => c.situacao === "Ativo").length;
  const aguardando = casos.filter(c => c.status === "Aguardando retorno").length;
  const resolvidos = casos.filter(c => c.situacao === "Arquivado" || c.status === "Resolvido" || c.status === "Encerrado").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Meus Casos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Olá, <span className="font-medium">{user?.name}</span>. Aqui estão os casos sob sua responsabilidade.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 self-start">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-foreground">{totalCasos}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ativos</p>
            <p className="text-2xl font-bold text-green-600">{ativos}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Aguardando</p>
            <p className="text-2xl font-bold text-orange-600">{aguardando}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Resolvidos</p>
            <p className="text-2xl font-bold text-slate-600">{resolvidos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Casos Atribuídos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por aluno, protocolo, escola ou regional..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Carregando seus casos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Briefcase className="h-10 w-10 opacity-30" />
              {casos.length === 0 ? (
                <>
                  <p className="font-medium">Nenhum caso atribuído</p>
                  <p className="text-sm text-center max-w-sm">
                    Você ainda não possui casos vinculados ao seu perfil. Entre em contato com a equipe SAIN para verificar seu cadastro como assessor.
                  </p>
                </>
              ) : (
                <p className="font-medium">Nenhum caso encontrado para "{search}"</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Estudante</TableHead>
                    <TableHead className="hidden md:table-cell">Escola</TableHead>
                    <TableHead className="hidden sm:table-cell">Regional</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Atualizado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(caso => (
                    <TableRow key={caso.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {caso.numeroCaso}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          {caso.alerta && (
                            <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          )}
                          {caso.nomeEstudante}
                        </div>
                        {caso.segmento && (
                          <p className="text-xs text-muted-foreground">{caso.segmento}</p>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {caso.escola || "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {caso.regional || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${SITUACAO_COLORS[caso.situacao ?? ""] ?? ""}`}
                        >
                          {caso.situacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_COLORS[caso.status ?? ""] ?? ""}`}
                        >
                          {caso.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {caso.updatedAt
                          ? new Date(caso.updatedAt).toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/farol/casos/${caso.id}`)}
                          className="gap-1 text-xs"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-3 text-right">
                {filtered.length} caso{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
