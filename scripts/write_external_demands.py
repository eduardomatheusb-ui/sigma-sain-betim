import os

content = r'''import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Search, FileText, History, Eye, ArrowRightLeft } from "lucide-react";

const STATUS_LIST = ["Recebida","Triagem/Protocolo","Em instrução técnica","Devolvida para complementação","Em validação do gabinete","Aguardando assinatura","Assinada","Encaminhada à SEMED","Arquivada"] as const;
type DemandStatus = typeof STATUS_LIST[number];

const STATUS_CONFIG: Record<DemandStatus, { label: string; color: string }> = {
  "Recebida":                      { label: "Recebida",                      color: "bg-blue-100 text-blue-800" },
  "Triagem/Protocolo":             { label: "Triagem/Protocolo",             color: "bg-indigo-100 text-indigo-800" },
  "Em instrução técnica":          { label: "Em instrução técnica",          color: "bg-yellow-100 text-yellow-800" },
  "Devolvida para complementação": { label: "Devolvida para complementação", color: "bg-orange-100 text-orange-800" },
  "Em validação do gabinete":      { label: "Em validação do gabinete",      color: "bg-purple-100 text-purple-800" },
  "Aguardando assinatura":         { label: "Aguardando assinatura",         color: "bg-pink-100 text-pink-800" },
  "Assinada":                      { label: "Assinada",                      color: "bg-teal-100 text-teal-800" },
  "Encaminhada à SEMED":           { label: "Encaminhada à SEMED",           color: "bg-green-100 text-green-800" },
  "Arquivada":                     { label: "Arquivada",                     color: "bg-gray-100 text-gray-600" },
};

const PRIORIDADE_CONFIG = {
  baixa:   { label: "Baixa",   color: "bg-slate-100 text-slate-700" },
  media:   { label: "Média",   color: "bg-yellow-100 text-yellow-700" },
  alta:    { label: "Alta",    color: "bg-orange-100 text-orange-700" },
  urgente: { label: "Urgente", color: "bg-red-100 text-red-700" },
};

const TIPO_DOC_LABELS: Record<string, string> = {
  oficio: "Ofício", notificacao: "Notificação", recomendacao: "Recomendação",
  requisicao: "Requisição", encaminhamento: "Encaminhamento", solicitacao: "Solicitação",
  denuncia: "Denúncia", outros: "Outros",
};

const ACTIVE_STATUSES: DemandStatus[] = ["Recebida","Triagem/Protocolo","Em instrução técnica","Devolvida para complementação","Em validação do gabinete"];
const AWAITING_STATUSES: DemandStatus[] = ["Aguardando assinatura"];
const FORWARDED_STATUSES: DemandStatus[] = ["Assinada","Encaminhada à SEMED"];

export default function ExternalDemands() {
  const { user } = useAuth();
  const [tab, setTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [showChangeStatus, setShowChangeStatus] = useState<number | null>(null);
  const { data: demands = [], isLoading, refetch } = trpc.externalDemands.list.useQuery();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (demands as any[]).filter((d: any) => {
      const matchSearch = !q || (d.origem||"").toLowerCase().includes(q) || (d.orgaoSetor||"").toLowerCase().includes(q) || (d.protocolo||"").toLowerCase().includes(q) || (d.resumo||"").toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (tab === "todas") return true;
      if (tab === "andamento") return ACTIVE_STATUSES.includes(d.status);
      if (tab === "aguardando") return AWAITING_STATUSES.includes(d.status);
      if (tab === "encaminhadas") return FORWARDED_STATUSES.includes(d.status);
      if (tab === "arquivadas") return d.status === "Arquivada";
      return true;
    });
  }, [demands, tab, search]);

  const counts = useMemo(() => ({
    todas: (demands as any[]).length,
    andamento: (demands as any[]).filter((d: any) => ACTIVE_STATUSES.includes(d.status)).length,
    aguardando: (demands as any[]).filter((d: any) => AWAITING_STATUSES.includes(d.status)).length,
    encaminhadas: (demands as any[]).filter((d: any) => FORWARDED_STATUSES.includes(d.status)).length,
    arquivadas: (demands as any[]).filter((d: any) => d.status === "Arquivada").length,
  }), [demands]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Demandas Externas</h1>
          <p className="text-sm text-muted-foreground mt-1">Expedientes institucionais recebidos pela Secretaria Adjunta de Inclusão</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus className="h-4 w-4" />Nova Demanda</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {([
          { key: "todas", label: "Total", color: "text-foreground" },
          { key: "andamento", label: "Em andamento", color: "text-yellow-600" },
          { key: "aguardando", label: "Aguardando", color: "text-pink-600" },
          { key: "encaminhadas", label: "Encaminhadas", color: "text-green-600" },
          { key: "arquivadas", label: "Arquivadas", color: "text-gray-500" },
        ] as const).map(m => (
          <Card key={m.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTab(m.key)}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${m.color}`}>{counts[m.key]}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por origem, órgão, protocolo ou resumo..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="todas">Todas ({counts.todas})</TabsTrigger>
          <TabsTrigger value="andamento">Em Andamento ({counts.andamento})</TabsTrigger>
          <TabsTrigger value="aguardando">Aguardando Resposta ({counts.aguardando})</TabsTrigger>
          <TabsTrigger value="encaminhadas">Encaminhadas ({counts.encaminhadas})</TabsTrigger>
          <TabsTrigger value="arquivadas">Arquivadas ({counts.arquivadas})</TabsTrigger>
        </TabsList>
        {["todas","andamento","aguardando","encaminhadas","arquivadas"].map(tabKey => (
          <TabsContent key={tabKey} value={tabKey}>
            <DemandList demands={filtered} isLoading={isLoading} onView={id => setShowDetail(id)} onChangeStatus={id => setShowChangeStatus(id)} />
          </TabsContent>
        ))}
      </Tabs>

      {showCreate && <CreateDemandDialog open={showCreate} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); refetch(); }} />}
      {showDetail !== null && <DemandDetailDialog demandId={showDetail} open={showDetail !== null} onClose={() => setShowDetail(null)} onChangeStatus={() => { setShowChangeStatus(showDetail); setShowDetail(null); }} onSuccess={refetch} />}
      {showChangeStatus !== null && <ChangeStatusDialog demandId={showChangeStatus} open={showChangeStatus !== null} onClose={() => setShowChangeStatus(null)} onSuccess={() => { setShowChangeStatus(null); refetch(); }} />}
    </div>
  );
}

function DemandList({ demands, isLoading, onView, onChangeStatus }: { demands: any[]; isLoading: boolean; onView: (id: number) => void; onChangeStatus: (id: number) => void; }) {
  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Carregando...</div>;
  if (demands.length === 0) return <div className="py-12 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Nenhuma demanda encontrada.</p></div>;
  return (
    <div className="space-y-2 mt-4">
      {demands.map((d: any) => {
        const sc = STATUS_CONFIG[d.status as DemandStatus] || { label: d.status, color: "bg-gray-100 text-gray-600" };
        const pc = PRIORIDADE_CONFIG[d.prioridade as keyof typeof PRIORIDADE_CONFIG] || PRIORIDADE_CONFIG.media;
        const isOverdue = d.prazoResposta && new Date(d.prazoResposta) < new Date() && d.status !== "Arquivada";
        return (
          <Card key={d.id} className={`hover:shadow-md transition-shadow ${isOverdue ? "border-red-300" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`${sc.color} text-xs`}>{sc.label}</Badge>
                    <Badge className={`${pc.color} text-xs`}>{pc.label}</Badge>
                    {d.protocolo && <span className="text-xs text-muted-foreground font-mono">#{d.protocolo}</span>}
                    {isOverdue && <Badge className="bg-red-100 text-red-700 text-xs">Prazo vencido</Badge>}
                  </div>
                  <div className="font-medium text-sm truncate">{d.origem || "—"}</div>
                  {d.orgaoSetor && <div className="text-xs text-muted-foreground">{d.orgaoSetor}</div>}
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.resumo || "—"}</div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {d.dataRecebimento && <span>Recebido: {new Date(d.dataRecebimento).toLocaleDateString("pt-BR")}</span>}
                    {d.prazoResposta && <span className={isOverdue ? "text-red-600 font-medium" : ""}>Prazo: {new Date(d.prazoResposta).toLocaleDateString("pt-BR")}</span>}
                    {d.responsavelNome && <span>Resp.: {d.responsavelNome}</span>}
                    {d.tipoDocumento && <span>{TIPO_DOC_LABELS[d.tipoDocumento] || d.tipoDocumento}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => onView(d.id)} className="gap-1"><Eye className="h-3 w-3" />Ver</Button>
                  {d.status !== "Arquivada" && <Button size="sm" variant="outline" onClick={() => onChangeStatus(d.id)} className="gap-1"><ArrowRightLeft className="h-3 w-3" />Status</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CreateDemandDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void; }) {
  const [form, setForm] = useState({ protocolo: "", origem: "", orgaoSetor: "", tipoDocumento: "oficio" as any, dataRecebimento: new Date().toISOString().split("T")[0], prazoResposta: "", prioridade: "media" as any, resumo: "", descricaoCompleta: "", responsavelNome: "", documentosLinks: "" });
  const createMutation = trpc.externalDemands.create.useMutation({
    onSuccess: () => { toast.success("Demanda registrada com sucesso!"); onSuccess(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origem.trim()) { toast.error("Origem é obrigatória"); return; }
    if (!form.resumo.trim()) { toast.error("Resumo é obrigatório"); return; }
    createMutation.mutate(form);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nova Demanda Externa</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Protocolo</Label><Input placeholder="Nº do protocolo" value={form.protocolo} onChange={e => setForm(f => ({ ...f, protocolo: e.target.value }))} /></div>
            <div><Label>Tipo de Documento</Label>
              <Select value={form.tipoDocumento} onValueChange={v => setForm(f => ({ ...f, tipoDocumento: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(TIPO_DOC_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Origem / Órgão Demandante *</Label><Input placeholder="Ex: Ministério Público, Conselho Tutelar, Ouvidoria..." value={form.origem} onChange={e => setForm(f => ({ ...f, origem: e.target.value }))} required /></div>
          <div><Label>Setor / Promotoria / Unidade</Label><Input placeholder="Ex: Promotoria de Educação, 1ª Vara da Infância..." value={form.orgaoSetor} onChange={e => setForm(f => ({ ...f, orgaoSetor: e.target.value }))} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Data de Recebimento *</Label><Input type="date" value={form.dataRecebimento} onChange={e => setForm(f => ({ ...f, dataRecebimento: e.target.value }))} required /></div>
            <div><Label>Prazo de Resposta</Label><Input type="date" value={form.prazoResposta} onChange={e => setForm(f => ({ ...f, prazoResposta: e.target.value }))} /></div>
            <div><Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={v => setForm(f => ({ ...f, prioridade: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PRIORIDADE_CONFIG).map(([v, c]) => <SelectItem key={v} value={v}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Responsável Interno</Label><Input placeholder="Nome do responsável pela instrução" value={form.responsavelNome} onChange={e => setForm(f => ({ ...f, responsavelNome: e.target.value }))} /></div>
          <div><Label>Resumo da Demanda *</Label><Textarea placeholder="Descreva brevemente o objeto da demanda..." rows={3} value={form.resumo} onChange={e => setForm(f => ({ ...f, resumo: e.target.value }))} required /></div>
          <div><Label>Descrição Completa</Label><Textarea placeholder="Detalhamento completo da demanda..." rows={4} value={form.descricaoCompleta} onChange={e => setForm(f => ({ ...f, descricaoCompleta: e.target.value }))} /></div>
          <div><Label>Documentos / Links</Label><Input placeholder="URLs ou referências de documentos anexos" value={form.documentosLinks} onChange={e => setForm(f => ({ ...f, documentosLinks: e.target.value }))} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Registrando..." : "Registrar Demanda"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DemandDetailDialog({ demandId, open, onClose, onChangeStatus, onSuccess }: { demandId: number; open: boolean; onClose: () => void; onChangeStatus: () => void; onSuccess: () => void; }) {
  const { data: demand, isLoading } = trpc.externalDemands.getById.useQuery({ id: demandId });
  const { data: movements = [] } = trpc.externalDemands.getMovements.useQuery({ demandId });
  const [resposta, setResposta] = useState("");
  const [situacao, setSituacao] = useState("");
  const updateMutation = trpc.externalDemands.update.useMutation({
    onSuccess: () => { toast.success("Demanda atualizada!"); onSuccess(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  if (isLoading || !demand) return <Dialog open={open} onOpenChange={onClose}><DialogContent><div className="py-8 text-center text-muted-foreground">Carregando...</div></DialogContent></Dialog>;
  const sc = STATUS_CONFIG[(demand as any).status as DemandStatus] || { label: (demand as any).status, color: "bg-gray-100 text-gray-600" };
  const pc = PRIORIDADE_CONFIG[(demand as any).prioridade as keyof typeof PRIORIDADE_CONFIG] || PRIORIDADE_CONFIG.media;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Demanda {(demand as any).protocolo ? `#${(demand as any).protocolo}` : `ID ${demandId}`}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Badge className={sc.color}>{sc.label}</Badge>
            <Badge className={pc.color}>{pc.label}</Badge>
            {(demand as any).tipoDocumento && <Badge variant="outline">{TIPO_DOC_LABELS[(demand as any).tipoDocumento] || (demand as any).tipoDocumento}</Badge>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Origem:</span> <span className="font-medium">{(demand as any).origem || "—"}</span></div>
            <div><span className="text-muted-foreground">Setor:</span> <span className="font-medium">{(demand as any).orgaoSetor || "—"}</span></div>
            <div><span className="text-muted-foreground">Recebido em:</span> <span className="font-medium">{(demand as any).dataRecebimento ? new Date((demand as any).dataRecebimento).toLocaleDateString("pt-BR") : "—"}</span></div>
            <div><span className="text-muted-foreground">Prazo:</span> <span className="font-medium">{(demand as any).prazoResposta ? new Date((demand as any).prazoResposta).toLocaleDateString("pt-BR") : "—"}</span></div>
            <div><span className="text-muted-foreground">Responsável:</span> <span className="font-medium">{(demand as any).responsavelNome || "—"}</span></div>
            <div><span className="text-muted-foreground">Registrado por:</span> <span className="font-medium">{(demand as any).createdByName || "—"}</span></div>
          </div>
          <div><div className="text-sm font-medium mb-1">Resumo</div><div className="text-sm text-muted-foreground bg-muted/50 rounded p-3">{(demand as any).resumo || "—"}</div></div>
          {(demand as any).descricaoCompleta && <div><div className="text-sm font-medium mb-1">Descrição Completa</div><div className="text-sm text-muted-foreground bg-muted/50 rounded p-3 whitespace-pre-wrap">{(demand as any).descricaoCompleta}</div></div>}
          <div><div className="text-sm font-medium mb-1">Resposta Elaborada</div><Textarea placeholder="Registre a resposta elaborada..." rows={4} value={resposta || (demand as any).respostaElaborada || ""} onChange={e => setResposta(e.target.value)} /></div>
          <div><div className="text-sm font-medium mb-1">Situação Final</div><Textarea placeholder="Descreva a situação final..." rows={2} value={situacao || (demand as any).situacaoFinal || ""} onChange={e => setSituacao(e.target.value)} /></div>
          {(movements as any[]).length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2"><History className="h-4 w-4" />Histórico de Movimentações</div>
              <div className="space-y-2">
                {(movements as any[]).map((m: any) => (
                  <div key={m.id} className="flex gap-3 text-xs border-l-2 border-muted pl-3">
                    <div className="flex-1"><div className="font-medium">{m.statusAnterior} → {m.statusNovo}</div>{m.observacao && <div className="text-muted-foreground">{m.observacao}</div>}</div>
                    <div className="text-muted-foreground text-right shrink-0"><div>{m.userName}</div><div>{new Date(m.createdAt).toLocaleDateString("pt-BR")}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t">
            <Button variant="outline" onClick={onChangeStatus} className="gap-1"><ArrowRightLeft className="h-4 w-4" />Alterar Status</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Fechar</Button>
              {(resposta || situacao) && <Button onClick={() => updateMutation.mutate({ id: demandId, respostaElaborada: resposta || undefined, situacaoFinal: situacao || undefined })} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Salvando..." : "Salvar Resposta"}</Button>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChangeStatusDialog({ demandId, open, onClose, onSuccess }: { demandId: number; open: boolean; onClose: () => void; onSuccess: () => void; }) {
  const [status, setStatus] = useState<DemandStatus>("Recebida");
  const [observacao, setObservacao] = useState("");
  const changeStatus = trpc.externalDemands.changeStatus.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); onSuccess(); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Alterar Status da Demanda</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Novo Status</Label>
            <Select value={status} onValueChange={v => setStatus(v as DemandStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Observação (opcional)</Label><Textarea placeholder="Descreva o motivo da mudança de status..." rows={3} value={observacao} onChange={e => setObservacao(e.target.value)} /></div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => changeStatus.mutate({ id: demandId, status, observacao: observacao || undefined })} disabled={changeStatus.isPending}>{changeStatus.isPending ? "Salvando..." : "Confirmar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
'''

target = '/home/ubuntu/sigma-sain-betim/client/src/pages/ExternalDemands.tsx'
with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Written {len(content)} chars to {target}")
