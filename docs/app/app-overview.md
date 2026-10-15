# App overview

How the **Dragon Roll** application is put together: request flow, the
auth/route guard, routes, Server Actions, and what each component does.

## Big picture

- **Next.js App Router** (`app/` at the repo root) + React + TypeScript.
- **Server Components are the default.** Pages fetch data and read the session on
  the server; `"use client"` is used only for interactive pieces (dialogs,
  forms, local state).
- **better-auth** handles authentication (email + password) with a Prisma
  adapter. The generated client is exposed both server-side (`lib/auth.ts`) and
  to the browser (`lib/auth-client.ts`).
- **Prisma + PostgreSQL** (`lib/prisma.ts`) is the only data layer and is used
  exclusively on the server (Server Components, Server Actions, better-auth).
- **Open5e** (`lib/open5e.ts`) is a server-only client for the public Open5e
  monster API, used by the character Server Actions to autofill monster
  templates.
- **Guest access** — unauthenticated visitors can join a room with a nickname.
  Guest identity lives in httpOnly cookies (`lib/guest.ts`); no `User` row is
  created. Guests are stored as `RoomMember` rows with `guestName` and a `null`
  `userId`.
- **Styling:** Tailwind CSS + shadcn/ui primitives (`components/ui/`), dark-first
  theme.

```
Browser
  │  (1) request
  ▼
proxy.ts ── no session ──▶ redirect /login
  │ session
  ▼
app/<route>/page.tsx  (Server Component: reads session, queries Prisma)
  │  renders
  ▼
feature client components ── form submit ──▶ app/<route>/actions.ts (Server Action)
                                                    │
                                                    ▼
                                              Prisma → PostgreSQL
```

## Route map

| Route | File | Type | What it does |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Server | Public landing page. Signed-in users are redirected to `/dashboard`. Otherwise shows `BrandMark` and a card with the **guest join** form (room code + nickname) plus Sign in / Create account links. |
| `/login` | `app/login/page.tsx` | Server | Renders `BrandMark` + `LoginForm`. Also links to `/` to join as a guest. |
| `/signup` | `app/signup/page.tsx` | Server | Renders `BrandMark` + `SignupForm`. Also links to `/` to join as a guest. |
| `/dashboard` | `app/dashboard/page.tsx` | Server | Reads the session, greets the user, shows `SignOutButton` and `DashboardMenu`. |
| `/characters` | `app/characters/page.tsx` | Server | Reads the session (redirects to `/login` if absent) and loads the signed-in user's characters and monsters from Prisma, passing them to `CharacterList`. |
| `/room/[id]` | `app/room/[id]/page.tsx` | Server | Public. Loads the room + members from Prisma (`notFound()` if missing). Shows name / code / DM and the member list. If the viewer is not a member it offers a guest join form (nickname) or, when signed in, a "Join this room" button. |
| `/api/auth/[...all]` | `app/api/auth/[...all]/route.ts` | Route handler | better-auth HTTP endpoint (`toNextJsHandler(auth)`), handles `GET`/`POST`. |

## Authentication and route protection

- `lib/auth.ts` — server-side `auth` instance: `emailAndPassword` enabled,
  `prismaAdapter(prisma)`, `nextCookies()` plugin.
- `lib/auth-client.ts` — browser client exporting `signIn`, `signUp`, `signOut`,
  `useSession`.
- `proxy.ts` — Next.js proxy/middleware guard. Matcher is `["/dashboard/:path*", "/characters/:path*"]` (the account-only areas): no session → redirect to `/login`. `/`, `/login`, `/signup`, and `/room/[id]` are intentionally **public** so guests can join a session; the landing page redirects signed-in users to `/dashboard` itself.
- Server-side reads use `auth.api.getSession({ headers: await headers() })`
  (in `page.tsx` files and Server Actions). Server Actions still re-check the
  session — they never trust that the page already did.

## Guest access

- `lib/guest.ts` holds the shared constants/helpers: cookie names
  (`dragon_guest_name`, `dragon_guest_room_<roomId>`), cookie options, nickname
  normalization (`normalizeGuestName`, 2–32 chars), and the `RoomJoinState` type.
- `app/room/actions.ts` exposes two Server Actions:
  - `joinRoomAsGuest(state, formData)` — validates the nickname, finds the room by
    id or code, creates a `RoomMember` (`userId: null`, `guestName`), writes the
    guest cookies, and redirects to `/room/:id`. If the caller already has a
    session it joins as a member instead.
  - `joinRoomAsUser(state, formData)` — requires a session; adds the user as a
    member if they are not already one, then redirects.
- Guest cookies are httpOnly, `sameSite: lax`, 30-day max age. The per-room cookie
  stores the `RoomMember.id`, so the room page can recognize the guest and show
  "You are in this room as …".
- **What requires an account:** creating a room (`/dashboard` + `createRoom`),
  and creating/editing/deleting characters and monsters (`/characters` +
  `app/characters/actions.ts`). Guests are blocked from both by the proxy and by
  the Server Actions' session checks.

## Server Actions

