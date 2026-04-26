import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Eye, Trash2, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FarolGestao() {
  const user = trpc.auth.me.useQuery().data;
  const [search, setSearch] = useState("");
  const [situacao, setSituacao] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Queries
  const { data: cases, isLoading, refetch } = trpc.farol.listCases.useQuery({
    search: search || undefined,
    situacao: situacao || undefined,
    status: status || undefined,
  });

  const { data: selectedCase } = trpc.farol.getCase.useQuery(
    { id: selectedCaseId! },
    { enabled: !!selectedCaseId }
  );

  const { data: metrics } = trpc.farol.metrics.useQuery();

  // Mutations
  const createMutation = trpc.farol.createCase.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
    },
  });

  const updateMutation = trpc.farol.updateCase.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedCaseId(null);
    },
  });

  const deleteMutation = trpc.farol.deleteCase.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedCaseId(null);
    },
  });

  // Verificar permissão
  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar o Farol da Gestão. Apenas administradores podem usar este módulo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const situacaoOptions = ["Ativo", "Inativo", "Arquivado", "Suspenso"];
  const statusOptions = ["Novo", "Em acompanhamento", "Aguardando retorno", "Encaminhado", "Resolvido", "Encerrado"];

  const getSituacaoBadge = (sit: string) => {
    const colors: Record<string, string> = {
      "Ativo": "bg-green-100 text-green-800",
      "Inativo": "bg-gray-100 text-gray-800",
      "Arquivado": "bg-blue-100 text-blue-800",
      "Suspenso": "bg-yellow-100 text-yellow-800",
    };
    return colors[sit] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (stat: string) => {
    const colors: Record<string, string> = {
      "Novo": "bg-blue-100 text-blue-800",
      "Em acompanhamento": "bg-purple-100 text-purple-800",
      "Aguardando retorno": "bg-orange-100 text-orange-800",
      "Encaminhado": "bg-cyan-100 text-cyan-800",
      "Resolvido": "bg-green-100 text-green-800",
      "Encerrado": "bg-red-100 text-red-800",
    };
    return colors[stat] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Farol da Gestão</h1>
          <p className="text-gray-600 mt-1">Gerenciamento de casos intersetoriais</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Caso
        </Button>
      </div>

      {/* Métricas */}
      {metrics && (
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Casos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.urgent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.resolved}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulário de Novo Caso */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Caso</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createMutation.mutate({
                  nome: formData.get("nome") as string,
                  tipoDemanda: formData.get("tipoDemanda") as string,
                  origem: formData.get("origem") as string,
                  situacao: (formData.get("situacao") as "Ativo" | "Inativo" | "Arquivado" | "Suspenso") || "Ativo",
                  status: (formData.get("status") as "Novo" | "Em acompanhamento" | "Aguardando retorno" | "Encaminhado" | "Resolvido" | "Encerrado") || "Novo",
                  descricao: (formData.get("descricao") as string) || undefined,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Input name="nome" placeholder="Nome do caso" required />
                <Input name="tipoDemanda" placeholder="Tipo de demanda" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input name="origem" placeholder="Origem" required />
                <select name="situacao" defaultValue="Ativo" className="w-full p-2 border rounded">
                  {situacaoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="status" defaultValue="Novo" className="w-full p-2 border rounded">
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                name="descricao"
                placeholder="Descrição"
                className="w-full p-2 border rounded"
                rows={3}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Caso"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={situacao || "all"} onValueChange={(val) => setSituacao(val === "all" ? "" : val)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Situação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {situacaoOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status || "all"} onValueChange={(val) => setStatus(val === "all" ? "" : val)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Casos */}
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-gray-500">Carregando casos...</p>
        ) : cases && cases.length > 0 ? (
          cases.map((caseItem) => (
            <Card key={caseItem.id} className="cursor-pointer hover:bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{caseItem.numeroCaso}</h3>
                      <Badge className={getSituacaoBadge(caseItem.situacao)}>
                        {caseItem.situacao}
                      </Badge>
                      <Badge className={getStatusBadge(caseItem.status)}>
                        {caseItem.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{caseItem.nome}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tipo: {caseItem.tipoDemanda} | Origem: {caseItem.origem}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCaseId(caseItem.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        deleteMutation.mutate({ id: caseItem.id })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhum caso encontrado</p>
        )}
      </div>

      {/* Detalhes do Caso */}
      {selectedCase && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Caso {selectedCase.numeroCaso}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-semibold">{selectedCase.nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo de Demanda</p>
                <p className="font-semibold">{selectedCase.tipoDemanda}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Origem</p>
                <p className="font-semibold">{selectedCase.origem}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Classificação</p>
                <p className="font-semibold">{selectedCase.classificacao || "Não informada"}</p>
              </div>
            </div>
            {selectedCase.descricao && (
              <div>
                <p className="text-sm text-gray-600">Descrição</p>
                <p className="text-sm">{selectedCase.descricao}</p>
              </div>
            )}
            {selectedCase.history && selectedCase.history.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Histórico</p>
                <div className="space-y-1">
                  {selectedCase.history.map((h) => (
                    <p key={h.id} className="text-xs text-gray-600">
                      {h.tipoAcao} - {h.createdByName}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setSelectedCaseId(null)}
            >
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
