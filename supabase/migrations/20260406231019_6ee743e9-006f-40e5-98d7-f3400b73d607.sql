CREATE OR REPLACE FUNCTION public.is_server_owner(_server_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.servers
    WHERE id = _server_id
      AND owner_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_server_member(_server_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_server_owner(_server_id, _user_id)
    OR EXISTS (
      SELECT 1
      FROM public.server_members
      WHERE server_id = _server_id
        AND user_id = _user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.is_server_manager(_server_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_server_owner(_server_id, _user_id)
    OR EXISTS (
      SELECT 1
      FROM public.server_members
      WHERE server_id = _server_id
        AND user_id = _user_id
        AND role IN ('owner', 'admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.can_access_channel(_channel_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channels
    WHERE id = _channel_id
      AND public.is_server_member(server_id, _user_id)
  );
$$;

DROP POLICY IF EXISTS "Servers visible to members" ON public.servers;
CREATE POLICY "Servers visible to members"
ON public.servers
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR public.is_server_member(id, auth.uid())
);

DROP POLICY IF EXISTS "Members can view server members" ON public.server_members;
CREATE POLICY "Members can view server members"
ON public.server_members
FOR SELECT
TO authenticated
USING (
  public.is_server_member(server_id, auth.uid())
);

DROP POLICY IF EXISTS "Server owner/admin can add members" ON public.server_members;
CREATE POLICY "Server owner/admin can add members"
ON public.server_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR public.is_server_manager(server_id, auth.uid())
);

DROP POLICY IF EXISTS "Channels visible to server members" ON public.channels;
CREATE POLICY "Channels visible to server members"
ON public.channels
FOR SELECT
TO authenticated
USING (
  public.is_server_member(server_id, auth.uid())
);

DROP POLICY IF EXISTS "Server owner can manage channels" ON public.channels;
CREATE POLICY "Server owner can manage channels"
ON public.channels
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_server_manager(server_id, auth.uid())
);

DROP POLICY IF EXISTS "Server owner can update channels" ON public.channels;
CREATE POLICY "Server owner can update channels"
ON public.channels
FOR UPDATE
TO authenticated
USING (
  public.is_server_manager(server_id, auth.uid())
);

DROP POLICY IF EXISTS "Server owner can delete channels" ON public.channels;
CREATE POLICY "Server owner can delete channels"
ON public.channels
FOR DELETE
TO authenticated
USING (
  public.is_server_manager(server_id, auth.uid())
);

DROP POLICY IF EXISTS "Messages visible to server members" ON public.messages;
CREATE POLICY "Messages visible to server members"
ON public.messages
FOR SELECT
TO authenticated
USING (
  public.can_access_channel(channel_id, auth.uid())
);

DROP POLICY IF EXISTS "Server members can send messages" ON public.messages;
CREATE POLICY "Server members can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND public.can_access_channel(channel_id, auth.uid())
);