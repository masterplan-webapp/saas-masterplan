-- Verificar e remover planos duplicados baseados no data.id
-- Primeiro, vamos identificar os duplicados
WITH duplicate_plans AS (
  SELECT 
    id,
    user_id,
    name,
    data->>'id' as plan_data_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, data->>'id' 
      ORDER BY created_at ASC
    ) as rn
  FROM plans
  WHERE data->>'id' IS NOT NULL
)
-- Deletar os duplicados (manter apenas o primeiro criado)
DELETE FROM plans 
WHERE id IN (
  SELECT id 
  FROM duplicate_plans 
  WHERE rn > 1
);

-- Verificar se ainda existem duplicados
SELECT 
  user_id,
  data->>'id' as plan_data_id,
  COUNT(*) as count
FROM plans
WHERE data->>'id' IS NOT NULL
GROUP BY user_id, data->>'id'
HAVING COUNT(*) > 1