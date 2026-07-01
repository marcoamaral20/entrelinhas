create table parser_results (
  id uuid primary key,
  raw_message_id uuid not null references raw_messages (id),
  status text not null,
  reason text,
  created_at timestamptz not null,
  constraint parser_results_raw_message_unique unique (raw_message_id)
);

create table property_listings (
  id uuid primary key,
  raw_message_id uuid not null references raw_messages (id),
  parser_result_id uuid not null references parser_results (id),
  intent text not null,
  property_type text not null,
  price_amount integer not null,
  location_text text not null,
  city text,
  neighborhood text,
  state text,
  bedrooms integer,
  contact_phone text,
  created_at timestamptz not null,
  constraint property_listings_parser_result_unique unique (parser_result_id)
);
