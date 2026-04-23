import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateQuadroPDF(quadro: any, schoolName: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 15;

  // Logo/Cabeçalho institucional
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('SECRETARIA MUNICIPAL DE EDUCAÇÃO / SECRETARIA ADJUNTA DE INCLUSÃO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  
  doc.setFontSize(12);
  doc.text('NEXUS - Plataforma de Gestão e Articulação da Rede de Inclusão', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Linha divisória
  doc.setDrawColor(0, 0, 0);
  doc.line(10, yPosition, pageWidth - 10, yPosition);
  yPosition += 6;

  // Título
  doc.setFontSize(16);
  doc.setFont('Helvetica', 'bold');
  doc.text('QUADRO DE MEDIADORES', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Informações da escola
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Escola: ${schoolName}`, 10, yPosition);
  yPosition += 5;
  
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 10, yPosition);
  doc.text(`Responsável: ${quadro.responsible || 'N/A'}`, pageWidth - 60, yPosition);
  yPosition += 8;

  // Tabela de mediadores
  const tableData = quadro.rows.map((row: any) => [
    String(row.numero).padStart(2, '0'),
    row.nomeAAP,
    row.turno1 && row.turno2 ? 'Integral' : row.turno1 ? 'Manhã' : 'Tarde',
    row.alunos.map((a: any) => a.nome).join(', '),
    row.alunos.length,
  ]);

  (doc as any).autoTable({
    head: [['Nº', 'Mediador', 'Turno', 'Alunos', 'Qtd']],
    body: tableData,
    startY: yPosition,
    margin: 10,
    styles: { fontSize: 9, cellPadding: 3, halign: 'left' },
    headStyles: { fillColor: [25, 25, 112], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  // Rodapé com resumo
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.text('RESUMO:', 10, yPosition);
  yPosition += 5;
  
  doc.setFont('Helvetica', 'normal');
  doc.text(`Total de mediadores: ${quadro.totalMediadores}`, 10, yPosition);
  yPosition += 4;
  doc.text(`Total de alunos: ${quadro.totalAlunos}`, 10, yPosition);
  yPosition += 4;
  doc.text(`Alunos sem mediador: ${quadro.totalSemAtendente}`, 10, yPosition);

  // Rodapé da página
  const pageCount = (doc as any).internal.pages.length - 1;
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'italic');
  doc.text(`Página 1 de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  return doc;
}
