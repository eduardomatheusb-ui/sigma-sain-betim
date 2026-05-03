
import { useState, useMemo, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Search, Eye, Edit2, Download, FileText } from 'lucide-react';
import { SearchComboBox } from '@/components/SearchComboBox';

const STATUS_LIST = [
  'Recebida', 'Triagem/Protocolo', 'Em instrução técnica', 'Devolvida para complementação',
  'Em validação do gabinete', 'Aguardando resposta', 'Aguardando assinatura', 'Aguardando retorno',
  'Aguardando complementação', 'Assinada', 'Encaminhada à SEMED', 'Encaminhada ao órgão demandante',
  'Concluída, mas não arquivada', 'Arquivada'
] as const;

type DemandStatus = typeof STATUS_LIST[number];

const STATUS_CONFIG: Record<DemandStatus, { label: string; color: string }> = {
  'Recebida': { label: 'Recebida', color: 'bg-blue-100 text-blue-800' },
  'Triagem/Protocolo': { label: 'Triagem/Protocolo', color: 'bg-indigo-100 text-indigo-800' },
  'Em instrução técnica': { label: 'Em instrução técnica', color: 'bg-yellow-100 text-yellow-800' },
  'Devolvida para complementação': { label: 'Devolvida para complementação', color: 'bg-orange-100 text-orange-800' },
  'Em validação do gabinete': { label: 'Em validação do gabinete', color: 'bg-purple-100 text-purple-800' },
  'Aguardando resposta': { label: 'Aguardando resposta', color: 'bg-pink-100 text-pink-800' },
  'Aguardando assinatura': { label: 'Aguardando assinatura', color: 'bg-pink-100 text-pink-800' },
  'Aguardando retorno': { label: 'Aguardando retorno', color: 'bg-pink-100 text-pink-800' },
  'Aguardando complementação': { label: 'Aguardando complementação', color: 'bg-pink-100 text-pink-800' },
  'Assinada': { label: 'Assinada', color: 'bg-teal-100 text-teal-800' },
  'Encaminhada à SEMED': { label: 'Encaminhada à SEMED', color: 'bg-green-100 text-green-800' },
  'Encaminhada ao órgão demandante': { label: 'Encaminhada ao órgão demandante', color: 'bg-green-100 text-green-800' },
  'Concluída, mas não arquivada': { label: 'Concluída, mas não arquivada', color: 'bg-green-100 text-green-800' },
  'Arquivada': { label: 'Arquivada', color: 'bg-gray-100 text-gray-600' },
};

