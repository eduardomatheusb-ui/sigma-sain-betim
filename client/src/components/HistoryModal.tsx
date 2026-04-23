import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, User, Clock, ArrowRight } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  name: "Nome",
  dateOfBirth: "Data de Nascimento",
  schoolId: "Escola",
  shift: "Turno",
  disability: "Deficiência",
  attendantName: "Atendente",
  status: "Situação",
  grade: "Turma",
  notes: "Observações",
  responsible: "Responsável",
  phone: "Telefone",
  address: "Endereço",
  cpf: "CPF",
  registration: "Matrícula",
  changeType: "Tipo de Alteração",
  inactivityReason: "Motivo de Inatividade",
  linkedStudents: "Alunos Vinculados",
  isShared: "Compartilhado",
  note: "Observação",
  returnDate: "Data de Retorno",
};

function formatValue(val: string | null): string {
  if (val === null || val === undefined || val === "") return "(vazio)";
  if (val === "true") return "Sim";
  if (val === "false") return "Não";
  // Tentar formatar datas
  if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
    try {
      return new Date(val).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return val; }
  }
  return val;
}

interface HistoryEntry {
  id: number;
  editedByName?: string | null;
  changedByName?: string | null;
  fieldChanged?: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  editedAt?: Date | string | null;
  changedAt?: Date | string | null;
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  entries: HistoryEntry[];
  isLoading?: boolean;
}

export function HistoryModal({ open, onClose, title, subtitle, entries, isLoading }: HistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando histórico...</div>
        ) : entries.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Nenhuma alteração registrada ainda.</p>
            <p className="text-xs mt-1">O histórico será registrado a partir da próxima edição.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 pr-2">
              {entries.map((entry) => {
                const timestamp = entry.editedAt || entry.changedAt;
                const editor = entry.editedByName || entry.changedByName || "Usuário";
                const dateStr = timestamp
                  ? new Date(timestamp as string).toLocaleString("pt-BR", {
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })
                  : "—";

                // Entrada de histórico de aluno (fieldChanged)
                if (entry.fieldChanged) {
                  const label = FIELD_LABELS[entry.fieldChanged] || entry.fieldChanged;
                  return (
                    <div key={entry.id} className="border rounded-lg p-3 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{editor}</span>
                          <span className="text-muted-foreground">alterou</span>
                          <Badge variant="outline" className="text-xs">{label}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {dateStr}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs line-through">
                          {formatValue(entry.oldValue ?? null)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium">
                          {formatValue(entry.newValue ?? null)}
                        </span>
                      </div>
                      {entry.reason && (
                        <p className="text-xs text-muted-foreground mt-1">Motivo: {entry.reason}</p>
                      )}
                    </div>
                  );
                }

                // Entrada de histórico de mediador (previousStatus → newStatus)
                return (
                  <div key={entry.id} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{editor}</span>
                        <span className="text-muted-foreground">alterou situação</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {dateStr}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs line-through">
                        {entry.previousStatus || "(vazio)"}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium">
                        {entry.newStatus || "(vazio)"}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-xs text-muted-foreground mt-1">Motivo: {entry.reason}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
