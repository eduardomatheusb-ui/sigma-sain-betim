import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Attendances() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    studentId: 0,
    mediatorId: 0,
    attendanceDate: "",
    startTime: "",
    endTime: "",
    description: "",
    type: "individual" as "individual" | "shared",
  });

  const { data: attendancesData, isLoading, refetch } = trpc.attendances.listBySchool.useQuery();
  const { data: studentsData } = trpc.students.listBySchool.useQuery();
  const { data: mediatorsData } = trpc.mediators.listBySchool.useQuery();

  const createAttendance = trpc.attendances.create.useMutation({
    onSuccess: () => {
      toast.success("Atendimento registrado com sucesso!");
      setIsOpen(false);
      setFormData({ studentId: 0, mediatorId: 0, attendanceDate: "", startTime: "", endTime: "", description: "", type: "individual" });
      refetch();
    },
    onError: (err) => { toast.error("Erro ao registrar atendimento: " + err.message); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.mediatorId || !formData.attendanceDate) {
      toast.error("Aluno, mediador e data são obrigatórios");
      return;
    }
    createAttendance.mutate(formData);
  };

  const filtered = (attendancesData || []).filter(a =>
    (a.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d: Date | string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><ClipboardList className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Atendimentos</h1>
            <p className="text-sm text-muted-foreground">Registro e histórico de atendimentos</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2"><Plus className="w-4 h-4" />Novo Atendimento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Atendimento</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="studentId">Aluno *</Label>
                  <select id="studentId" className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background" value={formData.studentId} onChange={e => setFormData(p => ({ ...p, studentId: parseInt(e.target.value) }))}>
                    <option value={0}>Selecione o aluno...</option>
                    {(studentsData || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="mediatorId">Mediador *</Label>
                  <select id="mediatorId" className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background" value={formData.mediatorId} onChange={e => setFormData(p => ({ ...p, mediatorId: parseInt(e.target.value) }))}>
                    <option value={0}>Selecione o mediador...</option>
                    {(mediatorsData || []).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="attendanceDate">Data *</Label>
                  <Input id="attendanceDate" type="date" value={formData.attendanceDate} onChange={e => setFormData(p => ({ ...p, attendanceDate: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="type">Tipo</Label>
                  <select id="type" className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as "individual" | "shared" }))}>
                    <option value="individual">Individual</option>
                    <option value="shared">Compartilhado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="startTime">Hora Início</Label>
                  <Input id="startTime" type="time" value={formData.startTime} onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endTime">Hora Fim</Label>
                  <Input id="endTime" type="time" value={formData.endTime} onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="description">Observações</Label>
                  <Input id="description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Observações sobre o atendimento..." />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createAttendance.isPending} className="bg-primary text-white">
                  {createAttendance.isPending ? "Salvando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar atendimentos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>Histórico de Atendimentos</span>
            <Badge variant="secondary" className="font-normal">{filtered.length} registros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Carregando atendimentos...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <ClipboardList className="w-8 h-8 opacity-30" />
              <p>{searchTerm ? "Nenhum atendimento encontrado." : "Nenhum atendimento registrado ainda."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Aluno (ID)</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mediador (ID)</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((att, idx) => (
                    <tr key={att.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3">{formatDate(att.attendanceDate)}</td>
                      <td className="px-4 py-3 text-muted-foreground">Aluno #{att.studentId}</td>
                      <td className="px-4 py-3 text-muted-foreground">Mediador #{att.mediatorId}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{att.type === "individual" ? "Individual" : "Compartilhado"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={att.status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-100" : att.status === "pending" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : "bg-gray-100 text-gray-600"}>
                          {att.status === "completed" ? "Concluído" : att.status === "pending" ? "Pendente" : att.status}
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
