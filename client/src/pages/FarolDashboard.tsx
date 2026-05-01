import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { AlertCircle, TrendingUp, Clock, Users } from "lucide-react";

const COLORS = ["#004B99", "#9AC331", "#FF6B6B", "#FFA500", "#4ECDC4"];

export default function FarolDashboard() {
  const userQuery = trpc.auth.me.useQuery();
  const user = userQuery.data;
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");
  
  const metricsQuery = trpc.farol.metrics.useQuery();
  const casesQuery = trpc.farol.listCases.useQuery({});
  const auditQuery = trpc.farol.getAuditTrail.useQuery({ limit: 100 });

  // Dados para gráficos
  const [demandTypeData, setDemandTypeData] = useState<any[]>([]);
  const [originData, setOriginData] = useState<any[]>([]);
  const [statusTimeline, setStatusTimeline] = useState<any[]>([]);

  useEffect(() => {
    if (casesQuery.data) {
      // Agrupar por tipo de demanda
      const demandMap = new Map<string, number>();
      casesQuery.data.forEach((c: any) => {
        const key = c.tipoDemanda || "Não informado";
        demandMap.set(key, (demandMap.get(key) || 0) + 1);
      });
      setDemandTypeData(Array.from(demandMap, ([name, value]) => ({ name, value })));

      // Agrupar por origem
      const originMap = new Map<string, number>();
      casesQuery.data.forEach((c: any) => {
        const key = c.origem || "Não informado";
        originMap.set(key, (originMap.get(key) || 0) + 1);
      });
      setOriginData(Array.from(originMap, ([name, value]) => ({ name, value })));

      // Timeline de status
      const statusMap = new Map<string, number>();
      casesQuery.data.forEach((c: any) => {
        const key = c.status || "Novo";
        statusMap.set(key, (statusMap.get(key) || 0) + 1);
      });
      setStatusTimeline(Array.from(statusMap, ([name, value]) => ({ name, value })));
    }
  }, [casesQuery.data]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold">Acesso Negado</p>
                <p className="text-sm text-gray-600">Apenas administradores podem acessar o dashboard gerencial.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard - Acompanhamento de Casos</h1>
          <p className="text-gray-600 mt-1">Visão consolidada de casos e métricas</p>
        </div>
        <div className="flex gap-2">
          {(["week", "month", "quarter"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              onClick={() => setTimeRange(range)}
              className="capitalize"
            >
              {range === "week" ? "Semana" : range === "month" ? "Mês" : "Trimestre"}
            </Button>
          ))}
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Casos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{metricsQuery.data?.total || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Casos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Casos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metricsQuery.data?.ativo || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metricsQuery.data?.urgentes || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Com alerta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{metricsQuery.data?.aguardando || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Retorno</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{metricsQuery.data?.resolvidos || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Encerrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico por Tipo de Demanda */}
        <Card>
          <CardHeader>
            <CardTitle>Casos por Tipo de Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            {demandTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demandTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#004B99" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        {/* Gráfico por Origem */}
        <Card>
          <CardHeader>
            <CardTitle>Casos por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            {originData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={originData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {originData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={statusTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#9AC331" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        {/* Últimas Ações */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Ações (Auditoria)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {auditQuery.data && auditQuery.data.length > 0 ? (
                auditQuery.data.slice(0, 10).map((audit: any) => (
                  <div key={audit.id} className="flex items-start gap-3 pb-2 border-b">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {audit.actionType}
                        </Badge>
                        <span className="text-xs text-gray-500">{audit.userName}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{audit.numeroCaso}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(audit.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Sem ações registradas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Casos Sem Movimentação Recente */}
      <Card>
        <CardHeader>
          <CardTitle>Casos Sem Movimentação Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {casesQuery.data && casesQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Protocolo</th>
                    <th className="text-left py-2">Estudante</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Última Atualização</th>
                  </tr>
                </thead>
                <tbody>
                  {casesQuery.data
                    .filter((c: any) => {
                      const daysSinceUpdate = Math.floor(
                        (Date.now() - new Date(c.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return daysSinceUpdate > 7;
                    })
                    .slice(0, 5)
                    .map((c: any) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-mono text-xs">{c.numeroCaso}</td>
                        <td className="py-2">{c.nomeEstudante}</td>
                        <td className="py-2">
                          <Badge variant="outline">{c.status}</Badge>
                        </td>
                        <td className="py-2 text-gray-500">
                          {new Date(c.updatedAt).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Sem casos</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
