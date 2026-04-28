/**
 * Standardization Constants
 * Centralized definitions for text standardization across the system
 */

// Regional standardization
export const REGIONAIS_PADRONIZADAS = [
  'Alterosas',
  'Centro',
  'Citrolândia',
  'Icaivera',
  'Imbiruçu',
  'Norte',
  'Petrovale',
  'PTB',
  'Terezópolis',
  'Vianópolis',
] as const;

export type RegionalPadronizada = (typeof REGIONAIS_PADRONIZADAS)[number];

// Unit standardization
export const UNIDADES_PADRONIZADAS = [
  'Escola Municipal',
  'CIM',
  'Rede Parceira',
] as const;

export type UnidadePadronizada = (typeof UNIDADES_PADRONIZADAS)[number];

// Action type standardization
export const TIPOS_ACAO_PADRONIZADOS = [
  'Reunião com família',
  'Visita domiciliar',
  'Encaminhamento',
  'Acompanhamento',
  'Avaliação',
  'Protocolo regularizado',
  'Caso atualizado',
  'Caso arquivado',
  'Caso reaberto',
] as const;

export type TipoAcaoPadronizado = (typeof TIPOS_ACAO_PADRONIZADOS)[number];

// Status standardization
export const STATUS_PADRONIZADOS = [
  'Novo',
  'Em análise',
  'Em acompanhamento',
  'Aguardando retorno',
  'Encaminhado',
  'Encerrado',
  'Resolvido',
  'Urgente',
] as const;

export type StatusPadronizado = (typeof STATUS_PADRONIZADOS)[number];

// Situation standardization
export const SITUACOES_PADRONIZADAS = [
  'Ativo',
  'Em andamento',
  'Resolvido',
  'Arquivado',
] as const;

export type SituacaoPadronizada = (typeof SITUACOES_PADRONIZADAS)[number];

// Classification standardization
export const CLASSIFICACOES_PADRONIZADAS = [
  'Baixa complexidade',
  'Média complexidade',
  'Alta complexidade',
  'Crítica',
] as const;

export type ClassificacaoPadronizada = (typeof CLASSIFICACOES_PADRONIZADAS)[number];

// Demand type standardization
export const TIPOS_DEMANDA_PADRONIZADOS = [
  'Evasão escolar',
  'Dificuldade de aprendizagem',
  'Comportamento',
  'Saúde',
  'Vulnerabilidade social',
  'Deficiência',
  'Altas habilidades',
  'Outro',
] as const;

export type TipoDemandaPadronizado = (typeof TIPOS_DEMANDA_PADRONIZADOS)[number];

// Origin standardization
export const ORIGENS_PADRONIZADAS = [
  'Escola',
  'Família',
  'Comunidade',
  'Saúde',
  'Assistência Social',
  'Justiça',
  'Outro',
] as const;

export type OrigemPadronizada = (typeof ORIGENS_PADRONIZADAS)[number];

// Profile standardization
export const PERFIS_PADRONIZADOS = [
  'admin',
  'coordinator',
  'advisor',
  'childhood_coordination',
  'school_user',
  'viewer',
] as const;

export type PerfilPadronizado = (typeof PERFIS_PADRONIZADOS)[number];

// Utility functions for standardization

/**
 * Normalize accents and special characters
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return 'não informado';
  
  return text
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ã/g, 'a')
    .replace(/õ/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/â/g, 'a')
    .replace(/ê/g, 'e')
    .replace(/ô/g, 'o');
}

/**
 * Standardize regional name
 */
export function standardizeRegional(regional: string | null | undefined): RegionalPadronizada | 'não informado' {
  if (!regional) return 'não informado';
  
  const normalized = normalizeText(regional).toLowerCase();
  const match = REGIONAIS_PADRONIZADAS.find(r => 
    normalizeText(r).toLowerCase() === normalized
  );
  
  return match || ('não informado' as const);
}

/**
 * Standardize unit name
 */
export function standardizeUnidade(unidade: string | null | undefined): UnidadePadronizada | 'não informado' {
  if (!unidade) return 'não informado';
  
  const normalized = normalizeText(unidade).toLowerCase();
  const match = UNIDADES_PADRONIZADAS.find(u => 
    normalizeText(u).toLowerCase() === normalized
  );
  
  return match || ('não informado' as const);
}

/**
 * Standardize status
 */
export function standardizeStatus(status: string | null | undefined): StatusPadronizado | 'não informado' {
  if (!status) return 'não informado';
  
  const normalized = normalizeText(status).toLowerCase();
  const match = STATUS_PADRONIZADOS.find(s => 
    normalizeText(s).toLowerCase() === normalized
  );
  
  return match || ('não informado' as const);
}

/**
 * Standardize situation
 */
export function standardizeSituacao(situacao: string | null | undefined): SituacaoPadronizada | 'não informado' {
  if (!situacao) return 'não informado';
  
  const normalized = normalizeText(situacao).toLowerCase();
  const match = SITUACOES_PADRONIZADAS.find(s => 
    normalizeText(s).toLowerCase() === normalized
  );
  
  return match || ('não informado' as const);
}

/**
 * Standardize classification
 */
export function standardizeClassificacao(classificacao: string | null | undefined): ClassificacaoPadronizada | 'não informado' {
  if (!classificacao) return 'não informado';
  
  const normalized = normalizeText(classificacao).toLowerCase();
  const match = CLASSIFICACOES_PADRONIZADAS.find(c => 
    normalizeText(c).toLowerCase() === normalized
  );
  
  return match || ('não informado' as const);
}

/**
 * Standardize demand type
 */
export function standardizeTipoDemanda(tipo: string | null | undefined): TipoDemandaPadronizado | 'não informado' {
  if (!tipo) return 'não informado';
  
  const normalized = normalizeText(tipo).toLowerCase();
  const match = TIPOS_DEMANDA_PADRONIZADOS.find(t => 
    normalizeText(t).toLowerCase() === normalized
  );
  
  return match || ('não informado' as const);
}

/**
 * Standardize origin
 */
export function standardizeOrigem(origem: string | null | undefined): OrigemPadronizada | 'não informado' {
  if (!origem) return 'não informado';
  
  const normalized = normalizeText(origem).toLowerCase();
  const match = ORIGENS_PADRONIZADAS.find(o => 
    normalizeText(o).toLowerCase() === normalized
  );
  
  return match || ('não informado' as const);
}

/**
 * Capitalize first letter
 */
export function capitalizeFirstLetter(text: string | null | undefined): string {
  if (!text) return 'não informado';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format text for display (capitalize, trim, etc)
 */
export function formatTextForDisplay(text: string | null | undefined): string {
  if (!text) return 'não informado';
  return capitalizeFirstLetter(text.trim());
}
