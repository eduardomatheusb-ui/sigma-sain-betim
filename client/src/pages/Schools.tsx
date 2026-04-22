import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Briefcase, ClipboardList, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Schools() {
  const { user } = useAuth();
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);

  // Dados de exemplo - em produção viriam do banco
  const schools = [
    {
      id: 1,
      name: "Escola Municipal Tiradentes",
      address: "Rua A, 100",
      students: 45,
      mediators: 8,
      attendances: 156,
      demands: 3,
    },
    {
      id: 2,
      name: "Escola Municipal Getúlio Vargas",
      address: "Avenida B, 200",
      students: 38,
      mediators: 6,
      attendances: 128,
      demands: 5,
    },
    {
      id: 3,
      name: "Escola Municipal Anísio Teixeira",
      address: "Rua C, 300",
      students: 52,
      mediators: 9,
      attendances: 189,
      demands: 2,
    },
    {
      id: 4,
      name: "Escola Municipal Paulo Freire",
      address: "Avenida D, 400",
      students: 41,
      mediators: 7,
      attendances: 142,
      demands: 4,
    },
  ];

  const selectedSchoolData = schools.find(s => s.id === selectedSchool);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Controle por Escola</h1>
        <p className="text-muted-foreground mt-1">
          Visão consolidada de alunos, mediadores e atendimentos por unidade escolar
        </p>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Escolas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.reduce((sum, s) => sum + s.students, 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Mediadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.reduce((sum, s) => sum + s.mediators, 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.reduce((sum, s) => sum + s.attendances, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Escolas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Escolas da Rede</CardTitle>
            <CardDescription>
              Clique em uma escola para ver detalhes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Alunos</TableHead>
                    <TableHead>Mediadores</TableHead>
                    <TableHead>Atendimentos</TableHead>
                    <TableHead>Demandas</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id} className={selectedSchool === school.id ? "bg-muted" : ""}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.students}</TableCell>
                      <TableCell>{school.mediators}</TableCell>
                      <TableCell>{school.attendances}</TableCell>
                      <TableCell>
                        <Badge variant={school.demands > 0 ? "destructive" : "outline"}>
                          {school.demands}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={selectedSchool === school.id ? "default" : "outline"}
                          onClick={() => setSelectedSchool(school.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Escola Selecionada */}
        {selectedSchoolData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedSchoolData.name}</CardTitle>
              <CardDescription>{selectedSchoolData.address}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Alunos</p>
                    <p className="font-bold">{selectedSchoolData.students}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mediadores</p>
                    <p className="font-bold">{selectedSchoolData.mediators}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Atendimentos</p>
                    <p className="font-bold">{selectedSchoolData.attendances}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">Demandas Pendentes</p>
                    <p className="font-bold">{selectedSchoolData.demands}</p>
                  </div>
                </div>
              </div>

              <Button className="w-full">Ver Detalhes Completos</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
