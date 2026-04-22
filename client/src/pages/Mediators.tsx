import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Mediators() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    professionalLicense: "",
    specialization: "",
    maxAttendances: 20,
  });

  const { data: mediatorsData, isLoading, refetch } = trpc.mediators.listBySchool.useQuery();
  const createMediator = trpc.mediators.create.useMutation({
    onSuccess: () => {
      toast.success("Mediador cadastrado com sucesso!");
      setIsOpen(false);
      setFormData({ name: "", cpf: "", professionalLicense: "", specialization: "", maxAttendances: 20 });
      refetch();
    },
    onError: (err) => {
      toast.error("Erro ao cadastrar mediador: " + err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error("Nome do mediador é obrigatório"); return; }
    createMediator.mutate(formData);
  };

  const filtered = (mediatorsData || []).filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.specialization || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><UserCheck className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Mediadores</h1>
            <p className="text-sm text-muted-foreground">Cadastro e gestão de profissionais mediadores</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2"><Plus className="w-4 h-4" />Novo Mediador</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Cadastrar Novo Mediador</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nome do mediador" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={formData.cpf} onChange={e => setFormData(p => ({ ...p, cpf: e.target.value }))} placeholder="000.000.000-00" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="professionalLicense">Registro Profissional</Label>
                  <Input id="professionalLicense" value={formData.professionalLicense} onChange={e => setFormData(p => ({ ...p, professionalLicense: e.target.value }))} placeholder="CRP, CREFITO..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="specialization">Especialização</Label>
                  <Input id="specialization" value={formData.specialization} onChange={e => setFormData(p => ({ ...p, specialization: e.target.value }))} placeholder="Ex: Psicologia, Fonoaudiologia" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxAttendances">Máx. Atendimentos/Mês</Label>
                  <Input id="maxAttendances" type="number" min={1} max={100} value={formData.maxAttendances} onChange={e => setFormData(p => ({ ...p, maxAttendances: parseInt(e.target.value) || 20 }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMediator.isPending} className="bg-primary text-white">
                  {createMediator.isPending ? "Salvando..." : "Cadastrar Mediador"}
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
            <Input className="pl-9" placeholder="Buscar por nome ou especialização..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>Lista de Mediadores</span>
            <Badge variant="secondary" className="font-normal">{filtered.length} {filtered.length === 1 ? "mediador" : "mediadores"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Carregando mediadores...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <UserCheck className="w-8 h-8 opacity-30" />
              <p>{searchTerm ? "Nenhum mediador encontrado." : "Nenhum mediador cadastrado ainda."}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Especialização</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Registro</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Máx. Atend.</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((mediator, idx) => (
                    <tr key={mediator.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3 font-medium">{mediator.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{mediator.specialization || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{mediator.professionalLicense || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{mediator.maxAttendances || 20}</td>
                      <td className="px-4 py-3">
                        <Badge className={mediator.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600"}>
                          {mediator.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
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
