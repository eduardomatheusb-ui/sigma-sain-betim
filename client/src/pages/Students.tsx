import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { GraduationCap, Pencil, Trash2, Download, Search, UserPlus, X, History } from "lucide-react";
import { HistoryModal } from "@/components/HistoryModal";
import { StudentProfileSheet } from "@/components/StudentProfileSheet";

// Lista completa de deficiências/transtornos (idêntica ao Netlify)
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

const DISABILITY_GROUPS: { label: string; options: string[] }[] = [
  {
    label: "Deficiências Visuais",
    options: ["Deficiência visual - baixa visão", "Deficiência visual - cegueira", "Visão monocular"],
  },
  {
    label: "Deficiências Auditivas",
    options: ["Deficiência auditiva - surdez", "Deficiência auditiva - baixa audição", "Surdocegueira", "Deficiência sensorial"],
  },
  {
    label: "Deficiências Físicas e Intelectuais",
    options: ["Deficiência física", "Deficiência intelectual", "Síndrome de Down"],
  },
  {
    label: "Transtornos do Neurodesenvolvimento",
    options: ["TEA - Transtorno do Espectro Autista", "TDAH - Transtorno de Déficit de Atenção e Hiperatividade", "TOD - Transtorno Opositor Desafiador"],
  },
  {
    label: "Transtornos de Aprendizagem e Ansiedade",
    options: ["Dislexia", "Disgrafia", "Discalculia", "TPAC - Transtorno do Processamento Auditivo Central", "TAG - Transtorno de Ansiedade Generalizada"],
  },
  {
    label: "Outros",
    options: ["Altas habilidades/superdotação", "Em hipótese diagnóstica (em avaliação)", "P300 - potencial evocado auditivo", "Outro"],
  },
];

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

