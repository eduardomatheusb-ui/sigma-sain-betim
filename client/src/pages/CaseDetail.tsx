import { useParams, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Edit2, Trash2, Plus } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CaseData {
  id: string;
  numeroCaso: string;
  nomeEstudante: string;
  idade?: number;
  escola?: string;
  segmento?: string;
  regional?: string;
  situacao?: string;
  status?: string;
  classificacaoCaso?: string;
  tipoDemanda?: string;
  origem?: string;
  responsavel?: string;
  observacaoGeral?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface HistoryItem {
  id: string;
  titulo: string;
  data: Date;
  responsavel: string;
  descricao: string;
}

interface AuditItem {
  id: string;
  acao: string;
  data: Date;
  usuario: string;
  protocolo: string;
  camposAlterados?: string[];
  origem?: string;
}

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const [, navigate] = useLocation();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch case details from backend
    // For now, using mock data
    if (caseId) {
      setLoading(false);
    }
  }, [caseId]);

  const getSituacaoBadgeColor = (situacao?: string) => {
    switch (situacao?.toLowerCase()) {
      case 'arquivado':
        return 'bg-gray-200 text-gray-800';
      case 'resolvido':
        return 'bg-green-200 text-green-800';
      case 'em andamento':
        return 'bg-blue-200 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'resolvido':
        return 'bg-green-200 text-green-800';
      case 'urgente':
        return 'bg-red-600 text-white';
      case 'novo':
        return 'bg-blue-200 text-blue-800';
      case 'em análise':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getClassificacaoBadgeColor = (classificacao?: string) => {
    switch (classificacao?.toLowerCase()) {
      case 'alta':
        return 'bg-red-200 text-red-800';
      case 'média':
        return 'bg-yellow-200 text-yellow-800';
      case 'baixa':
        return 'bg-blue-200 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
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
                    <p className="text-sm font-medium text-gray-600">Idade</p>
                    <p className="mt-1 text-gray-900">{caseData?.idade || 'Não informado'}</p>
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
                        ? new Date(caseData.createdAt).toLocaleDateString('pt-BR')
                        : 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Atualizado em</p>
                    <p className="mt-1 text-gray-900">
                      {caseData?.updatedAt
                        ? new Date(caseData.updatedAt).toLocaleDateString('pt-BR')
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
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="border-l-2 border-blue-500 pl-4 pb-4">
                      <p className="font-semibold text-gray-900">{item.titulo}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.data).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{item.responsavel}</p>
                      <p className="mt-2 text-sm text-gray-700">{item.descricao}</p>
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
                <div className="space-y-4">
                  {audit.map((item) => (
                    <div key={item.id} className="border-l-2 border-gray-400 pl-4 pb-4">
                      <p className="font-semibold text-gray-900">{item.acao}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.data).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.usuario} · {item.protocolo}
                      </p>
                      {item.camposAlterados && item.camposAlterados.length > 0 && (
                        <p className="mt-1 text-xs text-gray-600">
                          Campos: {item.camposAlterados.join(', ')}
                        </p>
                      )}
                      {item.origem && (
                        <p className="text-xs text-gray-600">Origem: {item.origem}</p>
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
    </div>
  );
}
