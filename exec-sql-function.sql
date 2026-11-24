CREATE OR REPLACE FUNCTION exec_sql(sql text, args jsonb DEFAULT '[]'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    EXECUTE sql USING args;
    GET DIAGNOSTICS result = ROW_COUNT;
    RETURN jsonb_build_object('rows', result, 'rowCount', result);
END;
$$;