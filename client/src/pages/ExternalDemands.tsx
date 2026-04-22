import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ExternalDemands() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    demandType: "",
    source: "family" as "family" | "school" | "health" | "court" | "other",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });

  const { data: demandsData, isLoading, refetch } = trpc.externalDemands.listBySchool.useQuery();
  const createDemand = trpc.externalDemands.create.useMutation({
    onSuccess: () => {
      toast.success("Demanda registrada com sucesso!");
      setIsOpen(false);
      setFormData({ demandType: "", source: "family", description: "", priority: "medium", dueDate: "" });
      refetch();
    },
    onError: (err) => { toast.error("Erro ao registrar demanda: " + err.message); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.demandType.trim()) { toast.error("Tipo da demanda é obrigatório"); return; }
    createDemand.mutate(formData);
  };

  const filtered = (demandsData || []).filter(d =>
    (d.demandType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sourceLabel: Record<string, string> = { family: "Família", school: "Escola", health: "Saúde", court: "Judiciário", other: "Outro" };
  const priorityLabel: Record<string, string> = { low: "Baixa", medium: "Média", high: "Alta" };
  const priorityClass: Record<string, string> = { low: "bg-blue-100 text-blue-800", medium: "bg-yellow-100 text-yellow-800", high: "bg-red-100 text-red-800" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><AlertCircle className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Demandas Externas</h1>
            <p className="text-sm text-muted-foreground">Solicitações e demandas externas ao sistema</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2"><Plus className="w-4 h-4" />Nova Demanda</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Demanda Externa</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="demandType">Tipo da Demanda *</Label>
                  <Input id="demandType" value={formData.demandType} onChange={e => setFormData(p => ({ ...p, demandType: e.target.value }))} placeholder="Ex: Laudo médico, Avaliação psicológica..." required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="source">Origem</Label>
                  <select id="source" className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background" value={formData.source} onChange={e => setFormData(p => ({ ...p, source: e.target.value as typeof formData.source }))}>
                    <option value="family">Família</option>
                    <option value="school">Escola</option>
                    <option value="health">Saúde</option>
                    <option value="court">Judiciário</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="priority">Prioridade</Label>
                  <select id="priority" className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background" value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value as typeof formData.priority }))}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dueDate">Prazo</Label>
                  <Input id="dueDate" type="date" value={formData.dueDate} onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="description">Descrição</Label>
                  <Input id="description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes da demanda..." />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createDemand.isPending} className="bg-primary text-white">
                  {createDemand.isPending ? "Salvando..." : "Registrar Demanda"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar demandas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>Lista de Demandas</span>
            <Badge variant="secondary" className="font-normal">{filtered.length} demandas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Carregando demandas...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <AlertCircle className="w-8 h-8 opacity-30" />
              <p>{searchTerm ? "Nenhuma demanda encontrada." : "Nenhuma demanda registrada ainda."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Origem</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Prioridade</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((demand, idx) => (
                    <tr key={demand.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3 font-medium">{demand.demandType}</td>
                      <td className="px-4 py-3 text-muted-foreground">{sourceLabel[demand.source || 'other'] || demand.source || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${priorityClass[demand.priority || 'medium'] || "bg-gray-100 text-gray-600"} hover:opacity-80`}>
                          {priorityLabel[demand.priority || 'medium'] || demand.priority || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={demand.status === "resolved" ? "bg-green-100 text-green-800 hover:bg-green-100" : demand.status === "pending" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : "bg-blue-100 text-blue-800"}>
                          {demand.status === "resolved" ? "Resolvida" : demand.status === "pending" ? "Pendente" : "Em andamento"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{demand.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
