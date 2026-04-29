import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Edit2, Trash2, Plus, Loader2, Circle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ChangeHistory } from '@/components/ChangeHistory';
import { CaseEvolution } from '@/components/CaseEvolution';

interface CaseData {
  id: number;
  numeroCaso: string;
  nomeEstudante: string;
  dataEntrada: Date;
  diagnostico: string | null;
  responsavel: string | null;
  telefone: string | null;
  escola: string | null;
  schoolId: number | null;
  regional: string | null;
  segmento: string | null;
  tipoDemanda: string | null;
  origem: string | null;
  analiseConjunta: string | null;
  setorCraei: string | null;
  profissionalResponsavelId: number | null;
  coordenadorResponsavelId: number | null;
  situacao: string | null;
  status: string | null;
  classificacaoCaso: string | null;
  alerta: boolean | null;
  observacaoGeral: string | null;
  driveFolderUrl: string | null;
  active: boolean | null;
  createdBy: number;
  createdByName: string;
  updatedBy: number | null;
  updatedByName: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  isDeleted: boolean | null;
  deletedAt: Date | null;
  deletedBy: number | null;
  deletionReason: string | null;
  history?: HistoryItem[];
}

interface HistoryItem {
  id: number;
  caseId: number;
  numeroCaso: string;
  actionType: string;
  description?: string | null;
  forwarding?: string | null;
  internalNote?: string | null;
  createdBy: number;
  createdByName: string;
  createdByRole: string | null;
  createdAt: Date;
}

