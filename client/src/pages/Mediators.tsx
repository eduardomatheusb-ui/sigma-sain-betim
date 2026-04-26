import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Download, Users, Briefcase, AlertCircle, Clock, UserPlus, X, History } from "lucide-react";
import { HistoryModal } from "@/components/HistoryModal";
import { useAuth } from "@/_core/hooks/useAuth";
import { BETIM_SCHOOLS, INACTIVITY_REASONS } from "@/lib/schools";

const STATUS_OPTIONS = [
  { value: "active",      label: "Ativo(a)" },
  { value: "inactive",    label: "Inativo(a)" },
  { value: "on_leave",    label: "Licença médica" },
  { value: "temp_leave",  label: "Afastamento temporário" },
  { value: "dismissed",   label: "Desligado(a)" },
  { value: "substituted", label: "Substituído(a)" },
  { value: "vacancy",     label: "Vaga em aberto" },
] as const;

const CHANGE_OPTIONS = [
  "Sem alteração","Novo atendente","Desligamento","Licença médica",
  "Afastamento temporário","Retorno ao trabalho","Troca de escola",
  "Substituição","Nova demanda","Encerramento de demanda",
  "Alteração de vínculo com aluno","Vaga em aberto",
];

type StatusValue = typeof STATUS_OPTIONS[number]["value"];

const statusLabel = (s: string) => STATUS_OPTIONS.find(o => o.value === s)?.label ?? s;

