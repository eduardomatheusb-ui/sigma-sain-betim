import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  User, School, Clock, History, ArrowRight, GraduationCap, Users,
  Calendar, FileText, AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// ─── Mapeamentos legíveis ────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  name: "Nome",
  studentName: "Nome do Aluno",
  cpf: "CPF/Certidão",
  dateOfBirth: "Data de Nascimento",
  schoolId: "Escola",
  schoolName: "Unidade Educacional",
  shift: "Turno",
  grade: "Turma",
  disability: "Deficiência/Transtorno",
  disabilities: "Deficiências",
  attendanceStatus: "Situação do Atendimento",
  attendantStatus: "Situação do Atendente",
  attendantName: "Atendente",
  isShared: "Atendimento Compartilhado",
  notes: "Observações",
  email: "E-mail",
  status: "Status",
  needsAttendant: "Necessita Atendente",
  mobilityAid: "Auxílio de Mobilidade",
  homeCare: "Atendimento Domiciliar",
  enrollmentNumber: "Matrícula",
  guardianName: "Responsável",
  guardianPhone: "Telefone do Responsável",
};

const SHIFT_LABELS: Record<string, string> = {
  full: "Integral",
  morning: "Manhã",
  afternoon: "Tarde",
  evening: "Noite",
};

const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  with_attendant: "Com atendente",
  without_attendant: "Sem atendente",
  awaiting_substitution: "Aguardando substituição",
  partially_attended: "Parcialmente atendido",
};

const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  with_attendant: "bg-green-100 text-green-800",
  without_attendant: "bg-red-100 text-red-800",
  awaiting_substitution: "bg-yellow-100 text-yellow-800",
  partially_attended: "bg-blue-100 text-blue-800",
};

function formatValue(val: string | null | undefined, field?: string): string {
  if (val === null || val === undefined || val === "") return "(vazio)";
  if (val === "true") return "Sim";
  if (val === "false") return "Não";
  // Datas ISO
  if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
    try {
      return new Date(val).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return val; }
  }
  // Datas simples
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    try {
      const [y, m, d] = val.split("-");
      return `${d}/${m}/${y}`;
    } catch { return val; }
  }
  // Turnos
  if (field === "shift") return SHIFT_LABELS[val] || val;
  // Status de atendimento
  if (field === "attendanceStatus") return ATTENDANCE_STATUS_LABELS[val] || val;
  // JSON de deficiências
  if (val.startsWith("[")) {
    try {
      const arr = JSON.parse(val) as string[];
      return arr.join(", ");
    } catch { return val; }
  }
  return val;
}

// ─── Seção de dados do perfil ────────────────────────────────────────────────

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2">
      <span className="text-xs font-medium text-muted-foreground w-40 shrink-0">{label}</span>
      <span className="text-sm">{value || <span className="text-muted-foreground italic">—</span>}</span>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

interface StudentProfileSheetProps {
  open: boolean;
  onClose: () => void;
  student: any | null;
  defaultTab?: "dados" | "historico" | "atendimentos";
}

