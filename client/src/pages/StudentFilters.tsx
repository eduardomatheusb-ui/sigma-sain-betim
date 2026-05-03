import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function StudentFiltersBar({ schools, filters, setFilters }: any) {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-sm font-medium">Buscar</label>
            <Input 
              placeholder="Nome ou matrícula..." 
              value={filters.search || ""}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Escola</label>
            <Select value={filters.schoolId || ""} onValueChange={v => setFilters({ ...filters, schoolId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as escolas</SelectItem>
                {schools?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Turno</label>
            <Select value={filters.shift || ""} onValueChange={v => setFilters({ ...filters, shift: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os turnos</SelectItem>
                <SelectItem value="morning">Manhã</SelectItem>
                <SelectItem value="afternoon">Tarde</SelectItem>
                <SelectItem value="full">Integral</SelectItem>
                <SelectItem value="evening">Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Atendimento</label>
            <Select value={filters.attendanceStatus || ""} onValueChange={v => setFilters({ ...filters, attendanceStatus: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="with_attendant">Com atendente</SelectItem>
                <SelectItem value="without_attendant">Sem atendente</SelectItem>
                <SelectItem value="awaiting_substitution">Aguardando substituição</SelectItem>
                <SelectItem value="partially_attended">Parcialmente atendido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Deficiência</label>
            <Select value={filters.disability || ""} onValueChange={v => setFilters({ ...filters, disability: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as deficiências</SelectItem>
                <SelectItem value="TEA">TEA</SelectItem>
                <SelectItem value="TDAH">TDAH</SelectItem>
                <SelectItem value="Deficiência visual">Deficiência visual</SelectItem>
                <SelectItem value="Deficiência auditiva">Deficiência auditiva</SelectItem>
                <SelectItem value="Deficiência física">Deficiência física</SelectItem>
                <SelectItem value="Deficiência intelectual">Deficiência intelectual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
