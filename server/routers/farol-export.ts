import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  convertInchesToTwip,
  Footer,
} from "docx";

/**
 * Farol Export Router
 * Procedures for exporting case data to various formats (Word, PDF, etc.)
 */

export const farolExportRouter = {
  exportCaseToWord: async (caseData: any) => {
    try {
      // Create information table
      const infoTableRows = [
        ["Nº do Caso", caseData.numeroCaso || "não informado"],
        ["Nome do Aluno(a)", caseData.nomeEstudante || "não informado"],
        ["Idade", caseData.idade ? caseData.idade.toString() : "não informado"],
        ["Escola", caseData.escola || "não informado"],
        ["Segmento", caseData.segmento || "não informado"],
        ["Regional", caseData.regional || "não informado"],
        ["Situação", caseData.situacao || "não informado"],
        ["Status", caseData.status || "não informado"],
        ["Classificação", caseData.classificacaoCaso || "não informado"],
        ["Tipo de Demanda", caseData.tipoDemanda || "não informado"],
        ["Origem", caseData.origem || "não informado"],
        ["Responsável", caseData.responsavel || "não informado"],
        ["Criado por", caseData.createdByName || "não informado"],
        ["Criado em", caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString("pt-BR") : "não informado"],
        ["Atualizado em", caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleDateString("pt-BR") : "não informado"],
      ].map(
        ([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: label,
                        bold: true,
                        size: 22,
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                },
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: value,
                        size: 22,
                      }),
                    ],
                  }),
                ],
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                },
              }),
            ],
          })
      );

      const infoTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: infoTableRows,
      });

      // Create footer with protocol and page number
      const footerSection = new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Protocolo: ${caseData.numeroCaso || "—"} | Data: ${new Date().toLocaleDateString("pt-BR")}`,
                size: 20,
              }),
            ],
          }),
        ],
      });

      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: convertInchesToTwip(1.18), // 3cm
                  left: convertInchesToTwip(1.18), // 3cm
                  bottom: convertInchesToTwip(0.79), // 2cm
                  right: convertInchesToTwip(0.79), // 2cm
                },
              },
            },
            footers: {
              default: footerSection,
            },
            children: [
              // Header
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: "PREFEITURA MUNICIPAL DE BETIM",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: "SECRETARIA MUNICIPAL DE EDUCAÇÃO",
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: "SECRETARIA ADJUNTA DE INCLUSÃO",
                    size: 22,
                  }),
                ],
              }),

              // Title
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: "RELATÓRIO DE CASO - FAROL DA GESTÃO",
                    bold: true,
                    size: 28,
                  }),
                ],
              }),

              // Case Number
              new Paragraph({
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: `Protocolo do Caso: ${caseData.numeroCaso || "não informado"}`,
                    bold: true,
                    size: 24,
                  }),
                ],
              }),

              // Student Name
              new Paragraph({
                spacing: { after: 300 },
                children: [
                  new TextRun({
                    text: `Aluno(a): ${caseData.nomeEstudante || "não informado"}`,
                    bold: true,
                    size: 24,
                  }),
                ],
              }),

              // Information Section Title
              new Paragraph({
                spacing: { before: 200, after: 200 },
                children: [
                  new TextRun({
                    text: "INFORMAÇÕES DO CASO",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),

              // Information Table
              infoTable,

              // Observations
              new Paragraph({
                spacing: { before: 300, after: 200 },
                children: [
                  new TextRun({
                    text: "OBSERVAÇÕES",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),

              new Paragraph({
                spacing: { after: 300, line: 360 }, // 1.5 line spacing
                children: [
                  new TextRun({
                    text: caseData.observacaoGeral || "Nenhuma observação registrada para este caso.",
                    size: 22,
                  }),
                ],
              }),

              // History Section
              new Paragraph({
                spacing: { before: 200, after: 200 },
                children: [
                  new TextRun({
                    text: "HISTÓRICO DE MOVIMENTAÇÕES",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),

              new Paragraph({
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: "Registros de evolução do caso ao longo do tempo.",
                    size: 22,
                    italics: true,
                  }),
                ],
              }),

              // Audit Section
              new Paragraph({
                spacing: { before: 300, after: 200 },
                children: [
                  new TextRun({
                    text: "AUDITORIA DE ALTERAÇÕES",
                    bold: true,
                    size: 24,
                  }),
                ],
              }),

              new Paragraph({
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: "Registro de todas as alterações realizadas neste caso.",
                    size: 22,
                    italics: true,
                  }),
                ],
              }),

              // Footer note
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 100 },
                children: [
                  new TextRun({
                    text: "Este documento foi gerado automaticamente pelo sistema NEXUS - Plataforma de Gestão e Articulação da Rede de Inclusão.",
                    size: 18,
                    italics: true,
                  }),
                ],
              }),

              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [
                  new TextRun({
                    text: `Data de geração: ${new Date().toLocaleString("pt-BR")}`,
                    size: 18,
                    italics: true,
                  }),
                ],
              }),
            ],
          },
        ],
      });

      // Generate document
      const buffer = await Packer.toBuffer(doc);
      return buffer;
    } catch (error) {
      console.error("[Farol Export] Error generating Word document:", error);
      throw error;
    }
  },
};