const statusBadgeClass = (s: string) => {
  switch (s) {
    case "active":      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "on_leave":    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "temp_leave":  return "bg-orange-100 text-orange-800 hover:bg-orange-100";
    case "dismissed":   return "bg-red-100 text-red-800 hover:bg-red-100";
    case "substituted": return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "vacancy":     return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    default:            return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
};

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function downloadCSV(rows: any[]) {
  const headers = ["Escola","Responsável","Atendente","Matrícula","Situação","Aluno(s)","Tipo de alteração","Observação","Última atualização"];
  const lines = rows.map(row =>
    [row.schoolName, row.responsible, row.name, row.registration, statusLabel(row.status), row.linkedStudents, row.changeType, row.note, formatDateTime(row.updatedAt)]
      .map((f: any) => `"${String(f ?? "").replaceAll('"', '""')}"`)
      .join(";")
  );
  const csv = [headers.join(";"), ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quadro-atendentes.csv";
  link.click();
  URL.revokeObjectURL(url);
}

const defaultForm = {
  name: "", registration: "", cpf: "", professionalLicense: "",
  specialization: "", responsible: "", status: "active" as StatusValue,
  changeType: "Sem alteração", linkedStudents: "", note: "",
  schoolId: "" as string | number, maxAttendances: 20,
  isShared: false,
  additionalStudents: [] as string[],
  inactivityReason: "",
  inactivityDate: "",
  returnDate: "",
};

export default function Mediators() {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: mediatorsData = [], isLoading } = trpc.mediators.listBySchool.useQuery();
  const { data: schoolsData = [] } = trpc.schools.list.useQuery();

  const createMutation = trpc.mediators.create.useMutation({
    onSuccess: () => {
      utils.mediators.listBySchool.invalidate();
      toast.success("Atendente cadastrado!");
      setShowForm(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.mediators.update.useMutation({
    onSuccess: () => {
      utils.mediators.listBySchool.invalidate();
      toast.success("Atendente atualizado!");
      setShowForm(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.mediators.delete.useMutation({
    onSuccess: () => {
      utils.mediators.listBySchool.invalidate();
      toast.success("Atendente removido.");
    },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");

  // Histórico de mudanças de situação
  const [historyMediatorId, setHistoryMediatorId] = useState<number | null>(null);
  const [historyMediatorName, setHistoryMediatorName] = useState("");
  const { data: mediatorHistory = [], isLoading: historyLoading } = trpc.mediators.getHistory.useQuery(
    { mediatorId: historyMediatorId! },
    { enabled: !!historyMediatorId }
  );

  function resetForm() { setForm(defaultForm); setEditingId(null); }

  function handleEdit(row: any) {
    const addStudents = row.additionalStudents
      ? row.additionalStudents.split("|").map((s: string) => s.trim()).filter(Boolean)
      : [];
    setForm({
      name: row.name ?? "", registration: row.registration ?? "", cpf: row.cpf ?? "",
      professionalLicense: row.professionalLicense ?? "", specialization: row.specialization ?? "",
      responsible: row.responsible ?? "", status: (row.status as StatusValue) ?? "active",
      changeType: row.changeType ?? "Sem alteração", linkedStudents: row.linkedStudents ?? "",
      note: row.note ?? "", schoolId: row.schoolId ?? "", maxAttendances: row.maxAttendances ?? 20,
      isShared: row.isShared ?? false,
      additionalStudents: addStudents,
      inactivityReason: row.inactivityReason ?? "",
      inactivityDate: row.inactivityDate ? String(row.inactivityDate).substring(0, 10) : "",
      returnDate: row.returnDate ? String(row.returnDate).substring(0, 10) : "",
    });
    setEditingId(row.id);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    // Validar duplicidade de alunos adicionais
    if (form.isShared) {
      const mainName = form.linkedStudents.trim().toLowerCase();
      const addNames = form.additionalStudents.map(s => s.trim().toLowerCase()).filter(Boolean);
      const hasDuplicate = addNames.includes(mainName) || addNames.length !== new Set(addNames).size;
      if (hasDuplicate) {
        toast.error("Aluno duplicado: verifique se o aluno principal ou os alunos adicionais estão repetidos.");
        return;
      }
    }
    // Para school_user, forcar schoolId = user.schoolId (nao permitir alteracao)
    const finalSchoolId = isAdmin ? (form.schoolId ? Number(form.schoolId) : undefined) : (user?.schoolId || undefined);
    const payload = {
      ...form,
      schoolId: finalSchoolId,
      maxAttendances: Number(form.maxAttendances),
      additionalStudents: form.isShared ? form.additionalStudents.filter(Boolean).join(" | ") : "",
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filtered = useMemo(() => {
    return mediatorsData.filter((row: any) => {
      const matchSearch = [row.name, row.registration, row.linkedStudents, row.schoolName, row.responsible]
        .join(" ").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      const matchSchool = schoolFilter === "all" || String(row.schoolId) === schoolFilter;
      return matchSearch && matchStatus && matchSchool;
    });
  }, [mediatorsData, search, statusFilter, schoolFilter]);

  const metrics = useMemo(() => ({
    total: mediatorsData.length,
    active: mediatorsData.filter((m: any) => m.status === "active").length,
    onLeave: mediatorsData.filter((m: any) => m.status === "on_leave" || m.status === "temp_leave").length,
    vacancies: mediatorsData.filter((m: any) => m.status === "vacancy").length,
  }), [mediatorsData]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quadro de Atendentes</h1>
          <p className="text-sm text-muted-foreground">Gestão do quadro de mediadores e atendentes da rede municipal</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCSV(filtered)}>
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Novo Atendente
            </Button>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-primary opacity-80" />
              <div><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{metrics.total}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600 opacity-80" />
              <div><p className="text-xs text-muted-foreground">Ativos</p><p className="text-2xl font-bold">{metrics.active}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600 opacity-80" />
              <div><p className="text-xs text-muted-foreground">Afastamentos</p><p className="text-2xl font-bold">{metrics.onLeave}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-blue-600 opacity-80" />
              <div><p className="text-xs text-muted-foreground">Vagas</p><p className="text-2xl font-bold">{metrics.vacancies}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              placeholder="Buscar por nome, matrícula, aluno ou escola..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger><SelectValue placeholder="Todas as escolas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as escolas</SelectItem>
                {schoolsData.map((s: any) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Todas as situações" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as situações</SelectItem>
                {STATUS_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {["Escola","Responsável","Atendente","Matrícula","Situação","Aluno(s)","Alteração","Atualizado em","Ações"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Nenhum atendente encontrado.</td></tr>
                ) : (
                  filtered.map((row: any, idx: number) => (
                    <tr key={row.id} className={`border-b last:border-0 align-top hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3">{row.schoolName ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.responsible ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">{row.registration ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={statusBadgeClass(row.status)}>{statusLabel(row.status)}</Badge>
                      </td>
                      <td className="px-4 py-3 max-w-[180px] truncate" title={row.linkedStudents ?? ""}>{row.linkedStudents ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.changeType ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(row.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => { setHistoryMediatorId(row.id); setHistoryMediatorName(row.name); }}
                            title="Histórico de situação"
                          >
                            <History className="w-3.5 h-3.5" />
                          </Button>
                          {isAdmin && (
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(row.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Cadastro/Edição */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Atendente" : "Cadastrar Atendente"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">            <div className="sm:col-span-2">
              <Label>Escola</Label>
              {isAdmin ? (
                <Select value={String(form.schoolId)} onValueChange={v => setForm(f => ({ ...f, schoolId: v }))}>\n                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar escola..." /></SelectTrigger>
                  <SelectContent>
                    {schoolsData.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={schoolsData.find((s: any) => s.id === user?.schoolId)?.name || "Carregando..."}
                  disabled
                  className="bg-muted"
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <Label>Responsável pelo envio</Label>
              <Input className="mt-1" value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))} placeholder="Ex.: Direção Escolar" />
            </div>
            <div>
              <Label>Nome do atendente <span className="text-destructive">*</span></Label>
              <Input className="mt-1" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Matrícula / Identificador</Label>
              <Input className="mt-1" value={form.registration} onChange={e => setForm(f => ({ ...f, registration: e.target.value }))} placeholder="Ex.: ATP-001" />
            </div>
            <div>
              <Label>CPF</Label>
              <Input className="mt-1" value={form.cpf} onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
            </div>
            <div>
              <Label>Especialização</Label>
              <Input className="mt-1" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} placeholder="Ex.: Educação Especial" />
            </div>
            <div>
              <Label>Situação</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as StatusValue }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de alteração</Label>
              <Select value={form.changeType} onValueChange={v => setForm(f => ({ ...f, changeType: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHANGE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Aluno principal vinculado</Label>
              <Input className="mt-1" value={form.linkedStudents} onChange={e => setForm(f => ({ ...f, linkedStudents: e.target.value }))} placeholder="Nome do aluno principal" />
            </div>

            {/* Atendente compartilhado */}
            <div className="sm:col-span-2">
              <Label>O atendente é compartilhado?</Label>
              <Select value={form.isShared ? "yes" : "no"} onValueChange={v => setForm(f => ({ ...f, isShared: v === "yes", additionalStudents: v === "yes" ? f.additionalStudents : [] }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Não</SelectItem>
                  <SelectItem value="yes">Sim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.isShared && (
              <div className="sm:col-span-2 border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold">Alunos adicionais vinculados</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => setForm(f => ({ ...f, additionalStudents: [...f.additionalStudents, ""] }))}>
                    <UserPlus className="w-3.5 h-3.5 mr-1" /> Adicionar aluno
                  </Button>
                </div>
                {form.additionalStudents.length === 0 && (
                  <p className="text-xs text-muted-foreground">Clique em "Adicionar aluno" para vincular alunos adicionais.</p>
                )}
                {form.additionalStudents.map((student, idx) => (
                  <div key={idx} className="flex gap-2 mt-2">
                    <Input
                      value={student}
                      onChange={e => setForm(f => {
                        const arr = [...f.additionalStudents];
                        arr[idx] = e.target.value;
                        return { ...f, additionalStudents: arr };
                      })}
                      placeholder={`Nome do aluno adicional ${idx + 1}`}
                    />
                    <Button type="button" size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setForm(f => ({ ...f, additionalStudents: f.additionalStudents.filter((_, i) => i !== idx) }))}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Campos de inatividade (visível quando status não é ativo) */}
            {form.status !== "active" && (
              <>
                <div>
                  <Label>Motivo do afastamento/inatividade</Label>
                  <Select value={form.inactivityReason} onValueChange={v => setForm(f => ({ ...f, inactivityReason: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar motivo..." /></SelectTrigger>
                    <SelectContent>
                      {INACTIVITY_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data de início do afastamento</Label>
                  <Input type="date" className="mt-1" value={form.inactivityDate} onChange={e => setForm(f => ({ ...f, inactivityDate: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Previsão de retorno</Label>
                  <Input type="date" className="mt-1" value={form.returnDate} onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))} />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <Label>Observação</Label>
              <Textarea className="mt-1" rows={3} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Justificativa, observação ou informação complementar" />
            </div>
            <DialogFooter className="sm:col-span-2 flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Salvar alterações" : "Adicionar registro"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de histórico de mudanças de situação */}
      <HistoryModal
        open={!!historyMediatorId}
        onClose={() => { setHistoryMediatorId(null); setHistoryMediatorName(""); }}
        title="Histórico de Situação"
        subtitle={historyMediatorName ? `Atendente: ${historyMediatorName}` : undefined}
        entries={mediatorHistory as any[]}
        isLoading={historyLoading}
      />

      {/* Confirmação de exclusão */}
      <Dialog open={deleteTarget !== null} onOpenChange={v => { if (!v) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja remover este atendente? Esta ação não pode ser desfeita.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate({ id: deleteTarget }, { onSettled: () => setDeleteTarget(null) });
                }
              }}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
