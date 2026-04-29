import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Circle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface CaseEvolutionProps {
  caseId?: number | null;
  numeroCaso?: string;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'Progresso': 'bg-green-100 text-green-800',
  'Estável': 'bg-blue-100 text-blue-800',
  'Regressão': 'bg-orange-100 text-orange-800',
  'Encerrado': 'bg-gray-100 text-gray-800',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  'Progresso': 'fill-green-600 text-green-600',
  'Estável': 'fill-blue-600 text-blue-600',
  'Regressão': 'fill-orange-600 text-orange-600',
  'Encerrado': 'fill-gray-600 text-gray-600',
};

export function CaseEvolution({ caseId, numeroCaso, isLoading }: CaseEvolutionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'Progresso' as const,
    description: '',
  });

  // Fetch evolutions from backend
  const { data: evolutionData, isLoading: isLoadingEvolutions, refetch } = trpc.farol.listEvolutions.useQuery(
    {
      caseId: caseId || 0,
      limit: 50,
      offset: 0,
    },
    {
      enabled: !!caseId,
    }
  );

  // Add evolution mutation
  const addEvolutionMutation = trpc.farol.addEvolution.useMutation({
    onSuccess: () => {
      toast.success('Evolução registrada com sucesso');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        status: 'Progresso',
        description: '',
      });
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao registrar evolução');
    },
  });

  // Delete evolution mutation
  const deleteEvolutionMutation = trpc.farol.deleteEvolution.useMutation({
    onSuccess: () => {
      toast.success('Evolução removida com sucesso');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao remover evolução');
    },
  });

  const handleAddEvolution = async () => {
    if (!formData.description.trim()) {
      toast.error('Por favor, descreva a evolução do caso');
      return;
    }

    if (!caseId || !numeroCaso) {
      toast.error('Dados do caso não disponíveis');
      return;
    }

    await addEvolutionMutation.mutateAsync({
      caseId,
      numeroCaso,
      date: formData.date,
      status: formData.status as 'Progresso' | 'Estável' | 'Regressão' | 'Encerrado',
      description: formData.description,
    });
  };

  const handleDeleteEvolution = async (id: number) => {
    if (!caseId) return;

    await deleteEvolutionMutation.mutateAsync({
      id,
      caseId,
    });
  };

  const evolutions = evolutionData?.evolutions || [];
  const sortedEvolution = useMemo(() => {
    return [...evolutions].sort((a, b) => 
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
  }, [evolutions]);

  const isLoading_ = isLoading || isLoadingEvolutions;

  if (isLoading_) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-lg">Evolução do Caso</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando evolução...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b bg-gray-50 flex items-center justify-between">
        <CardTitle className="text-lg">Evolução do Caso</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!caseId}
            >
              <Plus className="h-4 w-4" />
              Registrar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Evolução do Caso</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Data</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Progresso">Progresso</SelectItem>
                    <SelectItem value="Estável">Estável</SelectItem>
                    <SelectItem value="Regressão">Regressão</SelectItem>
                    <SelectItem value="Encerrado">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea
                  placeholder="Descreva a evolução do caso..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-24"
                />
              </div>
              <Button
                onClick={handleAddEvolution}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={addEvolutionMutation.isPending}
              >
                {addEvolutionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Evolução'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-6">
        {sortedEvolution.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedEvolution.map((entry, index) => (
              <div key={entry.id} className="flex gap-3 pb-4 border-b last:border-b-0">
                <div className="flex flex-col items-center">
                  <Circle className={`h-3 w-3 mt-1 ${STATUS_DOT_COLORS[entry.status || 'Progresso']}`} />
                  {index < sortedEvolution.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-200 mt-1"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={STATUS_COLORS[entry.status || 'Progresso']}>
                      {entry.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEvolution(entry.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      disabled={deleteEvolutionMutation.isPending}
                    >
                      {deleteEvolutionMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {entry.date ? new Date(entry.date).toLocaleDateString('pt-BR') : 'Data não informada'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{entry.createdByName || 'Usuário desconhecido'}</p>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma evolução registrada ainda.</p>
            <p className="text-xs mt-1">Clique em "Registrar" para adicionar a primeira evolução.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
