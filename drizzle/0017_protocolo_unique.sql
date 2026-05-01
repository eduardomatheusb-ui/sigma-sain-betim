-- Fase 52: Adicionar constraint UNIQUE ao protocolo de Demandas Externas
-- Garante que cada protocolo SAIN-XXXXXX/YYYY é único no sistema

ALTER TABLE externalDemands 
ADD CONSTRAINT uk_protocolo UNIQUE (protocolo);

-- Criar índice para melhorar performance de busca por protocolo
CREATE INDEX idx_protocolo ON externalDemands(protocolo);

-- Criar índice para filtros por status e ano
CREATE INDEX idx_status_ano ON externalDemands(status, YEAR(dataRecebimento));
