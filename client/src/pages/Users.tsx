import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, Pencil, ToggleLeft, ToggleRight, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador SAIN",
  school_user: "Usuário Escola",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-primary/10 text-primary hover:bg-primary/10",
  school_user: "bg-blue-100 text-blue-800 hover:bg-blue-100",
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function Users() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: usersData = [], isLoading } = trpc.users.list.useQuery(undefined, { enabled: user?.role === "admin" });
  const { data: schoolsData = [] } = trpc.schools.list.useQuery(undefined, { enabled: user?.role === "admin" });

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => { utils.users.list.invalidate(); toast.success("Perfil atualizado!"); setEditUser(null); },
    onError: (e) => toast.error(e.message),
  });
  const linkSchoolMutation = trpc.users.linkSchool.useMutation({
    onSuccess: () => { utils.users.list.invalidate(); toast.success("Escola vinculada!"); setEditUser(null); },
    onError: (e) => toast.error(e.message),
  });
  const toggleActiveMutation = trpc.users.toggleActive.useMutation({
    onSuccess: () => { utils.users.list.invalidate(); toast.success("Status atualizado!"); },
    onError: (e) => toast.error(e.message),
  });

  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ role: "school_user", schoolId: "" });

  const filtered = useMemo(() => {
    return usersData.filter((u: any) => {
      const q = search.toLowerCase();
      return (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
    });
  }, [usersData, search]);

  function openEdit(u: any) {
    setEditForm({ role: u.role ?? "school_user", schoolId: u.schoolId ? String(u.schoolId) : "" });
    setEditUser(u);
  }

  function handleSaveEdit() {
    if (!editUser) return;
    const promises: Promise<any>[] = [];
    if (editForm.role !== editUser.role) {
      promises.push(updateRoleMutation.mutateAsync({ userId: editUser.id, role: editForm.role as "admin" | "school_user" }));
    }
    const newSchoolId = editForm.schoolId ? Number(editForm.schoolId) : null;
    if (newSchoolId !== (editUser.schoolId ?? null)) {
      promises.push(linkSchoolMutation.mutateAsync({ userId: editUser.id, schoolId: newSchoolId }));
    }
    if (promises.length === 0) { setEditUser(null); return; }
    Promise.all(promises).catch(() => {});
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Shield className="w-12 h-12 text-muted-foreground opacity-30" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Acesso Restrito</h2>
          <p className="text-muted-foreground mt-1">Esta área é exclusiva para administradores do sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <UsersIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-sm text-muted-foreground">Administração de acessos e vínculos com escolas</p>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total de usuários", value: usersData.length },
          { label: "Administradores", value: usersData.filter((u: any) => u.role === "admin").length },
          { label: "Usuários escola", value: usersData.filter((u: any) => u.role === "school_user").length },
          { label: "Ativos", value: usersData.filter((u: any) => u.isActive).length },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Usuários do Sistema</CardTitle>
          <CardDescription>
            Clique em "Editar" para alterar o perfil ou vincular uma escola. Use o botão de status para ativar/desativar o acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Nome", "E-mail", "Perfil", "Escola vinculada", "Último acesso", "Status", "Ações"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      {usersData.length === 0
                        ? "Nenhum usuário cadastrado ainda. Os usuários aparecem aqui após o primeiro acesso via login."
                        : "Nenhum usuário encontrado com os filtros aplicados."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u: any) => {
                    const school = schoolsData.find((s: any) => s.id === u.schoolId);
                    return (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{u.name ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                        <td className="px-4 py-3">
                          <Badge className={ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-700"}>
                            {ROLE_LABEL[u.role] ?? u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{school?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(u.lastSignedIn)}</td>
                        <td className="px-4 py-3">
                          <Badge className={u.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                            {u.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className={u.isActive ? "text-red-600 hover:text-red-600" : "text-green-600 hover:text-green-600"}
                              disabled={toggleActiveMutation.isPending}
                              onClick={() => toggleActiveMutation.mutate({ userId: u.id, isActive: !u.isActive })}
                              title={u.isActive ? "Desativar acesso" : "Ativar acesso"}
                            >
                              {u.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de edição */}
      <Dialog open={editUser !== null} onOpenChange={v => { if (!v) setEditUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuário: {editUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Perfil de acesso</Label>
              <Select value={editForm.role} onValueChange={v => setEditForm(f => ({ ...f, role: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="school_user">Usuário Escola</SelectItem>
                  <SelectItem value="admin">Administrador SAIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Escola vinculada</Label>
              <Select value={editForm.schoolId || "none"} onValueChange={v => setEditForm(f => ({ ...f, schoolId: v === "none" ? "" : v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Nenhuma escola" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma escola (admin geral)</SelectItem>
                  {schoolsData.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Usuários escola só visualizam dados da escola vinculada.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancelar</Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateRoleMutation.isPending || linkSchoolMutation.isPending}
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
