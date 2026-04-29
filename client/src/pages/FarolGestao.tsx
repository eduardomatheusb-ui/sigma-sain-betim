import { trpc } from "@/lib/trpc";
import { exportCaseToWord, exportCasesToExcel } from "@/lib/farol-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Eye, Trash2, FileText, Edit, FileDown, ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { SearchComboBox } from "@/components/SearchComboBox";

export default function FarolGestao() {
  const user = trpc.auth.me.useQuery().data;
  
  // Filtros
  const [search, setSearch] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [regional, setRegional] = useState("todos");
  const [escola, setEscola] = useState("todos");
  const [situacao, setSituacao] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [classificacao, setClassificacao] = useState("todos");
  const [responsavel, setResponsavel] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ordenacao, setOrdenacao] = useState("updatedAt");
  const [ordem, setOrdem] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [incluirHistorico, setIncluirHistorico] = useState(false);
  
  // UI State
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null);

  // Queries
  const { data: cases, isLoading, refetch } = trpc.farol.listCases.useQuery({
    search: search || protocolo || undefined,
  });

  const { data: selectedCase } = trpc.farol.getCase.useQuery(
    { id: editingCaseId! },
    { enabled: !!editingCaseId }
  );

  const { data: advisors = [] } = trpc.farol.listAdvisors.useQuery({ ativo: true });
  const { data: metrics } = trpc.farol.metrics.useQuery();
  const { data: schools = [] } = trpc.schools.list.useQuery();

  // Preencher formulário ao editar
  useEffect(() => {
    if (selectedCase && editingCaseId) {
      const form = document.querySelector('form');
      if (form) {
        const dataInput = form.querySelector('input[name="dataEntrada"]') as HTMLInputElement;
        if (dataInput && selectedCase.dataEntrada) {
          dataInput.value = new Date(selectedCase.dataEntrada).toISOString().split('T')[0];
        }
        const nomeInput = form.querySelector('input[name="nomeEstudante"]') as HTMLInputElement;
        if (nomeInput) nomeInput.value = selectedCase.nomeEstudante || '';
        const idadeInput = form.querySelector('input[name="idade"]') as HTMLInputElement;
        if (idadeInput) idadeInput.value = (selectedCase as any).idade?.toString() || '';
        const segmentoSelect = form.querySelector('select[name="segmento"]') as HTMLSelectElement;
        if (segmentoSelect) segmentoSelect.value = selectedCase.segmento || '';
        const schoolSelect = form.querySelector('select[name="schoolId"]') as HTMLSelectElement;
        if (schoolSelect) schoolSelect.value = (selectedCase as any).schoolId?.toString() || '';
        const escolaInput = form.querySelector('input[name="escola"]') as HTMLInputElement;
        if (escolaInput) escolaInput.value = selectedCase.escola || '';
        const regionalInput = form.querySelector('input[name="regional"]') as HTMLInputElement;
        if (regionalInput) regionalInput.value = selectedCase.regional || '';
        const tipoSelect = form.querySelector('select[name="tipoDemanda"]') as HTMLSelectElement;
        if (tipoSelect) tipoSelect.value = selectedCase.tipoDemanda || '';
        const origemSelect = form.querySelector('select[name="origem"]') as HTMLSelectElement;
        if (origemSelect) origemSelect.value = selectedCase.origem || '';
        const classSelect = form.querySelector('select[name="classificacao"]') as HTMLSelectElement;
        if (classSelect) classSelect.value = selectedCase.classificacaoCaso || '';
        const situacaoSelect = form.querySelector('select[name="situacao"]') as HTMLSelectElement;
        if (situacaoSelect) situacaoSelect.value = selectedCase.situacao || '';
        const statusSelect = form.querySelector('select[name="status"]') as HTMLSelectElement;
        if (statusSelect) statusSelect.value = selectedCase.status || '';
        const obsTextarea = form.querySelector('textarea[name="observacaoGeral"]') as HTMLTextAreaElement;
        if (obsTextarea) obsTextarea.value = selectedCase.observacaoGeral || '';
        const encTextarea = form.querySelector('textarea[name="encaminhamentos"]') as HTMLTextAreaElement;
        if (encTextarea) encTextarea.value = selectedCase.analiseConjunta || '';
      }
    }
  }, [selectedCase, editingCaseId]);

  // Mutations
  const createMutation = trpc.farol.createCase.useMutation({
    onSuccess: () => {
      toast.success("Caso criado com sucesso");
      refetch();
      setShowForm(false);
      setEditingCaseId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar caso");
    },
  });

  const updateMutation = trpc.farol.updateCase.useMutation({
    onSuccess: () => {
      toast.success("Caso atualizado com sucesso");
      refetch();
      setShowForm(false);
      setEditingCaseId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar caso");
    },
  });

  const deleteMutation = trpc.farol.deleteCase.useMutation({
    onSuccess: () => {
      toast.success("Caso excluído com sucesso");
      refetch();
      setSelectedCaseId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir caso");
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
  const classificacaoOptions = ["Baixa", "Média", "Alta", "Crítica"];
  const tipoDemandasOptions = ["Educacional", "Social", "Saúde", "Outro"];
  const origemOptions = ["Escola", "Família", "Comunidade", "Encaminhamento"];
  const segmentoOptions = ["Creche", "Pré-escolar", "Fundamental", "Médio"];

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

  // Aplicar filtros
  const filteredCases = useMemo(() => {
    if (!cases) return [];
    
    let filtered = [...cases];

    // Filtro por protocolo
    if (protocolo) {
      filtered = filtered.filter(c => c.numeroCaso.includes(protocolo));
    }

    // Filtro por regional
    if (regional !== "todos") {
      filtered = filtered.filter(c => c.regional === regional);
    }

    // Filtro por escola
    if (escola !== "todos") {
      filtered = filtered.filter(c => c.schoolId === parseInt(escola));
    }

    // Filtro por situação
    if (situacao !== "todos") {
      filtered = filtered.filter(c => c.situacao === situacao);
    }

    // Filtro por status
    if (status !== "todos") {
      filtered = filtered.filter(c => c.status === status);
    }

    // Filtro por classificação
    if (classificacao !== "todos") {
      filtered = filtered.filter(c => c.classificacaoCaso === classificacao);
    }

    // Filtro por responsável
    if (responsavel !== "todos") {
      filtered = filtered.filter(c => c.responsavel === responsavel);
    }

    // Filtro por período
    if (dataInicio) {
      filtered = filtered.filter(c => new Date(c.dataEntrada) >= new Date(dataInicio));
    }
    if (dataFim) {
      filtered = filtered.filter(c => new Date(c.dataEntrada) <= new Date(dataFim));
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aVal: any = a[ordenacao as keyof typeof a];
      let bVal: any = b[ordenacao as keyof typeof b];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return ordem === "asc" ? -1 : 1;
      if (aVal > bVal) return ordem === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [cases, protocolo, regional, escola, situacao, status, classificacao, responsavel, dataInicio, dataFim, ordenacao, ordem]);

  const limparFiltros = () => {
    setSearch("");
    setProtocolo("");
    setRegional("todos");
    setEscola("todos");
    setSituacao("todos");
    setStatus("todos");
    setClassificacao("todos");
    setResponsavel("todos");
    setDataInicio("");
    setDataFim("");
    setOrdenacao("updatedAt");
    setOrdem("desc");
  };

  const [, navigate] = useLocation();

  const handleSubmitCase = (e: React.FormEvent<HTMLFormElement>, isEditing: boolean) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Validar campos obrigatórios
    const nomeEstudante = formData.get("nomeEstudante") as string;
    const tipoDemanda = formData.get("tipoDemanda") as string;
    const origem = formData.get("origem") as string;
    
    if (!nomeEstudante || !nomeEstudante.trim()) {
      alert("Por favor, preencha o nome do estudante");
      return;
    }
    if (!tipoDemanda) {
      alert("Por favor, selecione o tipo de demanda");
      return;
    }
    if (!origem) {
      alert("Por favor, selecione a origem");
      return;
    }
    
    const payload = {
      dataEntrada: formData.get("dataEntrada") as string,
      nomeEstudante: formData.get("nomeEstudante") as string,
      idade: formData.get("idade") ? parseInt(formData.get("idade") as string) : undefined,
      escola: formData.get("escola") as string,
      schoolId: formData.get("schoolId") ? parseInt(formData.get("schoolId") as string) : undefined,
      regional: formData.get("regional") as string,
      segmento: formData.get("segmento") as string,
      situacao: (formData.get("situacao") as any) || "Ativo",
      status: (formData.get("status") as any) || "Novo",
      classificacaoCaso: formData.get("classificacao") as string,
      tipoDemanda: formData.get("tipoDemanda") as string,
      origem: formData.get("origem") as string,

      observacaoGeral: (formData.get("observacaoGeral") as string) || undefined,
      encaminhamentos: (formData.get("encaminhamentos") as string) || undefined,
    };

    if (isEditing && editingCaseId) {
      updateMutation.mutate({ id: editingCaseId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
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
              <div className="text-2xl font-bold text-green-600">{metrics.ativo}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.urgentes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.aguardando}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.resolvidos}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Busca e Filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Busca e Filtros</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              {showFilters ? "Ocultar" : "Mostrar"} Filtros Avançados
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca Principal */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por nome, escola ou protocolo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Input
              placeholder="Filtrar por protocolo"
              value={protocolo}
              onChange={(e) => setProtocolo(e.target.value)}
            />
          </div>

          {/* Filtros Avançados */}
          {showFilters && (
            <>
              <div className="grid grid-cols-4 gap-4">
                <Select value={regional} onValueChange={setRegional}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as regionais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as regionais</SelectItem>
                    {Array.from(new Set(cases?.map(c => c.regional).filter(Boolean))).map(r => (
                      <SelectItem key={r} value={r || ""}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={escola} onValueChange={setEscola}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as escolas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as escolas</SelectItem>
                    {schools.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={situacao} onValueChange={setSituacao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as situações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as situações</SelectItem>
                    {situacaoOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Select value={classificacao} onValueChange={setClassificacao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as classificações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as classificações</SelectItem>
                    {classificacaoOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={responsavel} onValueChange={setResponsavel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os profissionais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os profissionais</SelectItem>
                    {advisors.map(adv => (
                      <SelectItem key={adv.id} value={adv.id.toString()}>{adv.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Período inicial"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />

                <Input
                  type="date"
                  placeholder="Período final"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <Select value={ordenacao} onValueChange={setOrdenacao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt">Atualizado em</SelectItem>
                    <SelectItem value="createdAt">Criado em</SelectItem>
                    <SelectItem value="nomeEstudante">Nome</SelectItem>
                    <SelectItem value="numeroCaso">Nº do caso</SelectItem>
                    <SelectItem value="classificacaoCaso">Classificação</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ordem} onValueChange={(v) => setOrdem(v as "asc" | "desc")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Decrescente</SelectItem>
                    <SelectItem value="asc">Crescente</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={limparFiltros} className="col-span-2">
                  Limpar Filtros
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Exportação */}
      <div className="flex gap-2 items-center">
        <Button
          onClick={() => {
            if (filteredCases && filteredCases.length > 0) {
              exportCasesToExcel(filteredCases as any);
            }
          }}
          variant="outline"
          disabled={!filteredCases || filteredCases.length === 0}
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          Exportar Excel
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={incluirHistorico}
            onChange={(e) => setIncluirHistorico(e.target.checked)}
            className="w-4 h-4"
          />
          Incluir histórico consolidado
        </label>
        <span className="text-sm text-gray-600 ml-auto">
          {filteredCases?.length || 0} caso(s) listado(s)
        </span>
      </div>

      {/* Tabela de Casos */}
      <Card>
        <CardHeader>
          <CardTitle>Casos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCases && filteredCases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2 font-semibold">Protocolo</th>
                    <th className="text-left py-3 px-2 font-semibold">Estudante</th>
                    <th className="text-left py-3 px-2 font-semibold">Escola</th>
                    <th className="text-left py-3 px-2 font-semibold">Regional</th>
                    <th className="text-left py-3 px-2 font-semibold">Situação</th>
                    <th className="text-left py-3 px-2 font-semibold">Status</th>
                    <th className="text-left py-3 px-2 font-semibold">Responsável</th>
                    <th className="text-left py-3 px-2 font-semibold">Atualizado em</th>
                    <th className="text-left py-3 px-2 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-mono text-xs font-semibold">{c.numeroCaso}</td>
                      <td className="py-3 px-2">{c.nomeEstudante}</td>
                      <td className="py-3 px-2 text-xs">{c.escola}</td>
                      <td className="py-3 px-2 text-xs">{c.regional || "-"}</td>
                      <td className="py-3 px-2">
                        <Badge className={getSituacaoBadge(c.situacao)}>{c.situacao}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getStatusBadge(c.status)}>{c.status}</Badge>
                      </td>
                      <td className="py-3 px-2 text-xs">
                        {c.responsavel || "Não informado"}
                      </td>
                      <td className="py-3 px-2 text-xs">
                        {new Date(c.updatedAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Ver detalhes"
                            onClick={() => navigate(`/farol/casos/${c.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Editar"
                            onClick={() => {
                              setEditingCaseId(c.id);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Exportar para Word"
                            onClick={() => exportCaseToWord(c as any)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Arquivar"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja arquivar este caso?")) {
                                deleteMutation.mutate({ id: c.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              {cases && cases.length === 0 
                ? "Nenhum caso cadastrado" 
                : "Nenhum caso encontrado com os filtros selecionados"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Novo Caso */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCaseId ? "Editar Caso" : "Novo Caso"}</CardTitle>
            <CardDescription>{editingCaseId ? "Atualize os dados do caso." : "Preencha os dados do novo caso. O protocolo será gerado automaticamente."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmitCase(e, !!editingCaseId)} className="space-y-6">
              {/* Identificação do Caso */}
              <div>
                <h3 className="font-semibold mb-3">Identificação do Caso</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nº do Caso</label>
                    <Input disabled value="Gerado automaticamente ao salvar" className="mt-1 bg-gray-100" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data de Entrada *</label>
                    <Input type="date" name="dataEntrada" required className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Dados do Estudante */}
              <div>
                <h3 className="font-semibold mb-3">Dados do Estudante</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome *</label>
                    <Input name="nomeEstudante" placeholder="Nome completo" required className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Idade</label>
                    <Input type="number" name="idade" placeholder="Idade" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Segmento</label>
                    <select name="segmento" className="w-full p-2 border rounded mt-1">
                      <option value="">Selecione</option>
                      {segmentoOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Escola e Território */}
              <div>
                <h3 className="font-semibold mb-3">Escola e Território</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Escola *</label>
                    <SearchComboBox
                      placeholder="Buscar escola..."
                      onSearch={async (query) => {
                        if (!query || query.length < 2) return [];
                        try {
                          const response = await fetch(`/api/trpc/farol.searchSchools?input=${JSON.stringify({query, limit: 10})}`)
                          const result = await response.json();
                          return result.result?.data?.schools?.map((s: any) => ({
                            id: s.id,
                            name: s.name,
                            code: s.code,
                          })) || [];
                        } catch (err) {
                          console.error('Erro ao buscar escolas:', err);
                          return [];
                        }
                      }}
                      onSelect={(option) => {
                        const schoolIdInput = document.querySelector('input[name="schoolId"]') as HTMLInputElement;
                        if (schoolIdInput) schoolIdInput.value = option.id.toString();
                        const escolaInput = document.querySelector('input[name="escola"]') as HTMLInputElement;
                        if (escolaInput) escolaInput.value = option.name;
                      }}
                    />
                    <Input name="schoolId" type="hidden" />
                    <Input name="escola" type="hidden" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Regional</label>
                    <Input name="regional" placeholder="Regional" className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Classificação da Demanda */}
              <div>
                <h3 className="font-semibold mb-3">Classificação da Demanda</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tipo de Demanda *</label>
                    <select name="tipoDemanda" required className="w-full p-2 border rounded mt-1">
                      <option value="">Selecione</option>
                      {tipoDemandasOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Origem *</label>
                    <select name="origem" required className="w-full p-2 border rounded mt-1">
                      <option value="">Selecione</option>
                      {origemOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Classificação</label>
                    <select name="classificacao" className="w-full p-2 border rounded mt-1">
                      <option value="">Selecione</option>
                      {classificacaoOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Situação</label>
                    <select name="situacao" defaultValue="Ativo" className="w-full p-2 border rounded mt-1">
                      {situacaoOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status e Responsável */}
              <div>
                <h3 className="font-semibold mb-3">Status e Responsável</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select name="status" defaultValue="Novo" className="w-full p-2 border rounded mt-1">
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assessor Responsável</label>
                    <select name="responsavel" className="w-full p-2 border rounded mt-1">
                      <option value="">Selecione um assessor</option>
                      {advisors.map((adv: any) => (
                        <option key={adv.id} value={adv.id}>{adv.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Observações e Encaminhamentos */}
              <div>
                <h3 className="font-semibold mb-3">Observações e Encaminhamentos</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Observação Geral</label>
                    <textarea
                      name="observacaoGeral"
                      placeholder="Observações gerais sobre o caso"
                      className="w-full p-2 border rounded mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Encaminhamentos</label>
                    <textarea
                      name="encaminhamentos"
                      placeholder="Encaminhamentos recomendados"
                      className="w-full p-2 border rounded mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Caso"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Detalhes do Caso */}
      {selectedCaseId && selectedCase && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Caso {selectedCase.numeroCaso}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Estudante</p>
                <p className="font-semibold">{selectedCase.nomeEstudante}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Escola</p>
                <p className="font-semibold">{selectedCase.escola}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Regional</p>
                <p className="font-semibold">{selectedCase.regional || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Responsável</p>
                <p className="font-semibold">{selectedCase.responsavel || "Não informado"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Situação</p>
                <Badge className={getSituacaoBadge(selectedCase.situacao)}>{selectedCase.situacao}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={getStatusBadge(selectedCase.status)}>{selectedCase.status}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Observação Geral</p>
              <p>{selectedCase.observacaoGeral || "-"}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedCaseId(null)}>
              Fechar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
