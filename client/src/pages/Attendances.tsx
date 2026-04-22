import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, Search, Pencil, Trash2, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  completed: "Concluido", pending: "Pendente", cancelled: "Cancelado",
};
const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Attendances() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const emptyForm = {
    studentId: 0, mediatorId: 0, attendanceDate: "",
    startTime: "", endTime: "", description: "", result: "",
    type: "individual" as "individual" | "shared",
    status: "pending" as "completed" | "pending" | "cancelled",
  };
  const [formData, setFormData] = useState(emptyForm);

  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin";

  // listBySchool already returns all for admin, filtered for school
  const { data: attendancesData, isLoading: loading } = trpc.attendances.listBySchool.useQuery();
  const { data: schoolsList } = trpc.schools.list.useQuery(undefined, { enabled: isAdmin });
  const { data: studentsData } = trpc.students.listBySchool.useQuery();
  const { data: mediatorsData } = trpc.mediators.listBySchool.useQuery();

  const allAttendances = attendancesData || [];

  // Build name maps from students and mediators
  const studentMap = useMemo(() => {
    const map = new Map<number, string>();
    (studentsData || []).forEach((s: any) => map.set(s.id, s.name));
    return map;
  }, [studentsData]);

  const mediatorMap = useMemo(() => {
    const map = new Map<number, string>();
    (mediatorsData || []).forEach((m: any) => map.set(m.id, m.name));
    return map;
  }, [mediatorsData]);

  const createAttendance = trpc.attendances.create.useMutation({
    onSuccess: () => {
      toast.success("Atendimento registrado com sucesso!");
      closeForm();
      utils.attendances.listBySchool.invalidate();
    },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });

  const updateAttendance = trpc.attendances.update.useMutation({
    onSuccess: () => {
      toast.success("Atendimento atualizado!");
      closeForm();
      utils.attendances.listBySchool.invalidate();
    },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });

  const deleteAttendance = trpc.attendances.delete.useMutation({
    onSuccess: () => {
      toast.success("Atendimento excluido!");
      setDeleteConfirm(null);
      utils.attendances.listBySchool.invalidate();
    },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });

  const closeForm = () => {
    setIsOpen(false);
    setEditId(null);
    setFormData(emptyForm);
  };

  const openEdit = (att: any) => {
    setEditId(att.id);
    setFormData({
      studentId: att.studentId,
      mediatorId: att.mediatorId,
      attendanceDate: att.attendanceDate ? new Date(att.attendanceDate).toISOString().slice(0, 10) : "",
      startTime: att.startTime || "",
      endTime: att.endTime || "",
      description: att.description || "",
      result: att.result || "",
      type: att.type || "individual",
      status: att.status || "pending",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.mediatorId || !formData.attendanceDate) {
      toast.error("Aluno, mediador e data sao obrigatorios");
      return;
    }
    if (editId) {
      const { studentId, mediatorId, ...updateData } = formData;
      updateAttendance.mutate({ id: editId, ...updateData });
    } else {
      createAttendance.mutate(formData);
    }
  };

  const filtered = useMemo(() => {
    let list = [...allAttendances];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((a: any) => {
        const sName = studentMap.get(a.studentId) || "";
        const mName = mediatorMap.get(a.mediatorId) || "";
        return sName.toLowerCase().includes(q) || mName.toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) || (a.result || "").toLowerCase().includes(q);
      });
    }
    if (statusFilter !== "all") {
      list = list.filter((a: any) => a.status === statusFilter);
    }
    if (schoolFilter !== "all" && isAdmin) {
      const sid = parseInt(schoolFilter);
      list = list.filter((a: any) => a.schoolId === sid);
    }
    return list;
  }, [allAttendances, searchTerm, statusFilter, schoolFilter, studentMap, mediatorMap, isAdmin]);

  const formatDate = (d: Date | string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["Data", "Aluno", "Mediador", "Tipo", "Status", "Descricao", "Resultado"];
    const rows = filtered.map((a: any) => [
      formatDate(a.attendanceDate),
      studentMap.get(a.studentId) || "ID " + a.studentId,
      mediatorMap.get(a.mediatorId) || "ID " + a.mediatorId,
      a.type === "individual" ? "Individual" : "Compartilhado",
      STATUS_LABELS[a.status] || a.status,
      (a.description || "").replace(/;/g, ","),
      (a.result || "").replace(/;/g, ","),
    ]);
    const csv = [headers.join(";"), ...rows.map((r: any) => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atendimentos_" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><ClipboardList className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestao de Atendimentos</h1>
            <p className="text-sm text-muted-foreground">Registro e historico de atendimentos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!filtered.length}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" onClick={() => { setEditId(null); setFormData(emptyForm); setIsOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Novo Atendimento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Buscar por aluno, mediador..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Concluido</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {isAdmin && (
              <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                <SelectTrigger><SelectValue placeholder="Escola" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as escolas</SelectItem>
                  {(schoolsList || []).map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>Historico de Atendimentos</span>
            <Badge variant="secondary" className="font-normal">{filtered.length} registros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
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
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Aluno</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mediador</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Resultado</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((att: any, idx: number) => (
                    <tr key={att.id} className={"border-b last:border-0 hover:bg-muted/20 transition-colors " + (idx % 2 === 0 ? "" : "bg-muted/10")}>
                      <td className="px-4 py-3">{formatDate(att.attendanceDate)}</td>
                      <td className="px-4 py-3 font-medium">{att.studentName || studentMap.get(att.studentId) || "Aluno #" + att.studentId}</td>
                      <td className="px-4 py-3">{att.mediatorName || mediatorMap.get(att.mediatorId) || "Mediador #" + att.mediatorId}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{att.type === "individual" ? "Individual" : "Compartilhado"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={"text-xs " + (STATUS_COLORS[att.status] || "bg-gray-100 text-gray-800")}>
                          {STATUS_LABELS[att.status] || att.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                        {att.result || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(att)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(att.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog criar/editar */}
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsOpen(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Editar Atendimento" : "Registrar Atendimento"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Aluno *</Label>
                <select className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background" value={formData.studentId} onChange={e => setFormData(p => ({ ...p, studentId: parseInt(e.target.value) }))}>
                  <option value={0}>Selecione o aluno...</option>
                  {(studentsData || []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Mediador *</Label>
                <select className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background" value={formData.mediatorId} onChange={e => setFormData(p => ({ ...p, mediatorId: parseInt(e.target.value) }))}>
                  <option value={0}>Selecione o mediador...</option>
                  {(mediatorsData || []).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Data *</Label>
                <Input type="date" value={formData.attendanceDate} onChange={e => setFormData(p => ({ ...p, attendanceDate: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <select className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as "individual" | "shared" }))}>
                  <option value="individual">Individual</option>
                  <option value="shared">Compartilhado</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Hora Inicio</Label>
                <Input type="time" value={formData.startTime} onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Hora Fim</Label>
                <Input type="time" value={formData.endTime} onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} />
              </div>
              {editId && (
                <div className="col-span-2 space-y-1">
                  <Label>Status</Label>
                  <select className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background" value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as "completed" | "pending" | "cancelled" }))}>
                    <option value="pending">Pendente</option>
                    <option value="completed">Concluido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              )}
              <div className="col-span-2 space-y-1">
                <Label>Observacoes</Label>
                <Input value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Observacoes sobre o atendimento..." />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Resultado / Evolucao</Label>
                <textarea
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background min-h-[80px] resize-y"
                  value={formData.result}
                  onChange={e => setFormData(p => ({ ...p, result: e.target.value }))}
                  placeholder="Descreva o resultado ou evolucao do atendimento..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={createAttendance.isPending || updateAttendance.isPending}>
                {(createAttendance.isPending || updateAttendance.isPending) ? "Salvando..." : editId ? "Atualizar" : "Registrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar exclusao */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Exclusao</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este atendimento? Esta acao nao pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) deleteAttendance.mutate({ id: deleteConfirm }); }} disabled={deleteAttendance.isPending}>
              {deleteAttendance.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
