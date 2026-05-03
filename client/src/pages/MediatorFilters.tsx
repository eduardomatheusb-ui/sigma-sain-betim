import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function MediatorFiltersBar({ schools, filters, setFilters }: any) {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status || ""} onValueChange={v => setFilters({ ...filters, status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="on_leave">Licença</SelectItem>
                <SelectItem value="temp_leave">Licença Temporária</SelectItem>
                <SelectItem value="vacancy">Vaga</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Alunos</label>
            <Select value={filters.studentCount || ""} onValueChange={v => setFilters({ ...filters, studentCount: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="0">Sem alunos</SelectItem>
                <SelectItem value="1">1 aluno</SelectItem>
                <SelectItem value="2">2 alunos</SelectItem>
                <SelectItem value="3+">3+ alunos (sobrecarga)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
