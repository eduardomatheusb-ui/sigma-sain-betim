import { trpc } from "@/lib/trpc";
import { exportCaseToWord, exportCasesToExcel } from "@/lib/farol-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Eye, Trash2, FileText, Edit, FileDown, ChevronDown, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function FarolGestao() {
  const user = trpc.auth.me.useQuery().data;
  const [, navigate] = useLocation();
  
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
  const { data: schools = [] } = trpc.schools.list.useQuery();
  const { data: students = [] } = trpc.students.list.useQuery();

  // Scroll automático ao abrir formulário
  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showForm]);

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
        const schoolSelect = form.querySelector('select[name="escola"]') as HTMLSelectElement;
        if (schoolSelect) schoolSelect.value = selectedCase.escola || '';
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
      toast.error(`Erro ao criar caso: ${error.message}`);
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
      toast.error(`Erro ao atualizar caso: ${error.message}`);
    },
  });

  const deleteMutation = trpc.farol.deleteCase.useMutation({
    onSuccess: () => {
      toast.success("Caso excluído com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir caso: ${error.message}`);
    },
  });

  // Constantes
  const segmentoOptions = ["Educação Infantil", "Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio"];
  const tipoDemandaOptions = ["Evasão escolar", "Dificuldade de aprendizagem", "Comportamento", "Saúde mental", "Vulnerabilidade social", "Outro"];
  const origemOptions = ["Escola", "Família", "Comunidade", "Encaminhamento externo", "Outro"];
  const classificacaoOptions = ["Baixa", "Média", "Alta", "Urgente"];
  const situacaoOptions = ["Arquivado", "Resolvido", "Em andamento"];
  const statusOptions = ["Aberto", "Em análise", "Encaminhado", "Acompanhando", "Resolvido", "Arquivado"];

  // Handlers
  const handleSubmitCase = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const caseData = {
      nomeEstudante: formData.get("nomeEstudante") as string,
      idade: parseInt(formData.get("idade") as string) || 0,
      escola: formData.get("escola") as string,
      segmento: formData.get("segmento") as string,
      regional: formData.get("regional") as string,
      tipoDemanda: formData.get("tipoDemanda") as string,
      origem: formData.get("origem") as string,
      classificacaoCaso: formData.get("classificacao") as string,
      situacao: formData.get("situacao") as string,
      status: formData.get("status") as string,
      observacaoGeral: formData.get("observacaoGeral") as string,
      analiseConjunta: formData.get("encaminhamentos") as string,
      dataEntrada: formData.get("dataEntrada") as string,
    };

    if (isEdit && editingCaseId) {
      updateMutation.mutate({ id: editingCaseId, ...caseData });
    } else {
      createMutation.mutate(caseData);
    }
  };

  const handleViewCase = (caseId: number) => {
    navigate(`/farol/casos/${caseId}`);
  };

  const handleEditCase = (caseId: number) => {
    setEditingCaseId(caseId);
    setShowForm(true);
  };

  const handleDeleteCase = (caseId: number) => {
    if (confirm("Tem certeza que deseja excluir este caso?")) {
      deleteMutation.mutate({ id: caseId });
    }
  };

  const handleNewCase = () => {
    setEditingCaseId(null);
    setShowForm(true);
  };

  // Filtrar casos
  const filteredCases = useMemo(() => {
    if (!cases) return [];
    
    return cases.filter(c => {
      if (search && !c.nomeEstudante?.toLowerCase().includes(search.toLowerCase()) && 
          !c.numeroCaso?.toLowerCase().includes(search.toLowerCase())) return false;
      if (protocolo && !c.numeroCaso?.includes(protocolo)) return false;
      if (regional !== "todos" && c.regional !== regional) return false;
      if (escola !== "todos" && c.escola !== escola) return false;
      if (situacao !== "todos" && c.situacao !== situacao) return false;
      if (status !== "todos" && c.status !== status) return false;
      if (classificacao !== "todos" && c.classificacaoCaso !== classificacao) return false;
      if (responsavel !== "todos" && c.responsavel !== responsavel) return false;
      return true;
    });
  }, [cases, search, protocolo, regional, escola, situacao, status, classificacao, responsavel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Farol da Gestão</h1>
          <p className="text-gray-600 mt-1">Acompanhamento de casos e evolução dos alunos</p>
        </div>
        <Button onClick={handleNewCase} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Caso
        </Button>
      </div>

      {/* Métricas */}
      {metrics && (
        <div className="grid grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Total de Casos</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.ativo}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.resolvidos}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{metrics.urgentes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm">Aguardando</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.aguardando}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Filtros</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Input
                placeholder="Buscar por nome ou protocolo"
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
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-4">
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
                  {advisors.map(adv => (
                    <SelectItem key={adv.id} value={adv.id.toString()}>{adv.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 gap-4">
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
          </CardContent>
        )}
      </Card>

      {/* Formulário de Novo Caso */}
      {showForm && (
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
                onClick={() => {
                  setShowForm(false);
                  setEditingCaseId(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmitCase(e, !!editingCaseId)} className="space-y-6">
                {/* Dados do Estudante */}
                <div>
                  <h3 className="font-semibold mb-3">Dados do Estudante</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome do Aluno *</label>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Escola *</label>
                      <select name="escola" required className="w-full p-2 border rounded mt-1">
                        <option value="">Selecione uma escola</option>
                        {schools.map(s => (
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
                        {tipoDemandaOptions.map(opt => (
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
                    <div>
                      <label className="text-sm font-medium">Data de Entrada *</label>
                      <Input type="date" name="dataEntrada" required className="mt-1" />
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
                    onClick={() => {
                      setShowForm(false);
                      setEditingCaseId(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingCaseId ? "Atualizar" : "Criar"} Caso
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Casos */}
      <Card>
        <CardHeader>
          <CardTitle>Casos Cadastrados ({filteredCases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando casos...</p>
          ) : filteredCases.length === 0 ? (
            <p className="text-center text-gray-500">
              {cases && cases.length === 0 
                ? "Nenhum caso cadastrado" 
                : "Nenhum caso encontrado com os filtros selecionados"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Protocolo</th>
                    <th className="text-left py-2 px-4">Aluno</th>
                    <th className="text-left py-2 px-4">Escola</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Classificação</th>
                    <th className="text-left py-2 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map(c => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-mono text-xs">{c.numeroCaso}</td>
                      <td className="py-2 px-4">{c.nomeEstudante}</td>
                      <td className="py-2 px-4">{c.escola}</td>
                      <td className="py-2 px-4">
                        <Badge variant="outline">{c.status}</Badge>
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant="outline">{c.classificacaoCaso}</Badge>
                      </td>
                      <td className="py-2 px-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewCase(c.id)}
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCase(c.id)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCase(c.id)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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
    </div>
  );
}
