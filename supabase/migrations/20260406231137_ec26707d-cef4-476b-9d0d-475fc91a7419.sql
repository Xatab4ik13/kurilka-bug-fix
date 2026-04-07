CREATE OR REPLACE FUNCTION public.is_server_owner(_server_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.servers
    WHERE id = _server_id
      AND owner_id = _user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_server_member(_server_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.servers s
    WHERE s.id = _server_id
      AND s.owner_id = _user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.server_members sm
    WHERE sm.server_id = _server_id
      AND sm.user_id = _user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_server_manager(_server_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.servers s
    WHERE s.id = _server_id
      AND s.owner_id = _user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.server_members sm
    WHERE sm.server_id = _server_id
      AND sm.user_id = _user_id
      AND sm.role IN ('owner', 'admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_channel(_channel_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.channels c
    JOIN public.servers s ON s.id = c.server_id
    WHERE c.id = _channel_id
      AND (
        s.owner_id = _user_id
        OR EXISTS (
          SELECT 1
          FROM public.server_members sm
          WHERE sm.server_id = c.server_id
            AND sm.user_id = _user_id
        )
      )
  );
END;
$$;