interface AuditItem {
  id: number;
  caseId?: number | null;
  numeroCaso: string | null;
  actionType: string;
  userId: number;
  userName: string;
  userRole: string;
  targetField?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: Date;
}

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const [, navigate] = useLocation();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [movementForm, setMovementForm] = useState({
    actionType: '',
    description: '',
    forwarding: '',
    internalNote: '',
  });

  const caseIdNum = caseId ? parseInt(caseId, 10) : 0;

  // Fetch case details
  const { data: caseDetail, isLoading: caseLoading } = trpc.farol.getCase.useQuery(
    { id: caseIdNum },
    { enabled: caseIdNum > 0 }
  );

  // Fetch audit trail
  const { data: auditData, isLoading: auditLoading } = trpc.farol.getAuditTrail.useQuery(
    { caseId: caseIdNum, limit: 100 },
    { enabled: caseIdNum > 0 }
  );

  // Add history mutation
  const addHistoryMutation = trpc.farol.addHistory.useMutation({
    onSuccess: () => {
      toast.success('Movimentação registrada com sucesso');
      setIsMovementDialogOpen(false);
      setMovementForm({ actionType: '', description: '', forwarding: '', internalNote: '' });
      // Refetch case to get updated history
      if (caseDetail) {
        setCaseData(caseDetail);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao registrar movimentação');
    },
  });

  // Update local state when data loads
  useEffect(() => {
    if (caseDetail) {
      setCaseData(caseDetail);

      // Extract history from case detail
      if (caseDetail.history && Array.isArray(caseDetail.history)) {
        setHistory(caseDetail.history);
      }
    }
  }, [caseDetail]);

  // Update audit data when loaded
  useEffect(() => {
    if (auditData && Array.isArray(auditData)) {
      setAudit(auditData);
    }
  }, [auditData]);

  // Set loading state
  useEffect(() => {
    if (!caseLoading && !auditLoading) {
      setLoading(false);
    }
  }, [caseLoading, auditLoading]);

  const exportMutation = trpc.farol.exportCaseToWord.useQuery;

  const handleExportToWord = async () => {
    try {
      const result = await trpc.farol.exportCaseToWord.useQuery({ caseId: caseIdNum });
      
      if (!result.data) {
        toast.error('Erro ao exportar caso');
        return;
      }

      // Decode base64 buffer
      const binaryString = atob(result.data.buffer);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and download
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Caso exportado: ${result.data.filename}`);
    } catch (error) {
      console.error('Error exporting case:', error);
      toast.error('Erro ao exportar caso');
    }
  };

  const handleAddMovement = () => {
    if (!movementForm.actionType.trim()) {
      toast.error('Tipo de ação é obrigatório');
      return;
    }

    addHistoryMutation.mutate({
      caseId: caseIdNum,
      actionType: movementForm.actionType,
      description: movementForm.description,
      forwarding: movementForm.forwarding,
      internalNote: movementForm.internalNote,
    });
  };

  const getSituacaoBadgeColor = (situacao?: string | null) => {
    switch (situacao?.toLowerCase()) {
      case 'arquivado':
        return 'bg-gray-200 text-gray-800';
      case 'resolvido':
        return 'bg-green-100 text-green-800';
      case 'em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'ativo':
        return 'bg-blue-100 text-blue-900';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'resolvido':
        return 'bg-green-100 text-green-800';
      case 'urgente':
        return 'bg-red-100 text-red-800';
      case 'novo':
        return 'bg-blue-100 text-blue-800';
      case 'em análise':
        return 'bg-yellow-100 text-yellow-800';
      case 'em acompanhamento':
        return 'bg-purple-100 text-purple-800';
      case 'aguardando retorno':
        return 'bg-orange-100 text-orange-800';
      case 'encaminhado':
        return 'bg-indigo-100 text-indigo-800';
      case 'encerrado':
        return 'bg-gray-400 text-gray-900';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getClassificacaoBadgeColor = (classificacao?: string | null) => {
    switch (classificacao?.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'crítica':
        return 'bg-red-200 text-red-900';
      case 'média':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixa':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {caseData?.nomeEstudante || 'Caso sem nome'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Protocolo: <span className="font-semibold text-gray-800">{caseData?.numeroCaso}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/farol')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportToWord}
          >
            <Download className="h-4 w-4" />
            Exportar Caso
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Caso
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Caso Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-lg">Informações do Caso</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Nº do Caso */}
                <div className="flex justify-between items-start border-b pb-4">
                  <span className="text-sm font-medium text-gray-600">Nº do Caso</span>
                  <Badge className="bg-blue-600 text-white">{caseData?.numeroCaso}</Badge>
                </div>

                {/* Nome */}
                <div className="flex justify-between items-start border-b pb-4">
                  <span className="text-sm font-medium text-gray-600">Nome</span>
                  <span className="text-sm text-gray-900">{caseData?.nomeEstudante}</span>
                </div>

                {/* Idade e Segmento */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-600">Tipo de Demanda</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-900">{caseData?.tipoDemanda || '—'}</span>
                  </div>
                </div>

                {/* Escola e Regional */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Escola</p>
                    <p className="text-sm text-gray-900 mt-1">{caseData?.escola || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Regional</p>
                    <p className="text-sm text-gray-900 mt-1">{caseData?.regional || '—'}</p>
                  </div>
                </div>

                {/* Segmento e Origem */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Segmento</p>
                    <p className="text-sm text-gray-900 mt-1">{caseData?.segmento || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Origem</p>
                    <p className="text-sm text-gray-900 mt-1">{caseData?.origem || '—'}</p>
                  </div>
                </div>

                {/* Situação, Status, Classificação */}
                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Situação</p>
                    <Badge className={`${getSituacaoBadgeColor(caseData?.situacao)}`}>
                      {caseData?.situacao || '—'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Status</p>
                    <Badge className={`${getStatusBadgeColor(caseData?.status)}`}>
                      {caseData?.status || '—'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Classificação</p>
                    <Badge className={`${getClassificacaoBadgeColor(caseData?.classificacaoCaso)}`}>
                      {caseData?.classificacaoCaso || '—'}
                    </Badge>
                  </div>
                </div>

                {/* Responsável */}
                <div className="flex justify-between items-start border-b pb-4">
                  <span className="text-sm font-medium text-gray-600">Responsável</span>
                  <span className="text-sm text-gray-900">{caseData?.responsavel || '—'}</span>
                </div>

                {/* Criado por e Criado em */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Criado por</p>
                    <p className="text-sm text-gray-900 mt-1">{caseData?.createdByName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Criado em</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {caseData?.createdAt
                        ? new Date(caseData.createdAt).toLocaleString('pt-BR')
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Atualizado em */}
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">Atualizado em</span>
                  <span className="text-sm text-gray-900">
                    {caseData?.updatedAt
                      ? new Date(caseData.updatedAt).toLocaleString('pt-BR')
                      : '—'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observação Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-lg">Observação</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed text-sm">
                {caseData?.observacaoGeral || 'Nenhuma observação registrada para este caso.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Histórico Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-gray-50 flex items-center justify-between">
              <CardTitle className="text-lg">Histórico</CardTitle>
              <Button
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsMovementDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {history.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <Circle className="h-3 w-3 fill-blue-600 text-blue-600 mt-1" />
                        <div className="w-0.5 h-12 bg-gray-200 mt-1"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-sm text-gray-900">{item.actionType}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{item.createdByName}</p>
                        {item.description && (
                          <p className="text-xs text-gray-700 mt-2">{item.description}</p>
                        )}
                        {item.forwarding && (
                          <p className="text-xs text-gray-600 mt-1">
                            <strong>Encaminhamento:</strong> {item.forwarding}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Nenhuma movimentação registrada</p>
              )}
            </CardContent>
          </Card>

          {/* Auditoria Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-gray-50 flex items-center justify-between">
              <CardTitle className="text-lg">Auditoria de Movimentações</CardTitle>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {audit.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {audit.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <Circle className="h-3 w-3 fill-gray-400 text-gray-400 mt-1" />
                        <div className="w-0.5 h-12 bg-gray-200 mt-1"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-sm text-gray-900">{item.actionType}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.userName} • <Badge variant="outline" className="text-xs">{item.numeroCaso}</Badge>
                        </p>
                        {item.targetField && (
                          <p className="text-xs text-gray-600 mt-2">
                            <strong>Campo:</strong> {item.targetField}
                          </p>
                        )}
                        {item.oldValue && (
                          <p className="text-xs text-gray-600">
                            <strong>Antes:</strong> {item.oldValue}
                          </p>
                        )}
                        {item.newValue && (
                          <p className="text-xs text-gray-600">
                            <strong>Depois:</strong> {item.newValue}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Nenhum registro de auditoria encontrado</p>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Alterações Card */}
          <ChangeHistory
            changes={audit.map(a => ({
              ...a,
              caseId: a.caseId || caseIdNum,
            }))}
            isLoading={auditLoading}
          />

          {/* Evolução do Caso Card */}
          <CaseEvolution caseId={caseIdNum} isLoading={loading} />
        </div>
      </div>

      {/* Movement Registration Dialog */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Movimentação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de Ação *</label>
              <Select
                value={movementForm.actionType}
                onValueChange={(value) =>
                  setMovementForm({ ...movementForm, actionType: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Análise Inicial">Análise Inicial</SelectItem>
                  <SelectItem value="Encaminhamento">Encaminhamento</SelectItem>
                  <SelectItem value="Acompanhamento">Acompanhamento</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                  <SelectItem value="Resolução">Resolução</SelectItem>
                  <SelectItem value="Reatribuição">Reatribuição</SelectItem>
                  <SelectItem value="Outra">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Descrição</label>
              <Textarea
                placeholder="Descreva a movimentação..."
                value={movementForm.description}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, description: e.target.value })
                }
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Encaminhamento</label>
              <Input
                placeholder="Para onde foi encaminhado?"
                value={movementForm.forwarding}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, forwarding: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Nota Interna</label>
              <Textarea
                placeholder="Notas internas (não visível ao público)..."
                value={movementForm.internalNote}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, internalNote: e.target.value })
                }
                className="mt-1"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMovementDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddMovement}
              disabled={addHistoryMutation.isPending}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {addHistoryMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
