import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Eye, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ExternalDemands() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    demandType: "",
    source: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar criação de demanda via tRPC
    console.log("Criar demanda:", formData);
    setIsOpen(false);
    setFormData({
      studentId: "",
      demandType: "",
      source: "",
      description: "",
      priority: "medium",
      dueDate: "",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Demandas Externas</h1>
          <p className="text-muted-foreground mt-1">
            Registro e acompanhamento de solicitações externas
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Demanda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nova Demanda Externa</DialogTitle>
              <DialogDescription>
                Preencha os dados da demanda para acompanhamento.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="demandType">Tipo de Demanda *</Label>
                  <Input
                    id="demandType"
                    placeholder="Ex: Avaliação Psicológica"
                    value={formData.demandType}
                    onChange={(e) => setFormData({ ...formData, demandType: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="source">Origem da Solicitação *</Label>
                  <select
                    id="source"
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    required
                  >
                    <option value="">Selecione a origem</option>
                    <option value="family">Família</option>
                    <option value="school">Escola</option>
                    <option value="health">Órgão de Saúde</option>
                    <option value="court">Judiciário</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <select
                    id="priority"
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="dueDate">Data Limite</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição da Demanda</Label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  placeholder="Descreva a demanda e contexto..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Registrar Demanda
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por tipo ou origem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Demandas */}
      <Card>
        <CardHeader>
          <CardTitle>Demandas Registradas</CardTitle>
          <CardDescription>
            Acompanhamento de solicitações externas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Data Limite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Avaliação Psicológica</TableCell>
                  <TableCell>Família</TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-800">Alta</Badge>
                  </TableCell>
                  <TableCell>25/04/2026</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Parecer Técnico</TableCell>
                  <TableCell>Órgão de Saúde</TableCell>
                  <TableCell>
                    <Badge className="bg-orange-100 text-orange-800">Média</Badge>
                  </TableCell>
                  <TableCell>30/04/2026</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Resolvido</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Encaminhamento Especializado</TableCell>
                  <TableCell>Escola</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">Baixa</Badge>
                  </TableCell>
                  <TableCell>10/05/2026</TableCell>
                  <TableCell>
                    <Badge variant="outline">Pendente</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