export function StudentProfileSheet({ open, onClose, student, defaultTab = "dados" }: StudentProfileSheetProps) {
  const studentId = student?.id ?? null;

  const { data: history = [], isLoading: historyLoading } = trpc.students.getHistory.useQuery(
    { studentId: studentId! },
    { enabled: !!studentId && open }
  );

  const { data: mediatorLinks = [] } = trpc.mediators.listBySchoolId.useQuery(
    { schoolId: student?.schoolId! },
    { enabled: !!student?.schoolId && open }
  );

  if (!student) return null;

  const disabilities = student.disabilities
    ? (() => { try { return JSON.parse(student.disabilities) as string[]; } catch { return []; } })()
    : [];

  // Mediadores vinculados ao aluno
  const linkedMediators = mediatorLinks.filter((m: any) =>
    m.linkedStudents?.toLowerCase().includes(student.studentName?.toLowerCase()) ||
    m.additionalStudents?.toLowerCase().includes(student.studentName?.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        {/* Cabeçalho */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg leading-tight">{student.studentName}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{student.schoolName}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ATTENDANCE_STATUS_COLORS[student.attendanceStatus] || "bg-gray-100 text-gray-800"}`}>
                  {ATTENDANCE_STATUS_LABELS[student.attendanceStatus] || student.attendanceStatus}
                </span>
                {student.isShared && (
                  <Badge variant="outline" className="text-xs">Compartilhado</Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Abas */}
        <Tabs defaultValue={defaultTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-6 mt-4 w-auto self-start">
            <TabsTrigger value="dados" className="gap-1.5">
              <User className="h-3.5 w-3.5" /> Dados
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-1.5">
              <History className="h-3.5 w-3.5" />
              Histórico
              {history.length > 0 && (
                <span className="ml-1 bg-primary/20 text-primary text-xs rounded-full px-1.5 py-0">{history.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="atendimentos" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Atendimentos
            </TabsTrigger>
          </TabsList>

          {/* ── ABA DADOS ─────────────────────────────────────────────────── */}
          <TabsContent value="dados" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Identificação</h3>
                  <div className="divide-y">
                    <DataRow label="Nome completo" value={student.studentName} />
                    <DataRow label="CPF/Certidão" value={student.cpf ? `${student.cpf.slice(0, 3)}.***.***-**` : "—"} />
                    <DataRow label="Data de nascimento" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("pt-BR") : "—"} />
                    <DataRow label="E-mail" value={student.email} />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Escola e Turma</h3>
                  <div className="divide-y">
                    <DataRow label="Unidade educacional" value={student.schoolName} />
                    <DataRow label="Turno" value={SHIFT_LABELS[student.shift] || student.shift} />
                    <DataRow label="Turma" value={student.grade} />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Deficiências e Transtornos</h3>
                  {disabilities.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Nenhuma deficiência registrada</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {disabilities.map((d: string) => (
                        <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Atendimento</h3>
                  <div className="divide-y">
                    <DataRow label="Situação" value={
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ATTENDANCE_STATUS_COLORS[student.attendanceStatus] || "bg-gray-100 text-gray-800"}`}>
                        {ATTENDANCE_STATUS_LABELS[student.attendanceStatus] || student.attendanceStatus}
                      </span>
                    } />
                    <DataRow label="Atendente" value={student.attendantName} />
                    <DataRow label="Compartilhado" value={student.isShared ? "Sim" : "Não"} />
                    <DataRow label="Necessita atendente" value={student.needsAttendant ? "Sim" : "Não"} />
                  </div>
                </div>

                {student.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Observações</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{student.notes}</p>
                    </div>
                  </>
                )}

                <div className="pt-2 pb-4">
                  <p className="text-xs text-muted-foreground">
                    Última atualização: {new Date(student.updatedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── ABA HISTÓRICO ─────────────────────────────────────────────── */}
          <TabsContent value="historico" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full px-6 py-4">
              {historyLoading ? (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                  Carregando histórico...
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nenhuma alteração registrada</p>
                  <p className="text-xs mt-1">O histórico será registrado a partir da próxima edição.</p>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  <p className="text-xs text-muted-foreground mb-4">
                    {history.length} {history.length === 1 ? "alteração registrada" : "alterações registradas"}
                  </p>
                  {(history as any[]).map((entry: any) => {
                    const timestamp = entry.editedAt || entry.changedAt;
                    const editor = entry.editedByName || entry.changedByName || "Usuário";
                    const dateStr = timestamp
                      ? new Date(timestamp as string).toLocaleString("pt-BR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "—";
                    const fieldLabel = FIELD_LABELS[entry.fieldChanged] || entry.fieldChanged;
                    const oldFormatted = formatValue(entry.oldValue, entry.fieldChanged);
                    const newFormatted = formatValue(entry.newValue, entry.fieldChanged);

                    return (
                      <div key={entry.id} className="border rounded-lg p-3.5 bg-muted/20 hover:bg-muted/40 transition-colors">
                        {/* Cabeçalho da entrada */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2 text-sm min-w-0">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium truncate">{editor}</span>
                              <span className="text-muted-foreground"> alterou </span>
                              <Badge variant="outline" className="text-xs">{fieldLabel}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            <span>{dateStr}</span>
                          </div>
                        </div>

                        {/* Valores anterior → novo */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-100 max-w-[45%]">
                            <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                            <span className="text-xs text-red-700 line-through truncate">{oldFormatted}</span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 border border-green-100 max-w-[45%]">
                            <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                            <span className="text-xs text-green-700 font-medium truncate">{newFormatted}</span>
                          </div>
                        </div>

                        {entry.reason && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {entry.reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* ── ABA ATENDIMENTOS ──────────────────────────────────────────── */}
          <TabsContent value="atendimentos" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full px-6 py-4">
              {linkedMediators.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Nenhum atendente vinculado</p>
                  <p className="text-xs mt-1">Os atendentes são vinculados pelo módulo de Mediadores.</p>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {linkedMediators.map((m: any) => (
                    <div key={m.id} className="border rounded-lg p-3.5 bg-muted/20">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.schoolName}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge className={`text-xs ${m.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                              {m.status === "active" ? "Ativo" : m.status}
                            </Badge>
                            {m.isShared && <Badge variant="outline" className="text-xs">Compartilhado</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
