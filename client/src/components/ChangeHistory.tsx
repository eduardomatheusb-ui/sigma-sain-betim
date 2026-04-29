import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Circle, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ChangeHistoryItem {
  id: number;
  caseId: number;
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

interface ChangeHistoryProps {
  changes: ChangeHistoryItem[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function ChangeHistory({ changes, isLoading = false }: ChangeHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActionType, setFilterActionType] = useState<string>('all');
  const [filterField, setFilterField] = useState<string>('all');

  // Get unique action types and fields for filters
  const uniqueActionTypes = useMemo(() => {
    return Array.from(new Set(changes.map(c => c.actionType))).sort();
  }, [changes]);

  const uniqueFields = useMemo(() => {
    return Array.from(new Set(changes.filter(c => c.targetField).map(c => c.targetField))).sort();
  }, [changes]);

  // Filter changes
  const filteredChanges = useMemo(() => {
    return changes.filter(change => {
      const matchesActionType = filterActionType === 'all' || change.actionType === filterActionType;
      const matchesField = filterField === 'all' || change.targetField === filterField;
      return matchesActionType && matchesField;
    });
  }, [changes, filterActionType, filterField]);

  // Paginate changes
  const totalPages = Math.ceil(filteredChanges.length / ITEMS_PER_PAGE);
  const paginatedChanges = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredChanges.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredChanges, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const getActionTypeColor = (actionType: string): string => {
    switch (actionType.toLowerCase()) {
      case 'criação':
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'edição':
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'exclusão':
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'movimentação':
      case 'movement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-50 text-red-700';
      case 'coordinator':
        return 'bg-blue-50 text-blue-700';
      case 'advisor':
        return 'bg-green-50 text-green-700';
      case 'school_user':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
          <span className="text-xs text-gray-500">
            {filteredChanges.length} alteração{filteredChanges.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 pb-6 border-b">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Tipo de Alteração</label>
            <Select value={filterActionType} onValueChange={(value) => handleFilterChange(setFilterActionType, value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as alterações</SelectItem>
                {uniqueActionTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Campo Alterado</label>
            <Select value={filterField} onValueChange={(value) => handleFilterChange(setFilterField, value)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os campos</SelectItem>
                {uniqueFields.map(field => (
                  <SelectItem key={field} value={field || ''}>{field || 'Sem campo'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Changes Timeline */}
        {paginatedChanges.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {paginatedChanges.map((change, index) => (
              <div key={change.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Circle className="h-3 w-3 fill-blue-600 text-blue-600 mt-1" />
                  {index < paginatedChanges.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-200 mt-1"></div>
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-xs ${getActionTypeColor(change.actionType)}`}>
                      {change.actionType}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getRoleColor(change.userRole)}`}>
                      {change.userRole}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(change.createdAt).toLocaleString('pt-BR')}
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    <strong>Por:</strong> {change.userName}
                  </p>

                  {change.targetField && (
                    <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                      <p className="font-medium text-gray-700">
                        Campo: <span className="text-blue-600">{change.targetField}</span>
                      </p>

                      {change.oldValue && (
                        <p className="text-gray-600 mt-1">
                          <strong>Antes:</strong> <span className="line-through text-red-600">{change.oldValue}</span>
                        </p>
                      )}

                      {change.newValue && (
                        <p className="text-gray-600 mt-1">
                          <strong>Depois:</strong> <span className="text-green-600">{change.newValue}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center py-8">
            Nenhuma alteração encontrada com os filtros aplicados
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <span className="text-xs text-gray-600">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
