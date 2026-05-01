
import { useState, useMemo, useCallback } from 'react';
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
    schoolId: '',
    studentName: '',
    resumo: '',
    descricaoCompleta: '',
    documentosLinks: '',
    status: 'Recebida',
    observacoes: '',
  });

  const { data: demands = [], isLoading, refetch } = trpc.externalDemands.list.useQuery();
  const { data: schools = [] } = trpc.schools.list.useQuery();
  const createMutation = trpc.externalDemands.create.useMutation();
  
  // Search queries with enabled: false - will be called on demand
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  
  const schoolSearchResult = trpc.farol.searchSchools.useQuery(
    { query: schoolSearchQuery, limit: 10 },
    { enabled: schoolSearchQuery.length > 0 }
  );
  
  const studentSearchResult = trpc.demands.searchStudents.useQuery(
    { query: studentSearchQuery, schoolId: formData.schoolId ? parseInt(formData.schoolId) : undefined },
    { enabled: studentSearchQuery.length > 0 && !!formData.schoolId }
  );

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
        responsavelNome: formData.responsavelNome,
        schoolId: formData.schoolId ? parseInt(formData.schoolId) : undefined,
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
        schoolId: '',
        studentName: '',
        resumo: '',
        descricaoCompleta: '',
        documentosLinks: '',
        status: 'Recebida',
        observacoes: '',
      });
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

    if (dataToExport.length === 0) {
      toast.error('Nenhuma demanda para exportar com os filtros aplicados');
      return;
    }

    // Prepare CSV content
    const headers = ['Protocolo', 'Órgão', 'Setor', 'Tipo', 'Prioridade', 'Prazo', 'Responsável', 'Escola', 'Aluno', 'Resumo', 'Status', 'Data Criação'];
    const rows = dataToExport.map((d) => [
      d.protocolo || '',
      d.origem || '',
      d.orgaoSetor || '',
      TIPO_DOC_LABELS[d.tipoDocumento] || d.tipoDocumento || '',
      PRIORIDADE_CONFIG[d.prioridade as keyof typeof PRIORIDADE_CONFIG]?.label || d.prioridade || '',
      d.prazoResposta ? new Date(d.prazoResposta).toLocaleDateString('pt-BR') : '',
      d.responsavelNome || '',
      schools.find((s: any) => s.id === d.schoolId)?.name || '',
      d.studentName || '',
      d.resumo || '',
      d.status || '',
      new Date(d.createdAt).toLocaleDateString('pt-BR'),
    ]);

    // Create CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `demandas-externas-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exportadas ${dataToExport.length} demandas para CSV`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Demandas Externas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Expedientes institucionais recebidos pela Secretaria Adjunta de Inclusão
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="nova">Nova Demanda</TabsTrigger>
          <TabsTrigger value="todas">Todas ({counts.todas})</TabsTrigger>
          <TabsTrigger value="andamento">Em Andamento ({counts.andamento})</TabsTrigger>
          <TabsTrigger value="aguardando">Aguardando ({counts.aguardando})</TabsTrigger>
          <TabsTrigger value="encaminhadas">Encaminhadas ({counts.encaminhadas})</TabsTrigger>
        </TabsList>

        {/* Aba Nova Demanda */}
        <TabsContent value="nova" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Demanda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Recebimento *</Label>
                  <Input
                    type="date"
                    value={formData.dataRecebimento}
                    onChange={(e) => setFormData({ ...formData, dataRecebimento: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Órgão Demandante *</Label>
                  <Input
                    value={formData.origem}
                    onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                    placeholder="Ex: Ministério Público"
                  />
                </div>
                <div>
                  <Label>Setor Demandante</Label>
                  <Input
                    value={formData.orgaoSetor}
                    onChange={(e) => setFormData({ ...formData, orgaoSetor: e.target.value })}
                    placeholder="Ex: Promotoria de Infância"
                  />
                </div>
                <div>
                  <Label>Tipo de Demanda</Label>
                  <Select value={formData.tipoDocumento} onValueChange={(v) => setFormData({ ...formData, tipoDocumento: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPO_DOC_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select value={formData.prioridade} onValueChange={(v) => setFormData({ ...formData, prioridade: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORIDADE_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prazo de Resposta</Label>
                  <Input
                    type="date"
                    value={formData.prazoResposta}
                    onChange={(e) => setFormData({ ...formData, prazoResposta: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Responsável Interno</Label>
                  <Input
                    value={formData.responsavelNome}
                    onChange={(e) => setFormData({ ...formData, responsavelNome: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Escola Relacionada</Label>
                  <SearchComboBox
                    placeholder="Buscar escola por nome..."
                    onSearch={async (query) => {
                      setSchoolSearchQuery(query);
                      // Return empty while loading, will be filled by query
                      return [];
                    }}
                    onSelect={(school: any) => {
                      setFormData({ ...formData, schoolId: String(school.id) });
                      setSchoolSearchQuery('');
                    }}
                    value={formData.schoolId ? { id: parseInt(formData.schoolId), name: schools.find((s: any) => s.id === parseInt(formData.schoolId))?.name || '' } : null}
                    onClear={() => {
                      setFormData({ ...formData, schoolId: '' });
                      setSchoolSearchQuery('');
                    }}
                  />
                  {schoolSearchResult.isLoading && <p className="text-xs text-muted-foreground">Carregando escolas...</p>}
                  {schoolSearchResult.data?.schools && schoolSearchResult.data.schools.length > 0 && (
                    <div className="mt-2 p-2 border rounded bg-slate-50">
                      {schoolSearchResult.data.schools.map((s: any) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setFormData({ ...formData, schoolId: String(s.id) });
                            setSchoolSearchQuery('');
                          }}
                          className="block w-full text-left px-2 py-1 text-sm hover:bg-slate-200 rounded"
                        >
                          {s.name} ({s.code})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Aluno Relacionado</Label>
                  <SearchComboBox
                    placeholder="Buscar aluno por nome..."
                    onSearch={async (query) => {
                      setStudentSearchQuery(query);
                      return [];
                    }}
                    onSelect={(student: any) => {
                      setFormData({ ...formData, studentName: student.name });
                      setStudentSearchQuery('');
                    }}
                    onClear={() => {
                      setFormData({ ...formData, studentName: '' });
                      setStudentSearchQuery('');
                    }}
                  />
                  {studentSearchResult.isLoading && <p className="text-xs text-muted-foreground">Carregando alunos...</p>}
                  {studentSearchResult.data && studentSearchResult.data.length > 0 && (
                    <div className="mt-2 p-2 border rounded bg-slate-50 max-h-48 overflow-y-auto">
                      {studentSearchResult.data.map((s: any) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setFormData({ ...formData, studentName: s.name });
                            setStudentSearchQuery('');
                          }}
                          className="block w-full text-left px-2 py-1 text-sm hover:bg-slate-200 rounded"
                        >
                          {s.name} {s.enrollmentNumber && `(${s.enrollmentNumber})`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Resumo da Demanda *</Label>
                <Input
                  value={formData.resumo}
                  onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                  placeholder="Resumo breve da demanda"
                />
              </div>

              <div>
                <Label>Descrição Detalhada</Label>
                <Textarea
                  value={formData.descricaoCompleta}
                  onChange={(e) => setFormData({ ...formData, descricaoCompleta: e.target.value })}
                  placeholder="Descrição completa da demanda"
                  rows={4}
                />
              </div>

              <div>
                <Label>Links Relacionados</Label>
                <Textarea
                  value={formData.documentosLinks}
                  onChange={(e) => setFormData({ ...formData, documentosLinks: e.target.value })}
                  placeholder="Cole links relacionados (um por linha)"
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                <strong>Nota:</strong> O protocolo SAIN será gerado automaticamente após a criação da demanda.
              </div>

              <Button onClick={handleCreateDemand} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? 'Criando...' : 'Criar Demanda'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Abas de Listagem */}
        {['todas', 'andamento', 'aguardando', 'encaminhadas'].map((tabName) => (
          <TabsContent key={tabName} value={tabName} className="space-y-4 mt-6">
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Buscar por protocolo, órgão, setor ou resumo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[200px]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            {/* Filtros expandidos */}
            <Card className="bg-slate-50 p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <Label className="text-xs">Órgão</Label>
                  <Input
                    placeholder="Filtrar órgão"
                    value={filterOrigin}
                    onChange={(e) => setFilterOrigin(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Prioridade</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(PRIORIDADE_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {STATUS_LIST.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">De</Label>
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Até</Label>
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </Card>

            {isLoading ? (
              <div className="text-center py-8">Carregando demandas...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhuma demanda encontrada nesta categoria</div>
            ) : (
              <div className="space-y-2">
                {(filtered as any[]).map((demand) => {
                  const alertBadge = getDeadlineAlertBadge(demand.prazoResposta ? new Date(demand.prazoResposta) : null);
                  const alertClass = getDeadlineAlertClass(demand.prazoResposta ? new Date(demand.prazoResposta) : null);
                  
                  return (
                    <Card key={demand.id} className={`cursor-pointer hover:shadow-md transition-shadow ${alertClass}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge>{demand.protocolo}</Badge>
                              <Badge variant="outline">{PRIORIDADE_CONFIG[demand.prioridade as keyof typeof PRIORIDADE_CONFIG]?.label}</Badge>
                              <Badge className={STATUS_CONFIG[demand.status as DemandStatus]?.color}>
                                {STATUS_CONFIG[demand.status as DemandStatus]?.label}
                              </Badge>
                              {alertBadge && (
                                <Badge className={alertBadge.color}>{alertBadge.label}</Badge>
                              )}
                            </div>
                            <p className="font-medium mt-2">{demand.resumo}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {demand.origem} {demand.orgaoSetor && `- ${demand.orgaoSetor}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetail(demand.id)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetail !== null} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Demanda</DialogTitle>
          </DialogHeader>
          {selectedDemand && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Protocolo</p>
                  <p className="font-mono">{selectedDemand.protocolo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={STATUS_CONFIG[selectedDemand.status as DemandStatus]?.color}>
                    {STATUS_CONFIG[selectedDemand.status as DemandStatus]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Órgão Demandante</p>
                  <p>{selectedDemand.origem}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prioridade</p>
                  <Badge variant="outline">{PRIORIDADE_CONFIG[selectedDemand.prioridade as keyof typeof PRIORIDADE_CONFIG]?.label}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resumo</p>
                <p>{selectedDemand.resumo}</p>
              </div>
              {selectedDemand.descricaoCompleta && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descrição Completa</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedDemand.descricaoCompleta}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
