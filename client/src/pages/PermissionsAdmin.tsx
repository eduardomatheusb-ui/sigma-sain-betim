import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PermissionsAdmin() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localMatrix, setLocalMatrix] = useState<any[]>([]);

  // Fetch modules and roles
  const rolesList = [
    { id: "admin", label: "Administrador" },
    { id: "user", label: "Usuário Padrão" },
    { id: "craei_assessor", label: "Assessor CRAEI" },
    { id: "coordinator", label: "Coordenador" },
    { id: "coordenacao_adjunta", label: "Coordenação Adjunta" },
    { id: "setor_atendentes", label: "Setor de Atendentes" },
    { id: "coordenacao_nucleo", label: "Coordenação de Núcleo" },
    { id: "school_user", label: "Usuário de Escola" },
  ];

  // Fetch modules
  const { data: modules = [] } = trpc.permissions.listModules.useQuery();

  // Fetch permission matrix for selected role
  const { data: matrix = [] } = trpc.permissions.getMatrix.useQuery(
    { roleId: selectedRole || "" },
    { enabled: !!selectedRole }
  );

  // Update permission mutation
  const updatePermMutation = trpc.permissions.updatePermission.useMutation({
    onSuccess: () => {
      toast.success("Permissão atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  // Handle role selection
  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setLocalMatrix(matrix);
  };

  // Handle checkbox change
  const handleCheckboxChange = (moduleId: number, permission: "canView" | "canEdit" | "canDelete", checked: boolean) => {
    if (!selectedRole) return;

    setLocalMatrix((prev) =>
      prev.map((mod) =>
        mod.id === moduleId
          ? { ...mod, [permission]: checked }
          : mod
      )
    );
  };

  // Handle save
  const handleSave = async () => {
    if (!selectedRole) return;

    setIsSaving(true);
    try {
      for (const mod of localMatrix) {
        await updatePermMutation.mutateAsync({
          roleId: selectedRole,
          moduleId: mod.id,
          canView: mod.canView,
          canEdit: mod.canEdit,
          canDelete: mod.canDelete,
        });
      }
      toast.success("Todas as permissões foram salvas!");
    } catch (error) {
      toast.error("Erro ao salvar permissões");
    } finally {
      setIsSaving(false);
    }
  };

  // Update local matrix when matrix changes
  if (matrix.length > 0 && localMatrix.length === 0) {
    setLocalMatrix(matrix);
  }

  const ROLE_LABELS: Record<string, string> = {
    admin: "Administrador",
    user: "Usuário Padrão",
    craei_assessor: "Assessor CRAEI",
    coordinator: "Coordenador",
    coordenacao_adjunta: "Coordenação Adjunta",
    setor_atendentes: "Setor de Atendentes",
    coordenacao_nucleo: "Coordenação de Núcleo",
    school_user: "Usuário de Escola",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
        <p className="text-gray-600 mt-2">Configure quais módulos cada perfil pode visualizar, editar e deletar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Role Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Perfis</CardTitle>
            <CardDescription>Selecione um perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rolesList.map((role: any) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedRole === role.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {ROLE_LABELS[role.id] || role.id}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Permission Matrix */}
        <div className="md:col-span-3">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Permissões - {ROLE_LABELS[selectedRole] || selectedRole}
                </CardTitle>
                <CardDescription>Marque as ações permitidas para cada módulo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Módulo</th>
                        <th className="text-center py-2 px-2">Visualizar</th>
                        <th className="text-center py-2 px-2">Editar</th>
                        <th className="text-center py-2 px-2">Deletar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localMatrix.map((mod) => (
                        <tr key={mod.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium">{mod.label}</td>
                          <td className="py-3 px-2 text-center">
                            <Checkbox
                              checked={mod.canView}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(mod.id, "canView", checked as boolean)
                              }
                            />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Checkbox
                              checked={mod.canEdit}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(mod.id, "canEdit", checked as boolean)
                              }
                            />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Checkbox
                              checked={mod.canDelete}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(mod.id, "canDelete", checked as boolean)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || updatePermMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving || updatePermMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Permissões"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Selecione um perfil para gerenciar suas permissões
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