const PRIORIDADE_CONFIG = {
  baixa: { label: 'Baixa', color: 'bg-slate-100 text-slate-700' },
  media: { label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
  alta: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
};

const TIPO_DOC_LABELS: Record<string, string> = {
  oficio: 'Ofício',
  notificacao: 'Notificação',
  recomendacao: 'Recomendação',
  requisicao: 'Requisição',
  encaminhamento: 'Encaminhamento',
  solicitacao: 'Solicitação',
  denuncia: 'Denúncia',
  outros: 'Outros',
};

// Filtros por aba
const EM_ANDAMENTO_STATUSES: DemandStatus[] = [
  'Recebida', 'Triagem/Protocolo', 'Em instrução técnica', 'Devolvida para complementação', 'Em validação do gabinete'
];

const AGUARDANDO_RESPOSTA_STATUSES: DemandStatus[] = [
  'Aguardando resposta', 'Aguardando assinatura', 'Aguardando retorno', 'Aguardando complementação'
];

const ENCAMINHADAS_STATUSES: DemandStatus[] = [
  'Assinada', 'Encaminhada à SEMED', 'Encaminhada ao órgão demandante', 'Concluída, mas não arquivada'
];

// Helper: calcular dias até vencimento
function getDaysUntilDeadline(prazoResposta: Date | null): number | null {
  if (!prazoResposta) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(prazoResposta);
  deadline.setHours(0, 0, 0, 0);
  const diffMs = deadline.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// Helper: determinar classe de alerta de prazo
function getDeadlineAlertClass(prazoResposta: Date | null): string {
  const days = getDaysUntilDeadline(prazoResposta);
  if (days === null) return '';
  if (days < 0) return 'border-red-500 border-2'; // Vencido
  if (days <= 3) return 'border-yellow-500 border-2'; // Próximo
  return '';
}

// Helper: determinar badge de alerta
function getDeadlineAlertBadge(prazoResposta: Date | null): { label: string; color: string } | null {
  const days = getDaysUntilDeadline(prazoResposta);
  if (days === null) return null;
  if (days < 0) return { label: 'VENCIDO', color: 'bg-red-100 text-red-800' };
  if (days <= 3) return { label: 'PRÓXIMO', color: 'bg-yellow-100 text-yellow-800' };
  return null;
}

export default function ExternalDemands() {
  const { user } = useAuth();
  const [tab, setTab] = useState('nova');
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    dataRecebimento: '',
    origem: '',
    orgaoSetor: '',
    tipoDocumento: 'oficio',
    prioridade: 'media',
    prazoResposta: '',
    responsavelNome: '',
    responsavelId: '',
    schoolId: '',
    studentId: '',
    studentName: '',
    resumo: '',
    descricaoCompleta: '',
    documentosLinks: '',
    status: 'Recebida',
    observacoes: '',
  });

  const { data: demands = [], isLoading, refetch } = trpc.externalDemands.list.useQuery();
  const { data: schools = [] } = trpc.schools.list.useQuery();
  const { data: advisors = [] } = trpc.farol.listAdvisors.useQuery({ ativo: true });
  const createMutation = trpc.externalDemands.create.useMutation();
  
  // State for selected school and student
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentCountForSchool, setStudentCountForSchool] = useState<number>(0);

  // Query to count students for the selected school
  const { data: studentCountData } = trpc.farol.countStudentsBySchool.useQuery(
    { schoolId: formData.schoolId ? parseInt(formData.schoolId) : 0 },
    { enabled: !!formData.schoolId }
  );

  // Update student count when data changes
  useEffect(() => {
    if (studentCountData?.count !== undefined) {
      setStudentCountForSchool(studentCountData.count);
    }
  }, [studentCountData]);

  // Reset student selection when school changes
  useEffect(() => {
    if (selectedSchool?.id !== (formData.schoolId ? parseInt(formData.schoolId) : null)) {
      setSelectedStudent(null);
    }
  }, [formData.schoolId, selectedSchool?.id]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (demands as any[]).filter((d: any) => {
      const matchSearch =
        !q ||
        (d.origem || '').toLowerCase().includes(q) ||
        (d.orgaoSetor || '').toLowerCase().includes(q) ||
        (d.protocolo || '').toLowerCase().includes(q) ||
        (d.resumo || '').toLowerCase().includes(q);
      if (!matchSearch) return false;

      if (tab === 'todas') return d.status !== 'Arquivada';
      if (tab === 'andamento') return EM_ANDAMENTO_STATUSES.includes(d.status);
      if (tab === 'aguardando') return AGUARDANDO_RESPOSTA_STATUSES.includes(d.status);
      if (tab === 'encaminhadas') return ENCAMINHADAS_STATUSES.includes(d.status);
      return true;
    });
  }, [demands, tab, search]);

  const counts = useMemo(
    () => ({
      todas: (demands as any[]).filter((d: any) => d.status !== 'Arquivada').length,
      andamento: (demands as any[]).filter((d: any) => EM_ANDAMENTO_STATUSES.includes(d.status)).length,
      aguardando: (demands as any[]).filter((d: any) => AGUARDANDO_RESPOSTA_STATUSES.includes(d.status)).length,
      encaminhadas: (demands as any[]).filter((d: any) => ENCAMINHADAS_STATUSES.includes(d.status)).length,
    }),
    [demands]
  );

  const handleCreateDemand = async () => {
    if (!formData.origem.trim() || !formData.resumo.trim() || !formData.dataRecebimento) {
      toast.error('Preencha os campos obrigatórios: Órgão demandante, Resumo e Data de recebimento');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        origem: formData.origem,
        orgaoSetor: formData.orgaoSetor,
        tipoDocumento: formData.tipoDocumento as any,
        dataRecebimento: formData.dataRecebimento,
        prazoResposta: formData.prazoResposta || undefined,
        prioridade: formData.prioridade as any,
        responsavelNome: formData.responsavelNome || undefined,
        responsavelId: formData.responsavelId ? parseInt(formData.responsavelId) : undefined,
        schoolId: formData.schoolId ? parseInt(formData.schoolId) : undefined,
        studentId: formData.studentId ? parseInt(formData.studentId) : undefined,
        studentName: formData.studentName,
        resumo: formData.resumo,
        descricaoCompleta: formData.descricaoCompleta,
        documentosLinks: formData.documentosLinks,
      });

      toast.success(`Demanda criada com sucesso. Protocolo: ${result.protocolo}`);
      setFormData({
        dataRecebimento: '',
        origem: '',
        orgaoSetor: '',
        tipoDocumento: 'oficio',
        prioridade: 'media',
        prazoResposta: '',
        responsavelNome: '',
        responsavelId: '',
        schoolId: '',
        studentId: '',
        studentName: '',
        resumo: '',
        descricaoCompleta: '',
        documentosLinks: '',
        status: 'Recebida',
        observacoes: '',
      });
      setSelectedSchool(null);
      setSelectedStudent(null);
      setTab('todas');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar demanda');
    }
  };

  const selectedDemand = demands.find((d: any) => d.id === showDetail);

  // Export to CSV
  const handleExportCSV = () => {
    let dataToExport = filtered as any[];
    
    // Apply additional filters for export
    if (filterOrigin) {
      dataToExport = dataToExport.filter((d) => d.origem?.toLowerCase().includes(filterOrigin.toLowerCase()));
    }
    if (filterPriority !== 'all') {
      dataToExport = dataToExport.filter((d) => d.prioridade === filterPriority);
    }
    if (filterStatus !== 'all') {
      dataToExport = dataToExport.filter((d) => d.status === filterStatus);
    }
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      dataToExport = dataToExport.filter((d) => new Date(d.dataRecebimento) >= fromDate);
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      dataToExport = dataToExport.filter((d) => new Date(d.dataRecebimento) <= toDate);
    }

    const headers = ['Protocolo', 'Órgão', 'Setor', 'Tipo', 'Prioridade', 'Prazo', 'Responsável', 'Escola', 'Aluno', 'Resumo', 'Status', 'Data Criação'];
    const rows = dataToExport.map((d: any) => [
      d.protocolo,
      d.origem,
      d.orgaoSetor,
      TIPO_DOC_LABELS[d.tipoDocumento] || d.tipoDocumento,
      PRIORIDADE_CONFIG[d.prioridade as keyof typeof PRIORIDADE_CONFIG]?.label || d.prioridade,
      d.prazoResposta ? new Date(d.prazoResposta).toLocaleDateString('pt-BR') : '-',
      d.responsavelNome || '-',
      d.schoolId ? schools.find((s: any) => s.id === d.schoolId)?.name || '-' : '-',
      d.studentName || '-',
      d.resumo,
      d.status,
      new Date(d.dataRecebimento).toLocaleDateString('pt-BR'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r: any[]) => r.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `demandas-externas-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  // Search functions for SearchComboBox
  const handleSchoolSearch = async (query: string) => {
    if (query.length < 2) return [];
    try {
      const response = await fetch('/api/trpc/farol.searchSchools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: { query, limit: 10 },
        }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.result?.data?.schools || [];
    } catch (error) {
      console.error('School search error:', error);
      return [];
    }
  };

  const handleStudentSearch = async (query: string) => {
    if (!formData.schoolId) return [];
    if (query.length < 2) return [];
    try {
      const response = await fetch('/api/trpc/farol.searchStudents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: { query, schoolId: parseInt(formData.schoolId) },
        }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.result?.data?.students || [];
    } catch (error) {
      console.error('Student search error:', error);
      return [];
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Demandas Externas</h1>
          <p className="text-gray-600 mt-1">Gestão de demandas e solicitações externas</p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle>Nova Demanda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Data de Recebimento *</Label>
              <Input
                type="date"
                value={formData.dataRecebimento}
                onChange={(e) => setFormData({ ...formData, dataRecebimento: e.target.value })}
                className="mt-1"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label>Órgão Demandante *</Label>
              <Input
                placeholder="Ex: Secretaria de Educação"
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Setor/Departamento</Label>
              <Input
                placeholder="Ex: Departamento de Políticas Educacionais"
                value={formData.orgaoSetor}
                onChange={(e) => setFormData({ ...formData, orgaoSetor: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Documento</Label>
              <select
                value={formData.tipoDocumento}
                onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                className="w-full p-2 border rounded mt-1"
              >
                {Object.entries(TIPO_DOC_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <select
                value={formData.prioridade}
                onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <Label>Prazo de Resposta</Label>
              <Input
                type="date"
                value={formData.prazoResposta}
                onChange={(e) => setFormData({ ...formData, prazoResposta: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Assessor Responsável</Label>
              <Select
                value={formData.responsavelId}
                onValueChange={(value) => {
                  const advisor = advisors.find((a: any) => a.id === parseInt(value));
                  setFormData({
                    ...formData,
                    responsavelId: value,
                    responsavelNome: advisor?.nome || '',
                  });
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um assessor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem assessor definido</SelectItem>
                  {(advisors as any[]).map((a: any) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.nome} {a.cargo ? `(${a.cargo})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.responsavelNome && (
                <p className="text-xs text-green-600 mt-1">✓ Assessor: {formData.responsavelNome}</p>
              )}
            </div>
            <div>
              <Label>Escola Relacionada</Label>
              <SearchComboBox
                placeholder="Buscar escola por nome..."
                onSearch={handleSchoolSearch}
                onSelect={(school: any) => {
                  setSelectedSchool(school);
                  setSelectedStudent(null);
                  setFormData({ ...formData, schoolId: String(school.id), studentId: '', studentName: '' });
                }}
                value={selectedSchool}
                onClear={() => {
                  setSelectedSchool(null);
                  setSelectedStudent(null);
                  setFormData({ ...formData, schoolId: '', studentId: '', studentName: '' });
                }}
              />
            </div>
          </div>

          <div>
            <Label>Aluno Relacionado</Label>
            {!formData.schoolId && (
              <p className="text-xs text-amber-600 mb-1">Selecione primeiro a escola para buscar os alunos.</p>
            )}
            {formData.schoolId && studentCountForSchool === 0 && (
              <p className="text-xs text-amber-600 mb-1">Nenhum aluno cadastrado para esta escola.</p>
            )}
            <SearchComboBox
              placeholder={formData.schoolId ? "Buscar aluno por nome..." : "Selecione uma escola primeiro"}
              onSearch={handleStudentSearch}
              onSelect={(student: any) => {
                setSelectedStudent(student);
                setFormData({ ...formData, studentId: String(student.id), studentName: student.name });
              }}
              value={selectedStudent}
              onClear={() => {
                setSelectedStudent(null);
                setFormData({ ...formData, studentId: '', studentName: '' });
              }}
              disabled={!formData.schoolId}
            />
            {selectedStudent && (
              <p className="text-xs text-green-600 mt-1">✓ Aluno vinculado</p>
            )}
          </div>

          <div>
            <Label>Resumo *</Label>
            <Textarea
              placeholder="Resumo da demanda"
              value={formData.resumo}
              onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
              className="mt-1 min-h-24"
            />
          </div>

          <div>
            <Label>Descrição Completa</Label>
            <Textarea
              placeholder="Descrição detalhada da demanda"
              value={formData.descricaoCompleta}
              onChange={(e) => setFormData({ ...formData, descricaoCompleta: e.target.value })}
              className="mt-1 min-h-32"
            />
          </div>

          <div>
            <Label>Links de Documentos</Label>
            <Textarea
              placeholder="Cole aqui os links dos documentos relacionados (um por linha)"
              value={formData.documentosLinks}
              onChange={(e) => setFormData({ ...formData, documentosLinks: e.target.value })}
              className="mt-1 min-h-20"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => {
              setFormData({
                dataRecebimento: '',
                origem: '',
                orgaoSetor: '',
                tipoDocumento: 'oficio',
                prioridade: 'media',
                prazoResposta: '',
                responsavelNome: '',
                responsavelId: '',
                schoolId: '',
                studentId: '',
                studentName: '',
                resumo: '',
                descricaoCompleta: '',
                documentosLinks: '',
                status: 'Recebida',
                observacoes: '',
              });
              setSelectedSchool(null);
              setSelectedStudent(null);
            }}>
              Limpar
            </Button>
            <Button onClick={handleCreateDemand} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar Demanda'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs and List */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="todas">Todas ({counts.todas})</TabsTrigger>
                <TabsTrigger value="andamento">Em Andamento ({counts.andamento})</TabsTrigger>
                <TabsTrigger value="aguardando">Aguardando Resposta ({counts.aguardando})</TabsTrigger>
                <TabsTrigger value="encaminhadas">Encaminhadas ({counts.encaminhadas})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center p-8">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-8 text-gray-500">Nenhuma demanda encontrada</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((demand: any) => {
                const alertBadge = getDeadlineAlertBadge(demand.prazoResposta ? new Date(demand.prazoResposta) : null);
                const alertClass = getDeadlineAlertClass(demand.prazoResposta ? new Date(demand.prazoResposta) : null);
                return (
                  <Card key={demand.id} className={`cursor-pointer hover:bg-slate-50 ${alertClass}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{demand.protocolo}</span>
                            <Badge className={PRIORIDADE_CONFIG[demand.prioridade as keyof typeof PRIORIDADE_CONFIG]?.color}>
                              {PRIORIDADE_CONFIG[demand.prioridade as keyof typeof PRIORIDADE_CONFIG]?.label}
                            </Badge>
                            <Badge className={STATUS_CONFIG[demand.status as DemandStatus]?.color}>
                              {STATUS_CONFIG[demand.status as DemandStatus]?.label}
                            </Badge>
                            {alertBadge && (
                              <Badge className={alertBadge.color}>{alertBadge.label}</Badge>
                            )}
                          </div>
                          <p className="font-medium">{demand.resumo}</p>
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <p>Órgão: {demand.origem}</p>
                            {demand.schoolId && (
                              <p>Escola: {schools.find((s: any) => s.id === demand.schoolId)?.name}</p>
                            )}
                            {demand.studentName && <p>Aluno: {demand.studentName}</p>}
                            <p>Recebido em: {new Date(demand.dataRecebimento).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetail(demand.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedDemand && (
        <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDemand.protocolo}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Resumo</h4>
                <p>{selectedDemand.resumo}</p>
              </div>
              <div>
                <h4 className="font-semibold">Descrição</h4>
                <p className="text-sm">{selectedDemand.descricaoCompleta || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Órgão</h4>
                  <p>{selectedDemand.origem}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Prioridade</h4>
                  <Badge className={PRIORIDADE_CONFIG[selectedDemand.prioridade as keyof typeof PRIORIDADE_CONFIG]?.color}>
                    {PRIORIDADE_CONFIG[selectedDemand.prioridade as keyof typeof PRIORIDADE_CONFIG]?.label}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
