import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface AuditRecord {
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

export default function FarolAuditDashboard() {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    actionType: '',
    userName: '',
    userRole: '',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch all audit records
  const { data: auditData, isLoading: auditLoading, refetch } = trpc.farol.getAuditTrail.useQuery(
    { limit: 1000 },
    { enabled: true }
  );

  // Update local state when data loads
  useEffect(() => {
    if (auditData && Array.isArray(auditData)) {
      setAuditRecords(auditData);
      setLoading(false);
    }
  }, [auditData]);

  // Apply filters
  useEffect(() => {
    let filtered = auditRecords;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.numeroCaso?.toLowerCase().includes(searchLower) ||
          record.userName.toLowerCase().includes(searchLower) ||
          record.actionType.toLowerCase().includes(searchLower)
      );
    }

    if (filters.actionType) {
      filtered = filtered.filter((record) => record.actionType === filters.actionType);
    }

    if (filters.userName) {
      filtered = filtered.filter((record) =>
        record.userName.toLowerCase().includes(filters.userName.toLowerCase())
      );
    }

    if (filters.userRole && filters.userRole !== 'todos') {
      filtered = filtered.filter((record) => record.userRole === filters.userRole);
    }

    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filtered = filtered.filter((record) => new Date(record.createdAt) >= dateFrom);
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter((record) => new Date(record.createdAt) <= dateTo);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [filters, auditRecords]);

  const handleRefresh = async () => {
    setLoading(true);
    await refetch();
  };

  const handleExport = () => {
    try {
      const csv = [
        ['Data/Hora', 'Usuário', 'Perfil', 'Ação', 'Protocolo', 'Campo', 'Valor Anterior', 'Valor Novo'],
        ...filteredRecords.map((record) => [
          new Date(record.createdAt).toLocaleString('pt-BR'),
          record.userName,
          record.userRole,
          record.actionType,
          record.numeroCaso || '—',
          record.targetField || '—',
          record.oldValue || '—',
          record.newValue || '—',
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `auditoria-farol-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Auditoria exportada com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar auditoria');
    }
  };

  const getActionBadgeColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'create':
      case 'criação':
        return 'bg-green-100 text-green-800';
      case 'update':
      case 'atualização':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
      case 'deleção':
        return 'bg-red-100 text-red-800';
      case 'restore':
      case 'restauração':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'coordinator':
        return 'bg-blue-100 text-blue-800';
      case 'advisor':
        return 'bg-green-100 text-green-800';
      case 'school_user':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIdx, endIdx);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Auditoria do Farol da Gestão</h1>
        <p className="mt-2 text-sm text-gray-600">
          Visualize e monitore todas as ações realizadas no módulo Farol
        </p>
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Protocolo, usuário, ação..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Type */}
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de Ação</label>
              <Select value={filters.actionType} onValueChange={(value) => setFilters({ ...filters, actionType: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="Criação">Criação</SelectItem>
                  <SelectItem value="Atualização">Atualização</SelectItem>
                  <SelectItem value="Deleção">Deleção</SelectItem>
                  <SelectItem value="Restauração">Restauração</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Role */}
            <div>
              <label className="text-sm font-medium text-gray-700">Perfil do Usuário</label>
              <Select value={filters.userRole} onValueChange={(value) => setFilters({ ...filters, userRole: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="advisor">Advisor</SelectItem>
                  <SelectItem value="school_user">School User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <label className="text-sm font-medium text-gray-700">Data Inicial</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-sm font-medium text-gray-700">Data Final</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    search: '',
                    actionType: '',
                    userName: '',
                    userRole: '',
                    dateFrom: '',
                    dateTo: '',
                  })
                }
                className="w-full"
              >
                Limpar
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={auditLoading}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {auditLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Atualizar
              </Button>
              <Button
                onClick={handleExport}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Exibindo <strong>{paginatedRecords.length}</strong> de <strong>{filteredRecords.length}</strong> registros
      </div>

      {/* Audit Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          {paginatedRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuário</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Perfil</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ação</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Protocolo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Campo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Valor Anterior</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Valor Novo</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(record.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{record.userName}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${getRoleBadgeColor(record.userRole)}`}>
                          {record.userRole}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getActionBadgeColor(record.actionType)}`}>
                          {record.actionType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">
                        {record.numeroCaso || '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{record.targetField || '—'}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                        {record.oldValue ? (
                          <span className="bg-red-50 text-red-800 px-2 py-1 rounded text-xs">
                            {record.oldValue}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                        {record.newValue ? (
                          <span className="bg-green-50 text-green-800 px-2 py-1 rounded text-xs">
                            {record.newValue}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum registro de auditoria encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(pageNum)}
                  className={pageNum === currentPage ? 'bg-blue-600 text-white' : ''}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
