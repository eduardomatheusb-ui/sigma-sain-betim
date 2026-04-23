/**
 * Quadro de Mediadores
 * Visão consolidada: mediadores, alunos vinculados e situação por escola
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Send, FileSpreadsheet, Printer, Clock, CheckCircle2, AlertCircle, Building2, Users, GraduationCap, AlertTriangle, UserPlus, Search, X, Plus } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// ─── Constantes ─────────────────────────────────────────────────────────────

const DISABILITY_OPTIONS = [
  "Deficiência visual - baixa visão",
  "Deficiência visual - cegueira",
  "Visão monocular",
  "Deficiência auditiva - surdez",
  "Deficiência auditiva - baixa audição",
  "Surdocegueira",
  "Deficiência sensorial",
  "Deficiência física",
  "Deficiência intelectual",
  "Síndrome de Down",
  "TEA - Transtorno do Espectro Autista",
  "TDAH - Transtorno de Déficit de Atenção e Hiperatividade",
  "TOD - Transtorno Opositor Desafiador",
  "TPAC - Transtorno do Processamento Auditivo Central",
  "TAG - Transtorno de Ansiedade Generalizada",
  "Dislexia",
  "Disgrafia",
  "Discalculia",
  "Altas habilidades/superdotação",
  "Em hipótese diagnóstica (em avaliação)",
  "P300 - potencial evocado auditivo",
  "Outro",
];

type FormData = {
  email: string;
  schoolName: string;
  studentName: string;
  dateOfBirth: string;
  cpf: string;
  shift: "morning" | "afternoon" | "full" | "evening";
  grade: string;
  disabilities: string[];
  attendanceStatus: "with_attendant" | "without_attendant" | "awaiting_substitution" | "partially_attended";
  attendantStatus: "active" | "inactive";
  hasAttendant: boolean;
  attendantName: string;
  isShared: boolean;
  notes: string;
  needsAttendant: "yes" | "no" | "nam";
};

type SharedStudentData = {
  studentName: string;
  dateOfBirth: string;
  cpf: string;
  grade: string;
  disabilities: string[];
  existingId?: number;
};

const EMPTY_FORM: FormData = {
  email: "",
  schoolName: "",
  studentName: "",
  dateOfBirth: "",
  cpf: "",
  shift: "full",
  grade: "",
  disabilities: [],
  attendanceStatus: "without_attendant",
  attendantStatus: "active",
  hasAttendant: false,
  attendantName: "",
  isShared: false,
  notes: "",
  needsAttendant: "yes",
};

const EMPTY_SHARED: SharedStudentData = {
  studentName: "",
  dateOfBirth: "",
  cpf: "",
  grade: "",
  disabilities: [],
};

// ─── Componente principal ────────────────────────────────────────────────────

export default function Cadastros() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin";
  const userSchoolId = (user as any)?.schoolId;

  // Seleção de escola (admin escolhe, escola usa a própria)
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(
    isAdmin ? null : userSchoolId || null
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitNotes, setSubmitNotes] = useState("");

  // Dialog de cadastro/edição de aluno
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [editingDemandId, setEditingDemandId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [sharedStudent, setSharedStudent] = useState<SharedStudentData>(EMPTY_SHARED);
  const [sharedStudentSearch, setSharedStudentSearch] = useState("");
  const [showSharedStudentDropdown, setShowSharedStudentDropdown] = useState(false);
  const [sharedStudentMode, setSharedStudentMode] = useState<"search" | "new">("search");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [attendantSearch, setAttendantSearch] = useState("");
  const [showAttendantDropdown, setShowAttendantDropdown] = useState(false);
  
  // Filtro por turno
  const [filterShift, setFilterShift] = useState<"all" | "morning" | "afternoon" | "full" | "evening">("all");

  // Dados
  const { data: schoolList } = trpc.schools.list.useQuery(undefined, { enabled: isAdmin });
  const { data: schools = [] } = trpc.schools.list.useQuery();

  const { data: quadro, isLoading, refetch } = trpc.quadroAAP.generate.useQuery(
    { schoolId: selectedSchoolId! },
    { enabled: !!selectedSchoolId }
  );

  const { data: history } = trpc.quadroAAP.history.useQuery(
    { schoolId: selectedSchoolId! },
    { enabled: !!selectedSchoolId }
  );

  // Mediadores da escola selecionada no formulário
  const formSchoolId = useMemo(() => {
    if (!form.schoolName) return null;
    const found = schools.find((s) => s.name === form.schoolName);
    return found?.id ?? null;
  }, [form.schoolName, schools]);

  const { data: mediatorsList = [] } = trpc.mediators.listBySchoolId.useQuery(
    { schoolId: formSchoolId! },
    { enabled: !!formSchoolId }
  );
  const mediatorNames = useMemo(() => mediatorsList.map((m: any) => m.name), [mediatorsList]);

  // Busca de alunos existentes para atendimento compartilhado
  const { data: existingStudents = [] } = trpc.demands.searchStudents.useQuery(
    { query: sharedStudentSearch },
    { enabled: sharedStudentSearch.length >= 2 }
  );

  // Escolas filtradas para autocomplete
  const filteredSchools = useMemo(() => {
    if (!schoolSearch) return schools;
    return schools.filter((s) => s.name.toLowerCase().includes(schoolSearch.toLowerCase()));
  }, [schools, schoolSearch]);

  // Mediadores filtrados para autocomplete
  const filteredAttendants = useMemo(() => {
    if (!attendantSearch) return mediatorNames;
    return mediatorNames.filter((n: string) => n.toLowerCase().includes(attendantSearch.toLowerCase()));
  }, [mediatorNames, attendantSearch]);

  // Mutations
  const createMutation = trpc.demands.create.useMutation({
    onSuccess: () => {
      toast.success("Aluno cadastrado com sucesso!");
      resetStudentForm();
      setShowStudentDialog(false);
      setEditingDemandId(null);
      utils.demands.list.invalidate();
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.demands.update.useMutation({
    onSuccess: () => {
      toast.success("Aluno atualizado com sucesso!");
      resetStudentForm();
      setShowStudentDialog(false);
      setEditingDemandId(null);
      utils.demands.list.invalidate();
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const submitMutation = trpc.quadroAAP.submit.useMutation({
    onSuccess: (data) => {
      toast.success(`Quadro enviado com sucesso! Semana: ${data.weekReference}`);
      setShowSubmitDialog(false);
      setSubmitNotes("");
      refetch();
    },
    onError: () => toast.error("Erro ao enviar quadro"),
  });

  const resetStudentForm = () => {
    setForm({ ...EMPTY_FORM, schoolName: quadro?.school?.name || "" });
    setSchoolSearch(quadro?.school?.name || "");
    setAttendantSearch("");
    setSharedStudent(EMPTY_SHARED);
    setSharedStudentSearch("");
  };

  const openStudentDialog = () => {
    setEditingDemandId(null);
    const schoolName = quadro?.school?.name || "";
    setForm({ ...EMPTY_FORM, schoolName });
    setSchoolSearch(schoolName);
    setAttendantSearch("");
    setSharedStudent(EMPTY_SHARED);
    setSharedStudentSearch("");
    setShowStudentDialog(true);
  };

  const openEditDialog = (demand: any) => {
    setEditingDemandId(demand.id);
    setForm({
      email: demand.email || "",
      schoolName: demand.schoolName,
      studentName: demand.studentName,
      dateOfBirth: demand.dateOfBirth ? new Date(demand.dateOfBirth).toISOString().split("T")[0] : "",
      cpf: demand.cpf || "",
      shift: demand.shift,
      grade: demand.grade || "",
      disabilities: demand.disabilities ? JSON.parse(demand.disabilities) : [],
      attendanceStatus: demand.attendanceStatus,
      attendantStatus: demand.attendantStatus,
      hasAttendant: demand.hasAttendant,
      attendantName: demand.attendantName || "",
      isShared: demand.isShared,
      notes: demand.notes || "",
      needsAttendant: demand.needsAttendant || "yes",
    });
    setSchoolSearch(demand.schoolName);
    setAttendantSearch(demand.attendantName || "");
    setSharedStudent(EMPTY_SHARED);
    setSharedStudentSearch("");
    setShowStudentDialog(true);
  };

  const checkDuplicateSubmission = () => {
    if (!history || history.length === 0) return null;
    const lastSubmission = history[0];
    const lastDate = new Date(lastSubmission.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return `Quadro já foi enviado em ${lastDate.toLocaleDateString("pt-BR")} (${daysDiff} dia(s) atrás). Deseja enviar novamente?`;
    }
    return null;
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.schoolName) {
      toast.error("Preencha os campos obrigatórios: Nome do aluno e Unidade educacional.");
      return;
    }
    if (form.disabilities.length === 0) {
      toast.error("Selecione ao menos uma deficiência/transtorno.");
      return;
    }
    if (form.isShared && !sharedStudent.studentName) {
      toast.error("Informe o nome do segundo aluno para o atendimento compartilhado.");
      return;
    }

    let notes = form.notes;
    if (form.isShared && sharedStudent.studentName) {
      const sharedInfo = [
        `2º ALUNO VINCULADO: ${sharedStudent.studentName}`,
        sharedStudent.cpf ? `CPF/Certidão: ${sharedStudent.cpf}` : null,
        sharedStudent.grade ? `Turma: ${sharedStudent.grade}` : null,
        sharedStudent.disabilities.length > 0 ? `Deficiências: ${sharedStudent.disabilities.join(", ")}` : null,
      ].filter(Boolean).join(" | ");
      notes = notes ? `${notes}\n${sharedInfo}` : sharedInfo;
    }

    const payload = {
      email: form.email || undefined,
      schoolName: form.schoolName,
      studentName: form.studentName,
      dateOfBirth: form.dateOfBirth || undefined,
      cpf: form.cpf || undefined,
      shift: form.shift,
      grade: form.grade || undefined,
      disabilities: form.disabilities,
      attendanceStatus: form.attendanceStatus,
      attendantStatus: form.attendantStatus,
      hasAttendant: form.hasAttendant,
      attendantName: form.hasAttendant ? form.attendantName || undefined : undefined,
      isShared: form.isShared,
      notes: notes || undefined,
      needsAttendant: form.needsAttendant,
    };

    if (editingDemandId !== null) {
      updateMutation.mutate({ id: editingDemandId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleDisability = (d: string) =>
    setForm((prev) => ({
      ...prev,
      disabilities: prev.disabilities.includes(d)
        ? prev.disabilities.filter((x) => x !== d)
        : [...prev.disabilities, d],
    }));

  const toggleSharedDisability = (d: string) =>
    setSharedStudent((prev) => ({
      ...prev,
      disabilities: prev.disabilities.includes(d)
        ? prev.disabilities.filter((x) => x !== d)
        : [...prev.disabilities, d],
    }));

  const handleSubmitQuadro = () => {
    if (!selectedSchoolId) return;
    submitMutation.mutate({ schoolId: selectedSchoolId, notes: submitNotes || undefined });
  };

  const handleExportExcel = () => {
    if (!quadro?.rows || !quadro.school) return;
    const headerRows: (string | number)[][] = [
      [`QUADRO DE MEDIADORES — ${quadro.school.name}`],
      [`Data: ${quadro.date}`],
      [],
      ["Nº", "Mediador", "Turno", "Situação", "Aluno Atendido", "Ano/Turma", "Deficiência"],
    ];
    const dataRows: (string | number)[][] = [];
    for (const row of quadro.rows) {
      for (let i = 0; i < row.alunos.length; i++) {
        const al = row.alunos[i];
        dataRows.push([
          i === 0 ? String(row.numero).padStart(2, "0") : "",
          i === 0 ? row.nomeAAP : "",
          i === 0 ? [row.turno1 ? "Manhã" : "", row.turno2 ? "Tarde" : ""].filter(Boolean).join("/") : "",
          i === 0 ? getStatusLabel(row.status) : "",
          al.nome,
          al.anoTurma,
          al.deficiencia,
        ]);
      }
    }
    const summaryRows: (string | number)[][] = [
      [],
      ["Resumo"],
      ["Total de Mediadores", quadro.totalMediadores],
      ["Total de Alunos", quadro.totalAlunos],
      ["Alunos sem Mediador", quadro.totalSemAtendente],
    ];
    const allRows = [...headerRows, ...dataRows, ...summaryRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 22 }, { wch: 30 }, { wch: 12 }, { wch: 25 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quadro de Mediadores");
    XLSX.writeFile(wb, `Quadro_Mediadores_${quadro.school.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Excel exportado com sucesso!");
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: "Ativo",
      inactive: "Inativo",
      on_leave: "Afastado",
      temp_leave: "Licença",
      sem_atendente: "Sem mediador",
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      active: "text-green-700 bg-green-50",
      inactive: "text-red-700 bg-red-50",
      on_leave: "text-amber-700 bg-amber-50",
      temp_leave: "text-orange-700 bg-orange-50",
      sem_atendente: "text-red-700 bg-red-50",
    };
    return map[status] || "text-gray-700 bg-gray-50";
  };

  const lastSubmission = history?.[0];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quadro de Mediadores</h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada dos mediadores, alunos vinculados e situação por escola
          </p>
        </div>
        {isAdmin && (
          <Select
            value={selectedSchoolId ? String(selectedSchoolId) : ""}
            onValueChange={(v) => setSelectedSchoolId(Number(v))}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecionar escola..." />
            </SelectTrigger>
            <SelectContent>
              {schoolList?.map((s: any) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Estado vazio */}
      {!selectedSchoolId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Building2 className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Selecione uma escola para visualizar o quadro</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {selectedSchoolId && isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </CardContent>
        </Card>
      )}

      {selectedSchoolId && quadro && quadro.school && (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-muted-foreground">Mediadores</p>
                </div>
                <p className="text-2xl font-bold">{quadro.totalMediadores}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-muted-foreground">Alunos</p>
                </div>
                <p className="text-2xl font-bold">{quadro.totalAlunos}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <p className="text-xs text-muted-foreground">Sem mediador</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">{quadro.totalSemAtendente}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  {lastSubmission ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <p className="text-xs text-muted-foreground">Envio</p>
                </div>
                <p className="text-sm font-medium">
                  {lastSubmission
                    ? `Enviado ${new Date(lastSubmission.createdAt).toLocaleDateString("pt-BR")}`
                    : "Pendente"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2 flex-wrap print:hidden">
            <Button variant="outline" onClick={openStudentDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Aluno
            </Button>
            {!isAdmin && (
              <Button onClick={() => setShowSubmitDialog(true)} className="bg-blue-700 hover:bg-blue-800">
                <Send className="h-4 w-4 mr-2" />
                Enviar para SAIN
              </Button>
            )}
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Select value={filterShift} onValueChange={(v: any) => setFilterShift(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filtrar por turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os turnos</SelectItem>
                <SelectItem value="morning">Manhã</SelectItem>
                <SelectItem value="afternoon">Tarde</SelectItem>
                <SelectItem value="full">Integral</SelectItem>
                <SelectItem value="evening">Noite</SelectItem>
              </SelectContent>
            </Select>
            {history && history.length > 0 && (
              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {history.length} envio(s)
              </div>
            )}
          </div>

          {/* Tabela do Quadro */}
          <div className="border rounded-lg bg-white overflow-x-auto" id="quadro-mediadores">
            <div className="p-4 border-b bg-slate-50 print:bg-white">
              <p className="font-semibold text-lg">{quadro.school.name}</p>
              <p className="text-sm text-muted-foreground">{quadro.date}</p>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border px-3 py-2 text-center font-semibold w-12">Nº</th>
                  <th className="border px-3 py-2 text-left font-semibold min-w-[180px]">Mediador</th>
                  <th className="border px-3 py-2 text-center font-semibold w-24">Turno</th>
                  <th className="border px-3 py-2 text-center font-semibold w-28">Situação</th>
                  <th className="border px-3 py-2 text-left font-semibold min-w-[200px]">Aluno Atendido</th>
                  <th className="border px-3 py-2 text-center font-semibold w-24">Ano/Turma</th>
                  <th className="border px-3 py-2 text-left font-semibold min-w-[160px]">Deficiência</th>
                  <th className="border px-3 py-2 text-center font-semibold w-12 print:hidden">Ações</th>
                </tr>
              </thead>
              <tbody>
                {quadro.rows
                  .filter((row: any) => {
                    if (filterShift === "all") return true;
                    if (filterShift === "morning") return row.turno1;
                    if (filterShift === "afternoon") return row.turno2;
                    if (filterShift === "full") return row.turno1 && row.turno2;
                    if (filterShift === "evening") return !row.turno1 && !row.turno2;
                    return true;
                  })
                  .map((row: any) =>
                  row.alunos.map((aluno: any, idx: number) => (
                    <tr
                      key={`${row.numero}-${idx}`}
                      className={`${
                        row.status === "sem_atendente"
                          ? "bg-amber-50"
                          : row.nomeAAP === "NÃO NECESSITA"
                          ? "bg-gray-50"
                          : idx % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50/50"
                      } hover:bg-blue-50/50 transition-colors`}
                    >
                      {idx === 0 && (
                        <>
                          <td rowSpan={row.alunos.length} className="border px-3 py-2 text-center font-medium align-top">
                            {String(row.numero).padStart(2, "0")}
                          </td>
                          <td rowSpan={row.alunos.length} className="border px-3 py-2 align-top font-medium">
                            {row.nomeAAP}
                          </td>
                          <td rowSpan={row.alunos.length} className="border px-3 py-2 text-center align-top text-xs">
                            {[row.turno1 ? "Manhã" : "", row.turno2 ? "Tarde" : ""].filter(Boolean).join(" / ") || "-"}
                          </td>
                          <td rowSpan={row.alunos.length} className="border px-3 py-2 text-center align-top">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(row.status)}`}>
                              {getStatusLabel(row.status)}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="border px-3 py-2">{aluno.nome}</td>
                      <td className="border px-3 py-2 text-center">{aluno.anoTurma}</td>
                      <td className="border px-3 py-2 text-sm">{aluno.deficiencia || "-"}</td>
                      {idx === 0 && (
                        <td rowSpan={row.alunos.length} className="border px-3 py-2 text-center print:hidden">
                          <button
                            onClick={() => {
                              if (aluno.id && aluno.id > 0) {
                                openEditDialog({ id: aluno.id, studentName: aluno.nome, grade: aluno.anoTurma, schoolName: quadro?.school?.name });
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            title="Editar aluno"
                          >
                            ✎ Editar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
                {quadro.rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="border px-4 py-8 text-center text-muted-foreground">
                      Nenhum registro encontrado. Cadastre alunos e mediadores para gerar o quadro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Rodapé com resumo */}
            <div className="p-4 border-t bg-slate-50 flex gap-6 text-sm">
              <span><strong>Total de mediadores:</strong> {quadro.totalMediadores}</span>
              <span><strong>Total de alunos:</strong> {quadro.totalAlunos}</span>
              <span className="text-amber-700"><strong>Sem mediador:</strong> {quadro.totalSemAtendente}</span>
            </div>
          </div>

          {/* Histórico de envios */}
          {history && history.length > 0 && (
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Envios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.map((h: any) => (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                      <div>
                        <p className="font-medium">{h.weekReference}</p>
                        <p className="text-sm text-muted-foreground">
                          Enviado por {h.submittedByName} em{" "}
                          {new Date(h.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                        {h.notes && <p className="text-sm mt-1 italic">{h.notes}</p>}
                      </div>
                      <Badge variant={h.status === "validated" ? "default" : h.status === "rejected" ? "destructive" : "secondary"}>
                        {h.status === "submitted" ? "Enviado" : h.status === "validated" ? "Validado" : "Rejeitado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── Dialog: Cadastrar Aluno ─────────────────────────────────────────── */}
      <Dialog open={showStudentDialog} onOpenChange={(open) => { setShowStudentDialog(open); if (!open) resetStudentForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Cadastrar Aluno
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do aluno. Os campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            {/* E-mail + Unidade educacional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="s-email">E-mail</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              {isAdmin ? (
                <div className="space-y-1 relative">
                  <Label>Unidade educacional *</Label>
                  <Input
                    value={schoolSearch}
                    onChange={(e) => { setSchoolSearch(e.target.value); setForm({ ...form, schoolName: e.target.value }); setShowSchoolDropdown(true); }}
                    onFocus={() => setShowSchoolDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                    placeholder="Selecione ou digite a unidade educacional"
                  />
                  {showSchoolDropdown && filteredSchools.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredSchools.slice(0, 20).map((school) => (
                        <button key={school.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                          onMouseDown={() => { setSchoolSearch(school.name); setForm({ ...form, schoolName: school.name }); setShowSchoolDropdown(false); }}>
                          {school.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>Unidade educacional</Label>
                  <Input value={schools.find(s => s.id === user?.schoolId)?.name || "Carregando..."} disabled className="bg-muted" />
                </div>
              )}
            </div>

            {/* Nome do aluno */}
            <div className="space-y-1">
              <Label htmlFor="s-studentName">Nome completo do aluno *</Label>
              <Input id="s-studentName" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Nome completo do aluno" />
            </div>

            {/* Data de nascimento + CPF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="s-dob">Data de nascimento</Label>
                <Input id="s-dob" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="s-cpf">CPF ou certidão</Label>
                <Input id="s-cpf" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
              </div>
            </div>

            {/* Turno + Turma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Turno *</Label>
                <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v as FormData["shift"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Integral</SelectItem>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                    <SelectItem value="evening">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="s-grade">Turma</Label>
                <Input id="s-grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="Ex: 3º ano A" />
              </div>
            </div>

            {/* Deficiências */}
            <div className="space-y-2">
              <Label>Deficiência/Transtorno *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border rounded-md p-3 bg-muted/30 max-h-48 overflow-y-auto">
                {DISABILITY_OPTIONS.map((disability) => (
                  <div key={disability} className="flex items-center gap-2">
                    <Checkbox id={`s-dis-${disability}`} checked={form.disabilities.includes(disability)} onCheckedChange={() => toggleDisability(disability)} />
                    <label htmlFor={`s-dis-${disability}`} className="text-sm cursor-pointer">{disability}</label>
                  </div>
                ))}
              </div>
              {form.disabilities.length > 0 && (
                <p className="text-xs text-muted-foreground">Selecionado(s): {form.disabilities.join(", ")}</p>
              )}
            </div>

            {/* Situação do atendimento + situação do atendente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Situação do atendimento *</Label>
                <Select value={form.attendanceStatus} onValueChange={(v) => setForm({ ...form, attendanceStatus: v as FormData["attendanceStatus"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="with_attendant">Com atendente</SelectItem>
                    <SelectItem value="without_attendant">Sem atendente</SelectItem>
                    <SelectItem value="awaiting_substitution">Aguardando substituição</SelectItem>
                    <SelectItem value="partially_attended">Parcialmente atendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Situação do atendente *</Label>
                <Select value={form.attendantStatus} onValueChange={(v) => setForm({ ...form, attendantStatus: v as FormData["attendantStatus"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* O aluno possui atendente? */}
            <div className="space-y-1">
              <Label>O aluno possui atendente? *</Label>
              <Select value={form.hasAttendant ? "yes" : "no"} onValueChange={(v) => setForm({ ...form, hasAttendant: v === "yes", attendantName: v === "no" ? "" : form.attendantName })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="no">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mediador */}
            {form.hasAttendant && (
              <div className="space-y-1 relative">
                <Label htmlFor="s-attendant">Mediador (atendente)</Label>
                <Input
                  id="s-attendant"
                  value={attendantSearch || form.attendantName}
                  onChange={(e) => { setAttendantSearch(e.target.value); setForm({ ...form, attendantName: e.target.value }); setShowAttendantDropdown(true); }}
                  onFocus={() => setShowAttendantDropdown(true)}
                  onBlur={() => setTimeout(() => setShowAttendantDropdown(false), 200)}
                  placeholder="Selecione um mediador cadastrado na escola"
                />
                {showAttendantDropdown && filteredAttendants.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredAttendants.map((name: string) => (
                      <button key={name} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                        onMouseDown={() => { setAttendantSearch(name); setForm({ ...form, attendantName: name }); setShowAttendantDropdown(false); }}>
                        {name}
                      </button>
                    ))}
                  </div>
                )}
                {mediatorNames.length > 0 ? (
                  <p className="text-xs text-muted-foreground">{mediatorNames.length} mediador(es) cadastrado(s) na escola.</p>
                ) : (
                  <p className="text-xs text-amber-600">Nenhum mediador cadastrado nesta escola. Cadastre primeiro na aba Mediadores.</p>
                )}
              </div>
            )}

            {/* Atendimento compartilhado */}
            <div className="space-y-1">
              <Label>O atendente é compartilhado? *</Label>
              <Select value={form.isShared ? "yes" : "no"} onValueChange={(v) => { setForm({ ...form, isShared: v === "yes" }); if (v === "no") { setSharedStudent(EMPTY_SHARED); setSharedStudentSearch(""); } }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="no">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Segundo aluno (compartilhado) */}
            {form.isShared && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      2º Aluno vinculado ao atendente compartilhado
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant={sharedStudentMode === "search" ? "default" : "outline"} onClick={() => setSharedStudentMode("search")} className="text-xs h-7">Buscar existente</Button>
                      <Button type="button" size="sm" variant={sharedStudentMode === "new" ? "default" : "outline"} onClick={() => setSharedStudentMode("new")} className="text-xs h-7">Novo cadastro</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sharedStudentMode === "search" ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={sharedStudentSearch}
                          onChange={(e) => { setSharedStudentSearch(e.target.value); setShowSharedStudentDropdown(true); }}
                          onFocus={() => setShowSharedStudentDropdown(true)}
                          onBlur={() => setTimeout(() => setShowSharedStudentDropdown(false), 200)}
                          placeholder="Buscar aluno pelo nome..."
                          className="pl-8"
                        />
                        {showSharedStudentDropdown && existingStudents.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {existingStudents.map((s) => (
                              <button key={s.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                                onMouseDown={() => { setSharedStudent({ studentName: s.studentName, dateOfBirth: "", cpf: s.cpf || "", grade: "", disabilities: [], existingId: s.id }); setSharedStudentSearch(s.studentName); setShowSharedStudentDropdown(false); }}>
                                <div className="font-medium">{s.studentName}</div>
                                <div className="text-xs text-muted-foreground">{s.schoolName}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {sharedStudent.studentName && (
                        <div className="flex items-center gap-2 p-2 bg-blue-100 rounded-md">
                          <span className="text-sm font-medium text-blue-800">{sharedStudent.studentName}</span>
                          {sharedStudent.cpf && <span className="text-xs text-blue-600">CPF: {sharedStudent.cpf}</span>}
                          <button type="button" onClick={() => { setSharedStudent(EMPTY_SHARED); setSharedStudentSearch(""); }} className="ml-auto text-blue-600 hover:text-blue-800">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {sharedStudentSearch.length >= 2 && existingStudents.length === 0 && (
                        <p className="text-xs text-muted-foreground">Nenhum aluno encontrado. Use "Novo cadastro" para registrar.</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome completo do aluno *</Label>
                        <Input value={sharedStudent.studentName} onChange={(e) => setSharedStudent({ ...sharedStudent, studentName: e.target.value })} placeholder="Nome completo" className="h-8 text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Data de nascimento</Label>
                          <Input type="date" value={sharedStudent.dateOfBirth} onChange={(e) => setSharedStudent({ ...sharedStudent, dateOfBirth: e.target.value })} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">CPF ou certidão</Label>
                          <Input value={sharedStudent.cpf} onChange={(e) => setSharedStudent({ ...sharedStudent, cpf: e.target.value })} placeholder="000.000.000-00" className="h-8 text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Turma</Label>
                        <Input value={sharedStudent.grade} onChange={(e) => setSharedStudent({ ...sharedStudent, grade: e.target.value })} placeholder="Ex: 3º ano B" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Deficiências/Transtornos</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 border border-border rounded-md p-2 bg-white max-h-32 overflow-y-auto">
                          {DISABILITY_OPTIONS.map((disability) => (
                            <div key={disability} className="flex items-center gap-1.5">
                              <Checkbox id={`s2-dis-${disability}`} checked={sharedStudent.disabilities.includes(disability)} onCheckedChange={() => toggleSharedDisability(disability)} className="h-3 w-3" />
                              <label htmlFor={`s2-dis-${disability}`} className="text-xs cursor-pointer">{disability}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Necessita de mediador? */}
            <div className="space-y-1">
              <Label>Necessita de mediador?</Label>
              <Select value={form.needsAttendant} onValueChange={(v) => setForm({ ...form, needsAttendant: v as "yes" | "no" | "nam" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="no">Não necessita</SelectItem>
                  <SelectItem value="nam">NAM (Não Atendido por Mediador)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observação */}
            <div className="space-y-1">
              <Label htmlFor="s-notes">Observação geral</Label>
              <Textarea id="s-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observações adicionais..." rows={3} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowStudentDialog(false); resetStudentForm(); }}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Cadastrar aluno"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Enviar para SAIN ────────────────────────────────────────── */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Quadro de Mediadores para SAIN</DialogTitle>
            <DialogDescription>
              O quadro atual será registrado e enviado para a Secretaria Adjunta de Inclusão.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {checkDuplicateSubmission() && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <p className="font-medium">⚠️ Aviso</p>
                <p>{checkDuplicateSubmission()}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Observações (opcional)</label>
              <Textarea value={submitNotes} onChange={(e) => setSubmitNotes(e.target.value)} placeholder="Informações adicionais sobre alterações, vagas, etc." rows={3} />
            </div>
            {quadro && (
              <div className="p-3 rounded-lg bg-blue-50 text-sm">
                <p><strong>Escola:</strong> {quadro.school?.name}</p>
                <p><strong>Mediadores:</strong> {quadro.totalMediadores} | <strong>Alunos:</strong> {quadro.totalAlunos} | <strong>Sem mediador:</strong> {quadro.totalSemAtendente}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmitQuadro} disabled={submitMutation.isPending} className="bg-blue-700 hover:bg-blue-800">
              {submitMutation.isPending ? "Enviando..." : "Confirmar Envio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #quadro-mediadores, #quadro-mediadores * { visibility: visible; }
          #quadro-mediadores { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
