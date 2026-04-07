DROP POLICY IF EXISTS "Members can view server members" ON public.server_members;
CREATE POLICY "Members can view own memberships"
ON public.server_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Servers visible to members" ON public.servers;
CREATE POLICY "Servers visible to members"
ON public.servers
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.server_members sm
    WHERE sm.server_id = servers.id
      AND sm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Channels visible to server members" ON public.channels;
CREATE POLICY "Channels visible to server members"
ON public.channels
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.servers s
    WHERE s.id = channels.server_id
      AND s.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.server_members sm
    WHERE sm.server_id = channels.server_id
      AND sm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Messages visible to server members" ON public.messages;
CREATE POLICY "Messages visible to server members"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.channels c
    JOIN public.servers s ON s.id = c.server_id
    WHERE c.id = messages.channel_id
      AND s.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.channels c
    JOIN public.server_members sm ON sm.server_id = c.server_id
    WHERE c.id = messages.channel_id
      AND sm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Server members can send messages" ON public.messages;
CREATE POLICY "Server members can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id
  AND (
    EXISTS (
      SELECT 1
      FROM public.channels c
      JOIN public.servers s ON s.id = c.server_id
      WHERE c.id = messages.channel_id
        AND s.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.channels c
      JOIN public.server_members sm ON sm.server_id = c.server_id
      WHERE c.id = messages.channel_id
        AND sm.user_id = auth.uid()
    )
  )
);