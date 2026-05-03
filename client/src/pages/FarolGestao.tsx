import { trpc } from "@/lib/trpc";
import { REGIONAIS_PADRONIZADAS } from "@shared/standardization";
import { exportCaseToWord, exportCasesToExcel } from "@/lib/farol-export";
import { SearchComboBox } from "@/components/SearchComboBox";
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
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentCountForSchool, setStudentCountForSchool] = useState<number>(0);
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

  // Query to count students for the selected school
  const { data: studentCountData } = trpc.farol.countStudentsBySchool.useQuery(
    { schoolId: selectedSchoolId! },
    { enabled: !!selectedSchoolId }
  );

  // Auto-scroll ao abrir formulário
  useEffect(() => {
    if (showForm && formRef.current && !isMobile) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showForm, isMobile]);

  // Update student count when data changes
  useEffect(() => {
    if (studentCountData?.count !== undefined) {
      setStudentCountForSchool(studentCountData.count);
    }
  }, [studentCountData]);

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
        if (escolaSelect) escolaSelect.value = selectedCase.schoolId?.toString() || '';
        const regionalSelect = form.querySelector('select[name="regional"]') as HTMLSelectElement;
        if (regionalSelect) regionalSelect.value = selectedCase.regional || '';
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
    const escolaId = formData.get("escola") as string;
    const dataEntrada = formData.get("dataEntrada") as string;

    if (!nomeEstudante?.trim()) {
      toast.error("Nome do aluno é obrigatório");
      return;
    }

    if (!escolaId?.trim()) {
      toast.error("Escola é obrigatória");
      return;
    }

    if (!dataEntrada?.trim()) {
      toast.error("Data de entrada é obrigatória");
      return;
    }

    // Validar que schoolId foi salvo (obrigatório)
    if (!selectedSchoolId) {
      toast.error("Erro ao processar escola. Tente novamente.");
      return;
    }

    // Get school name from list
    const schoolName = schoolsList?.find((s: any) => s.id === selectedSchoolId)?.name || "";
    if (!schoolName) {
      toast.error("Escola não encontrada");
      return;
    }

    const caseData = {
      nomeEstudante,
      idade: parseInt(formData.get("idade") as string) || 0,
      escola: schoolName,
      schoolId: selectedSchoolId,
      studentId: selectedStudent?.id || undefined,
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
    setSelectedSchoolId(null);
    setSelectedStudent(null);
    setStudentCountForSchool(0);
  };

  // Handle school change - reset student selection
  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const schoolId = val ? parseInt(val, 10) : null;
    setSelectedSchoolId(schoolId);
    setSelectedStudent(null);
    // Clear student input
    const nomeInput = document.querySelector('input[name="nomeEstudante"]') as HTMLInputElement;
    if (nomeInput) nomeInput.value = '';
  };

  // Search students function for SearchComboBox
  const handleStudentSearch = async (query: string) => {
    if (!selectedSchoolId) {
      return [];
    }
    if (query.length < 2) {
      return [];
    }
    try {
      const response = await fetch('/api/trpc/farol.searchStudents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: { query, schoolId: selectedSchoolId },
        }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.result?.data?.students || [];
    } catch (error) {
      console.error("Student search error:", error);
      return [];
    }
  };

  // Renderizar formulário como JSX direto
  const formContentJSX = (
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
          <div>
            <label className="text-sm font-medium">Nome do Aluno *</label>
            {!selectedSchoolId && (
              <p className="text-xs text-amber-600 mb-1">Selecione primeiro a escola para buscar os alunos.</p>
            )}
            {selectedSchoolId && studentCountForSchool === 0 && (
              <p className="text-xs text-amber-600 mb-1">Nenhum aluno cadastrado para esta escola.</p>
            )}
            <SearchComboBox
              placeholder={selectedSchoolId ? "Digite o nome do aluno" : "Selecione uma escola primeiro"}
              onSearch={handleStudentSearch}
              onSelect={(student) => {
                setSelectedStudent(student);
                const nomeInput = document.querySelector('input[name="nomeEstudante"]') as HTMLInputElement;
                if (nomeInput) nomeInput.value = student.name;
              }}
              onClear={() => {
                setSelectedStudent(null);
              }}
              value={selectedStudent}
              disabled={!selectedSchoolId}
            />
            {selectedStudent && (
              <p className="text-xs text-green-600 mt-1">✓ Aluno vinculado ao caso</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Idade</label>
            <Input name="idade" type="number" placeholder="Idade" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Segmento</label>
            <select name="segmento" className="w-full p-2 border rounded mt-1">
              <option value="">Selecione</option>
              <option value="Creche">Creche</option>
              <option value="Pré-escolar">Pré-escolar</option>
              <option value="Fundamental">Fundamental</option>
              <option value="Médio">Médio</option>
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
            <select name="escola" required className="w-full p-2 border rounded mt-1" onChange={handleSchoolChange}>
              <option value="">Selecione uma escola</option>
              {(schoolsList)?.map?.((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Regional</label>
            <select name="regional" className="w-full p-2 border rounded mt-1">
              <option value="">Selecione a regional</option>
              {REGIONAIS_PADRONIZADAS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
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
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Observação Geral</label>
            <textarea name="observacaoGeral" placeholder="Observações sobre o caso" className="w-full p-2 border rounded mt-1 min-h-24" />
          </div>
          <div>
            <label className="text-sm font-medium">Encaminhamentos</label>
            <textarea name="encaminhamentos" placeholder="Encaminhamentos e ações" className="w-full p-2 border rounded mt-1 min-h-24" />
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={handleCloseForm}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : editingCaseId ? "Atualizar Caso" : "Criar Caso"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Acompanhamento de Casos</h1>
          <p className="text-gray-600 mt-1">Gestão de casos e acompanhamento de alunos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Novo Caso
        </Button>
      </div>

      {/* Métricas */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Casos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Casos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.ativo}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.urgentes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.resolvidos}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <Card ref={formRef} className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Novo Caso</CardTitle>
            <CardDescription>Preencha os dados do novo caso.</CardDescription>
          </CardHeader>
          <CardContent>
            {formContentJSX}
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Filtros</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Buscar</label>
                <Input
                  placeholder="Buscar por protocolo ou aluno"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Protocolo</label>
                <Input
                  placeholder="Protocolo"
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Regional</label>
                <select
                  value={regional}
                  onChange={(e) => setRegional(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="todos">Todas as regionais</option>
                  {REGIONAIS_PADRONIZADAS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Escola</label>
                <select
                  value={escola}
                  onChange={(e) => setEscola(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="todos">Todas as escolas</option>
                  {schoolsList?.map?.((s: any) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Situação</label>
                <select
                  value={situacao}
                  onChange={(e) => setSituacao(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="todos">Todas as situações</option>
                  {situacaoOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="todos">Todos os status</option>
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Classificação</label>
                <select
                  value={classificacao}
                  onChange={(e) => setClassificacao(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="todos">Todas as classificações</option>
                  {classificacaoOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Responsável</label>
                <select
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="todos">Todos os profissionais</option>
                  {advisors.map((a: any) => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Período Inicial</label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Período Final</label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ordenar por</label>
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="updatedAt">Atualizado em</option>
                  <option value="dataEntrada">Data de Entrada</option>
                  <option value="nomeEstudante">Nome do Aluno</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Ordem</label>
                <select
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value as "asc" | "desc")}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
              <Button variant="outline" onClick={() => exportCasesToExcel(filteredCases as any)}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <label className="flex items-center gap-2 ml-auto">
                <input
                  type="checkbox"
                  checked={incluirHistorico}
                  onChange={(e) => setIncluirHistorico(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Incluir histórico consolidado</span>
              </label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Listagem */}
      <Card>
        <CardHeader>
          <CardTitle>{filteredCases.length} caso(s) listado(s)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              Nenhum caso encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Protocolo</th>
                    <th className="text-left p-2">Estudante</th>
                    <th className="text-left p-2">Escola</th>
                    <th className="text-left p-2">Regional</th>
                    <th className="text-left p-2">Situação</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Responsável</th>
                    <th className="text-left p-2">Atualizado em</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{c.numeroCaso}</td>
                      <td className="p-2">{c.nomeEstudante}</td>
                      <td className="p-2">{c.escola}</td>
                      <td className="p-2">{c.regional || "-"}</td>
                      <td className="p-2">
                        <Badge className={getSituacaoBadge(c.situacao)}>
                          {c.situacao}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusBadge(c.status)}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="p-2">{c.responsavel || "Não informado"}</td>
                      <td className="p-2 text-xs text-gray-500">
                        {new Date(c.updatedAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCaseId(c.id)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCaseId(c.id);
                            setShowForm(true);
                          }}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => exportCaseToWord(c)}
                          title="Exportar para Word"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja arquivar este caso?")) {
                              updateMutation.mutate({
                                id: c.id,
                                situacao: "Arquivado",
                              } as any);
                            }
                          }}
                          title="Arquivar"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawer de Detalhes */}
      {selectedCaseId && (
        <Drawer open={!!selectedCaseId} onOpenChange={() => setSelectedCaseId(null)}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Detalhes do Caso</DrawerTitle>
              <DrawerClose />
            </DrawerHeader>
            {selectedCase && (
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <h4 className="font-semibold">Protocolo</h4>
                  <p>{selectedCase.numeroCaso}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Estudante</h4>
                  <p>{selectedCase.nomeEstudante}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Escola</h4>
                  <p>{selectedCase.escola}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Regional</h4>
                  <p>{selectedCase.regional || "-"}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Status</h4>
                  <Badge className={getStatusBadge(selectedCase.status)}>
                    {selectedCase.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Situação</h4>
                  <Badge className={getSituacaoBadge(selectedCase.situacao)}>
                    {selectedCase.situacao}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Observações</h4>
                  <p className="text-sm text-gray-700">{selectedCase.observacaoGeral || "-"}</p>
                </div>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
