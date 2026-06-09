# Agroconecta MVP Implementation

## Mobile App

Run the Expo app from the repository root:

```bash
npm install
npx expo start --host lan
```

Required environment variables once Supabase is created:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Until those values exist, the app keeps using the local mock data. The new domain model is already in place:

- `Organization` replaces publisher/medio as the main account entity.
- `Post` replaces news article and supports article, video, auction, and institutional notice.
- `MarketPrice` is the manual-price shape that Supabase/admin will write.
- `organizationSubscriptions` is the canonical user-follow list. `mediaPreferences` remains as a compatibility alias.

## Supabase

Create a Supabase project, then run:

```sql
-- supabase/schema.sql
```

Then load demo data:

```sql
-- supabase/seed.sql
```

The schema includes:

- Profiles with email, phone, profession, and department.
- Organizations with commercial status and manual plan tracking.
- Organization members with admin/editor roles.
- Posts with editorial workflow and importance flag.
- User interests and organization subscriptions.
- Market prices for manual cattle/international updates.
- Push tokens for Expo notifications.

## Admin Web

The admin is intentionally separate from Expo to avoid Metro/router conflicts.

```bash
cd admin-web
npm install
npm run dev
```

Admin env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Current admin scope:

- Dashboard scaffold.
- Reads posts, organizations, and market prices.
- Shows editorial status, important flag, B2B commercial status, and manual prices.

Next admin implementation step:

- Add authenticated login.
- Add create/edit post form.
- Add approve/reject actions for `agro_admin`.
- Add manual price form.
- Add organization billing status form.

## MVP Behavior Implemented In Mobile

- Home feed now separates important posts, personalized posts, and discovery.
- Banners and organization logos use public Supabase Storage buckets. See `docs/supabase-buckets-banners.md`.
- Following accounts includes associations, institutions, media, gremios, and rematadoras.
- Onboarding collects name, email, phone, profession, department, interests, and followed accounts.
- Videos has a featured embedded YouTube auction block.
- Prices use the `MarketPrice` shape that the admin will populate.
- Push token registration helper is ready in `lib/push-notifications.ts`.
