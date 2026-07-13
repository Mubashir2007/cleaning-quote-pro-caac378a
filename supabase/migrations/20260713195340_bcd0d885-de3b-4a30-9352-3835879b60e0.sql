-- Add 'sent' to the quote_status enum if not present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'sent' AND enumtypid = 'public.quote_status'::regtype) THEN
    ALTER TYPE public.quote_status ADD VALUE 'sent';
  END IF;
END$$;

-- Add tokens + timestamps to quotes
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS accept_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS reject_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

CREATE INDEX IF NOT EXISTS quotes_accept_token_idx ON public.quotes (accept_token);
CREATE INDEX IF NOT EXISTS quotes_reject_token_idx ON public.quotes (reject_token);

-- Public RPC that lets an unauthenticated customer act on a single quote via a secret token.
-- action = 'accept' | 'reject'. Prevents duplicate submissions.
CREATE OR REPLACE FUNCTION public.act_on_quote_by_token(_token text, _action text)
RETURNS TABLE (
  quote_number text,
  status public.quote_status,
  accepted_at timestamptz,
  rejected_at timestamptz,
  company_name text,
  total numeric,
  currency text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q record;
BEGIN
  IF _action NOT IN ('accept','reject') THEN
    RAISE EXCEPTION 'invalid_action';
  END IF;

  IF _action = 'accept' THEN
    SELECT * INTO q FROM public.quotes WHERE accept_token = _token LIMIT 1;
  ELSE
    SELECT * INTO q FROM public.quotes WHERE reject_token = _token LIMIT 1;
  END IF;

  IF q.id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  IF q.status IN ('accepted','rejected','completed') THEN
    -- already finalized; return current state
    RETURN QUERY
      SELECT q.quote_number, q.status, q.accepted_at, q.rejected_at,
             p.company_name, q.total, p.currency
      FROM public.profiles p WHERE p.id = q.user_id;
    RETURN;
  END IF;

  IF _action = 'accept' THEN
    UPDATE public.quotes
      SET status = 'accepted', accepted_at = now(), updated_at = now()
      WHERE id = q.id
      RETURNING * INTO q;
  ELSE
    UPDATE public.quotes
      SET status = 'rejected', rejected_at = now(), updated_at = now()
      WHERE id = q.id
      RETURNING * INTO q;
  END IF;

  RETURN QUERY
    SELECT q.quote_number, q.status, q.accepted_at, q.rejected_at,
           p.company_name, q.total, p.currency
    FROM public.profiles p WHERE p.id = q.user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.act_on_quote_by_token(text, text) TO anon, authenticated;

-- Public read of minimal quote info by token (so the confirmation page can display quote #, total, company)
CREATE OR REPLACE FUNCTION public.get_quote_by_token(_token text)
RETURNS TABLE (
  quote_number text,
  status public.quote_status,
  total numeric,
  currency text,
  company_name text,
  customer_name text,
  accepted_at timestamptz,
  rejected_at timestamptz,
  action text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  q record;
  act text;
BEGIN
  SELECT *, 'accept'::text AS a INTO q FROM public.quotes WHERE accept_token = _token LIMIT 1;
  IF q.id IS NULL THEN
    SELECT *, 'reject'::text AS a INTO q FROM public.quotes WHERE reject_token = _token LIMIT 1;
  END IF;
  IF q.id IS NULL THEN
    RETURN;
  END IF;
  act := q.a;

  RETURN QUERY
    SELECT q.quote_number, q.status, q.total,
           p.currency, p.company_name, c.full_name,
           q.accepted_at, q.rejected_at, act
    FROM public.profiles p, public.customers c
    WHERE p.id = q.user_id AND c.id = q.customer_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_quote_by_token(text) TO anon, authenticated;