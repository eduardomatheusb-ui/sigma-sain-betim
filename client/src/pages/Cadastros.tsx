/**
 * Quadro Semanal - visao da escola sobre seus mediadores/atendentes.
 * Usa weeklySnapshots.submit para registrar snapshot real.
 */
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { CalendarCheck, CheckCircle2, Clock, Search, X, Users, Download, History, Send } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo", inactive: "Inativo", on_leave: "Afastado",
  dismissed: "Desligado", substituted: "Substituido", vacancy: "Vaga aberta",
  temp_leave: "Afastamento temp.", awaiting_replacement: "Aguardando substituto",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800", inactive: "bg-gray-100 text-gray-800",
  on_leave: "bg-yellow-100 text-yellow-800", dismissed: "bg-red-100 text-red-800",
  substituted: "bg-purple-100 text-purple-800", vacancy: "bg-blue-100 text-blue-800",
  temp_leave: "bg-orange-100 text-orange-800", awaiting_replacement: "bg-orange-100 text-orange-800",
};
const CHANGE_TYPE_LABELS: Record<string, string> = {
  none: "Sem alteracao", new: "Novo", replacement: "Substituicao",
  transfer: "Transferencia", return: "Retorno", dismissal: "Desligamento",
  "Sem alteração": "Sem alteracao", "Novo atendente": "Novo atendente",
  "Desligamento": "Desligamento", "Licença médica": "Licenca medica",
  "Afastamento temporário": "Afastamento temp.", "Retorno ao trabalho": "Retorno",
  "Troca de escola": "Troca de escola", "Substituição": "Substituicao",
  "Nova demanda": "Nova demanda", "Encerramento de demanda": "Encerramento",
  "Alteração de vínculo com aluno": "Alteracao vinculo", "Vaga em aberto": "Vaga aberta",
};

