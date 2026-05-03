import { useState, useMemo, useEffect } from "react";
import { REGIONAIS_PADRONIZADAS } from "@shared/standardization";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Search, Pencil, ToggleLeft, ToggleRight, Users as UsersIcon, UserPlus, School } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  sain_assessor: "Assessor SAIN",
  coordinator: "Coordenador",
  external_professional: "Profissional Externo",
  school_user: "Secretário de Escola",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-primary/10 text-primary hover:bg-primary/10",
  sain_assessor: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  coordinator: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  external_professional: "bg-teal-100 text-teal-800 hover:bg-teal-100",
  school_user: "bg-blue-100 text-blue-800 hover:bg-blue-100",
};

// Roles that support multiple schools
const MULTI_SCHOOL_ROLES = ["admin", "sain_assessor", "coordinator", "external_professional"];

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

// Multi-school selector component
function SchoolMultiSelect({
  schoolsData,
  selectedIds,
  onChange,
  singleOnly,
}: {
  schoolsData: any[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  singleOnly?: boolean;
}) {
  if (singleOnly) {
    return (
      <Select
        value={selectedIds[0] ? String(selectedIds[0]) : "none"}
        onValueChange={v => onChange(v === "none" ? [] : [Number(v)])}
      >
        <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione a escola" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhuma escola</SelectItem>
          {schoolsData.map((s: any) => (
            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="mt-1 border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
      {schoolsData.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma escola cadastrada.</p>
      )}
      {schoolsData.map((s: any) => (
        <div key={s.id} className="flex items-center gap-2">
          <Checkbox
            id={`school-${s.id}`}
            checked={selectedIds.includes(s.id)}
            onCheckedChange={checked => {
              if (checked) {
                onChange([...selectedIds, s.id]);
              } else {
                onChange(selectedIds.filter(id => id !== s.id));
              }
            }}
          />
          <label htmlFor={`school-${s.id}`} className="text-sm cursor-pointer select-none flex-1">
            {s.name}
          </label>
        </div>
      ))}
    </div>
  );
}

// Edit dialog that loads user's current schools
function EditUserDialog({
  editUser,
  schoolsData,
  onClose,
  onSaved,
}: {
  editUser: any;
  schoolsData: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [role, setRole] = useState<string>(editUser.role ?? "school_user");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<number[]>([]);
  const [cargo, setCargo] = useState<string>("");

  const { data: userSchools, isLoading: loadingSchools } = trpc.users.getUserSchools.useQuery(
    { userId: editUser.id },
    { enabled: !!editUser }
  );

  useEffect(() => {
    if (userSchools) {
      setSelectedSchoolIds(userSchools.map((s: any) => s.schoolId).filter(Boolean));
    }
  }, [userSchools]);

  const updateRoleMutation = trpc.users.updateRole.useMutation();
  const setUserSchoolsMutation = trpc.users.setUserSchools.useMutation();

  async function handleSave() {
    try {
      if (role !== editUser.role) {
        await updateRoleMutation.mutateAsync({ userId: editUser.id, role: role as any });
      }
      await setUserSchoolsMutation.mutateAsync({ userId: editUser.id, schoolIds: selectedSchoolIds });
      toast.success("Usuário atualizado com sucesso!");
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar alterações");
    }
  }

  const isSingleOnly = role === "school_user";
  const isPending = updateRoleMutation.isPending || setUserSchoolsMutation.isPending;

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar usuário: {editUser.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Perfil de acesso</Label>
            <Select value={role} onValueChange={v => { setRole(v); if (v === "school_user") setSelectedSchoolIds(selectedSchoolIds.slice(0, 1)); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="sain_assessor">Assessor SAIN</SelectItem>
                <SelectItem value="coordinator">Coordenador</SelectItem>
                <SelectItem value="external_professional">Profissional Externo</SelectItem>
                <SelectItem value="school_user">Secretário de Escola</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{isSingleOnly ? "Escola vinculada *" : "Escolas vinculadas"}</Label>
            {loadingSchools ? (
              <p className="text-sm text-muted-foreground mt-1">Carregando escolas...</p>
            ) : (
              <SchoolMultiSelect
                schoolsData={schoolsData}
                selectedIds={selectedSchoolIds}
                onChange={setSelectedSchoolIds}
                singleOnly={isSingleOnly}
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isSingleOnly
                ? "Secretários de escola só visualizam dados da escola vinculada."
                : "Selecione todas as escolas que este usuário deve acessar."}
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Users() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: usersData = [], isLoading } = trpc.users.list.useQuery(undefined, { enabled: user?.role === "admin" });
  const { data: schoolsData = [] } = trpc.schools.list.useQuery(undefined, { enabled: user?.role === "admin" });

  const toggleActiveMutation = trpc.users.toggleActive.useMutation({
    onSuccess: () => { utils.users.list.invalidate(); toast.success("Status atualizado!"); },
    onError: (e) => toast.error(e.message),
  });

  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    role: "school_user",
    schoolIds: [] as number[],
    cargo: "",
    telefone: "",
    areaAtuacao: "",
    regional: "",
  });

  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Usuário criado com sucesso! Ele poderá fazer login com este e-mail.");
      setShowCreate(false);
      setCreateForm({ name: "", email: "", role: "school_user", schoolIds: [], cargo: "", telefone: "", areaAtuacao: "", regional: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  function handleCreate() {
    if (!createForm.name.trim()) { toast.error("Informe o nome do usuário"); return; }
    if (!createForm.email.trim()) { toast.error("Informe o e-mail do usuário"); return; }
    if (createForm.role === "school_user" && createForm.schoolIds.length === 0) {
      toast.error("Selecione a escola vinculada para secretários de escola");
      return;
    }
    createMutation.mutate({
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      role: createForm.role as any,
      schoolIds: createForm.schoolIds,
      cargo: createForm.cargo.trim() || undefined,
      telefone: createForm.telefone.trim() || undefined,
      areaAtuacao: createForm.areaAtuacao.trim() || undefined,
      regional: createForm.regional.trim() || undefined,
    });
  }

  const filtered = useMemo(() => {
    return usersData.filter((u: any) => {
      const q = search.toLowerCase();
      return (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
    });
  }, [usersData, search]);

  // Build a map of userId -> school names from the users list
  // (users.list returns schoolId, but we need count from user_schools)
  // We'll show the legacy schoolId school name for now, and a note if multi
  function getSchoolDisplay(u: any) {
    const school = schoolsData.find((s: any) => s.id === u.schoolId);
    return school?.name ?? "—";
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

  const roleMetrics = [
    { label: "Total", value: usersData.length },
    { label: "Administradores", value: usersData.filter((u: any) => u.role === "admin").length },
    { label: "Assessores SAIN", value: usersData.filter((u: any) => u.role === "sain_assessor").length },
    { label: "Coordenadores", value: usersData.filter((u: any) => u.role === "coordinator").length },
    { label: "Prof. Externos", value: usersData.filter((u: any) => u.role === "external_professional").length },
    { label: "Secretários", value: usersData.filter((u: any) => u.role === "school_user").length },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UsersIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
            <p className="text-sm text-muted-foreground">Administração de acessos e vínculos com escolas</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Novo usuário
        </Button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {roleMetrics.map(m => (
          <Card key={m.label}>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground leading-tight">{m.label}</p>
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
            Clique em "Editar" para alterar o perfil ou vincular escolas. Use o botão de status para ativar/desativar o acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Nome", "E-mail", "Perfil", "Escola principal", "Último acesso", "Status", "Ações"].map(h => (
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
                  filtered.map((u: any) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className={ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-700"}>
                          {ROLE_LABEL[u.role] ?? u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {u.schoolId && <School className="w-3.5 h-3.5 opacity-50 shrink-0" />}
                          <span>{getSchoolDisplay(u)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(u.lastSignedIn)}</td>
                      <td className="px-4 py-3">
                        <Badge className={u.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                          {u.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditUser(u)}>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de criação de usuário */}
      <Dialog open={showCreate} onOpenChange={v => { if (!v) setShowCreate(false); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar novo usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Nome completo *</Label>
              <Input
                className="mt-1"
                placeholder="Nome do responsável"
                value={createForm.name}
                onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>E-mail *</Label>
              <Input
                className="mt-1"
                type="email"
                placeholder="email@escola.betim.mg.gov.br"
                value={createForm.email}
                onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">O usuário fará login com este e-mail via Manus.</p>
            </div>
            <div>
              <Label>Perfil de acesso *</Label>
              <Select
                value={createForm.role}
                onValueChange={v => {
                  setCreateForm(f => ({
                    ...f,
                    role: v,
                    schoolIds: v === "school_user" ? f.schoolIds.slice(0, 1) : f.schoolIds,
                  }));
                }}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="sain_assessor">Assessor SAIN</SelectItem>
                  <SelectItem value="coordinator">Coordenador</SelectItem>
                  <SelectItem value="external_professional">Profissional Externo</SelectItem>
                  <SelectItem value="school_user">Secretário de Escola</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(createForm.role === "sain_assessor" || createForm.role === "external_professional") && (
              <>
              <div>
                <Label>Telefone</Label>
                <Input
                  className="mt-1"
                  placeholder="(31) 99999-9999"
                  value={createForm.telefone}
                  onChange={e => setCreateForm(f => ({ ...f, telefone: e.target.value }))}
                />
              </div>
              <div>
                <Label>Regional</Label>
                <Select
                  value={createForm.regional || "none"}
                  onValueChange={v => setCreateForm(f => ({ ...f, regional: v === "none" ? "" : v }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione a regional" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {REGIONAIS_PADRONIZADAS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </>
            )}
            <div>
              <Label>
                {createForm.role === "school_user" ? "Escola vinculada *" : "Escolas vinculadas"}
              </Label>
              <SchoolMultiSelect
                schoolsData={schoolsData}
                selectedIds={createForm.schoolIds}
                onChange={ids => setCreateForm(f => ({ ...f, schoolIds: ids }))}
                singleOnly={createForm.role === "school_user"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {createForm.role === "school_user"
                  ? "Secretários de escola só visualizam dados da escola vinculada."
                  : "Selecione todas as escolas que este usuário deve acessar (opcional)."}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Criando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edição */}
      {editUser && (
        <EditUserDialog
          editUser={editUser}
          schoolsData={schoolsData}
          onClose={() => setEditUser(null)}
          onSaved={() => utils.users.list.invalidate()}
        />
      )}
    </div>
  );
}
