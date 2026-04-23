import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function PersonalDataSection({ form, setForm }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dados Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome do Aluno *</Label>
            <Input value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} placeholder="Nome completo" />
          </div>
          <div>
            <Label>Data de Nascimento</Label>
            <Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <div>
            <Label>CPF</Label>
            <Input value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
          </div>
          <div>
            <Label>Matrícula</Label>
            <Input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="Número de matrícula" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SchoolDataSection({ form, setForm, schools }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dados Escolares</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Escola *</Label>
            <Select value={form.schoolName} onValueChange={v => setForm({ ...form, schoolName: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a escola" />
              </SelectTrigger>
              <SelectContent>
                {schools?.map((s: any) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Turno</Label>
            <Select value={form.shift} onValueChange={v => setForm({ ...form, shift: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Manhã</SelectItem>
                <SelectItem value="afternoon">Tarde</SelectItem>
                <SelectItem value="full">Integral</SelectItem>
                <SelectItem value="evening">Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DisabilitySection({ form, setForm }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Deficiência / Transtorno</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {DISABILITY_OPTIONS.map(disability => (
            <div key={disability} className="flex items-center gap-2">
              <Checkbox 
                checked={form.disabilities?.includes(disability) || false}
                onCheckedChange={checked => {
                  const updated = checked 
                    ? [...(form.disabilities || []), disability]
                    : (form.disabilities || []).filter((d: string) => d !== disability);
                  setForm({ ...form, disabilities: updated });
                }}
              />
              <Label className="text-sm cursor-pointer">{disability}</Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AttendanceSection({ form, setForm }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atendimento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Status de Atendimento</Label>
            <Select value={form.attendanceStatus} onValueChange={v => setForm({ ...form, attendanceStatus: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="with_attendant">Com atendente</SelectItem>
                <SelectItem value="without_attendant">Sem atendente</SelectItem>
                <SelectItem value="awaiting_substitution">Aguardando substituição</SelectItem>
                <SelectItem value="partially_attended">Parcialmente atendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nome do Atendente</Label>
            <Input value={form.attendantName} onChange={e => setForm({ ...form, attendantName: e.target.value })} placeholder="Nome do mediador/atendente" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox 
            checked={form.isShared}
            onCheckedChange={checked => setForm({ ...form, isShared: !!checked })}
          />
          <Label className="cursor-pointer">Atendente compartilhado</Label>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotesSection({ form, setForm }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Observações</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          value={form.notes} 
          onChange={e => setForm({ ...form, notes: e.target.value })} 
          placeholder="Observações adicionais sobre o aluno..."
          rows={4}
        />
      </CardContent>
    </Card>
  );
}
