# RippleNet AI — Full Project Context

## One-line pitch
RippleNet AI is a decision-intelligence platform that turns chaotic, low-literacy-accessible flood SOS signals into one ranked, AI-justified deployment order for Alkhidmat health camps — so scarce volunteers and supplies go to the highest-risk victim first, with the reasoning attached.

## Problem
During floods, requests for help arrive faster (calls, USSD, voice notes) than they can be manually ranked. Two victims may both be in danger but only one volunteer/truck is free — today that choice is made by whoever's loudest, not who's most at risk. There's also no defensible record of *why* aid went where it went.

## Who it's for
Alkhidmat health camps, field volunteers, global admin (Alkhidmat/government oversight), and low-literacy/low-tech flood victims in rural Pakistan (e.g. Badin, Buner, Lasbela).

---

## System structure — 3 layers

### Layer 1: Omni-Channel Ingestion (citizen-facing, no login, no dashboard feel)
- **SOS Video** (smartphone): GPS auto-extracted from video metadata.
- **USSD `*313#`** (basic keypad phone): no data/app/literacy needed, tower-triangulated location.
- **WhatsApp voice note**: transcribed via ASR (Punjabi/Sindhi/Pashto/Balochi), crisis keywords ("Paani," "Doob") auto-spike risk to 10/10, system can call back with spoken directions.
- Victim also reports symptoms/needs (fever, injury, no clean water, etc.) at this stage.

### Layer 2: AI Decision Engine — 6 agents, run sequentially per request
1. **Flood Agent** — rainfall + satellite surface-water data → 1–10 severity score.
2. **Health Agent** — reads victim's symptoms + housing/water exposure → outputs a **specific, contraindication-aware resource list** per victim (e.g. no fever medicine if open wound present — antiseptic instead) → also flags village-level outbreak risk tier (Primary/Secondary).
3. **Logistics Agent** — builds the exact parcel from Health Agent's list against **live camp stock as a hard ceiling**; matches nearest available volunteer; auto-files a restock request to admin if stock is low; rounds into shippable units (crates/boxes).
4. **Route Agent** — checks road passability, computes detour + delay if blocked, calculates trip count from cargo weight.
5. **Health Camp Manager Agent** (formerly "Complaint Resolution Agent") — oversees the whole pipeline for errors/stalls; resolves complaints from both citizens ("never arrived," "wrong priority") and field staff ("bad route," "unfair allocation"); permanently logs what was delivered, to whom, when, by whom.
6. *(Note: a "Resource Agent" for cost/freight tracking was proposed then explicitly removed — folded into Logistics Agent.)*

**Output of every case:** a ranked **Deployment Manifesto** ending in a fixed four-header justification block:
- Risk Driver
- Priority Effect
- Route Decision
- Allocation Decision

This justification block is the system's core "defensibility" differentiator vs. competitors that just show a dashboard number.

### Layer 3: Human Execution Layer (role-based dashboards)
Request routing is **camp-first, not admin-first**:
1. Citizen → **nearest health camp** (not global admin directly)
2. Camp checks: available volunteer + sufficient stock?
   - Yes → dispatch
   - No → auto-forward to next-nearest camp
3. **Global admin** = oversight only (sees camps-covered count, pending time, resolved/not) — never handles individual requests directly
4. **Volunteer** — follows AI route/ETA, delivers parcel, marks Resolved (timestamps, deducts stock, frees volunteer)
5. **Citizen** — gets a ContactCard (nearest base camp, dispatch number, district hotline) + live status (Pending/In Transit/Resolved)

---

