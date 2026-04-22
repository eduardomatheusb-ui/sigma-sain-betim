import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Eye, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function Attendances() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    mediatorId: "",
    attendanceDate: "",
    startTime: "",
    endTime: "",
    description: "",
    type: "individual",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar criação de atendimento via tRPC
    console.log("Criar atendimento:", formData);
    setIsOpen(false);
    setFormData({
      studentId: "",
      mediatorId: "",
      attendanceDate: "",
      startTime: "",
      endTime: "",
      description: "",
      type: "individual",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Atendimentos</h1>
          <p className="text-muted-foreground mt-1">
            Registro, acompanhamento e histórico de atendimentos
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Atendimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Novo Atendimento</DialogTitle>
              <DialogDescription>
                Preencha os dados do atendimento.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentId">Aluno *</Label>
                  <select
                    id="studentId"
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um aluno</option>
                    <option value="1">João Silva Santos</option>
                    <option value="2">Ana Costa Oliveira</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="mediatorId">Mediador *</Label>
                  <select
                    id="mediatorId"
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                    value={formData.mediatorId}
                    onChange={(e) => setFormData({ ...formData, mediatorId: e.target.value })}
                    required
                  >
                    <option value="">Selecione um mediador</option>
                    <option value="1">Dra. Maria Silva</option>
                    <option value="2">Prof. João Santos</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="attendanceDate">Data do Atendimento *</Label>
                  <Input
                    id="attendanceDate"
                    type="date"
                    value={formData.attendanceDate}
                    onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Atendimento</Label>
                  <select
                    id="type"
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="individual">Individual</option>
                    <option value="shared">Compartilhado</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="startTime">Hora de Início</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">Hora de Término</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição do Atendimento</Label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  placeholder="Descreva o atendimento realizado..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Registrar Atendimento
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
                placeholder="Buscar por aluno ou mediador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos Registrados</CardTitle>
          <CardDescription>
            Histórico de atendimentos realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Mediador</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">João Silva Santos</TableCell>
                  <TableCell>Dra. Maria Silva</TableCell>
                  <TableCell>22/04/2026</TableCell>
                  <TableCell>
                    <Badge variant="outline">Individual</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Ana Costa Oliveira</TableCell>
                  <TableCell>Prof. João Santos</TableCell>
                  <TableCell>21/04/2026</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">Compartilhado</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">João Silva Santos</TableCell>
                  <TableCell>Dra. Maria Silva</TableCell>
                  <TableCell>23/04/2026</TableCell>
                  <TableCell>
                    <Badge variant="outline">Individual</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
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
