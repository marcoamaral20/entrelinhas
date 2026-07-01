alter table raw_messages
  add column if not exists processing_started_at timestamptz,
  add column if not exists processed_at timestamptz,
  add column if not exists processing_failed_at timestamptz,
  add column if not exists last_processing_error text;