type FormData = {
  email: string;
  schoolId: number | null;
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
  schoolId: null,
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

export default function Students() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Dados
  const { data: demands = [], isLoading } = trpc.demands.list.useQuery();
  const { data: schools = [] } = trpc.schools.list.useQuery();

  // Estado do formulário
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  // Usar schoolId diretamente do formulário (ou da escola do usuário se for school_user)
  const selectedSchoolId = useMemo(() => {
    if (user?.role === "admin") return form.schoolId;
    return user?.schoolId ?? null;
  }, [form.schoolId, user?.schoolId, user?.role]);

  // Buscar mediadores da escola selecionada no formulário (reativo)
  const { data: mediatorsList = [] } = trpc.mediators.listBySchoolId.useQuery(
    { schoolId: selectedSchoolId! },
    { enabled: !!selectedSchoolId }
  );
  const mediatorNames = useMemo(() => mediatorsList.map((m: any) => m.name), [mediatorsList]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [attendantSearch, setAttendantSearch] = useState("");
  const [showAttendantDropdown, setShowAttendantDropdown] = useState(false);
  const [sharedStudent, setSharedStudent] = useState<SharedStudentData>(EMPTY_SHARED);
  const [sharedStudentSearch, setSharedStudentSearch] = useState("");
  const [showSharedStudentDropdown, setShowSharedStudentDropdown] = useState(false);
  const [sharedStudentMode, setSharedStudentMode] = useState<"search" | "new">("search");

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSchool, setFilterSchool] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Paginação
  const [studentsPage, setStudentsPage] = useState(1);
  const STUDENTS_PAGE_SIZE = 20;

  // Histórico de alterações (modal legado)
  const [historyDemandId, setHistoryDemandId] = useState<number | null>(null);
  const [historyStudentName, setHistoryStudentName] = useState("");
  const { data: studentHistory = [], isLoading: historyLoading } = trpc.students.getHistory.useQuery(
    { studentId: historyDemandId! },
    { enabled: !!historyDemandId }
  );

  // Perfil do aluno com abas
  const [profileStudent, setProfileStudent] = useState<any | null>(null);
  const [profileDefaultTab, setProfileDefaultTab] = useState<"dados" | "historico" | "atendimentos">("dados");

  // Busca de alunos existentes para atendimento compartilhado
  const { data: existingStudents = [] } = trpc.demands.searchStudents.useQuery(
    { query: sharedStudentSearch },
    { enabled: sharedStudentSearch.length >= 2 }
  );

  // Admin check
  const isAdmin = user?.role === "admin";

  // Mutations
  const createMutation = trpc.demands.create.useMutation({
    onSuccess: () => {
      toast.success("Registro cadastrado com sucesso!");
      setForm(EMPTY_FORM);
      setSchoolSearch("");
      setAttendantSearch("");
      setSharedStudent(EMPTY_SHARED);
      setSharedStudentSearch("");
      utils.demands.list.invalidate();
      utils.demands.listAttendants.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.demands.update.useMutation({
    onSuccess: () => {
      toast.success("Registro atualizado com sucesso!");
      setEditingId(null);
      setForm(EMPTY_FORM);
      setSchoolSearch("");
      setAttendantSearch("");
      setSharedStudent(EMPTY_SHARED);
      setSharedStudentSearch("");
      utils.demands.list.invalidate();
      utils.demands.listAttendants.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.demands.delete.useMutation({
    onSuccess: () => {
      toast.success("Registro excluído com sucesso!");
      setShowDeleteDialog(false);
      setDeletingId(null);
      utils.demands.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Escolas filtradas para autocomplete
  const filteredSchools = useMemo(() => {
    if (!schoolSearch) return schools;
    return schools.filter((s) =>
      s.name.toLowerCase().includes(schoolSearch.toLowerCase())
    );
  }, [schools, schoolSearch]);

  // Mediadores filtrados para autocomplete de atendente
  const filteredAttendants = useMemo(() => {
    if (!attendantSearch) return mediatorNames;
    return mediatorNames.filter((n: string) =>
      n.toLowerCase().includes(attendantSearch.toLowerCase())
    );
  }, [mediatorNames, attendantSearch]);

  // Registros filtrados
  const filteredDemands = useMemo(() => {
    return demands.filter((d) => {
      if (filterSchool !== "all" && d.schoolName !== filterSchool) return false;
      if (filterShift !== "all" && d.shift !== filterShift) return false;
      if (filterStatus !== "all" && d.attendanceStatus !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          d.studentName.toLowerCase().includes(q) ||
          d.schoolName.toLowerCase().includes(q) ||
          (d.attendantName && d.attendantName.toLowerCase().includes(q)) ||
          (d.email && d.email.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [demands, searchQuery, filterSchool, filterShift, filterStatus]);

  // Escolas únicas para o filtro
  const uniqueSchools = useMemo(() => {
    return Array.from(new Set(demands.map((d) => d.schoolName))).sort();
  }, [demands]);

  // Paginação de alunos
  const studentsTotalPages = Math.max(1, Math.ceil(filteredDemands.length / STUDENTS_PAGE_SIZE));
  const paginatedDemands = filteredDemands.slice(
    (studentsPage - 1) * STUDENTS_PAGE_SIZE,
    studentsPage * STUDENTS_PAGE_SIZE
  );
  useEffect(() => { setStudentsPage(1); }, [searchQuery, filterSchool, filterShift, filterStatus]);

  const toggleDisability = (disability: string) => {
    setForm((prev) => ({
      ...prev,
      disabilities: prev.disabilities.includes(disability)
        ? prev.disabilities.filter((d) => d !== disability)
        : [...prev.disabilities, disability],
    }));
  };

  const toggleSharedDisability = (disability: string) => {
    setSharedStudent((prev) => ({
      ...prev,
      disabilities: prev.disabilities.includes(disability)
        ? prev.disabilities.filter((d) => d !== disability)
        : [...prev.disabilities, disability],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Para school_user, preencher schoolName automaticamente se não estiver preenchido
    let finalSchoolName = form.schoolName;
    if (!isAdmin && !finalSchoolName && user?.schoolId) {
      const userSchool = schools.find(s => s.id === user.schoolId);
      finalSchoolName = userSchool?.name || "";
    }
    
    if (!form.studentName?.trim() || !finalSchoolName?.trim()) {
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
      schoolName: finalSchoolName,
      studentName: form.studentName.trim(),
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

    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (demand: typeof demands[0]) => {
    setEditingId(demand.id);
    const schoolId = schools.find(s => s.name === demand.schoolName)?.id || null;
    setForm({
      email: demand.email || "",
      schoolId,
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
      needsAttendant: (demand as any).needsAttendant || "yes",
    });
    setSchoolSearch(demand.schoolName);
    setAttendantSearch(demand.attendantName || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSchoolSearch("");
    setAttendantSearch("");
    setSharedStudent(EMPTY_SHARED);
    setSharedStudentSearch("");
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deletingId !== null) deleteMutation.mutate({ id: deletingId });
  };

  const maskCPF = (cpf: string) => {
    if (!cpf) return "";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length === 11) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`.replace(/\d(?=\d{2})/g, (_, i) => i < 7 ? "*" : _);
    return cpf.replace(/./g, (c, i) => (i > 1 && i < cpf.length - 2) ? "*" : c);
  };

  const exportCSV = () => {
    const headers = ["Aluno", "CPF/Certidão", "Unidade", "Turno", "Turma", "Deficiências", "Situação", "Situação Atendente", "Atendente", "Compartilhado", "Observação", "Atualizado"];
    const rows = filteredDemands.map((d) => [
      d.studentName,
      maskCPF(d.cpf || ""),
      d.schoolName,
      SHIFT_LABELS[d.shift] || d.shift,
      d.grade || "",
      d.disabilities ? JSON.parse(d.disabilities).join("; ") : "",
      ATTENDANCE_STATUS_LABELS[d.attendanceStatus] || d.attendanceStatus,
      d.attendantStatus === "active" ? "Ativo" : "Inativo",
      d.attendantName || "",
      d.isShared ? "Sim" : "Não",
      d.notes || "",
      new Date(d.updatedAt).toLocaleDateString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quadro-alunos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Alunos</h1>
            <p className="text-sm text-muted-foreground">Cadastro e acompanhamento de alunos com necessidades especiais</p>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total de alunos", value: demands.length },
          { label: "Com atendente", value: demands.filter(d => d.attendanceStatus === "with_attendant").length },
          { label: "Sem atendente", value: demands.filter(d => d.attendanceStatus === "without_attendant").length },
          { label: "Compartilhados", value: demands.filter(d => d.isShared).length },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário de Novo Registro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {editingId !== null ? "Editar registro" : "Novo registro"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail + Unidade educacional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* Autocomplete de escola — admin escolhe, escola_user usa a própria escola */}
              {isAdmin ? (
                <div className="space-y-1 relative">
                  <Label>Unidade educacional *</Label>
                  <Input
                    value={schoolSearch}
                    onChange={(e) => {
                      setSchoolSearch(e.target.value);
                      setForm({ ...form, schoolName: e.target.value });
                      setShowSchoolDropdown(true);
                    }}
                    onFocus={() => setShowSchoolDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                    placeholder="Selecione ou digite a unidade educacional"
                  />
                  {showSchoolDropdown && filteredSchools.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredSchools.slice(0, 20).map((school) => (
                        <button
                          key={school.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                          onMouseDown={() => {
                            setSchoolSearch(school.name);
                            setForm({ ...form, schoolId: school.id, schoolName: school.name });
                            setShowSchoolDropdown(false);
                          }}
                        >
                          {school.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>Unidade educacional</Label>
                  <Input
                    value={schools.find(s => s.id === user?.schoolId)?.name || "Carregando..."}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
            </div>

            {/* Nome do aluno */}
            <div className="space-y-1">
              <Label htmlFor="studentName">Nome completo do aluno *</Label>
              <Input
                id="studentName"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                placeholder="Nome completo do aluno"
              />
            </div>

            {/* Data de nascimento + CPF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="dateOfBirth">Data de nascimento *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cpf">CPF ou certidão *</Label>
                <Input
                  id="cpf"
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            {/* Turno + Turma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Turno *</Label>
                <Select
                  value={form.shift}
                  onValueChange={(v) => setForm({ ...form, shift: v as FormData["shift"] })}
                >
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
                <Label htmlFor="grade">Turma *</Label>
                <Input
                  id="grade"
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  placeholder="Ex: 3º ano A"
                />
              </div>
            </div>

            {/* Deficiências/Transtornos */}
            <div className="space-y-2">
              <Label>Deficiência/Transtorno *</Label>
              <div className="border border-border rounded-md p-3 bg-muted/30 space-y-4">
                {DISABILITY_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{group.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.options.map((disability) => (
                        <div key={disability} className="flex items-center gap-2">
                          <Checkbox
                            id={`dis-${disability}`}
                            checked={form.disabilities.includes(disability)}
                            onCheckedChange={() => toggleDisability(disability)}
                          />
                          <label htmlFor={`dis-${disability}`} className="text-sm cursor-pointer leading-tight">
                            {disability}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {form.disabilities.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selecionado(s): {form.disabilities.join(", ")}
                </p>
              )}
            </div>

            {/* Situação do atendimento + situação do atendente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Situação do atendimento *</Label>
                <Select
                  value={form.attendanceStatus}
                  onValueChange={(v) => setForm({ ...form, attendanceStatus: v as FormData["attendanceStatus"] })}
                >
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
                <Select
                  value={form.attendantStatus}
                  onValueChange={(v) => setForm({ ...form, attendantStatus: v as FormData["attendantStatus"] })}
                >
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
              <Select
                value={form.hasAttendant ? "yes" : "no"}
                onValueChange={(v) =>
                  setForm({ ...form, hasAttendant: v === "yes", attendantName: v === "no" ? "" : form.attendantName })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="no">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mediador — Select com loading state */}
            {form.hasAttendant && (
              <div className="space-y-1">
                <Label htmlFor="attendantName">Mediador (atendente) *</Label>
                {mediatorsList.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                      <p className="text-sm text-amber-800 font-medium">Carregando mediadores...</p>
                    </div>
                  </div>
                ) : mediatorNames.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800 font-medium">Nenhum mediador cadastrado nesta escola.</p>
                    <p className="text-xs text-amber-700 mt-1">Cadastre primeiro na aba Mediadores.</p>
                  </div>
                ) : (
                  <Select value={form.attendantName} onValueChange={(v) => setForm({ ...form, attendantName: v })}>
                    <SelectTrigger id="attendantName">
                      <SelectValue placeholder="Selecione um mediador cadastrado na escola" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediatorNames.map((name: string) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {mediatorNames.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {mediatorNames.length} mediador(es) cadastrado(s) na escola.
                  </p>
                )}
              </div>
            )}

            {/* O atendente é compartilhado? */}
            <div className="space-y-1">
              <Label>O atendente é compartilhado? *</Label>
              <Select
                value={form.isShared ? "yes" : "no"}
                onValueChange={(v) => {
                  setForm({ ...form, isShared: v === "yes" });
                  if (v === "no") {
                    setSharedStudent(EMPTY_SHARED);
                    setSharedStudentSearch("");
                  }
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="no">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Segundo aluno (quando compartilhado = Sim) */}
            {form.isShared && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      2º Aluno vinculado ao atendente compartilhado
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={sharedStudentMode === "search" ? "default" : "outline"}
                        onClick={() => setSharedStudentMode("search")}
                        className="text-xs h-7"
                      >
                        Buscar existente
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={sharedStudentMode === "new" ? "default" : "outline"}
                        onClick={() => setSharedStudentMode("new")}
                        className="text-xs h-7"
                      >
                        Novo cadastro
                      </Button>
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
                          onChange={(e) => {
                            setSharedStudentSearch(e.target.value);
                            setShowSharedStudentDropdown(true);
                          }}
                          onFocus={() => setShowSharedStudentDropdown(true)}
                          onBlur={() => setTimeout(() => setShowSharedStudentDropdown(false), 200)}
                          placeholder="Buscar aluno pelo nome..."
                          className="pl-8"
                        />
                        {showSharedStudentDropdown && existingStudents.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {existingStudents.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                                onMouseDown={() => {
                                  setSharedStudent({
                                    studentName: s.name,
                                    dateOfBirth: "",
                                    cpf: s.cpf || "",
                                    grade: s.grade || "",
                                    disabilities: [],
                                    existingId: s.id,
                                  });
                                  setSharedStudentSearch(s.name);
                                  setShowSharedStudentDropdown(false);
                                }}
                              >
                                <div className="font-medium">{s.name}</div>
                                <div className="text-xs text-muted-foreground">Matrícula: {s.enrollmentNumber}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {sharedStudent.studentName && (
                        <div className="flex items-center gap-2 p-2 bg-blue-100 rounded-md">
                          <span className="text-sm font-medium text-blue-800">{sharedStudent.studentName}</span>
                          {sharedStudent.cpf && <span className="text-xs text-blue-600">CPF: {sharedStudent.cpf}</span>}
                          <button
                            type="button"
                            onClick={() => { setSharedStudent(EMPTY_SHARED); setSharedStudentSearch(""); }}
                            className="ml-auto text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      {sharedStudentSearch.length >= 2 && existingStudents.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Nenhum aluno encontrado. Use "Novo cadastro" para registrar.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome completo do aluno *</Label>
                        <Input
                          value={sharedStudent.studentName}
                          onChange={(e) => setSharedStudent({ ...sharedStudent, studentName: e.target.value })}
                          placeholder="Nome completo"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Data de nascimento</Label>
                          <Input
                            type="date"
                            value={sharedStudent.dateOfBirth}
                            onChange={(e) => setSharedStudent({ ...sharedStudent, dateOfBirth: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">CPF ou certidão</Label>
                          <Input
                            value={sharedStudent.cpf}
                            onChange={(e) => setSharedStudent({ ...sharedStudent, cpf: e.target.value })}
                            placeholder="000.000.000-00"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Turma</Label>
                        <Input
                          value={sharedStudent.grade}
                          onChange={(e) => setSharedStudent({ ...sharedStudent, grade: e.target.value })}
                          placeholder="Ex: 3º ano B"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Deficiências/Transtornos</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 border border-border rounded-md p-2 bg-white max-h-32 overflow-y-auto">
                          {DISABILITY_OPTIONS.map((disability) => (
                            <div key={disability} className="flex items-center gap-1.5">
                              <Checkbox
                                id={`shared-dis-${disability}`}
                                checked={sharedStudent.disabilities.includes(disability)}
                                onCheckedChange={() => toggleSharedDisability(disability)}
                                className="h-3 w-3"
                              />
                              <label htmlFor={`shared-dis-${disability}`} className="text-xs cursor-pointer">
                                {disability}
                              </label>
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
              <Select
                value={form.needsAttendant}
                onValueChange={(v) => setForm({ ...form, needsAttendant: v as "yes" | "no" | "nam" })}
              >
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
              <Label htmlFor="notes">Observação geral</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : editingId !== null ? "Salvar alterações" : "Cadastrar aluno"}
              </Button>
              {editingId !== null && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold">
                Registros ({filteredDemands.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" />
                Exportar CSV
              </Button>
            </div>
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por aluno, atendente, unidade ou e-mail"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              {isAdmin && (
                <Select value={filterSchool} onValueChange={setFilterSchool}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas as escolas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as escolas</SelectItem>
                    {uniqueSchools.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={filterShift} onValueChange={setFilterShift}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Todos os turnos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os turnos</SelectItem>
                  <SelectItem value="full">Integral</SelectItem>
                  <SelectItem value="morning">Manhã</SelectItem>
                  <SelectItem value="afternoon">Tarde</SelectItem>
                  <SelectItem value="evening">Noite</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas as situações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as situações</SelectItem>
                  <SelectItem value="with_attendant">Com atendente</SelectItem>
                  <SelectItem value="without_attendant">Sem atendente</SelectItem>
                  <SelectItem value="awaiting_substitution">Aguardando substituição</SelectItem>
                  <SelectItem value="partially_attended">Parcialmente atendido</SelectItem>
                </SelectContent>
              </Select>
              {(filterSchool !== "all" || filterShift !== "all" || filterStatus !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilterSchool("all"); setFilterShift("all"); setFilterStatus("all"); setSearchQuery(""); }}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" /> Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando registros...</div>
          ) : filteredDemands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Nenhum registro encontrado para a busca." : "Nenhum registro cadastrado ainda."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ALUNO</TableHead>
                    <TableHead>UNIDADE</TableHead>
                    <TableHead>TURMA/TURNO</TableHead>
                    <TableHead>ATENDIMENTO</TableHead>
                    <TableHead>ATENDENTE</TableHead>
                    <TableHead>ATUALIZADO</TableHead>
                    <TableHead className="text-right">AÇÕES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDemands.map((demand) => {
                    const disabilities = demand.disabilities ? JSON.parse(demand.disabilities) as string[] : [];
                    return (
                      <TableRow key={demand.id}>
                        <TableCell>
                          <div className="font-medium">{demand.studentName}</div>
                          {disabilities.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {disabilities.slice(0, 2).join(", ")}
                              {disabilities.length > 2 && ` +${disabilities.length - 2}`}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{demand.schoolName}</TableCell>
                        <TableCell className="text-sm">
                          <div>{demand.grade || "—"}</div>
                          <div className="text-muted-foreground">{SHIFT_LABELS[demand.shift] || demand.shift}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ATTENDANCE_STATUS_COLORS[demand.attendanceStatus] || "bg-gray-100 text-gray-800"}`}>
                            {ATTENDANCE_STATUS_LABELS[demand.attendanceStatus] || demand.attendanceStatus}
                          </span>
                          {demand.isShared && (
                            <Badge variant="outline" className="ml-1 text-xs">Compartilhado</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {demand.hasAttendant && demand.attendantName ? (
                            <div>
                              <div>{demand.attendantName}</div>
                              <div className={`text-xs ${demand.attendantStatus === "active" ? "text-green-600" : "text-red-600"}`}>
                                {demand.attendantStatus === "active" ? "Ativo" : "Inativo"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(demand.updatedAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(demand)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setProfileStudent(demand); setProfileDefaultTab("historico"); }}
                              title="Histórico de alterações"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(demand.id)}
                                title="Excluir"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Controles de paginação */}
          {studentsTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Exibindo {(studentsPage - 1) * STUDENTS_PAGE_SIZE + 1}–{Math.min(studentsPage * STUDENTS_PAGE_SIZE, filteredDemands.length)} de {filteredDemands.length} registros
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={studentsPage === 1} onClick={() => setStudentsPage(p => p - 1)}>Anterior</Button>
                {Array.from({ length: Math.min(5, studentsTotalPages) }, (_, i) => {
                  const page = studentsPage <= 3 ? i + 1 : studentsPage + i - 2;
                  if (page < 1 || page > studentsTotalPages) return null;
                  return (
                    <Button key={page} variant={page === studentsPage ? "default" : "outline"} size="sm" onClick={() => setStudentsPage(page)}>{page}</Button>
                  );
                })}
                <Button variant="outline" size="sm" disabled={studentsPage === studentsTotalPages} onClick={() => setStudentsPage(p => p + 1)}>Próxima</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de histórico de alterações do aluno (legado - mantido para compatibilidade) */}
      {/* <HistoryModal ... /> */}

      {/* Perfil do aluno com abas: Dados, Histórico, Atendimentos */}
      <StudentProfileSheet
        open={!!profileStudent}
        onClose={() => setProfileStudent(null)}
        student={profileStudent}
        defaultTab={profileDefaultTab}
      />

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
