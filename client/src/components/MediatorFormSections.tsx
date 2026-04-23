import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MediatorBasicSection({ form, setForm, schools }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dados Básicos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome do Mediador *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
          </div>
          <div>
            <Label>Matrícula</Label>
            <Input value={form.registration} onChange={e => setForm({ ...form, registration: e.target.value })} placeholder="Matrícula" />
          </div>
          <div>
            <Label>Escola *</Label>
            <Select value={form.schoolId} onValueChange={v => setForm({ ...form, schoolId: parseInt(v) })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a escola" />
              </SelectTrigger>
              <SelectContent>
                {schools?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MediatorStatusSection({ form, setForm }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Situação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Status *</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="on_leave">Licença</SelectItem>
                <SelectItem value="temp_leave">Licença Temporária</SelectItem>
                <SelectItem value="vacancy">Vaga</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.status !== "active" && (
            <>
              <div>
                <Label>Motivo da Inatividade</Label>
                <Input value={form.inactivityReason} onChange={e => setForm({ ...form, inactivityReason: e.target.value })} placeholder="Ex: Licença médica" />
              </div>
              <div>
                <Label>Data de Inatividade</Label>
                <Input type="date" value={form.inactivityDate} onChange={e => setForm({ ...form, inactivityDate: e.target.value })} />
              </div>
              <div>
                <Label>Previsão de Retorno</Label>
                <Input type="date" value={form.returnDate} onChange={e => setForm({ ...form, returnDate: e.target.value })} />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MediatorStudentsSection({ form, linkedStudents }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alunos Vinculados ({linkedStudents?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {linkedStudents && linkedStudents.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {linkedStudents.map((s: any) => (
              <div key={s.id} className="p-2 bg-slate-50 rounded text-sm">
                <p className="font-medium">{s.name}</p>
                <p className="text-muted-foreground text-xs">{s.schoolName} • {s.shift}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhum aluno vinculado</p>
        )}
      </CardContent>
    </Card>
  );
}

export function MediatorNotesSection({ form, setForm }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Observações</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          value={form.note} 
          onChange={e => setForm({ ...form, note: e.target.value })} 
          placeholder="Observações adicionais..."
          rows={4}
        />
      </CardContent>
    </Card>
  );
}
