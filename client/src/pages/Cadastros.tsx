/**
 * Quadro de Atendentes de Apoio Pedagógico (AAP)
 * Reproduz fielmente o documento Word enviado pelas escolas à SAIN
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
import { Send, FileSpreadsheet, FileText, Clock, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function Cadastros() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const userSchoolId = (user as any)?.schoolId;

  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(
    isAdmin ? null : userSchoolId || null
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitNotes, setSubmitNotes] = useState("");

  // Buscar lista de escolas (admin)
  const { data: schoolList } = trpc.schools.list.useQuery(undefined, { enabled: isAdmin });

  // Buscar quadro AAP
  const { data: quadro, isLoading, refetch } = trpc.quadroAAP.generate.useQuery(
    { schoolId: selectedSchoolId! },
    { enabled: !!selectedSchoolId }
  );

  // Buscar histórico de envios
  const { data: history } = trpc.quadroAAP.history.useQuery(
    { schoolId: selectedSchoolId! },
    { enabled: !!selectedSchoolId }
  );

  // Mutation para enviar quadro
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

  // Exportar Excel (.xlsx real)
  const handleExportExcel = () => {
    if (!quadro?.rows || !quadro.school) return;

    // Cabeçalho institucional
    const headerRows: (string | number)[][] = [
      ["QUADRO DE ATENDENTES DE APOIO PEDAG\u00d3GICO \u2013 AAP"],
      [`Escola Municipal: ${quadro.school.name}`],
      [`Respons\u00e1vel: ${quadro.responsible}`, "", "", `Data: ${quadro.date}`],
      [],
      ["N\u00b0", "Nome do AAP", "1\u00b0 Turno", "2\u00b0 Turno", "Alunos Atendidos", "Ano e Turma", "Cad. Rodas", "Andador", "Pr\u00f3tese", "Defici\u00eancia", "Atend. Domiciliar", "Escola outro turno"],
    ];

    const dataRows: (string | number)[][] = [];
    for (const row of quadro.rows) {
      for (let i = 0; i < row.alunos.length; i++) {
        const al = row.alunos[i];
        dataRows.push([
          i === 0 ? String(row.numero).padStart(2, "0") : "",
          i === 0 ? row.nomeAAP : "",
          i === 0 ? (row.turno1 ? "X" : "") : "",
          i === 0 ? (row.turno2 ? "X" : "") : "",
          al.nome,
          al.anoTurma,
          al.cadeiradeRodas ? "sim" : "n\u00e3o",
          al.andador ? "sim" : "n\u00e3o",
          al.protese ? "sim" : "n\u00e3o",
          al.deficiencia,
          al.atendimentoDomiciliar ? "Sim" : "N\u00e3o",
          i === 0 ? row.escolaOutroTurno : "",
        ]);
      }
    }

    // Resumo
    const summaryRows: (string | number)[][] = [
      [],
      ["Resumo"],
      ["Total de Mediadores", quadro.totalMediadores],
      ["Total de Alunos", quadro.totalAlunos],
      ["Alunos sem Atendente", quadro.totalSemAtendente],
    ];

    const allRows = [...headerRows, ...dataRows, ...summaryRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Ajustar largura das colunas
    ws["!cols"] = [
      { wch: 5 }, { wch: 28 }, { wch: 8 }, { wch: 8 }, { wch: 30 },
      { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 20 },
      { wch: 14 }, { wch: 22 },
    ];

    // Merge do t\u00edtulo
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quadro AAP");
    XLSX.writeFile(wb, `Quadro_AAP_${quadro.school.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Exporta\u00e7\u00e3o Excel conclu\u00edda");
  };

  // Exportar PDF (via impressão)
  const handleExportPDF = () => {
    window.print();
  };

  const lastSubmission = history?.[0];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quadro de Atendentes de Apoio Pedag\u00f3gico</h1>
          <p className="text-muted-foreground mt-1">Quadro AAP — Fiel ao documento oficial da SAIN</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          {/* Status e ações */}
          <div className="flex flex-col md:flex-row gap-4 print:hidden">
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status do envio</p>
                    {lastSubmission ? (
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-700">Enviado — {lastSubmission.weekReference}</span>
                        <span className="text-sm text-muted-foreground">
                          por {lastSubmission.submittedByName} em {new Date(lastSubmission.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <span className="font-medium text-amber-600">Pendente — Nenhum envio registrado</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="w-auto">
              <CardContent className="pt-6 flex items-center gap-2">
                <Badge variant="outline" className="text-sm">{quadro.totalAlunos || 0} alunos</Badge>
                <Badge variant="outline" className="text-sm">{quadro.totalMediadores || 0} mediadores</Badge>
                <Badge variant="outline" className="text-sm text-amber-600 border-amber-300">{quadro.totalSemAtendente || 0} sem atendente</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Botões de ação */}
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
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            {history && history.length > 0 && (
              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {history.length} envio(s) registrado(s)
              </div>
            )}
          </div>

          {/* Quadro AAP — Tabela fiel ao documento */}
          <div className="border rounded-lg bg-white overflow-x-auto" id="quadro-aap">
            {/* Cabeçalho institucional */}
            <div className="p-6 border-b bg-slate-50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Centro de Refer\u00eancia e Apoio \u00e0 Educa\u00e7\u00e3o Inclusiva "Rafael Veneroso"</p>
                  <p className="text-xs text-muted-foreground">craei@semed.betim.mg.gov.br | Tel: (31) 3531-2720 / (31) 3532-2389</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm"><strong>Escola Municipal:</strong> <span className="underline">{quadro.school.name}</span></p>
                <p className="text-sm mt-1"><strong>Respons\u00e1vel pela informa\u00e7\u00e3o:</strong> {quadro.responsible}</p>
                <p className="text-sm mt-1"><strong>Data:</strong> {quadro.date}</p>
              </div>
              <h2 className="text-center font-bold text-lg mt-4">QUADRO DE ATENDENTES DE APOIO PEDAG\u00d3GICO – AAP</h2>
            </div>

            {/* Tabela */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th rowSpan={2} className="border px-2 py-2 text-center font-semibold w-12">N\u00b0</th>
                  <th rowSpan={2} className="border px-2 py-2 text-left font-semibold min-w-[180px]">Nome do AAP</th>
                  <th colSpan={2} className="border px-2 py-2 text-center font-semibold">Turno</th>
                  <th rowSpan={2} className="border px-2 py-2 text-left font-semibold min-w-[200px]">Alunos Atendidos</th>
                  <th rowSpan={2} className="border px-2 py-2 text-center font-semibold w-20">Ano e Turma</th>
                  <th colSpan={3} className="border px-2 py-2 text-center font-semibold">Mobilidade</th>
                  <th rowSpan={2} className="border px-2 py-2 text-center font-semibold min-w-[120px]">Defici\u00eancia (tipologia)</th>
                  <th colSpan={2} className="border px-2 py-2 text-center font-semibold">Atend. Domiciliar</th>
                  <th rowSpan={2} className="border px-2 py-2 text-center font-semibold min-w-[140px]">Escola do AAP no outro turno</th>
                </tr>
                <tr className="bg-slate-100">
                  <th className="border px-1 py-1 text-center font-semibold text-xs w-10">1\u00b0</th>
                  <th className="border px-1 py-1 text-center font-semibold text-xs w-10">2\u00b0</th>
                  <th className="border px-1 py-1 text-center font-semibold text-xs w-16">Cad. Rodas</th>
                  <th className="border px-1 py-1 text-center font-semibold text-xs w-16">Andador</th>
                  <th className="border px-1 py-1 text-center font-semibold text-xs w-14">Pr\u00f3tese</th>
                  <th className="border px-1 py-1 text-center font-semibold text-xs w-10">Sim</th>
                  <th className="border px-1 py-1 text-center font-semibold text-xs w-10">N\u00e3o</th>
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
                          <td rowSpan={row.alunos.length} className="border px-2 py-2 text-center font-medium align-top">
                            {String(row.numero).padStart(2, "0")}
                          </td>
                          <td rowSpan={row.alunos.length} className="border px-2 py-2 align-top font-medium">
                            {row.nomeAAP}
                          </td>
                          <td rowSpan={row.alunos.length} className="border px-2 py-2 text-center align-top">
                            {row.turno1 ? <span className="font-bold">X</span> : ""}
                          </td>
                          <td rowSpan={row.alunos.length} className="border px-2 py-2 text-center align-top">
                            {row.turno2 ? <span className="font-bold">X</span> : ""}
                          </td>
                        </>
                      )}
                      <td className="border px-2 py-2">{aluno.nome}</td>
                      <td className="border px-2 py-2 text-center">{aluno.anoTurma}</td>
                      <td className="border px-2 py-2 text-center text-xs">{aluno.cadeiradeRodas ? "sim" : "n\u00e3o"}</td>
                      <td className="border px-2 py-2 text-center text-xs">{aluno.andador ? "sim" : "n\u00e3o"}</td>
                      <td className="border px-2 py-2 text-center text-xs">{aluno.protese ? "sim" : "n\u00e3o"}</td>
                      <td className="border px-2 py-2 text-center">{aluno.deficiencia}</td>
                      <td className="border px-2 py-2 text-center">{aluno.atendimentoDomiciliar ? "X" : ""}</td>
                      <td className="border px-2 py-2 text-center">{!aluno.atendimentoDomiciliar ? "X" : ""}</td>
                      {idx === 0 && (
                        <td rowSpan={row.alunos.length} className="border px-2 py-2 text-center align-top text-xs">
                          {row.escolaOutroTurno}
                        </td>
                      )}
                    </tr>
                  ))
                )}
                {quadro.rows.length === 0 && (
                  <tr>
                    <td colSpan={13} className="border px-4 py-8 text-center text-muted-foreground">
                      Nenhum registro encontrado para esta escola. Cadastre alunos e mediadores para gerar o quadro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Rodapé do quadro */}
            <div className="p-6 border-t bg-slate-50">
              <p className="text-sm font-semibold mb-2">Assinatura do respons\u00e1vel e carimbo</p>
              <div className="border-b border-dashed border-gray-400 w-64 mt-8 mb-2" />
              <p className="text-xs text-muted-foreground">{quadro.responsible}</p>

              <div className="mt-6 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Orienta\u00e7\u00f5es de Preenchimento</p>
                <p>Caso o AAP esteja trabalhando na sua Escola nos 02 turnos, marcar um X para cada turno em 01 linha e colocar o nome dos alunos atendidos \u00e0 frente.</p>
                <p><strong>Mobilidade:</strong> Marcar X nos espa\u00e7os que se referem \u00e0 situa\u00e7\u00e3o do aluno.</p>
                <p><strong>Defici\u00eancia:</strong> Registrar sucintamente a tipologia da defici\u00eancia do aluno.</p>
                <p><strong>Atendimento Domiciliar:</strong> Marcar com X na coluna Sim caso o aluno seja atendido em domic\u00edlio. Marcar N\u00e3o caso o aluno seja atendido somente na Escola.</p>
                <div className="mt-2">
                  <p className="font-semibold text-foreground">Tipologia:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
                    <span><strong>DI</strong> – Defici\u00eancia Intelectual</span>
                    <span><strong>DF</strong> – Defici\u00eancia F\u00edsica</span>
                    <span><strong>DMu</strong> – Defici\u00eancia M\u00faltipla</span>
                    <span><strong>TGD</strong> – Transtorno Global do Desenvolvimento</span>
                    <span><strong>TEA</strong> – Transtorno do Espectro do Autismo</span>
                    <span><strong>DV</strong> – Defici\u00eancia Visual</span>
                    <span><strong>PS</strong> – Pessoa com Surdez</span>
                    <span><strong>BA</strong> – Baixa Audi\u00e7\u00e3o</span>
                    <span><strong>BV</strong> – Baixa Vis\u00e3o</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico de envios */}
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
                          Enviado por {h.submittedByName} em {new Date(h.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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
            <DialogTitle>Enviar Quadro AAP para SAIN</DialogTitle>
            <DialogDescription>
              O quadro atual ser\u00e1 registrado como snapshot e enviado para a Secretaria Adjunta de Inclus\u00e3o.
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
                <p><strong>Total de registros:</strong> {quadro.rows.length}</p>
                <p><strong>Alunos:</strong> {quadro.totalAlunos} | <strong>Mediadores:</strong> {quadro.totalMediadores} | <strong>Sem atendente:</strong> {quadro.totalSemAtendente}</p>
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

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #quadro-aap, #quadro-aap * { visibility: visible; }
          #quadro-aap { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
