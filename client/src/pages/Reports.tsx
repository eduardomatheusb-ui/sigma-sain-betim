import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function Reports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState("attendances");
  const [period, setPeriod] = useState("month");
  const [school, setSchool] = useState("all");
  const [status, setStatus] = useState("all");

  const handleExport = (format: "csv" | "pdf") => {
    // TODO: Implementar exportação real
    console.log(`Exportando relatório em ${format}:`, { reportType, period, school, status });
    alert(`Relatório será exportado em ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios e Exportação</h1>
        <p className="text-muted-foreground mt-1">
          Gere e exporte relatórios com filtros personalizados
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendances">Atendimentos</SelectItem>
                  <SelectItem value="students">Alunos</SelectItem>
                  <SelectItem value="mediators">Mediadores</SelectItem>
                  <SelectItem value="demands">Demandas Externas</SelectItem>
                  <SelectItem value="schools">Por Escola</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period">Período</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="school">Escola</Label>
              <Select value={school} onValueChange={setSchool}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Escolas</SelectItem>
                  <SelectItem value="1">Escola Municipal 1</SelectItem>
                  <SelectItem value="2">Escola Municipal 2</SelectItem>
                  <SelectItem value="3">Escola Municipal 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => handleExport("csv")} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
            <Button onClick={() => handleExport("pdf")} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Atendimentos
            </CardTitle>
            <CardDescription>
              Relatório de atendimentos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Listagem completa de atendimentos com filtros por período, escola e status.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setReportType("attendances")}>
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Alunos
            </CardTitle>
            <CardDescription>
              Cadastro e situação de alunos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Listagem de alunos com necessidades especiais e seus dados.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setReportType("students")}>
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Mediadores
            </CardTitle>
            <CardDescription>
              Carga e atividades de mediadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Relatório de mediadores com carga de atendimentos e especialização.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setReportType("mediators")}>
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Prévia do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Prévia do Relatório</CardTitle>
          <CardDescription>
            Amostra dos dados que serão exportados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Mediador</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>22/04/2026</TableCell>
                  <TableCell>João Silva Santos</TableCell>
                  <TableCell>Dra. Maria Silva</TableCell>
                  <TableCell>Escola 1</TableCell>
                  <TableCell>
                    <Badge variant="outline">Individual</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>21/04/2026</TableCell>
                  <TableCell>Ana Costa Oliveira</TableCell>
                  <TableCell>Prof. João Santos</TableCell>
                  <TableCell>Escola 2</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">Compartilhado</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>20/04/2026</TableCell>
                  <TableCell>Carlos Mendes</TableCell>
                  <TableCell>Dra. Ana Costa</TableCell>
                  <TableCell>Escola 3</TableCell>
                  <TableCell>
                    <Badge variant="outline">Individual</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Total de registros: <span className="font-bold">156</span> | 
              Período: <span className="font-bold">Abril 2026</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
