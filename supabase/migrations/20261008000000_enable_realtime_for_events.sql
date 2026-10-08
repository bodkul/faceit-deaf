-- Event tables are written outside the app, so clients watch them with
-- Postgres Changes instead of app-sent broadcasts (see src/lib/realtime).
alter publication supabase_realtime add table
  public.events,
  public.event_matches,
  public.event_match_teams,
  public.event_match_maps,
  public.event_map_team_stats,
  public.event_map_player_stats;
