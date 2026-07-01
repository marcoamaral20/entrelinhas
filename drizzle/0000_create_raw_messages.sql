create table if not exists raw_messages (
  id uuid primary key,
  external_message_id text not null,
  group_id text not null,
  group_name text not null,
  sender_id text not null,
  sender_name text not null,
  text text not null,
  sent_at timestamptz not null,
  received_at timestamptz not null,
  processing_status text not null,
  constraint raw_messages_external_group_unique unique (external_message_id, group_id)
);
