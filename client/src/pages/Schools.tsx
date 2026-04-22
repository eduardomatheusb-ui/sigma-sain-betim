import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  School, Search, Plus, AlertTriangle, Download,
  ChevronDown, ChevronUp, Eye,
} from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  updated: "Atualizado",
  pending: "Pendente",
  with_vacancy: "Com vaga",
  with_leave: "Com licença",
};

const STATUS_COLORS: Record<string, string> = {
  updated: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  with_vacancy: "bg-red-100 text-red-800",
  with_leave: "bg-orange-100 text-orange-800",
};

export default function Schools() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [expandedSchool, setExpandedSchool] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "students" | "vacancies">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data: schoolsData, isLoading } = trpc.schools.listWithStats.useQuery();
  const { data: alerts } = trpc.schools.alerts.useQuery();
  const utils = trpc.useUtils();
  const createSchool = trpc.schools.create.useMutation({
    onSuccess: () => {
      toast.success("Escola cadastrada com sucesso!");
      setShowCreate(false);
      utils.schools.listWithStats.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const [form, setForm] = useState({
    name: "", code: "", address: "", phone: "", principal: "", responsible: "",
  });

  const filtered = useMemo(() => {
    if (!schoolsData) return [];
    let list = [...schoolsData];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s: any) => s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q)));
    }
    if (statusFilter !== "all") {
      list = list.filter((s: any) => s.weeklyStatus === statusFilter || (!s.weeklyStatus && statusFilter === "pending"));
    }
    list.sort((a: any, b: any) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "students") cmp = a.students - b.students;
      else if (sortBy === "vacancies") cmp = a.vacancies - b.vacancies;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [schoolsData, search, statusFilter, sortBy, sortDir]);

  const totals = useMemo(() => {
    if (!schoolsData) return { schools: 0, students: 0, mediators: 0, active: 0, vacancies: 0, onLeave: 0 };
    return {
      schools: schoolsData.length,
      students: schoolsData.reduce((s: number, e: any) => s + e.students, 0),
      mediators: schoolsData.reduce((s: number, e: any) => s + e.mediators, 0),
      active: schoolsData.reduce((s: number, e: any) => s + e.activeMediators, 0),
      vacancies: schoolsData.reduce((s: number, e: any) => s + e.vacancies, 0),
      onLeave: schoolsData.reduce((s: number, e: any) => s + e.onLeave, 0),
    };
  }, [schoolsData]);

  const handleSort = (col: "name" | "students" | "vacancies") => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ["Escola", "Codigo", "Alunos", "Mediadores", "Ativos", "Vagas", "Licenca", "Status Semanal"];
    const rows = filtered.map((s: any) => [
      s.name, s.code || "", s.students, s.mediators, s.activeMediators, s.vacancies, s.onLeave,
      STATUS_LABELS[s.weeklyStatus || "pending"] || "Pendente",
    ]);
    const csv = [headers.join(";"), ...rows.map((r: any) => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "escolas_sigma_" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreate = () => {
    if (!form.name || !form.code) { toast.error("Nome e codigo sao obrigatorios"); return; }
    createSchool.mutate(form);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />;
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <School className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>Acesso restrito a Secretaria (SAIN).</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <School className="h-6 w-6 text-primary" /> Escolas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visao geral das unidades escolares e seus indicadores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Escola
          </Button>
        </div>
      </div>

      {alerts && alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3 px-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-amber-800 text-sm">Alertas da Semana</p>
                {alerts.map((a: string, i: number) => (
                  <p key={i} className="text-sm text-amber-700">{a}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{totals.schools}</p><p className="text-xs text-muted-foreground">Escolas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{totals.students}</p><p className="text-xs text-muted-foreground">Alunos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{totals.active}</p><p className="text-xs text-muted-foreground">Mediadores Ativos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{totals.vacancies}</p><p className="text-xs text-muted-foreground">Vagas Abertas</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">{totals.onLeave}</p><p className="text-xs text-muted-foreground">Em Licenca</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-violet-600">{totals.mediators}</p><p className="text-xs text-muted-foreground">Total Mediadores</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou codigo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status semanal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="updated">Atualizado</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="with_vacancy">Com vaga</SelectItem>
            <SelectItem value="with_leave">Com licenca</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando escolas...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <School className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
              <p>Nenhuma escola encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>Escola <SortIcon col="name" /></TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => handleSort("students")}>Alunos <SortIcon col="students" /></TableHead>
                  <TableHead className="text-center">Mediadores</TableHead>
                  <TableHead className="text-center cursor-pointer select-none" onClick={() => handleSort("vacancies")}>Vagas <SortIcon col="vacancies" /></TableHead>
                  <TableHead className="text-center">Licenca</TableHead>
                  <TableHead className="text-center">Status Semanal</TableHead>
                  <TableHead className="text-center">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((school: any) => (
                  <TableRow key={school.id} className="group">
                    <TableCell>
                      <div><p className="font-medium text-sm">{school.name}</p><p className="text-xs text-muted-foreground">{school.code}</p></div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{school.students}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-emerald-600 font-medium">{school.activeMediators}</span>
                      <span className="text-muted-foreground">/{school.mediators}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {school.vacancies > 0 ? <Badge variant="destructive" className="text-xs">{school.vacancies}</Badge> : <span className="text-muted-foreground">0</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {school.onLeave > 0 ? <Badge className="bg-orange-100 text-orange-800 text-xs">{school.onLeave}</Badge> : <span className="text-muted-foreground">0</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={"text-xs " + (STATUS_COLORS[school.weeklyStatus || "pending"] || STATUS_COLORS.pending)}>
                        {STATUS_LABELS[school.weeklyStatus || "pending"] || "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" onClick={() => setExpandedSchool(expandedSchool === school.id ? null : school.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {expandedSchool && <SchoolDetail schoolId={expandedSchool} onClose={() => setExpandedSchool(null)} />}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Escola</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="EM Exemplo" /></div>
              <div><Label>Codigo *</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="EM001" /></div>
            </div>
            <div><Label>Endereco</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Diretor(a)</Label><Input value={form.principal} onChange={e => setForm({ ...form, principal: e.target.value })} /></div>
            </div>
            <div><Label>Responsavel SAIN</Label><Input value={form.responsible} onChange={e => setForm({ ...form, responsible: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createSchool.isPending}>{createSchool.isPending ? "Salvando..." : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SchoolDetail({ schoolId, onClose }: { schoolId: number; onClose: () => void }) {
  const { data: detail, isLoading } = trpc.schools.detail.useQuery({ id: schoolId });
  if (isLoading) return <Card><CardContent className="p-6 text-center text-muted-foreground">Carregando detalhes...</CardContent></Card>;
  if (!detail) return null;
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{detail.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-xl font-bold text-blue-600">{detail.totalStudents}</p><p className="text-xs text-muted-foreground">Alunos</p></div>
          <div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-xl font-bold text-emerald-600">{detail.activeMediators}</p><p className="text-xs text-muted-foreground">Mediadores Ativos</p></div>
          <div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-xl font-bold text-red-600">{detail.vacancies}</p><p className="text-xs text-muted-foreground">Vagas Abertas</p></div>
          <div className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-xl font-bold text-violet-600">{detail.totalAttendances}</p><p className="text-xs text-muted-foreground">Atendimentos</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {detail.code && <div><span className="text-muted-foreground">Codigo:</span> <span className="font-medium">{detail.code}</span></div>}
          {detail.address && <div><span className="text-muted-foreground">Endereco:</span> <span className="font-medium">{detail.address}</span></div>}
          {detail.phone && <div><span className="text-muted-foreground">Telefone:</span> <span className="font-medium">{detail.phone}</span></div>}
          {detail.principal && <div><span className="text-muted-foreground">Diretor(a):</span> <span className="font-medium">{detail.principal}</span></div>}
          {detail.responsible && <div><span className="text-muted-foreground">Responsavel SAIN:</span> <span className="font-medium">{detail.responsible}</span></div>}
        </div>
      </CardContent>
    </Card>
  );
}
