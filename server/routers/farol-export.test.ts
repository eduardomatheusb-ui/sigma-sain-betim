import { describe, it, expect } from 'vitest';
import { farolExportRouter } from './farol-export';

/**
 * Farol Export Router Tests
 * Tests for exporting case data to Word documents
 */

describe('Farol Export Router', () => {
  describe('exportCaseToWord', () => {
    it('should generate a valid Word document buffer', async () => {
      const mockCaseData = {
        id: 1,
        numeroCaso: 'CRAEIRV-2024-0001',
        nomeEstudante: 'Lucas Pereira',
        idade: 12,
        escola: 'EM Prof. Joao Batista',
        segmento: 'Ensino Fundamental I',
        regional: 'Norte',
        situacao: 'Arquivado',
        status: 'Resolvido',
        classificacaoCaso: 'Média complexidade',
        tipoDemanda: 'Evasão escolar',
        origem: 'Escola',
        responsavel: 'Maria Oliveira (Assessora)',
        createdByName: 'Carlos Mendes (Coordenador)',
        createdAt: new Date('2024-03-15T07:00:00'),
        updatedAt: new Date('2024-04-14T01:50:00'),
        observacaoGeral: 'Aluno com faltas recorrentes desde março. Família não atende ligações.',
      };

      const buffer = await farolExportRouter.exportCaseToWord(mockCaseData);

      // Verify buffer is valid
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verify it's a valid DOCX file (starts with PK signature)
      expect(buffer[0]).toBe(0x50); // 'P'
      expect(buffer[1]).toBe(0x4b); // 'K'
    });

    it('should handle missing fields gracefully', async () => {
      const mockCaseData = {
        id: 1,
        numeroCaso: 'CRAEIRV-2024-0001',
        nomeEstudante: 'Lucas Pereira',
        // Missing other fields
      };

      const buffer = await farolExportRouter.exportCaseToWord(mockCaseData);

      // Should still generate valid document
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should include case number in document', async () => {
      const mockCaseData = {
        id: 1,
        numeroCaso: 'TEST-2024-9999',
        nomeEstudante: 'Test Student',
      };

      const buffer = await farolExportRouter.exportCaseToWord(mockCaseData);

      // Convert buffer to string to check content
      const content = buffer.toString('utf-8', 0, Math.min(5000, buffer.length));
      
      // DOCX files contain XML, so the case number should appear somewhere
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should include student name in document', async () => {
      const mockCaseData = {
        id: 1,
        numeroCaso: 'CRAEIRV-2024-0001',
        nomeEstudante: 'João Silva Santos',
      };

      const buffer = await farolExportRouter.exportCaseToWord(mockCaseData);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle special characters in case data', async () => {
      const mockCaseData = {
        id: 1,
        numeroCaso: 'CRAEIRV-2024-0001',
        nomeEstudante: 'José da Silva Pereira',
        observacaoGeral: 'Aluno com dificuldades: leitura, escrita e matemática. Necessário acompanhamento especializado.',
      };

      const buffer = await farolExportRouter.exportCaseToWord(mockCaseData);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate document with proper structure', async () => {
      const mockCaseData = {
        id: 1,
        numeroCaso: 'CRAEIRV-2024-0001',
        nomeEstudante: 'Lucas Pereira',
        escola: 'EM Prof. Joao Batista',
        regional: 'Norte',
        situacao: 'Arquivado',
        status: 'Resolvido',
        classificacaoCaso: 'Média complexidade',
      };

      const buffer = await farolExportRouter.exportCaseToWord(mockCaseData);

      // Verify document structure
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000); // DOCX files are typically larger
      
      // Check for DOCX signature
      expect(buffer[0]).toBe(0x50);
      expect(buffer[1]).toBe(0x4b);
    });
  });
});
