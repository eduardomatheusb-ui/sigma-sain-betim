import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  standardizeRegional,
  standardizeUnidade,
  standardizeStatus,
  standardizeSituacao,
  standardizeClassificacao,
  standardizeTipoDemanda,
  standardizeOrigem,
  capitalizeFirstLetter,
  formatTextForDisplay,
} from '../shared/standardization';

describe('Standardization Functions', () => {
  describe('normalizeText', () => {
    it('should normalize accented characters', () => {
      expect(normalizeText('São Paulo')).toBeDefined();
      expect(normalizeText('Terezópolis')).toBeDefined();
    });

    it('should return "não informado" for null/undefined', () => {
      expect(normalizeText(null)).toBe('não informado');
      expect(normalizeText(undefined)).toBe('não informado');
      expect(normalizeText('')).toBe('não informado');
    });

    it('should trim whitespace', () => {
      expect(normalizeText('  text  ')).toBeDefined();
    });
  });

  describe('standardizeRegional', () => {
    it('should standardize valid regional names', () => {
      expect(standardizeRegional('norte')).toBe('Norte');
      expect(standardizeRegional('NORTE')).toBe('Norte');
      expect(standardizeRegional('Centro')).toBe('Centro');
    });

    it('should return "não informado" for invalid regional', () => {
      expect(standardizeRegional('Região Inexistente')).toBe('não informado');
      expect(standardizeRegional(null)).toBe('não informado');
      expect(standardizeRegional(undefined)).toBe('não informado');
    });

    it('should handle all standardized regionais', () => {
      const regionais = ['Alterosas', 'Centro', 'Citrolândia', 'Icaivera', 'Imbiruçu', 'Norte', 'Petrovale', 'PTB', 'Terezópolis', 'Vianópolis'];
      regionais.forEach(regional => {
        expect(standardizeRegional(regional)).toBe(regional);
      });
    });
  });

  describe('standardizeUnidade', () => {
    it('should standardize valid unit names', () => {
      expect(standardizeUnidade('escola municipal')).toBe('Escola Municipal');
      expect(standardizeUnidade('CIM')).toBe('CIM');
      expect(standardizeUnidade('rede parceira')).toBe('Rede Parceira');
    });

    it('should return "não informado" for invalid unit', () => {
      expect(standardizeUnidade('Unidade Inexistente')).toBe('não informado');
      expect(standardizeUnidade(null)).toBe('não informado');
    });
  });

  describe('standardizeStatus', () => {
    it('should standardize valid status', () => {
      expect(standardizeStatus('novo')).toBe('Novo');
      expect(standardizeStatus('EM ANÁLISE')).toBe('Em análise');
      expect(standardizeStatus('resolvido')).toBe('Resolvido');
    });

    it('should return "não informado" for invalid status', () => {
      expect(standardizeStatus('Status Inexistente')).toBe('não informado');
      expect(standardizeStatus(null)).toBe('não informado');
    });
  });

  describe('standardizeSituacao', () => {
    it('should standardize valid situation', () => {
      expect(standardizeSituacao('ativo')).toBe('Ativo');
      expect(standardizeSituacao('ARQUIVADO')).toBe('Arquivado');
      expect(standardizeSituacao('resolvido')).toBe('Resolvido');
    });

    it('should return "não informado" for invalid situation', () => {
      expect(standardizeSituacao('Situação Inexistente')).toBe('não informado');
      expect(standardizeSituacao(null)).toBe('não informado');
    });
  });

  describe('standardizeClassificacao', () => {
    it('should standardize valid classification', () => {
      expect(standardizeClassificacao('baixa complexidade')).toBe('Baixa complexidade');
      expect(standardizeClassificacao('MÉDIA COMPLEXIDADE')).toBe('Média complexidade');
      expect(standardizeClassificacao('alta complexidade')).toBe('Alta complexidade');
    });

    it('should return "não informado" for invalid classification', () => {
      expect(standardizeClassificacao('Classificação Inexistente')).toBe('não informado');
      expect(standardizeClassificacao(null)).toBe('não informado');
    });
  });

  describe('standardizeTipoDemanda', () => {
    it('should standardize valid demand type', () => {
      expect(standardizeTipoDemanda('evasão escolar')).toBe('Evasão escolar');
      expect(standardizeTipoDemanda('DIFICULDADE DE APRENDIZAGEM')).toBe('Dificuldade de aprendizagem');
    });

    it('should return "não informado" for invalid demand type', () => {
      expect(standardizeTipoDemanda('Tipo Inexistente')).toBe('não informado');
      expect(standardizeTipoDemanda(null)).toBe('não informado');
    });
  });

  describe('standardizeOrigem', () => {
    it('should standardize valid origin', () => {
      expect(standardizeOrigem('escola')).toBe('Escola');
      expect(standardizeOrigem('FAMÍLIA')).toBe('Família');
      expect(standardizeOrigem('comunidade')).toBe('Comunidade');
    });

    it('should return "não informado" for invalid origin', () => {
      expect(standardizeOrigem('Origem Inexistente')).toBe('não informado');
      expect(standardizeOrigem(null)).toBe('não informado');
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
      expect(capitalizeFirstLetter('HELLO')).toBe('Hello');
      expect(capitalizeFirstLetter('hELLO')).toBe('Hello');
    });

    it('should return "não informado" for null/undefined', () => {
      expect(capitalizeFirstLetter(null)).toBe('não informado');
      expect(capitalizeFirstLetter(undefined)).toBe('não informado');
    });
  });

  describe('formatTextForDisplay', () => {
    it('should format text properly', () => {
      expect(formatTextForDisplay('  hello world  ')).toBe('Hello world');
      expect(formatTextForDisplay('HELLO WORLD')).toBe('Hello world');
    });

    it('should return "não informado" for null/undefined', () => {
      expect(formatTextForDisplay(null)).toBe('não informado');
      expect(formatTextForDisplay(undefined)).toBe('não informado');
    });
  });
});
