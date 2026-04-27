import { Document, Packer, Paragraph, Table, TableCell, TableRow, BorderStyle, WidthType, TextRun, AlignmentType, PageBreak } from "docx";
import * as XLSX from "xlsx";

interface FarolCase {
  id: number;
  numeroCaso: string;
  dataEntrada: string;
  nomeEstudante: string;
  diagnostico?: string;
  responsavel?: string;
  telefone?: string;
  segmento?: string;
  tipoDemanda: string;
  origem: string;
  analiseConjunta?: string;
  setorCraei?: string;
  profissionalResponsavelId?: number;
  coordenadorResponsavelId?: number;
  classificacaoCaso?: string;
  alerta?: boolean;
  observacaoGeral?: string;
  driveFolderUrl?: string;
  regional?: string;
  situacao: "Ativo" | "Inativo" | "Arquivado" | "Suspenso";
  status: "Novo" | "Em acompanhamento" | "Aguardando retorno" | "Encaminhado" | "Resolvido" | "Encerrado";
  escola?: string;
  schoolId?: number;
  idade?: number;
  advisorId?: number;
  encaminhamentos?: string;
  createdAt: string;
  updatedAt: string;
}

export async function exportCaseToWord(caseData: FarolCase): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440 * 3,
              right: 1440 * 2,
              bottom: 1440 * 2,
              left: 1440 * 3,
            },
          },
        },
        children: [
          // Cabeçalho
          new Paragraph({
            text: "PREFEITURA MUNICIPAL DE BETIM",
            alignment: AlignmentType.CENTER,
            run: { bold: true },
            spacing: { line: 240 },
          }),
          new Paragraph({
            text: "SECRETARIA MUNICIPAL DE EDUCAÇÃO",
            alignment: AlignmentType.CENTER,
            run: { bold: true },
            spacing: { line: 240 },
          }),
          new Paragraph({
            text: "SECRETARIA ADJUNTA DE INCLUSÃO",
            alignment: AlignmentType.CENTER,
            run: { bold: true },
            spacing: { line: 240, after: 400 },
          }),

          // Título
          new Paragraph({
            text: `PROTOCOLO DE CASO - ${caseData.numeroCaso}`,
            alignment: AlignmentType.CENTER,
            run: { bold: true, size: 56 },
            spacing: { line: 240, after: 400 },
          }),

          // Dados do Caso
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Data de Entrada", run: { bold: true } })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: new Date(caseData.dataEntrada).toLocaleDateString("pt-BR") })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Nome do Estudante", run: { bold: true } })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: caseData.nomeEstudante })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Tipo de Demanda", run: { bold: true } })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: caseData.tipoDemanda })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Origem", run: { bold: true } })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: caseData.origem })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Status", run: { bold: true } })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: caseData.status })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Situação", run: { bold: true } })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: caseData.situacao })],
                    borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } },
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Observações
          new Paragraph({
            text: "OBSERVAÇÕES GERAIS",
            run: { bold: true, size: 28 },
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: caseData.observacaoGeral || "Não informado",
            spacing: { after: 400 },
          }),

          // Rodapé
          new Paragraph({
            text: `Documento gerado em ${new Date().toLocaleString("pt-BR")}`,
            alignment: AlignmentType.CENTER,
            run: { italics: true, size: 20 },
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `caso-${caseData.numeroCaso}.docx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

export function exportCasesToExcel(cases: FarolCase[]): void {
  const data = cases.map((c) => ({
    "Protocolo": c.numeroCaso,
    "Data Entrada": new Date(c.dataEntrada).toLocaleDateString("pt-BR"),
    "Estudante": c.nomeEstudante,
    "Idade": c.idade || "-",
    "Segmento": c.segmento || "-",
    "Escola": c.escola || "Não informado",
    "Regional": c.regional || "Não informado",
    "Tipo Demanda": c.tipoDemanda,
    "Origem": c.origem,
    "Classificação": c.classificacaoCaso || "-",
    "Situação": c.situacao,
    "Status": c.status,
    "Responsável": c.responsavel || "Não informado",
    "Telefone": c.telefone || "Não informado",
    "Diagnóstico": c.diagnostico || "Não informado",
    "Análise Conjunta": c.analiseConjunta || "Não informado",
    "Encaminhamentos": c.encaminhamentos || "Não informado",
    "Observações": c.observacaoGeral || "Não informado",
    "Última Atualização": new Date(c.updatedAt).toLocaleDateString("pt-BR"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Casos");

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 18 }, // Protocolo
    { wch: 12 }, // Data Entrada
    { wch: 25 }, // Estudante
    { wch: 8 },  // Idade
    { wch: 15 }, // Segmento
    { wch: 25 }, // Escola
    { wch: 15 }, // Regional
    { wch: 20 }, // Tipo Demanda
    { wch: 20 }, // Origem
    { wch: 15 }, // Classificação
    { wch: 15 }, // Situação
    { wch: 20 }, // Status
    { wch: 20 }, // Responsável
    { wch: 15 }, // Telefone
    { wch: 30 }, // Diagnóstico
    { wch: 30 }, // Análise Conjunta
    { wch: 30 }, // Encaminhamentos
    { wch: 40 }, // Observações
    { wch: 15 }, // Última Atualização
  ];
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `casos-farol-${new Date().toISOString().split("T")[0]}.xlsx`);
}
