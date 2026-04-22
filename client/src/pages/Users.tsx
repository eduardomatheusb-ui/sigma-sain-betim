import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Users() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Shield className="w-12 h-12 text-muted-foreground opacity-30" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground mt-1">Esta área é exclusiva para administradores do sistema.</p>
        </div>
      </div>
    );
  }

  

  const roleLabel: Record<string, string> = { admin: "Administrador SAIN", school_user: "Usuário Escola" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg"><Shield className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
            <p className="text-sm text-muted-foreground">Administração de acessos ao sistema</p>
          </div>
        </div>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Para adicionar novos usuários, eles devem acessar o sistema via login OAuth. O administrador pode então alterar o perfil de acesso diretamente no banco de dados.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar usuários..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Usuários do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Perfil</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{roleLabel[user.role] || user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2 border-t">
            <p className="text-sm">Os demais usuários aparecerão aqui após realizarem o primeiro acesso ao sistema.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
