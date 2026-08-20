-- Cola accionable de Consultas (panel admin) — antes `service_leads` era de solo lectura,
-- nadie podía marcar un pedido como resuelto ni saber cuáles ya se atendieron.

alter table public.service_leads
  add column if not exists status text not null default 'pendiente';

alter table public.service_leads
  drop constraint if exists service_leads_status_check;

alter table public.service_leads
  add constraint service_leads_status_check check (status in ('pendiente', 'atendido'));

notify pgrst, 'reload schema';
