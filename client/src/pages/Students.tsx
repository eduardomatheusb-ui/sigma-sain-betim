import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { BETIM_SCHOOLS } from "@/lib/schools";

const DISABILITY_OPTIONS = [
  "TEA (Transtorno do Espectro Autista)",
  "TDAH",
  "Deficiência Intelectual",
  "Deficiência Física",
  "Deficiência Visual",
  "Deficiência Auditiva",
  "Síndrome de Down",
  "Paralisia Cerebral",
  "Transtorno de Aprendizagem",
  "Múltiplas Deficiências",
  "Outro",
];

const SHIFT_LABEL: Record<string, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  full: "Integral",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  transferred: "Transferido",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  inactive: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  transferred: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
};

const EMPTY_FORM = {
  name: "",
  cpf: "",
  dateOfBirth: "",
  enrollmentNumber: "",
  specialNeeds: "",
  disability: "",
  shift: "" as "" | "morning" | "afternoon" | "full",
  grade: "",
  guardianName: "",
  guardianPhone: "",
  notes: "",
  schoolId: "" as string,
};

export default function Students() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);

  const { data: studentsData = [], isLoading } = trpc.students.listBySchool.useQuery();
  const { data: schoolsData = [] } = trpc.schools.list.useQuery(undefined, { enabled: user?.role === "admin" });

  const createStudent = trpc.students.create.useMutation({
    onSuccess: () => {
      toast.success("Aluno cadastrado com sucesso!");
      setIsOpen(false);
      setFormData(EMPTY_FORM);
      utils.students.listBySchool.invalidate();
    },
    onError: (err) => toast.error("Erro ao cadastrar aluno: " + err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Nome do aluno é obrigatório"); return; }
    if (user?.role === "admin" && !formData.schoolId) {
      toast.error("Selecione uma escola para o aluno"); return;
    }
    createStudent.mutate({
      name: formData.name,
      cpf: formData.cpf || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      enrollmentNumber: formData.enrollmentNumber || undefined,
      specialNeeds: formData.specialNeeds || undefined,
      disability: formData.disability || undefined,
      shift: (formData.shift as "morning" | "afternoon" | "full") || undefined,
      grade: formData.grade || undefined,
      guardianName: formData.guardianName || undefined,
      guardianPhone: formData.guardianPhone || undefined,
      notes: formData.notes || undefined,
      schoolId: formData.schoolId ? Number(formData.schoolId) : undefined,
    });
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return studentsData.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.enrollmentNumber ?? "").toLowerCase().includes(q) ||
      (s.disability ?? "").toLowerCase().includes(q)
    );
  }, [studentsData, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestão de Alunos</h1>
            <p className="text-sm text-muted-foreground">Cadastro e acompanhamento de alunos com necessidades especiais</p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setIsOpen(true)}>
          <Plus className="w-4 h-4" /> Novo Aluno
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total de alunos", value: studentsData.length },
          { label: "Ativos", value: studentsData.filter(s => s.status === "active").length },
          { label: "Inativos", value: studentsData.filter(s => s.status === "inactive").length },
          { label: "Transferidos", value: studentsData.filter(s => s.status === "transferred").length },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar por nome, matrícula ou deficiência..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Lista de Alunos</span>
            <Badge variant="secondary">{filtered.length} {filtered.length === 1 ? "aluno" : "alunos"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Carregando alunos...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <GraduationCap className="w-8 h-8 opacity-30" />
              <p>{searchTerm ? "Nenhum aluno encontrado." : "Nenhum aluno cadastrado ainda."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["Nome", "Matrícula", "Deficiência", "Turno", "Série", "Responsável", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => (
                    <tr key={s.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.enrollmentNumber || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.disability || s.specialNeeds || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.shift ? SHIFT_LABEL[s.shift] : "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.grade || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.guardianName || "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_BADGE[s.status] ?? "bg-gray-100 text-gray-600"}>
                          {STATUS_LABEL[s.status] ?? s.status}
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

      {/* Modal de cadastro */}
      <Dialog open={isOpen} onOpenChange={v => { if (!v) setIsOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Nome */}
              <div className="col-span-2 space-y-1">
                <Label>Nome Completo *</Label>
                <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nome do aluno" required />
              </div>

              {/* Escola — admin escolhe, escola_user usa a escola vinculada */}
              {user?.role === "admin" && (
                <div className="col-span-2 space-y-1">
                  <Label>Escola *</Label>
                  <Select value={formData.schoolId} onValueChange={v => setFormData(p => ({ ...p, schoolId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione a escola" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {schoolsData.length > 0
                        ? schoolsData.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)
                        : BETIM_SCHOOLS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* CPF e Data de Nascimento */}
              <div className="space-y-1">
                <Label>CPF</Label>
                <Input value={formData.cpf} onChange={e => setFormData(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-1">
                <Label>Data de Nascimento</Label>
                <Input type="date" value={formData.dateOfBirth} onChange={e => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))} />
              </div>

              {/* Matrícula e Série */}
              <div className="space-y-1">
                <Label>Matrícula</Label>
                <Input value={formData.enrollmentNumber} onChange={e => setFormData(p => ({ ...p, enrollmentNumber: e.target.value }))} placeholder="Número de matrícula" />
              </div>
              <div className="space-y-1">
                <Label>Série / Turma</Label>
                <Input value={formData.grade} onChange={e => setFormData(p => ({ ...p, grade: e.target.value }))} placeholder="Ex: 3º ano A" />
              </div>

              {/* Deficiência */}
              <div className="col-span-2 space-y-1">
                <Label>Deficiência / Necessidade Especial</Label>
                <Select value={formData.disability} onValueChange={v => setFormData(p => ({ ...p, disability: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione ou deixe em branco" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informado</SelectItem>
                    {DISABILITY_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Turno */}
              <div className="space-y-1">
                <Label>Turno</Label>
                <Select value={formData.shift} onValueChange={v => setFormData(p => ({ ...p, shift: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o turno" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                    <SelectItem value="full">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Necessidades especiais (campo livre) */}
              <div className="space-y-1">
                <Label>Observações sobre necessidades</Label>
                <Input value={formData.specialNeeds} onChange={e => setFormData(p => ({ ...p, specialNeeds: e.target.value }))} placeholder="Detalhes adicionais" />
              </div>

              {/* Responsável */}
              <div className="space-y-1">
                <Label>Nome do Responsável</Label>
                <Input value={formData.guardianName} onChange={e => setFormData(p => ({ ...p, guardianName: e.target.value }))} placeholder="Nome do responsável" />
              </div>
              <div className="space-y-1">
                <Label>Telefone do Responsável</Label>
                <Input value={formData.guardianPhone} onChange={e => setFormData(p => ({ ...p, guardianPhone: e.target.value }))} placeholder="(31) 99999-9999" />
              </div>

              {/* Observações */}
              <div className="col-span-2 space-y-1">
                <Label>Observações gerais</Label>
                <Input value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Informações adicionais relevantes" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createStudent.isPending}>
                {createStudent.isPending ? "Salvando..." : "Cadastrar Aluno"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
