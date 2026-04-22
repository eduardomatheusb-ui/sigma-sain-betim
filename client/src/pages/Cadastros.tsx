/**
 * Quadro Semanal — visão da escola sobre seus mediadores/atendentes.
 */
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CalendarCheck, CheckCircle2, Clock, Search, X, Users, Download } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  on_leave: "Afastado",
  awaiting_replacement: "Aguardando substituto",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  on_leave: "bg-yellow-100 text-yellow-800",
  awaiting_replacement: "bg-orange-100 text-orange-800",
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  none: "Sem alteração",
  new: "Novo",
  replacement: "Substituição",
  transfer: "Transferência",
  return: "Retorno",
  dismissal: "Desligamento",
};

export default function Cadastros() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: mediators = [], isLoading } = trpc.mediators.listBySchool.useQuery();
  const { data: schools = [] } = trpc.schools.list.useQuery();

  const updateWeeklyStatus = trpc.schools.updateWeeklyStatus.useMutation({
    onSuccess: () => {
      toast.success("Quadro semanal enviado com sucesso! A secretaria foi notificada.");
      utils.schools.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const userSchool = useMemo(() => {
    if (!user?.schoolId) return null;
    return schools.find((s) => s.id === user.schoolId) || null;
  }, [schools, user?.schoolId]);

  type Mediator = typeof mediators[number];

  const filteredMediators = useMemo(() => {
    return mediators.filter((m: Mediator) => {
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          (m.registration && m.registration.toLowerCase().includes(q)) ||
          (m.responsible && m.responsible.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [mediators, searchQuery, filterStatus]);

  const handleSendWeekly = () => {
    if (!user?.schoolId) {
      toast.error("Sua conta não está vinculada a uma escola. Contate o administrador.");
      return;
    }
    updateWeeklyStatus.mutate({ id: user.schoolId, weeklyStatus: "updated" });
  };

  const exportCSV = () => {
    const headers = ["Nome", "Matrícula", "Responsável", "Status", "Tipo de Alteração", "Alunos Vinculados", "Compartilhado", "Atualizado"];
    const rows = filteredMediators.map((m: Mediator) => [
      m.name,
      m.registration || "",
      m.responsible || "",
      STATUS_LABELS[m.status] || m.status,
      CHANGE_TYPE_LABELS[m.changeType || "none"] || m.changeType || "",
      m.linkedStudents || "",
      m.isShared ? "Sim" : "Não",
      new Date(m.updatedAt).toLocaleDateString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c: unknown) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quadro-semanal-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  };

  const isAdmin = user?.role === "admin";
  const weeklyStatus = userSchool?.weeklyStatus;
  const lastUpdate = userSchool?.lastWeeklyUpdate
    ? new Date(userSchool.lastWeeklyUpdate).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quadro Semanal</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Visão geral do quadro de atendentes por escola"
                : `Quadro de atendentes — ${userSchool?.name || "Carregando..."}`}
            </p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <Card className={weeklyStatus === "updated"
          ? "border-green-300 bg-green-50"
          : "border-yellow-300 bg-yellow-50"
        }>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {weeklyStatus === "updated" ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-semibold ${weeklyStatus === "updated" ? "text-green-800" : "text-yellow-800"}`}>
                    {weeklyStatus === "updated"
                      ? "Quadro semanal enviado"
                      : "Quadro semanal pendente"}
                  </p>
                  <p className={`text-sm ${weeklyStatus === "updated" ? "text-green-700" : "text-yellow-700"}`}>
                    {weeklyStatus === "updated"
                      ? `Último envio: ${lastUpdate || "—"}`
                      : "Confirme que os dados dos atendentes estão atualizados e envie o quadro semanal."}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSendWeekly}
                disabled={updateWeeklyStatus.isPending}
                className={weeklyStatus === "updated"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                {updateWeeklyStatus.isPending
                  ? "Enviando..."
                  : weeklyStatus === "updated"
                  ? "Reenviar quadro"
                  : "Enviar quadro semanal"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total de atendentes", value: mediators.length },
          { label: "Ativos", value: mediators.filter((m: Mediator) => m.status === "active").length },
          { label: "Afastados", value: mediators.filter((m: Mediator) => m.status === "on_leave").length },
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

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Atendentes ({filteredMediators.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" />
                Exportar CSV
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, matrícula ou responsável"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="on_leave">Afastado</SelectItem>
                  <SelectItem value="awaiting_replacement">Aguardando substituto</SelectItem>
                </SelectContent>
              </Select>
              {(filterStatus !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilterStatus("all"); setSearchQuery(""); }}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" /> Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando atendentes...</div>
          ) : filteredMediators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum atendente encontrado.</p>
              {!isAdmin && (
                <p className="text-sm mt-1">
                  Para cadastrar atendentes, acesse a aba <strong>Mediadores</strong>.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ATENDENTE</TableHead>
                    {isAdmin && <TableHead>ESCOLA</TableHead>}
                    <TableHead>MATRÍCULA</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>ALTERAÇÃO</TableHead>
                    <TableHead>ALUNOS</TableHead>
                    <TableHead>ATUALIZADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMediators.map((mediator) => (
                    <TableRow key={mediator.id}>
                      <TableCell>
                        <div className="font-medium">{mediator.name}</div>
                        {mediator.responsible && (
                          <div className="text-xs text-muted-foreground">Resp: {mediator.responsible}</div>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-sm">{mediator.schoolName || "—"}</TableCell>
                      )}
                      <TableCell className="text-sm">{mediator.registration || "—"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[mediator.status] || "bg-gray-100 text-gray-800"}`}>
                          {STATUS_LABELS[mediator.status] || mediator.status}
                        </span>
                        {mediator.isShared && (
                          <Badge variant="outline" className="ml-1 text-xs">Compartilhado</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {CHANGE_TYPE_LABELS[mediator.changeType || "none"] || mediator.changeType || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {mediator.linkedStudents ? (
                          <div className="max-w-32 truncate" title={mediator.linkedStudents}>
                            {mediator.linkedStudents}
                          </div>
                        ) : "—"}
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

      {!isAdmin && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <CalendarCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 text-sm">Como funciona o Quadro Semanal</p>
                <p className="text-sm text-blue-700 mt-1">
                  Toda semana, revise a lista de atendentes acima e clique em{" "}
                  <strong>"Enviar quadro semanal"</strong> para confirmar que as informações estão
                  corretas e atualizadas. Para cadastrar ou editar atendentes, acesse a aba{" "}
                  <strong>Mediadores</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
