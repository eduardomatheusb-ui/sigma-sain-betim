import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BarChart3, Download, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type ReportType = "students" | "mediators" | "attendances" | "schools";

const REPORT_LABELS: Record<ReportType, string> = {
  students: "Alunos",
  mediators: "Mediadores",
  attendances: "Atendimentos",
  schools: "Escolas",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo", inactive: "Inativo", on_leave: "Licenca", dismissed: "Desligado",
  vacancy: "Vaga", temp_leave: "Afastado", substituted: "Substituido",
  completed: "Concluido", pending: "Pendente", cancelled: "Cancelado",
  transferred: "Transferido", updated: "Atualizado",
  with_vacancy: "Com vaga", with_leave: "Com licenca",
};

const SHIFT_LABELS: Record<string, string> = {
  morning: "Manha", afternoon: "Tarde", full: "Integral", evening: "Noturno",
};

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>("students");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: schoolsList } = trpc.schools.list.useQuery();
  const schoolId = schoolFilter !== "all" ? parseInt(schoolFilter) : undefined;

  const { data: reportData, isLoading } = trpc.reports.generate.useQuery({
    type: reportType,
    schoolId,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const rows = reportData?.rows || [];

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r: any) => {
      const values = Object.values(r).join(" ").toLowerCase();
      return values.includes(q);
    });
  }, [rows, search]);

  const exportCSV = () => {
    if (!filtered.length) { toast.error("Nenhum dado para exportar"); return; }
    const cols = getColumns(reportType);
    const headers = cols.map(c => c.label);
    const csvRows = filtered.map((r: any) => cols.map(c => {
      const val = r[c.key];
      if (val === null || val === undefined) return "";
      if (c.key === "status" || c.key === "weeklyStatus") return STATUS_LABELS[val] || val;
      if (c.key === "shift") return SHIFT_LABELS[val] || val;
      return String(val);
    }));
    const csv = [headers.join(";"), ...csvRows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_" + reportType + "_" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Relatorios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gere relatorios com dados reais do sistema e exporte em CSV
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={!filtered.length}>
          <Download className="h-4 w-4 mr-1" /> Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={reportType} onValueChange={(v) => { setReportType(v as ReportType); setStatusFilter("all"); }}>
              <SelectTrigger><SelectValue placeholder="Tipo de relatorio" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="students">Alunos</SelectItem>
                <SelectItem value="mediators">Mediadores</SelectItem>
                <SelectItem value="attendances">Atendimentos</SelectItem>
                <SelectItem value="schools">Escolas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={schoolFilter} onValueChange={setSchoolFilter}>
              <SelectTrigger><SelectValue placeholder="Escola" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as escolas</SelectItem>
                {schoolsList?.map((s: any) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {reportType === "students" && (
                  <>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="transferred">Transferido</SelectItem>
                  </>
                )}
                {reportType === "mediators" && (
                  <>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="on_leave">Licenca</SelectItem>
                    <SelectItem value="vacancy">Vaga</SelectItem>
                    <SelectItem value="dismissed">Desligado</SelectItem>
                  </>
                )}
                {reportType === "attendances" && (
                  <>
                    <SelectItem value="completed">Concluido</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar nos resultados..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {REPORT_LABELS[reportType]} — {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Gerando relatorio...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
              <p>Nenhum registro encontrado com os filtros selecionados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <ReportTable type={reportType} rows={filtered} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type ColDef = { key: string; label: string };

function getColumns(type: ReportType): ColDef[] {
  switch (type) {
    case "students":
      return [
        { key: "name", label: "Nome" },
        { key: "cpf", label: "CPF" },
        { key: "disability", label: "Deficiencia" },
        { key: "shift", label: "Turno" },
        { key: "grade", label: "Serie" },
        { key: "status", label: "Status" },
        { key: "schoolName", label: "Escola" },
        { key: "enrollmentNumber", label: "Matricula" },
        { key: "guardianName", label: "Responsavel" },
      ];
    case "mediators":
      return [
        { key: "name", label: "Nome" },
        { key: "cpf", label: "CPF" },
        { key: "registration", label: "Matricula" },
        { key: "status", label: "Status" },
        { key: "changeType", label: "Tipo Alteracao" },
        { key: "linkedStudents", label: "Alunos Vinculados" },
        { key: "inactivityReason", label: "Motivo Inatividade" },
        { key: "schoolName", label: "Escola" },
      ];
    case "attendances":
      return [
        { key: "attendanceDate", label: "Data" },
        { key: "studentName", label: "Aluno" },
        { key: "mediatorName", label: "Mediador" },
        { key: "schoolName", label: "Escola" },
        { key: "status", label: "Status" },
        { key: "type", label: "Tipo" },
        { key: "description", label: "Descricao" },
        { key: "result", label: "Resultado" },
      ];
    case "schools":
      return [
        { key: "name", label: "Escola" },
        { key: "code", label: "Codigo" },
        { key: "students", label: "Alunos" },
        { key: "mediators", label: "Mediadores" },
        { key: "activeMediators", label: "Ativos" },
        { key: "vacancies", label: "Vagas" },
        { key: "weeklyStatus", label: "Status Semanal" },
      ];
  }
}

function ReportTable({ type, rows }: { type: ReportType; rows: any[] }) {
  const cols = getColumns(type);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {cols.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row: any, i: number) => (
          <TableRow key={row.id || i}>
            {cols.map(c => (
              <TableCell key={c.key} className="text-sm">
                {formatCell(c.key, row[c.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function formatCell(key: string, value: any): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>;
  if (key === "status" || key === "weeklyStatus") {
    const label = STATUS_LABELS[value] || value;
    const color = value === "active" || value === "completed" || value === "updated"
      ? "bg-emerald-100 text-emerald-800"
      : value === "inactive" || value === "cancelled" || value === "dismissed"
        ? "bg-red-100 text-red-800"
        : value === "pending"
          ? "bg-amber-100 text-amber-800"
          : "bg-gray-100 text-gray-800";
    return <Badge className={"text-xs " + color}>{label}</Badge>;
  }
  if (key === "shift") return <span>{SHIFT_LABELS[value] || value}</span>;
  if (key === "attendanceDate") {
    try {
      return <span>{new Date(value).toLocaleDateString("pt-BR")}</span>;
    } catch { return <span>{value}</span>; }
  }
  if (key === "type") return <span>{value === "individual" ? "Individual" : value === "shared" ? "Compartilhado" : value}</span>;
  return <span className="max-w-[200px] truncate block">{String(value)}</span>;
}