## Tech stack (MVP, near-zero cost)

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS, shadcn/ui, React Query, React Hook Form + Zod, Leaflet/OSM maps, next-intl (i18n), next-pwa |
| Backend | FastAPI (Python), SQLAlchemy (async) + Alembic |
| Database | PostgreSQL + PostGIS (via Supabase free tier) |
| Auth | Supabase Auth (JWT, role claims: admin/camp/volunteer) |
| File storage | Supabase Storage (SOS videos, delivery proof photos) |
| Background jobs | FastAPI BackgroundTasks (MVP) → Celery+Redis later |
| ASR | Whisper (open-source, self-hosted or HF free inference) |
| WhatsApp | WhatsApp Cloud API (Meta) free tier |
| USSD | Africa's Talking sandbox (simulated for MVP demo) |
| Routing | OSRM (self-hosted) or OpenRouteService free tier |
| Satellite/rainfall | NASA GPM (free) + Sentinel Hub / Google Earth Engine (free nonprofit tier) |
| Testing | Pytest + httpx.AsyncClient, GitHub Actions CI |

**MVP cuts for demo:** simulate USSD with a web form (no live carrier integration), use pre-loaded sample rainfall/flood data instead of live satellite feed, one camp + few demo volunteers instead of nationwide data.

---

## Database — core tables
`users`, `victims`, `requests` (status enum: received → processing → pending_camp_review → assigned → in_transit → resolved, plus forwarded/escalated), `manifestos` (risk_driver, priority_effect, route_decision, allocation_decision, assigned_volunteer_id), `camps`, `warehouse_stock`, `volunteers`, `parcels`, `restock_requests`, `complaints`, `delivery_records`.

## Auth model
JWT with `role` claim (admin/camp/volunteer) + `camp_id` where relevant. Citizen ingestion routes are unauthenticated by design (no login barrier during emergency) but rate-limited. Role scoping: admin = system-wide read + approve only; camp = own camp_id only; volunteer = own assigned tasks only.

## API routes (~28 total, by module)
- **Auth**: login, refresh, register (admin-only)
- **Ingestion (public)**: submit-video, submit-ussd (webhook), submit-whatsapp (webhook), get-status
- **Agent pipeline (internal)**: run-pipeline (background), get-manifesto
- **Camp**: get-queue, accept-request, forward-request, assign-volunteer, get/update-stock, restock-request
- **Volunteer**: get-tasks, update-task-status, resolve-task
- **Admin**: overview, list/add-camps, restock-approvals, reports/export
- **Complaints**: submit, list (role-scoped), resolve

## Frontend — pages by role (~20 total)
- **Citizen** (public, no login): SOS channel picker, video SOS submission, status tracker
- **Camp** (auth): login, incoming queue, request detail, volunteer roster, stock view, restock requests, complaints inbox
- **Volunteer** (auth): login, assigned tasks, task detail (route map), mark resolved
- **Admin** (auth): login, overview dashboard, camps management, restock approvals, complaints oversight, reports export

## Design system
- **Palette**: Ink Blue #0B3D5C (primary/trust), Channel Blue #0E5A8A (links/secondary), Signal Amber #E8A33D (urgency/pending — used instead of red to avoid panic), Critical Terracotta #C1440E (reserved only for severity 9–10), Resolved Teal #2E7D6B (success), Paper #F7F6F2 (background)
- **Type**: Sora (display/headings), Inter (body/UI), Inter tabular-nums (data/scores)
- **Signature component**: the four-header Justification Block, styled consistently everywhere it appears
- **Shared components**: StatusBadge, SeverityMeter, JustificationBlock, ContactCard, RouteMap, ParcelList, RequestQueueRow, ComplaintCard, Primary/SecondaryButton, BottomNav, EmptyState, LanguageSwitcher
- Mobile-first (375px baseline), 44px min tap targets, offline-first PWA shell for citizen pages, colorblind-safe (color+label pairing), 5-language support (Urdu, Punjabi, Sindhi, Pashto, Balochi) + English

## Suggested build order
1. Database schema (Supabase/Postgres)
2. Auth (roles)
3. One ingestion path first (video SOS only)
4. Agent pipeline with mocked/sample data (not live satellite yet)
5. Camp dashboard (queue, accept/forward)
6. Volunteer flow (tasks, resolve)
7. Citizen status tracker
8. Admin overview last
9. Real USSD/WhatsApp/satellite integration only if time remains

---

*This document consolidates all decisions made across planning sessions and can be pasted into other AI tools as full project context.*

