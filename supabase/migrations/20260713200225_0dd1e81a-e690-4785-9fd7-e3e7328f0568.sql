REVOKE EXECUTE ON FUNCTION public.get_quote_by_token(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.act_on_quote_by_token(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_quote_by_token(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.act_on_quote_by_token(text, text) TO service_role;