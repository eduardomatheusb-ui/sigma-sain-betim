import { trpc } from "@/lib/trpc";
import { exportCaseToWord, exportCasesToExcel } from "@/lib/farol-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Eye, Trash2, FileText, Edit, FileDown, ChevronDown, X, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useMobile";

export default function FarolGestao() {
  const user = trpc.auth.me.useQuery().data;
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  
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
  const [showFilters, setShowFilters] = useState(true);
  const [incluirHistorico, setIncluirHistorico] = useState(false);
  
  // UI State
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

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
  const schoolsQuery = (trpc.schools.list.useQuery() as any);
  const schoolsList = (schoolsQuery?.data || []) as any[];

  // Student autocomplete via searchStudents
  const { data: studentSearchResults = [] } = (trpc.demands.searchStudents.useQuery(
    { query: studentSearch },
    { enabled: studentSearch.length >= 2 }
  ) as any);

  // Auto-scroll ao abrir formulário
  useEffect(() => {
    if (showForm && formRef.current && !isMobile) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showForm, isMobile]);

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
        const escolaSelect = form.querySelector('select[name="escola"]') as HTMLSelectElement;
        if (escolaSelect) escolaSelect.value = selectedCase.escola || '';
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
    onError: (error: any) => {
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
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar caso");
    },
  });

  const deleteMutation = trpc.farol.deleteCase.useMutation({
    onSuccess: () => {
      toast.success("Caso excluído com sucesso");
      refetch();
      setSelectedCaseId(null);
    },
    onError: (error: any) => {
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
            Você não tem permissão para acessar o Acompanhamento de Casos. Apenas administradores podem usar este módulo.
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

    if (protocolo) {
      filtered = filtered.filter(c => c.numeroCaso.includes(protocolo));
    }

    if (regional !== "todos") {
      filtered = filtered.filter(c => c.regional === regional);
    }

    if (escola !== "todos") {
      filtered = filtered.filter(c => c.escola === escola);
    }

    if (situacao !== "todos") {
      filtered = filtered.filter(c => c.situacao === situacao);
    }

    if (status !== "todos") {
      filtered = filtered.filter(c => c.status === status);
    }

    if (classificacao !== "todos") {
      filtered = filtered.filter(c => c.classificacaoCaso === classificacao);
    }

    if (responsavel !== "todos") {
      filtered = filtered.filter(c => c.responsavel === responsavel);
    }

    if (dataInicio) {
      filtered = filtered.filter(c => new Date(c.dataEntrada) >= new Date(dataInicio));
    }
    if (dataFim) {
      filtered = filtered.filter(c => new Date(c.dataEntrada) <= new Date(dataFim));
    }

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

  const handleSubmitCase = (e: React.FormEvent<HTMLFormElement>, isEditing: boolean) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const nomeEstudante = formData.get("nomeEstudante") as string;
    const escola = formData.get("escola") as string;
    const dataEntrada = formData.get("dataEntrada") as string;

    if (!nomeEstudante?.trim()) {
      toast.error("Nome do aluno é obrigatório");
      return;
    }

    if (!escola?.trim()) {
      toast.error("Escola é obrigatória");
      return;
    }

    if (!dataEntrada?.trim()) {
      toast.error("Data de entrada é obrigatória");
      return;
    }

    const caseData = {
      nomeEstudante,
      idade: parseInt(formData.get("idade") as string) || 0,
      escola,
      segmento: formData.get("segmento") as string,
      regional: formData.get("regional") as string,
      tipoDemanda: formData.get("tipoDemanda") as string,
      origem: formData.get("origem") as string,
      classificacaoCaso: formData.get("classificacao") as string,
      situacao: formData.get("situacao") as string,
      status: formData.get("status") as string,
      observacaoGeral: formData.get("observacaoGeral") as string,
      analiseConjunta: formData.get("encaminhamentos") as string,
      dataEntrada,
    };

    if (isEditing && editingCaseId) {
      updateMutation.mutate({ id: editingCaseId, ...caseData } as any);
    } else {
      createMutation.mutate(caseData as any);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCaseId(null);
    setStudentSearch("");
  };

  // Renderizar formulário
  const FormContent = () => (
    <form onSubmit={(e) => handleSubmitCase(e, !!editingCaseId)} className="space-y-6">
      {/* Identificação do Caso */}
      <div>
        <h3 className="font-semibold mb-3">Identificação do Caso</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Nº do Caso</label>
            <Input disabled value="Gerado automaticamente ao salvar" className="mt-1 bg-gray-100" />
          </div>
          <div>
            <label className="text-sm font-medium">Data de Entrada *</label>
            <Input
              type="date"
              name="dataEntrada"
              required
              className="mt-1"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {/* Dados do Estudante */}
      <div>
        <h3 className="font-semibold mb-3">Dados do Estudante</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="text-sm font-medium">Nome do Aluno *</label>
            <Input
              name="nomeEstudante"
              placeholder="Digite o nome do aluno"
              required
              className="mt-1"
              onChange={(e) => setStudentSearch(e.target.value)}
              onFocus={() => setShowStudentDropdown(true)}
              autoComplete="off"
            />
            {showStudentDropdown && studentSearch.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                {(studentSearchResults as any[]).length > 0 ? (
                  (studentSearchResults as any[]).map((s: any) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                      onMouseDown={() => {
                        // Prefill nome
                        const nomeInput = document.querySelector('input[name="nomeEstudante"]') as HTMLInputElement;
                        if (nomeInput) nomeInput.value = s.studentName || s.name || '';
                        // Prefill escola
                        const escolaSelect = document.querySelector('select[name="escola"]') as HTMLSelectElement;
                        if (escolaSelect && s.schoolName) escolaSelect.value = s.schoolName;
                        // Prefill regional
                        const regionalInput = document.querySelector('input[name="regional"]') as HTMLInputElement;
                        if (regionalInput && s.regional) regionalInput.value = s.regional;
                        // Prefill segmento
                        const segmentoSelect = document.querySelector('select[name="segmento"]') as HTMLSelectElement;
                        if (segmentoSelect && s.grade) {
                          const seg = s.grade.includes('Creche') ? 'Creche'
                            : s.grade.includes('Pré') ? 'Pré-escolar'
                            : s.grade.match(/^[1-9]°/) ? 'Fundamental'
                            : s.grade.match(/^[1-3]° Médio/) ? 'Médio' : '';
                          if (seg) segmentoSelect.value = seg;
                        }
                        setShowStudentDropdown(false);
                        setStudentSearch('');
                      }}
                    >
                      <div className="font-medium">{s.studentName || s.name}</div>
                      <div className="text-xs text-gray-500">{s.schoolName || s.grade || 'Escola não informada'}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">Nenhum aluno encontrado</div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Idade</label>
            <Input type="number" name="idade" placeholder="Idade" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Segmento</label>
            <select name="segmento" className="w-full p-2 border rounded mt-1">
              <option value="">Selecione</option>
              {segmentoOptions.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Escola e Território */}
      <div>
        <h3 className="font-semibold mb-3">Escola e Território</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Escola *</label>
            <select name="escola" required className="w-full p-2 border rounded mt-1">
              <option value="">Selecione uma escola</option>
              {(schoolsList)?.map?.((s: any) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="text-sm font-medium">Classificação *</label>
            <select name="classificacao" required className="w-full p-2 border rounded mt-1">
              <option value="">Selecione</option>
              {classificacaoOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status e Situação */}
      <div>
        <h3 className="font-semibold mb-3">Status e Situação</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Status *</label>
            <select name="status" required className="w-full p-2 border rounded mt-1">
              <option value="">Selecione</option>
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Situação *</label>
            <select name="situacao" required className="w-full p-2 border rounded mt-1">
              <option value="">Selecione</option>
              {situacaoOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div>
        <h3 className="font-semibold mb-3">Observações</h3>
        <div>
          <label className="text-sm font-medium">Observação Geral</label>
          <textarea name="observacaoGeral" placeholder="Observações sobre o caso" className="w-full p-2 border rounded mt-1 min-h-20" />
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">Encaminhamentos</label>
          <textarea name="encaminhamentos" placeholder="Encaminhamentos e ações" className="w-full p-2 border rounded mt-1 min-h-20" />
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCloseForm}
        >
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {editingCaseId ? "Atualizar" : "Criar"} Caso
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Acompanhamento de Casos</h1>
          <p className="text-gray-600 mt-1">Gestão de casos e acompanhamento de alunos</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Novo Caso
        </Button>
      </div>

      {/* Métricas */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{metrics.total}</div>
                <div className="text-sm text-gray-600">Total de Casos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{metrics.ativo}</div>
                <div className="text-sm text-gray-600">Casos Ativos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{metrics.urgentes}</div>
                <div className="text-sm text-gray-600">Urgentes</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{metrics.resolvidos}</div>
                <div className="text-sm text-gray-600">Resolvidos</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              Filtros
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Input
                  placeholder="Buscar por protocolo ou aluno"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Input
                  placeholder="Protocolo"
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value)}
                />
                <Select value={regional} onValueChange={setRegional}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as regionais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as regionais</SelectItem>
                    {Array.from(new Set(cases?.map((c: any) => c.regional).filter(Boolean))).map((r: any) => (
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
                    {(schoolsList)?.map?.((s: any) => (
                      <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                    {advisors.map((adv: any) => (
                      <SelectItem key={adv.id} value={adv.id.toString()}>{adv.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                <Select value={ordenacao} onValueChange={setOrdenacao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt">Atualizado em</SelectItem>
                    <SelectItem value="createdAt">Criado em</SelectItem>
                    <SelectItem value="nomeEstudante">Nome</SelectItem>
                    <SelectItem value="numeroCaso">Nº do caso</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ordem} onValueChange={(v) => setOrdem(v as "asc" | "desc")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Crescente</SelectItem>
                    <SelectItem value="desc">Decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <Button variant="outline" onClick={limparFiltros} className="w-full md:w-auto">
                  Limpar Filtros
                </Button>
              </div>
            </>
          </CardContent>
        )}
      </Card>

      {/* Exportação */}
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
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

      {/* Formulário - Desktop (inline) */}
      {showForm && !isMobile && (
        <div ref={formRef} className="scroll-mt-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>{editingCaseId ? "Editar Caso" : "Novo Caso"}</CardTitle>
                <CardDescription>{editingCaseId ? "Atualize os dados do caso." : "Preencha os dados do novo caso."}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseForm}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <FormContent />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulário - Mobile (drawer) */}
      {showForm && isMobile && (
        <Drawer open={showForm} onOpenChange={(open) => {
          if (!open) handleCloseForm();
        }}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{editingCaseId ? "Editar Caso" : "Novo Caso"}</DrawerTitle>
              <DrawerClose />
            </DrawerHeader>
            <div className="px-4 pb-6 overflow-y-auto max-h-[70vh]">
              <FormContent />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Tabela de Casos */}
      <Card>
        <CardHeader>
          <CardTitle>Casos Cadastrados ({filteredCases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : filteredCases.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {cases && cases.length === 0 
                ? "Nenhum caso cadastrado" 
                : "Nenhum caso encontrado com os filtros selecionados"}
            </p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
