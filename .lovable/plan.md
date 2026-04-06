

## Plan: Copy Kurilka codebase to this project

Copy the entire Kurilka chat application code into this project. This is a Discord-like gaming chat app with cyberpunk/neon theme.

### Files to create/update:

**Core files:**
1. `src/App.tsx` — with AuthProvider, login flow, routing
2. `src/index.css` — cyberpunk theme system (6 themes: cyber-neon, purple, ocean, sunset, amber, minimal) with neon utilities
3. `src/main.tsx` — keep as-is
4. `tailwind.config.ts` — add animations (fade-in, scale-in, slide-in-right)

**Types & Data:**
5. `src/types/chat.ts` — User, Message, Server, Channel, etc.
6. `src/data/mockData.ts` — mock servers, users, conversations

**Pages:**
7. `src/pages/Index.tsx` — main app layout with sidebar (friends list), server grid, DM view, modals
8. `src/pages/Login.tsx` — login/register form with neon styling
9. `src/pages/NotFound.tsx` — keep existing

**Hooks:**
10. `src/hooks/useAuth.tsx` — Supabase auth context with theme support
11. `src/hooks/useDatabase.ts` — servers, channels, messages, DMs, profiles hooks with realtime
12. `src/hooks/useLiveKit.ts` — LiveKit voice/video integration

**Components:**
13. `src/components/GameIcon.tsx` — custom SVG icon system (gamepad, search, bell, settings, send, etc.)
14. `src/components/ProfilePanel.tsx` — full settings panel (profile, audio, appearance, notifications, keybinds)
15. `src/components/CreateServerModal.tsx` — 3-step server creation wizard
16. `src/components/AddFriendModal.tsx` — friend search and add
17. `src/components/NotificationsDropdown.tsx` — notifications panel
18. `src/components/StatusPicker.tsx` — online/afk/dnd/offline status picker
19. `src/components/ServerSettingsModal.tsx` — server settings (general, channels, members, roles)
20. `src/components/CallOverlay.tsx` — voice/video call overlay with LiveKit

**Chat components:**
21. `src/components/chat/ChatView.tsx` — server chat view with channels, messages, voice
22. `src/components/chat/DirectChat.tsx` — DM chat view
23. `src/components/chat/ServerCard.tsx` — server card for grid
24. `src/components/chat/MessageBubble.tsx` — message bubble with reply, context menu
25. `src/components/chat/EmojiPicker.tsx` — emoji picker
26. `src/components/chat/MessageContextMenu.tsx` — right-click context menu
27. `src/components/chat/MiniProfile.tsx` — hover profile card
28. `src/components/chat/TypingIndicator.tsx` — typing animation
29. `src/components/chat/VoiceChannelPanel.tsx` — voice channel controls

**Lib:**
30. `src/lib/sounds.ts` — Web Audio API sound effects

**Integrations:**
31. `src/integrations/supabase/client.ts` — Supabase client
32. `src/integrations/supabase/types.ts` — DB types (profiles, servers, channels, messages, DMs, server_members)

**Dependencies to add:**
- `livekit-client` — for voice/video calls
- `framer-motion` — for animations
- `date-fns` — for date formatting

