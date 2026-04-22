import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Students() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    dateOfBirth: "",
    enrollmentNumber: "",
    specialNeeds: "",
    guardianName: "",
    guardianPhone: "",
  });

  const { data: studentsData, isLoading, refetch } = trpc.students.listBySchool.useQuery();
  const createStudent = trpc.students.create.useMutation({
    onSuccess: () => {
      toast.success("Aluno cadastrado com sucesso!");
      setIsOpen(false);
      setFormData({ name: "", cpf: "", dateOfBirth: "", enrollmentNumber: "", specialNeeds: "", guardianName: "", guardianPhone: "" });
      refetch();
    },
    onError: (err) => {
      toast.error("Erro ao cadastrar aluno: " + err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nome do aluno é obrigatório");
      return;
    }
    createStudent.mutate(formData);
  };

  const filtered = (studentsData || []).filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.enrollmentNumber || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Alunos</h1>
            <p className="text-sm text-muted-foreground">Cadastro e acompanhamento de alunos com necessidades especiais</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nome do aluno" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={formData.cpf} onChange={e => setFormData(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                  <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={e => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="enrollmentNumber">Matrícula</Label>
                  <Input id="enrollmentNumber" value={formData.enrollmentNumber} onChange={e => setFormData(p => ({ ...p, enrollmentNumber: e.target.value }))} placeholder="Número de matrícula" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="specialNeeds">Necessidades Especiais</Label>
                  <Input id="specialNeeds" value={formData.specialNeeds} onChange={e => setFormData(p => ({ ...p, specialNeeds: e.target.value }))} placeholder="Ex: TEA, TDAH..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="guardianName">Responsável</Label>
                  <Input id="guardianName" value={formData.guardianName} onChange={e => setFormData(p => ({ ...p, guardianName: e.target.value }))} placeholder="Nome do responsável" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="guardianPhone">Telefone do Responsável</Label>
                  <Input id="guardianPhone" value={formData.guardianPhone} onChange={e => setFormData(p => ({ ...p, guardianPhone: e.target.value }))} placeholder="(31) 99999-9999" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createStudent.isPending} className="bg-primary text-white">
                  {createStudent.isPending ? "Salvando..." : "Cadastrar Aluno"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de busca */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar por nome ou matrícula..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>Lista de Alunos</span>
            <Badge variant="secondary" className="font-normal">{filtered.length} {filtered.length === 1 ? "aluno" : "alunos"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Carregando alunos...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <GraduationCap className="w-8 h-8 opacity-30" />
              <p>{searchTerm ? "Nenhum aluno encontrado para a busca." : "Nenhum aluno cadastrado ainda."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Matrícula</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Necessidades</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Responsável</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student, idx) => (
                    <tr key={student.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{student.enrollmentNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{student.specialNeeds || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{student.guardianName || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={student.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600"}>
                          {student.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
