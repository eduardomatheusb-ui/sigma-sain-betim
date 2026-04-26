import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Plus, Edit2, Trash2, RotateCcw } from "lucide-react";

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  areaAtuacao: string;
  regional: string;
}

const AREAS_ATUACAO = [
  "Educação Inclusiva",
  "Atendimento Especializado",
  "Coordenação Pedagógica",
  "Gestão Administrativa",
  "Assessoria Técnica",
  "Articulação de Rede",
];

const REGIONAIS = [
  "Centro",
  "Norte",
  "Sul",
  "Leste",
  "Oeste",
  "Regional 1",
  "Regional 2",
  "Regional 3",
];

export default function FarolAssessores() {
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegional, setFilterRegional] = useState("Todas");
  const [filterArea, setFilterArea] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    areaAtuacao: "",
    regional: "",
  });

  // Queries
  const { data: advisors = [], isLoading, refetch } = trpc.farol.listAdvisors.useQuery(
    { search: searchTerm, regional: filterRegional !== "Todas" ? filterRegional : undefined }
  );

  const createMutation = trpc.farol.createAdvisor.useMutation({
    onSuccess: () => {
      toast.success("Assessor criado com sucesso");
      setIsOpen(false);
      setFormData({ nome: "", email: "", telefone: "", cargo: "", areaAtuacao: "", regional: "" });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.farol.updateAdvisor.useMutation({
    onSuccess: () => {
      toast.success("Assessor atualizado com sucesso");
      setIsOpen(false);
      setEditingId(null);
      setFormData({ nome: "", email: "", telefone: "", cargo: "", areaAtuacao: "", regional: "" });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.farol.deleteAdvisor.useMutation({
    onSuccess: () => {
      toast.success("Assessor desativado com sucesso");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  // Filtros
  const filteredAdvisors = useMemo(() => {
    return advisors.filter((advisor) => {
      const matchArea = filterArea === "Todas" || advisor.areaAtuacao === filterArea;
      const matchStatus = filterStatus === "Todos" || (filterStatus === "Ativo" ? advisor.active : !advisor.active);
      return matchArea && matchStatus;
    });
  }, [advisors, filterArea, filterStatus]);

  // Métricas
  const metrics = useMemo(() => {
    const total = advisors.length;
    const ativos = advisors.filter((a: any) => a.active).length;
    const inativos = advisors.filter((a: any) => !a.active).length;
    const regionais = new Set(advisors.map((a: any) => a.regional)).size;
    return { total, ativos, inativos, regionais };
  }, [advisors]);

  const handleOpenForm = (advisor?: (typeof advisors)[0]) => {
    if (advisor) {
      setEditingId(advisor.id);
      setFormData({
        nome: advisor.nome,
        email: advisor.email || "",
        telefone: advisor.telefone || "",
        cargo: advisor.cargo || "",
        areaAtuacao: advisor.areaAtuacao || "",
        regional: advisor.regional,
      });
    } else {
      setEditingId(null);
      setFormData({ nome: "", email: "", telefone: "", cargo: "", areaAtuacao: "", regional: "" });
    }
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.email || !formData.telefone || !formData.cargo || !formData.areaAtuacao || !formData.regional) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja desativar este assessor?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6">
        <p className="text-red-600">Acesso negado. Apenas administradores podem acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Users className="h-8 w-8" />
          Assessores do Farol
        </h1>
        <p className="text-gray-600">Gestão dos responsáveis técnicos vinculados aos casos acompanhados pelo Farol da Gestão</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Assessores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assessores Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.ativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assessores Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.inativos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Regionais Atendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.regionais}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium">Buscar por nome</label>
            <Input
              placeholder="Digite o nome do assessor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="text-sm font-medium">Regional</label>
            <Select value={filterRegional} onValueChange={setFilterRegional}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas as Regionais</SelectItem>
                {REGIONAIS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <label className="text-sm font-medium">Área de Atuação</label>
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas as Áreas</SelectItem>
                {AREAS_ATUACAO.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <label className="text-sm font-medium">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os Status</SelectItem>
                <SelectItem value="Ativo">Ativos</SelectItem>
                <SelectItem value="Inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => handleOpenForm()} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Assessor
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Área de Atuação</TableHead>
              <TableHead>Regional</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredAdvisors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Nenhum assessor encontrado
                </TableCell>
              </TableRow>
            ) : (
                  filteredAdvisors.map((advisor: any) => (
                <TableRow key={advisor.id}>
                  <TableCell className="font-medium">{advisor.nome}</TableCell>
                  <TableCell>{advisor.email}</TableCell>
                  <TableCell>{advisor.telefone}</TableCell>
                  <TableCell>{advisor.cargo}</TableCell>
                  <TableCell>{advisor.areaAtuacao}</TableCell>
                  <TableCell>{advisor.regional}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${advisor.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {advisor.active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenForm(advisor)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {advisor.active ? (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(advisor.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => updateMutation.mutate({ id: advisor.id, active: true })}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Formulário */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Assessor" : "Novo Assessor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefone *</label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cargo *</label>
              <Input
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                placeholder="Ex: Coordenador"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Área de Atuação *</label>
              <Select value={formData.areaAtuacao} onValueChange={(value) => setFormData({ ...formData, areaAtuacao: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma área" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS_ATUACAO.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Regional *</label>
              <Select value={formData.regional} onValueChange={(value) => setFormData({ ...formData, regional: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma regional" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONAIS.map((regional) => (
                    <SelectItem key={regional} value={regional}>
                      {regional}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
