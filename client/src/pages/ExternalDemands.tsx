'use client';

import { useState, useMemo } from 'react';
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
import { Plus, Search, Eye, Edit2 } from 'lucide-react';

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

export default function ExternalDemands() {
  const { user } = useAuth();
  const [tab, setTab] = useState('nova');
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [showChangeStatus, setShowChangeStatus] = useState<number | null>(null);

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
                  <Select value={formData.schoolId} onValueChange={(v) => setFormData({ ...formData, schoolId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma escola" />
                    </SelectTrigger>
                    <SelectContent>
                      {(schools as any[]).map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Aluno Relacionado</Label>
                  <Input
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="Nome do aluno"
                  />
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
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por protocolo, órgão, setor ou resumo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-8">Carregando demandas...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhuma demanda encontrada nesta categoria</div>
            ) : (
              <div className="space-y-2">
                {(filtered as any[]).map((demand) => (
                  <Card key={demand.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge>{demand.protocolo}</Badge>
                            <Badge variant="outline">{PRIORIDADE_CONFIG[demand.prioridade as keyof typeof PRIORIDADE_CONFIG]?.label}</Badge>
                            <Badge className={STATUS_CONFIG[demand.status as DemandStatus]?.color}>
                              {STATUS_CONFIG[demand.status as DemandStatus]?.label}
                            </Badge>
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
                ))}
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
