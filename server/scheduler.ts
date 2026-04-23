/**
 * scheduler.ts
 * Agendamento automático de lembretes semanais para escolas pendentes.
 * Executa toda sexta-feira às 14h (horário de Brasília, UTC-3 = 17h UTC).
 */
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { schools, weeklySnapshots } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Helper: calcular semana de referência (formato YYYY-Wnn)
function getWeekReference(date?: Date): string {
  const d = date || new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - startOfYear.getTime()) / 86400000);
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// Verificar se é sexta-feira no horário de Brasília (UTC-3)
function isFridayBrasilia(): boolean {
  const now = new Date();
  // Ajustar para UTC-3
  const brasilia = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return brasilia.getUTCDay() === 5; // 5 = sexta-feira
}

// Verificar se está no horário de envio (14h-15h horário de Brasília)
function isReminderHour(): boolean {
  const now = new Date();
  const brasilia = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const hour = brasilia.getUTCHours();
  return hour === 14; // 14h de Brasília = 17h UTC
}

// Enviar lembrete para escolas pendentes
async function sendWeeklyReminder(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Scheduler] Database não disponível para envio de lembrete.");
    return;
  }

  try {
    const weekRef = getWeekReference();
    const allSchools = await db.select({ id: schools.id, name: schools.name }).from(schools);
    const sentSnapshots = await db
      .select({ schoolId: weeklySnapshots.schoolId })
      .from(weeklySnapshots)
      .where(eq(weeklySnapshots.weekReference, weekRef));
    const sentIds = new Set(sentSnapshots.map(s => s.schoolId));
    const pendingSchools = allSchools.filter(s => !sentIds.has(s.id));

    if (pendingSchools.length === 0) {
      console.log(`[Scheduler] Semana ${weekRef}: todas as ${allSchools.length} escolas já enviaram o quadro.`);
      return;
    }

    const pendingNames = pendingSchools.map(s => s.name).join(", ");
    await notifyOwner({
      title: `[SIGMA] Lembrete Automático — ${pendingSchools.length} escola(s) pendente(s)`,
      content: `Lembrete automático de sexta-feira.\n\nSemana ${weekRef}: ${pendingSchools.length} de ${allSchools.length} escolas ainda não enviaram o Quadro de Mediadores.\n\nEscolas pendentes:\n${pendingNames}`,
    });

    console.log(`[Scheduler] Lembrete enviado: ${pendingSchools.length} escola(s) pendente(s) na semana ${weekRef}.`);
  } catch (err) {
    console.error("[Scheduler] Erro ao enviar lembrete semanal:", err);
  }
}

// Controle para evitar múltiplos envios na mesma hora
let lastReminderSent: string | null = null;

// Iniciar agendamento: verificar a cada 30 minutos
export function startWeeklyReminderScheduler(): void {
  console.log("[Scheduler] Agendamento de lembrete semanal iniciado (verifica a cada 30 min, envia sexta às 14h).");

  const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutos

  const check = async () => {
    if (!isFridayBrasilia() || !isReminderHour()) return;

    // Evitar envio duplicado na mesma hora
    const weekRef = getWeekReference();
    const key = `${weekRef}-friday-14h`;
    if (lastReminderSent === key) return;

    lastReminderSent = key;
    console.log(`[Scheduler] Disparando lembrete semanal automático (${key})...`);
    await sendWeeklyReminder();
  };

  // Verificar imediatamente e depois a cada 30 minutos
  check().catch(console.error);
  setInterval(() => check().catch(console.error), CHECK_INTERVAL_MS);
}
