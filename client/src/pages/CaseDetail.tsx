import { useParams, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

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
        return 'bg-green-200 text-green-800';
      case 'em andamento':
        return 'bg-blue-200 text-blue-800';
      case 'ativo':
        return 'bg-blue-100 text-blue-900';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'resolvido':
        return 'bg-green-200 text-green-800';
      case 'urgente':
        return 'bg-red-600 text-white';
      case 'novo':
        return 'bg-blue-200 text-blue-800';
      case 'em análise':
        return 'bg-yellow-200 text-yellow-800';
      case 'em acompanhamento':
        return 'bg-purple-200 text-purple-800';
      case 'aguardando retorno':
        return 'bg-orange-200 text-orange-800';
      case 'encaminhado':
        return 'bg-indigo-200 text-indigo-800';
      case 'encerrado':
        return 'bg-gray-400 text-gray-900';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getClassificacaoBadgeColor = (classificacao?: string | null) => {
    switch (classificacao?.toLowerCase()) {
      case 'alta':
        return 'bg-red-200 text-red-800';
      case 'crítica':
        return 'bg-red-600 text-white';
      case 'média':
        return 'bg-yellow-200 text-yellow-800';
      case 'baixa':
        return 'bg-blue-200 text-blue-800';
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
          <h1 className="text-4xl font-bold text-gray-900">
            {caseData?.nomeEstudante || 'Caso sem nome'}
          </h1>
          <p className="mt-2 text-gray-600">
            Protocolo: <span className="font-semibold">{caseData?.numeroCaso}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
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
          >
            <Download className="h-4 w-4" />
            Exportar Caso
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
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
            Excluir
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Caso Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Caso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nº do Caso</p>
                    <Badge className="mt-1">{caseData?.numeroCaso}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nome</p>
                    <p className="mt-1 text-gray-900">{caseData?.nomeEstudante}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipo de Demanda</p>
                    <p className="mt-1 text-gray-900">{caseData?.tipoDemanda || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Segmento</p>
                    <p className="mt-1 text-gray-900">{caseData?.segmento || 'Não informado'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Escola</p>
                    <p className="mt-1 text-gray-900">{caseData?.escola || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Regional</p>
                    <p className="mt-1 text-gray-900">{caseData?.regional || 'Não informado'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Situação</p>
                    <Badge className={`mt-1 ${getSituacaoBadgeColor(caseData?.situacao)}`}>
                      {caseData?.situacao || 'Não informado'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge className={`mt-1 ${getStatusBadgeColor(caseData?.status)}`}>
                      {caseData?.status || 'Não informado'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Classificação</p>
                    <Badge className={`mt-1 ${getClassificacaoBadgeColor(caseData?.classificacaoCaso)}`}>
                      {caseData?.classificacaoCaso || 'Não informado'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipo de Demanda</p>
                    <p className="mt-1 text-gray-900">{caseData?.tipoDemanda || 'Não informado'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Origem</p>
                    <p className="mt-1 text-gray-900">{caseData?.origem || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Responsável</p>
                    <p className="mt-1 text-gray-900">{caseData?.responsavel || 'Não informado'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Criado por</p>
                    <p className="mt-1 text-gray-900">{caseData?.createdByName || 'Sistema'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Criado em</p>
                    <p className="mt-1 text-gray-900">
                      {caseData?.createdAt
                        ? new Date(caseData.createdAt).toLocaleString('pt-BR')
                        : 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Atualizado em</p>
                    <p className="mt-1 text-gray-900">
                      {caseData?.updatedAt
                        ? new Date(caseData.updatedAt).toLocaleString('pt-BR')
                        : 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observação Card */}
          <Card>
            <CardHeader>
              <CardTitle>Observação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {caseData?.observacaoGeral || 'Nenhuma observação registrada para este caso.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Histórico Card */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Histórico</CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setIsMovementDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="border-l-2 border-blue-500 pl-4 pb-4">
                      <p className="font-semibold text-gray-900">{item.actionType}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{item.createdByName}</p>
                      {item.description && (
                        <p className="mt-2 text-sm text-gray-700">{item.description}</p>
                      )}
                      {item.forwarding && (
                        <p className="mt-1 text-xs text-gray-600">
                          <strong>Encaminhamento:</strong> {item.forwarding}
                        </p>
                      )}
                      {item.internalNote && (
                        <p className="mt-1 text-xs text-gray-600">
                          <strong>Nota interna:</strong> {item.internalNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nenhuma movimentação registrada</p>
              )}
            </CardContent>
          </Card>

          {/* Auditoria Card */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Auditoria</CardTitle>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {audit.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {audit.map((item) => (
                    <div key={item.id} className="border-l-2 border-gray-400 pl-4 pb-4">
                      <p className="font-semibold text-gray-900">{item.actionType}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.userName} · {item.numeroCaso}
                      </p>
                      {item.targetField && (
                        <p className="mt-1 text-xs text-gray-600">
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
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nenhum registro de auditoria encontrado</p>
              )}
            </CardContent>
          </Card>
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
              className="gap-2"
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
