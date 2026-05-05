import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface ModulePermission {
  moduleId: number;
  moduleName: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Hook para buscar e gerenciar permissões de módulos do usuário
 * Retorna um mapa de permissões e funções para verificar acesso
 */
export function useModulePermissions() {
  const { user } = useAuth();

  // Busca as permissões da matriz para o role do usuário
  const { data: permissions = [] } = trpc.permissions.getMatrix.useQuery(
    { roleId: user?.role || "" },
    { enabled: !!user?.role }
  );

  // Cria um mapa de permissões para acesso rápido
  const permissionMap = useMemo(() => {
    const map = new Map<number, ModulePermission>();
    permissions.forEach((perm: any) => {
      map.set(perm.id, {
        moduleId: perm.id,
        moduleName: perm.name,
        canView: perm.canView,
        canEdit: perm.canEdit,
        canDelete: perm.canDelete,
      });
    });
    return map;
  }, [permissions]);

  // Função para verificar se o usuário pode visualizar um módulo
  const canView = (moduleId: number): boolean => {
    const perm = permissionMap.get(moduleId);
    return perm?.canView ?? false;
  };

  // Função para verificar se o usuário pode editar um módulo
  const canEdit = (moduleId: number): boolean => {
    const perm = permissionMap.get(moduleId);
    return perm?.canEdit ?? false;
  };

  // Função para verificar se o usuário pode deletar um módulo
  const canDelete = (moduleId: number): boolean => {
    const perm = permissionMap.get(moduleId);
    return perm?.canDelete ?? false;
  };

  // Função para obter todas as permissões de um módulo
  const getPermission = (moduleId: number): ModulePermission | undefined => {
    return permissionMap.get(moduleId);
  };

  return {
    permissions: Array.from(permissionMap.values()),
    permissionMap,
    canView,
    canEdit,
    canDelete,
    getPermission,
  };
}
