-- ============================================================================
-- Migração: View de Ranking Semanal (Ciclo com reset no Domingo às 00:00:00 BRT)
-- ============================================================================

-- View para Ranking Semanal (Resetando todo domingo às 00:00 Horário de Brasília)
-- No PostgreSQL, date_trunc('week', ...) começa na segunda-feira.
-- Adicionando 1 dia antes e subtraindo 1 dia, alinhamos o início para Domingo às 00:00.
create or replace view public.view_leaderboard_weekly as
select 
  p.id as player_id,
  p.nickname,
  p.avatar_url,
  p.is_anonymous,
  sum(r.score) as total_score,
  count(r.id) as games_played,
  count(case when r.won then 1 end) as games_won,
  min(r.attempts_count) as best_attempts,
  max(r.completed_at) as last_played_at
from public.players p
join public.daily_results r on r.player_id = p.id
where r.completed_at >= (date_trunc('week', (now() at time zone 'America/Sao_Paulo') + interval '1 day') - interval '1 day')
group by p.id, p.nickname, p.avatar_url, p.is_anonymous
order by total_score desc, games_won desc;

-- Permissão de leitura pública para a view de ranking semanal
grant select on public.view_leaderboard_weekly to anon, authenticated;
