/**
 * Quadro de Mediadores
 * Visão consolidada: mediadores, alunos vinculados e situação por escola
 * Usa dados já existentes no cadastro de alunos e mediadores
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, FileSpreadsheet, Printer, Clock, CheckCircle2, AlertCircle, Building2, Users, GraduationCap, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const SHIFT_LABELS: Record<string, string> = {
  morning: "Manhã",
  afternoon: "Tarde",
  full: "Integral",
  evening: "Noite",
};

export default function Cadastros() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const userSchoolId = (user as any)?.schoolId;

  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(
    isAdmin ? null : userSchoolId || null
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitNotes, setSubmitNotes] = useState("");

  const { data: schoolList } = trpc.schools.list.useQuery(undefined, { enabled: isAdmin });

  const { data: quadro, isLoading, refetch } = trpc.quadroAAP.generate.useQuery(
    { schoolId: selectedSchoolId! },
    { enabled: !!selectedSchoolId }
  );

  const { data: history } = trpc.quadroAAP.history.useQuery(
    { schoolId: selectedSchoolId! },
    { enabled: !!selectedSchoolId }
  );

  const submitMutation = trpc.quadroAAP.submit.useMutation({
    onSuccess: (data) => {
      toast.success(`Quadro enviado com sucesso! Semana: ${data.weekReference}`);
      setShowSubmitDialog(false);
      setSubmitNotes("");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao enviar quadro");
    },
  });

  const handleSubmit = () => {
    if (!selectedSchoolId) return;
    submitMutation.mutate({ schoolId: selectedSchoolId, notes: submitNotes || undefined });
  };

  const handleExportExcel = () => {
    if (!quadro?.rows || !quadro.school) return;

    const headerRows: (string | number)[][] = [
      [`QUADRO DE MEDIADORES — ${quadro.school.name}`],
      [`Data: ${quadro.date}`],
      [],
      ["N\u00b0", "Mediador", "Turno", "Situa\u00e7\u00e3o", "Aluno Atendido", "Ano/Turma", "Defici\u00eancia"],
    ];

    const dataRows: (string | number)[][] = [];
    for (const row of quadro.rows) {
      for (let i = 0; i < row.alunos.length; i++) {
        const al = row.alunos[i];
        dataRows.push([
          i === 0 ? String(row.numero).padStart(2, "0") : "",
          i === 0 ? row.nomeAAP : "",
          i === 0 ? [row.turno1 ? "Manh\u00e3" : "", row.turno2 ? "Tarde" : ""].filter(Boolean).join("/") : "",
          i === 0 ? row.status : "",
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
    ws["!cols"] = [
      { wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 22 }, { wch: 30 },
      { wch: 12 }, { wch: 25 },
    ];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quadro de Mediadores");
    XLSX.writeFile(wb, `Quadro_Mediadores_${quadro.school.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Excel exportado com sucesso!");
  };

  const handlePrint = () => {
    window.print();
  };

  const lastSubmission = history?.[0];

  // Mapear status do mediador para label legível
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: "Ativo",
      inactive: "Inativo",
      on_leave: "Afastado",
      temp_leave: "Licen\u00e7a",
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

  return (
    <div className="space-y-6">
      {/* Cabe\u00e7alho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quadro de Mediadores</h1>
          <p className="text-muted-foreground mt-1">
            Vis\u00e3o consolidada dos mediadores, alunos vinculados e situa\u00e7\u00e3o por escola
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

      {!selectedSchoolId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Building2 className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Selecione uma escola para visualizar o quadro</p>
          </CardContent>
        </Card>
      )}

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

          {/* Bot\u00f5es de a\u00e7\u00e3o */}
          <div className="flex items-center gap-2 flex-wrap print:hidden">
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
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
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
                  <th className="border px-3 py-2 text-center font-semibold w-12">N\u00b0</th>
                  <th className="border px-3 py-2 text-left font-semibold min-w-[180px]">Mediador</th>
                  <th className="border px-3 py-2 text-center font-semibold w-24">Turno</th>
                  <th className="border px-3 py-2 text-center font-semibold w-28">Situa\u00e7\u00e3o</th>
                  <th className="border px-3 py-2 text-left font-semibold min-w-[200px]">Aluno Atendido</th>
                  <th className="border px-3 py-2 text-center font-semibold w-24">Ano/Turma</th>
                  <th className="border px-3 py-2 text-left font-semibold min-w-[160px]">Defici\u00eancia</th>
                </tr>
              </thead>
              <tbody>
                {quadro.rows.map((row: any) =>
                  row.alunos.map((aluno: any, idx: number) => (
                    <tr
                      key={`${row.numero}-${idx}`}
                      className={`${
                        row.status === "sem_atendente"
                          ? "bg-amber-50"
                          : row.nomeAAP === "N\u00c3O NECESSITA"
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
                            {[row.turno1 ? "Manh\u00e3" : "", row.turno2 ? "Tarde" : ""].filter(Boolean).join(" / ") || "-"}
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
                    </tr>
                  ))
                )}
                {quadro.rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="border px-4 py-8 text-center text-muted-foreground">
                      Nenhum registro encontrado. Cadastre alunos e mediadores para gerar o quadro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Resumo no rodap\u00e9 */}
            <div className="p-4 border-t bg-slate-50 flex gap-6 text-sm">
              <span><strong>Total de mediadores:</strong> {quadro.totalMediadores}</span>
              <span><strong>Total de alunos:</strong> {quadro.totalAlunos}</span>
              <span className="text-amber-700"><strong>Sem mediador:</strong> {quadro.totalSemAtendente}</span>
            </div>
          </div>

          {/* Hist\u00f3rico de envios */}
          {history && history.length > 0 && (
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hist\u00f3rico de Envios
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

      {/* Dialog de envio */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Quadro de Mediadores para SAIN</DialogTitle>
            <DialogDescription>
              O quadro atual ser\u00e1 registrado e enviado para a Secretaria Adjunta de Inclus\u00e3o.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Observa\u00e7\u00f5es (opcional)</label>
              <Textarea
                value={submitNotes}
                onChange={(e) => setSubmitNotes(e.target.value)}
                placeholder="Informa\u00e7\u00f5es adicionais sobre altera\u00e7\u00f5es, vagas, etc."
                rows={3}
              />
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
            <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="bg-blue-700 hover:bg-blue-800">
              {submitMutation.isPending ? "Enviando..." : "Confirmar Envio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Estilos de impress\u00e3o */}
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