| File | Actions | Notes |
| --- | --- | --- |
| `app/dashboard/actions.ts` | `createRoom` | Requires a session. Generates a unique room code (`app/room/room-random-code-generator.ts`), creates the room, adds the creator as `isDM: true`, then redirects to `/room/:id`. |
| `app/room/actions.ts` | `joinRoomAsGuest`, `joinRoomAsUser` | Room membership. `joinRoomAsGuest` needs no session (nickname only) and writes the guest cookies; `joinRoomAsUser` requires a session. Both look the room up by `roomId` or `code` and redirect to `/room/:id`; errors are returned as `{ error }` for `useActionState`. |
| `app/characters/actions.ts` | `createCharacter`, `updateCharacter`, `createMonster`, `updateMonster`, `deleteCharacter`, `deleteMonster`, `searchMonsterLibrary`, `loadMonsterFromLibrary` | Require a session and enforce ownership (`findFirst` by `id` + `ownerId`). Enforce a `MAX_SLOTS = 5` limit per user for both characters and monsters. Values are read from `FormData` via a `getNumber` helper that rejects non-finite numbers. `deleteCharacter`/`deleteMonster` verify ownership before deleting, then `revalidatePath("/characters")`. `searchMonsterLibrary` (debounced from the dialog) and `loadMonsterFromLibrary` proxy the Open5e API server-side. |
| `app/room/room-random-code-generator.ts` | `generateUniqueRoomCode(prisma)` | Loops until it produces a code not already used by a room. Typed against `PrismaClient`. |

## Components

### Auth / shared (`components/`)

| Component | Type | Responsibility |
| --- | --- | --- |
| `login-form.tsx` | Client | Email/password form; calls `signIn.email`, then `router.push("/dashboard")`. Links to `/signup` and to `/` (join as guest). |
| `signup-form.tsx` | Client | Name/email/password/confirm form; calls `signUp.email`, then `router.push("/dashboard")`. Links to `/login` and to `/` (join as guest). |
| `sign-out-btn.tsx` | Client | Calls `signOut()` and redirects to `/login`. |
| `brand-mark.tsx` | Server | Flame emblem + "Dragon Roll" wordmark used on the auth/landing screens. |
| `guest-join-form.tsx` | Client | `useActionState` form posting to `joinRoomAsGuest`. Asks for a room code when no `roomId` is passed (landing page); otherwise only a nickname (room page). Prefills the nickname from the guest cookie. |
| `ui/*` | Client/Server | shadcn/ui primitives (`button`, `card`, `input`, `dialog`, `dropdown-menu`, `field`, `label`, `separator`, `sonner`). |

### Feature components (`app/<feature>/<feature>-components/`)

Dashboard:

| Component | Type | Responsibility |
| --- | --- | --- |
| `dashboard-menu.tsx` | Server | Three action panels: Create Room, Join Room, Manage Characters (links to `/characters`). |
| `create-room-dialog.tsx` | Client | Dialog with a room-name form posting to the `createRoom` action. |
| `join-room-dialog.tsx` | Client | `useActionState` dialog with a room-code form posting to `joinRoomAsUser`; shows an error when the code is not found. |

Rooms:

| Component | Type | Responsibility |
| --- | --- | --- |
| `room/[id]/room-components/join-room-button.tsx` | Client | `useActionState` form posting to `joinRoomAsUser` with the room id, shown to signed-in non-members on the room page. |

Characters:

| Component | Type | Responsibility |
| --- | --- | --- |
| `character-list.tsx` | Client | Data-driven (receives `characters` / `monsters` from the page). Tabbed Characters/Monsters view, client-side name filter, slot counter, and create/edit/delete wiring; calls `router.refresh()` after a mutation. Delete opens a confirmation dialog. |
| `character-card.tsx` | Client | Presentational card: name, level/type badge, AC / HP / initiative tiles, six ability scores, Edit/Delete buttons. |
| `character-form-dialog.tsx` | Client | Create/edit dialog for both characters and monsters. When creating a monster it shows an **Open5e autofill** section (debounced search → select → fields prefill; every value stays editable for custom entry). Calls the matching action and surfaces errors. |
| `character-menu.tsx` | — | Empty file, not imported (unused placeholder). |
| `types.ts` | — | Shared `CharacterData` / `MonsterData` shapes used by the card, list, and form dialog. |

## Monster creation flow (Open5e autofill)

1. On `/characters`, **Create monster** opens `character-form-dialog` in create mode.
2. The dialog shows an Open5e search box (debounced 350 ms → `searchMonsterLibrary`).
3. Selecting a result calls `loadMonsterFromLibrary(slug)`; `lib/open5e.ts` fetches
   `GET /v1/monsters/{slug}/` and maps it to the form fields.
4. The form remounts with the mapped values — every field stays editable, and the
   user can ignore the search entirely and type custom values.
5. Submitting calls `createMonster`, which writes a normal `MonsterTemplate` row
   (a snapshot with no live link to Open5e); the list then refreshes.

Field mapping (Open5e → `MonsterTemplate`): `name` → `name`, `armor_class` →
`armorClass`, `hit_points` → `maxHp`, DEX modifier → `initiativeBonus`, and the
six ability scores map 1:1. Open5e's `challenge_rating`/`type`/`size` are only
shown in the search list.

## Current status / known gaps

Documentation only — these are observations, not requests:

- `character-menu.tsx` is empty and unused.
- `signup-form.tsx` does not compare password vs. confirm-password, and both auth
  forms report results via `alert()` rather than the `sonner` toaster.
- Guest membership is recognized by cookie only; there is no "leave room" or
  account-linking flow yet, and guests cannot bring saved characters/monsters
  into a room.
- The room page shows the member list to anyone with the room id (the cuid acts
  as the invite token).