export default function Cadastros() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin";

  const { data: mediators = [], isLoading } = trpc.mediators.listBySchool.useQuery();
  const { data: schools = [] } = trpc.schools.list.useQuery();

  // Snapshots history
  const { data: snapshots = [] } = trpc.weeklySnapshots.listBySchool.useQuery(
    { schoolId: user?.schoolId || 0 },
    { enabled: !!user?.schoolId }
  );

  const submitSnapshot = trpc.weeklySnapshots.submit.useMutation({
    onSuccess: (result) => {
      toast.success("Quadro semanal enviado com sucesso! Semana: " + (result as any)?.weekReference);
      setShowSubmitDialog(false);
      setSubmitNotes("");
      utils.schools.list.invalidate();
      utils.weeklySnapshots.listBySchool.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitNotes, setSubmitNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const userSchool = useMemo(() => {
    if (!user?.schoolId) return null;
    return schools.find((s: any) => s.id === user.schoolId) || null;
  }, [schools, user?.schoolId]);

  type Mediator = typeof mediators[number];

  const filteredMediators = useMemo(() => {
    return mediators.filter((m: Mediator) => {
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return m.name.toLowerCase().includes(q) ||
          (m.registration && m.registration.toLowerCase().includes(q)) ||
          (m.responsible && m.responsible.toLowerCase().includes(q));
      }
      return true;
    });
  }, [mediators, searchQuery, filterStatus]);

  const handleSubmitWeekly = () => {
    if (!user?.schoolId) {
      toast.error("Sua conta nao esta vinculada a uma escola.");
      return;
    }
    submitSnapshot.mutate({
      schoolId: user.schoolId,
      notes: submitNotes || undefined,
    });
  };

  const exportCSV = () => {
    const headers = ["Nome", "Matricula", "Responsavel", "Status", "Tipo de Alteracao", "Alunos Vinculados", "Compartilhado", "Atualizado"];
    const rows = filteredMediators.map((m: Mediator) => [
      m.name, m.registration || "", m.responsible || "",
      STATUS_LABELS[m.status] || m.status,
      CHANGE_TYPE_LABELS[m.changeType || "none"] || m.changeType || "",
      m.linkedStudents || "", m.isShared ? "Sim" : "Nao",
      new Date(m.updatedAt).toLocaleDateString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map(r => r.map((c: unknown) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "quadro-semanal-" + new Date().toISOString().split("T")[0] + ".csv";
    a.click(); URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
  };

  const weeklyStatus = (userSchool as any)?.weeklyStatus;
  const lastUpdate = (userSchool as any)?.lastWeeklyUpdate
    ? new Date((userSchool as any).lastWeeklyUpdate).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quadro Semanal</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Visao geral do quadro de atendentes por escola" : "Quadro de atendentes - " + ((userSchool as any)?.name || "Carregando...")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isAdmin && user?.schoolId && (
            <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
              <History className="h-4 w-4 mr-1" /> Historico
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Banner de status (escola) */}
      {!isAdmin && (
        <Card className={weeklyStatus === "updated" ? "border-green-300 bg-green-50" : "border-yellow-300 bg-yellow-50"}>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {weeklyStatus === "updated" ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                )}
                <div>
                  <p className={"font-semibold " + (weeklyStatus === "updated" ? "text-green-800" : "text-yellow-800")}>
                    {weeklyStatus === "updated" ? "Quadro semanal enviado" : "Quadro semanal pendente"}
                  </p>
                  <p className={"text-sm " + (weeklyStatus === "updated" ? "text-green-700" : "text-yellow-700")}>
                    {weeklyStatus === "updated"
                      ? "Ultimo envio: " + (lastUpdate || "-")
                      : "Confirme os dados dos atendentes e envie o quadro semanal."}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className={weeklyStatus === "updated" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-yellow-600 hover:bg-yellow-700 text-white"}
              >
                <Send className="h-4 w-4 mr-2" />
                {weeklyStatus === "updated" ? "Reenviar quadro" : "Enviar quadro semanal"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total de atendentes", value: mediators.length },
          { label: "Ativos", value: mediators.filter((m: Mediator) => m.status === "active").length },
          { label: "Afastados/Inativos", value: mediators.filter((m: Mediator) => m.status !== "active").length },
          { label: "Compartilhados", value: mediators.filter((m: Mediator) => m.isShared).length },
        ].map((m: { label: string; value: number }) => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de mediadores */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" /> Atendentes ({filteredMediators.length})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome, matricula..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8" />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Todos os status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="on_leave">Afastado</SelectItem>
                  <SelectItem value="dismissed">Desligado</SelectItem>
                  <SelectItem value="vacancy">Vaga aberta</SelectItem>
                </SelectContent>
              </Select>
              {(filterStatus !== "all" || searchQuery) && (
                <Button variant="ghost" size="sm" onClick={() => { setFilterStatus("all"); setSearchQuery(""); }}>
                  <X className="h-4 w-4 mr-1" /> Limpar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando atendentes...</div>
          ) : filteredMediators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum atendente encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atendente</TableHead>
                    {isAdmin && <TableHead>Escola</TableHead>}
                    <TableHead>Matricula</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Alteracao</TableHead>
                    <TableHead>Alunos</TableHead>
                    <TableHead>Atualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMediators.map((mediator: Mediator) => (
                    <TableRow key={mediator.id}>
                      <TableCell>
                        <div className="font-medium">{mediator.name}</div>
                        {mediator.responsible && <div className="text-xs text-muted-foreground">Resp: {mediator.responsible}</div>}
                      </TableCell>
                      {isAdmin && <TableCell className="text-sm">{(mediator as any).schoolName || "-"}</TableCell>}
                      <TableCell className="text-sm">{mediator.registration || "-"}</TableCell>
                      <TableCell>
                        <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " + (STATUS_COLORS[mediator.status] || "bg-gray-100 text-gray-800")}>
                          {STATUS_LABELS[mediator.status] || mediator.status}
                        </span>
                        {mediator.isShared && <Badge variant="outline" className="ml-1 text-xs">Comp.</Badge>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {CHANGE_TYPE_LABELS[mediator.changeType || "none"] || mediator.changeType || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {mediator.linkedStudents ? <div className="max-w-32 truncate" title={mediator.linkedStudents}>{mediator.linkedStudents}</div> : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(mediator.updatedAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info card */}
      {!isAdmin && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <CalendarCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 text-sm">Como funciona o Quadro Semanal</p>
                <p className="text-sm text-blue-700 mt-1">
                  Toda semana, revise a lista de atendentes acima e clique em{" "}
                  <strong>"Enviar quadro semanal"</strong> para registrar um snapshot dos dados atuais.
                  O sistema registra automaticamente a semana de referencia, quem enviou e todos os dados dos mediadores.
                  Para cadastrar ou editar atendentes, acesse a aba <strong>Mediadores</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de envio com notas */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Quadro Semanal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ao enviar, um snapshot de todos os {mediators.length} atendentes sera registrado com a semana atual.
              A secretaria podera visualizar o quadro completo.
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Observacoes (opcional)</label>
              <Textarea
                placeholder="Alguma observacao sobre esta semana? Ex: mediador X entrou de licenca..."
                value={submitNotes}
                onChange={e => setSubmitNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancelar</Button>
            <Button onClick={handleSubmitWeekly} disabled={submitSnapshot.isPending}>
              <Send className="h-4 w-4 mr-2" />
              {submitSnapshot.isPending ? "Enviando..." : "Confirmar envio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog historico de envios */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Historico de Envios</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {snapshots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum envio registrado ainda.</p>
            ) : (
              snapshots.map((snap: any) => (
                <div key={snap.id} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{snap.weekReference}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(snap.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm">Enviado por: <strong>{snap.submittedByName || "Usuario"}</strong></p>
                  {snap.notes && <p className="text-sm text-muted-foreground">Obs: {snap.notes}</p>}
                  {snap.snapshotData && (
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const data = JSON.parse(snap.snapshotData);
                          return data.length + " atendentes registrados";
                        } catch { return ""; }
                      })()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
