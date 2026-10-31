# Crephore Web: Agent Instructions

This file is the source of truth for this repository's structure, API, auth, form, and testing conventions.
Follow it for every change, and update it when conventions change.

The structure mirrors the Zao POS web app (`~/Projects/zao/zao-pos-web`). When something is not covered here, follow how that project does it.
Intentional differences from zao: SSR for public pages (zao is `ssr: false`), the `landing` layout and `site-theme/` for the public site and event websites, `config/navigation.ts` instead of inline sidebar data, and the `c-`/`C` prefix instead of `z-`/`Z`.
The API is `../crephore-backend` (see its `CLAUDE.md`); keep types in sync with its DTOs.

---

## Tech Stack
- Nuxt 4 (`app/` directory), Vue 3, TypeScript
- UI: shadcn-vue (`app/components/ui`, no prefix, auto-imported), Tailwind CSS 4, `@lucide/vue` icons
- State: Pinia (`@pinia/nuxt`)
- HTTP: axios through `app/lib/axios.ts`
- Forms: vee-validate + zod (`@vee-validate/zod`, zod 3 syntax: `z.string().email()`)
- Toasts: vue-sonner through `cToast()` in `app/lib/cToast.ts`
- Drag to reorder: `vue-draggable-plus` (SortableJS). For vee-validate field arrays pass `customUpdate`: put Sortable's DOM move back and call `useFieldArray().move(oldIndex, newIndex)` (see the timeline in `EventFormFields.vue`)
- Tests: vitest + `@nuxt/test-utils` (`environment: 'nuxt'`)
- Package manager: pnpm (version pinned in `package.json` `packageManager`; dependency build scripts allowed in `pnpm-workspace.yaml` `allowBuilds`, as in zao). Do not use npm or commit a `package-lock.json`.

---

## Project Structure
- `app/features/<feature>/`: the data side of one feature (types, API calls, stores, registries)
  - `<feature>.type.ts`: request/response types mirroring the backend DTOs
  - `<feature>.api.ts`: one function per endpoint plus a `<Feature>ApiRoutes` object; only uses `get/post/put/patch/del` from `~/lib/axios`
  - `<feature>.store.ts`: Pinia setup store (`use<Feature>Store`), when state is shared across pages
- `app/pages/`: routes
  - Route groups organise pages without changing the URL:
    - `(auth)/`: `sign-in`, `sign-up` (use the `auth` layout)
    - `(dashboard)/`: signed-in pages, `dashboard/**` and `admin/**` (use the default layout; set `area` in `definePageMeta`)
    - `index.vue`: the public landing page (uses the `landing` layout)
  - A page is `<route>/index.vue`; its page-only pieces live next to it in `_components/`:
    - `<Name>Form.vue` for the form component, `<Name>FormFields.vue` for reusable field groups
    - `<name>.form.schema.ts` with the zod schema, `<name>FormInitialValues`, and `mapFormValuesTo<Request>()` mappers
  - `_`-prefixed folders and `.ts` files under `pages/` are not routes (`pages:extend` hook in `nuxt.config.ts`).
- `app/components/`: app shell components, as in zao
  - `AppSidebar.vue` (composes `NavMain.vue` per nav group and `NavUser.vue` for the user menu and sign out), `SiteHeader.vue` (breadcrumbs, search, `ModeToggle.vue`)
  - Brand and page pieces: `AppLogo.vue`, `AppLogoMark.vue`, `PagePlaceholder.vue`, `landing/*` (subfolder names prefix the component name, e.g. `LandingFeatureCard`)
  - `custom/c-<name>/C<Name>.vue`: reusable building blocks, registered without a path prefix (Crephore's equivalent of zao's `custom/z-*/Z*`)
    - `c-form/CFormTextField.vue`: vee-validate field (label, input, first error, optional `#description` slot); `type="password"` renders `CPasswordInput`; `#addon-start` / `#addon-end` put text or icons inside the input (shadcn `InputGroup`, e.g. the subdomain's `.crephore.com` suffix)
    - Help text: every `CForm*Field` takes a `#field-info` slot, shown in a popover behind an info icon next to the label (`c-form/CFormFieldLabel.vue` + `CFormFieldInfo.vue`, zao's `ZFormFieldLabel` / `ZFormFieldInfo`). Use it to explain what a field is for; use `#description` only for a short hint that should always be visible
    - `c-form/CPasswordInput.vue`: password input with show/hide toggle
    - `c-header/CPageHeader.vue`: page title, description (or a `#description` slot for richer content, e.g. an event's date), `#actions` slot
    - `c-tabs/CPillTabs.vue`: a shadcn `Tabs` list as rounded pills (active = primary); use it inside `<Tabs>` in place of `TabsList` for a page's main tabs
    - `c-toast/CToast.vue`: the toaster, mounted once in `app.vue`
    - `c-data-table/`: paged list tables ported from zao's `z-data-table` (`CDataTable`, `CDataTableCard`, column defs `CDataTableTextColumn` / `CDataTableDateTimeColumn`). Server-side paging, sorting and search; add/edit/delete through `CDataTableFormDialog` (or `onUpdateItemClicked` to edit elsewhere, like `onAddItemClicked`); optional `expandedRowComponent` for per-row panels; exposes `reload()`
    - `c-modal/CConfirmationModal.vue`: confirm before destructive actions outside the table dialog
    - `c-date-time/CDateTime.vue`: an event time or range in the event's timezone, with a muted "(Manila, GMT+8)" for viewers in another timezone (see `date.ts` below)
    - `c-form/CFormSelectField.vue` (`clearable` sends `null`), `c-form/CFormTextareaField.vue`
    - `c-form/CFormCheckboxListField.vue`: an array of checked option values, with optional search and per-option `description` / `hint` (e.g. picking a group's events)
    - `c-form/CFormDateTimeField.vue`: the shadcn-vue date picker (Calendar in a Popover) plus a time input; the value is a wall-clock string (`"2027-06-12T15:00"`) sent as it is with the event's `timezone`; the API converts it to UTC. Use it for every date/time field instead of `<input type="datetime-local">`
  - `ui/`: shadcn-vue components. Add them with `pnpm dlx shadcn-vue@latest add <name>` and do not edit them by hand.
    - The components style state with `data-open:`, `data-checked:`, `data-active:`, `data-horizontal:` … while reka-ui sets `data-state` / `data-orientation`. `assets/css/tailwind.css` maps those variants with `@custom-variant` (each matches reka's attribute or the plain one); keep that list in sync when adding components that use another state variant. Without it switches, checkboxes and active tabs look off, tabs don't stack, and overlays don't animate.
  - Import app and custom components explicitly in `<script setup>` (as zao does); `ui/` components are used through auto-import.
- `app/lib/`: framework-level helpers
  - `axios.ts`: request helpers, error toasts, refresh-and-retry on 401 and session-expiry handling, `isAuthFailure`, `getApiErrors`
  - `cToast.ts`: `cToast({ title, description?, type, button? })`
  - `table.ts`: `valueUpdater` for TanStack Table state
  - `date.ts`: `formatDateTime(iso, timeZone?)`, `formatDateTimeRange(start, end, timeZone?)`, `formatTimeZone(timeZone, iso?)` ("Manila, GMT+8"), `isOtherTimeZone`, `browserTimeZone()`, `timeZoneOptions()`
    - Event times are always shown in the event's `timezone`, never converted to the viewer's. Render them with `custom/c-date-time/CDateTime.vue` (`value`, optional `end`, `timeZone`, `viewerTimeZone`): "Jun 12, 2027, 3:00 PM", plus a muted "(Manila, GMT+8)" only when the viewer's timezone has a different UTC offset (`isOtherTimeZone`), so most viewers see just the date and time. Use the same muted "(City, GMT+8)" wherever a timezone is named. Dashboard pages are client-only, so pass `browserTimeZone()`; on server-rendered pages (the event website) pass `null` until mounted, so the server and browser render the same and the label appears after hydration. No "your time" conversion.
  - `form.ts`: `applyServerErrors(form, errors)` to show API field errors on a vee-validate form
  - `app-bootstrap.ts`: `init()` loads signed-in data (currently the user)
- `app/utils/styles/`: shared style maps (e.g. `toast-and-alert.ts` colours and icons per type)
- `app/plugins/api.ts`: provides the axios instance (`$api`) with `baseURL` from `runtimeConfig.public.apiUrl` and `withCredentials: true`
- `app/composables/`: auto-imported composables
  - `useBreadcrumbTitle(title)`: names the last breadcrumb on routes ending in an id (e.g. the event's name on `/dashboard/events/12`); `SiteHeader` reads it
  - `useSiteAddress()`: event website addresses for this environment (`domain`, `hostOf(subdomain)` to show, `urlOf(subdomain)` to link); never hard-code `crephore.com`
- `app/middleware/auth.global.ts`: route guard
- `app/types/api.ts`: `ApiResponse<T>` envelope, plus `ApiPaginatedRequest` (`page`, `pageSize`, `sort: ['field:asc']`, `searchKey`) and `ApiPaginatedResponse<T>` for list endpoints
- `app/config/`: static app config (`navigation.ts` drives the sidebar, breadcrumbs and admin overview; `brand.ts`)
- `app/components/sections/`: event-website sections, one folder per section type, one component per layout (see "Sections")
- `app/components/site-editor/`: controls shared by the event website editor and the admin playground: `ThemeControls.vue` (colour presets, colours, light background, fonts, corners), `ColorInput.vue`, `PreviewFrame.vue` (desktop / tablet / phone preview frame)
- `app/site-theme/`: theming for the event websites hosts build (Crephore-specific)
  - `SiteTheme`: primary and accent colours, an optional light `backgroundColor` (presets in `presets.ts` `backgroundPresets`, or any colour; `lightBackground` keeps it at oklch lightness ≥ 0.92 and soft, unset = plain white), fonts and corners. Every light-background text and button colour is checked against the chosen background, not white.
- `app/layouts/`: `default` (signed-in sidebar shell, calls `init()` on mount), `auth` (sign-in/up), `landing` (public site)
- `app/assets/css/`: `tailwind.css` (entry) imports `tailwind-tweakcn.css` (theme tokens from tweakcn; edit with the tweakcn editor and paste back)

---

## Event Websites (guests)
Guests open an event's website at `<subdomain>.<site domain>`: `ana-and-marco.crephore.com`, or `ana-and-marco.localhost:3000` in development (Chrome, Edge and Firefox send `*.localhost` to this machine; Safari may not).
1. The site domain comes from `runtimeConfig.public.siteBaseUrl` (`NUXT_PUBLIC_SITE_BASE_URL`, default `http://localhost:3000`); `features/sites/site.ts` (`siteAddress`, `siteSubdomainOf`) and `useSiteAddress()` build and read addresses from it.
2. Routing by host (`app/router.options.ts`): on an event's subdomain the app has one route, `/`, rendering `pages/_site/EventSitePage.vue` without a layout (any other path redirects to `/`); on the site domain itself (and `www`) it is Crephore with the pages in `pages/`. It runs per request on the server and once in the browser.
3. `EventSitePage` loads the published website (`features/sites/site.api.ts`, `getSite` → `GET /sites/{subdomain}`, no sign-in) with `useAsyncData`, so it is server-rendered (guests and link previews get the whole page, and the browser never calls the API). It renders the sections with `SiteThemeScope` + `SectionRenderer`, titled with the event's name; unpublished and unknown addresses get a 404 "This website isn't available" page.
4. `/` is server-rendered, not prerendered: one prerendered page would answer for every event's address.
5. The API client never toasts on the server, nor for `/sites/…` requests (`SILENT_URL_PREFIXES`).

---

## API Conventions
1. Every endpoint returns `ApiResponse<T>` (`{ success, data, message, errors }`); type API functions as `post<ApiResponse<T>>(...)`.
2. Never call axios directly from pages or components; add a function to `features/<feature>/<feature>.api.ts`.
3. The API client already shows the API's `message` as an error toast (except for `SILENT_URLS`), so callers should not toast errors again. Use `applyServerErrors(form, getApiErrors(error))` to also show field errors inline.
4. The API URL comes from `NUXT_PUBLIC_API_URL` (`.env`, see `.env.example`); never hard-code it.

---

## Auth
1. Auth is cookie-based. Login sets HttpOnly `accessToken` (30 minutes) and `refreshToken` (7 days) cookies that JavaScript cannot read; requests send them via `withCredentials`.
2. `useAuthStore` keeps `user` in memory plus an `isAuthenticated` flag in localStorage. The flag only drives route guarding; the API stays the authority.
3. Login (and sign-up, which logs in right after) calls `authStore.setAuth({ user })` from the login response.
4. The default (sidebar) layout calls `init()` on mount, which loads `GET /auth/me` and restores the user after a refresh.
5. Logout: `authStore.logout()` calls the API and always clears the local session, even if the API call fails.
6. Refresh, as in zao-pos-web (`lib/axios.ts`): a 401 (except from login, refresh and logout) calls `POST /auth/refresh` once and retries the request. Requests failing at the same time share one refresh (each refresh rotates the token). If the refresh fails, or the retry gets a 401 again, the session is cleared and the user is sent to `/sign-in?reason=session-expired`. Covered by `test/nuxt/auth/axios.refresh.test.ts`.
7. `auth.global.ts` sends signed-out visitors away from `protectedPaths` (`/dashboard`, `/admin`) and signed-in users away from `/sign-in` and `/sign-up`. It only runs on the client because the flag lives in localStorage. Add new signed-in areas to `protectedPaths`.

---

## List Pages
1. Lists use `CDataTable` inside `CDataTableCard`, like zao: a `<Feature>Table.vue` builds `tableProps` (`resourceName`, `columns`, `loadItems`, `addItem` / `updateItem` / `deleteItem`, `form` + `formInitialValues` + `formFieldComponent`, `mapItemToFormValues`).
2. Page-local files next to the table in `_components/`: `<name>.table.columns.ts`, `<name>.form.schema.ts`, `<Name>FormFields.vue`, and expanded-row panels (e.g. `EventTimelinePanel.vue`).
3. One table per page. Data that organises a list sits beside it as a side panel that filters it, not on its own page or in `Tabs`: e.g. My events (`/dashboard/events`) has `EventGroupsPanel` (pick a group to filter the events table, add/edit/delete groups, including which events they hold, through `CDataTableFormDialog`). The panel can be hidden ("View groups" above the table brings it back; remembered per browser) and the selected filter is shown as a chip above the table. Separate lists that stand on their own become separate routes, as sidebar sub-items (`children` in `config/navigation.ts`) if they belong together.
4. Records that have more than one form's worth of settings get their own page instead of the edit dialog: e.g. an event (`/dashboard/events/[id]`). The table's Edit (`onUpdateItemClicked`) and the name column link there; adding stays a quick dialog, and deleting stays in the table.
   - The page loads the record by id (skeleton while loading, "not found" empty state), names the breadcrumb with `useBreadcrumbTitle`, and splits its parts into `CPillTabs`: for an event, Details (the form, `[id]/_components/EventDetailsForm.vue`), Website (`EventWebsiteTab.vue`, see "Website Editor") and Guests & RSVP (placeholder).
   - The active tab is in the URL (`?tab=website`; none for the first tab). Tabs with unsaved edits (Details, Website) are `force-mount`ed and hidden when inactive, so the edits survive switching tabs.
   - The form saves with "Save changes" / "Discard changes" (disabled until something changes), resets to the saved record, and asks before leaving the page with unsaved changes (`onBeforeRouteLeave` + `CConfirmationModal`, and `beforeunload`).
5. When one part of the page changes data another shows, reload it: the table is re-created with a `:key` (the filter, plus a version bumped on changes, so it starts on page 1), and the panel exposes `reload()`. CDataTable also exposes `reload()`.
6. TanStack Table is pinned to v8 to match zao; do not upgrade to v9 without porting `c-data-table`.

---

## Forms
1. Use `useForm({ validationSchema: toTypedSchema(schema), initialValues })` and `CFormTextField` for inputs. Add new field types as `custom/c-form/CForm<Type>Field.vue`, following zao's `ZForm*Field` components.
2. Keep client validation in sync with the backend request DTO (lengths, required fields, password rules).
3. Return one error per field: use `.pipe(...)` for format checks that should only run after a "required" check.
4. Trim text in the `mapFormValuesTo<Request>()` mapper, never the password.
5. Disable the submit button while `isSubmitting` and change its label (e.g. "Signing in…").

---

## Sections
Sections are the building blocks of the event websites (Hero, RSVP, FAQ, …). They render in the admin playground, previews, the host editor and the public event site, so they follow strict rules.

1. Files:
   - `features/sections/section.type.ts`: `SectionBackground`, content shape per type (`SectionContentMap`), `Section` (with `options`), `SectionLayoutProps<T>`, `SectionOccasion` + `sampleOccasion()`
   - `features/sections/section.content.type.ts`: the content interfaces (`HeroContent`, `CountdownContent`, …)
   - `features/sections/countdown.ts`: the countdown's time maths and date formats (`countdownParts`, `countdownUnits`, `useCountdown`, `formatOccasionDate`, `calendarMonth`)
   - `features/sections/section.background.ts`: classes per background (`root`, `muted`, `eyebrow`, `button`)
   - `features/sections/section.options.ts`: layout placement options (`SectionLayoutOption`), the shared choice sets (`positionChoices` 3×3, `sideChoices`, `alignChoices`, `aboveBelowChoices`), `resolveLayoutOptions`, `positionClasses`, `alignClasses`, `overlayFor`
   - `features/sections/section.registry.ts`: every section type (with its `contentVersion`, saved with its content; bump it when the content's fields change and upgrade older content when loading) and layout (name, description, async component, supported `backgrounds`, `options`, `layoutPhotoCount`, default content), plus `createDefaultSection(type)` and `changeSectionLayout(section, key)` (keeps the section's other fields, e.g. the editor's `key`)
   - `features/sections/section.photos.ts`: read and set a section's photos without knowing its type (`backgroundPhotoOf`, `withBackgroundPhoto`, `layoutPhotosOf`, `withLayoutPhoto` by slot). A new section type adds its case here.
   - `features/sections/section.links.ts`: `safeHref(href)`. Section content is what hosts saved, so every link a section renders goes through it: only `#…`, `http(s):`, `mailto:` and `tel:` become links, anything else (e.g. `javascript:`) renders without an `href`.
   - `components/sections/<type>/<Type><Layout>.vue`: one component per layout (e.g. `hero/HeroOverlayCard.vue`)
   - `components/sections/SectionRenderer.vue`: renders a `Section` through the registry, resolving its options (defaults filled in) and passing the page's `occasion` (a sample one when none is given)
   - `components/sections/SectionPhoto.vue`: a photo, or a soft placeholder in the event's colours when it's missing, so the layout keeps its shape (shared by every section type)
   - `components/sections/SectionPhotoCarousel.vue`: one photo spot that becomes a slideshow with several photos (crossfade every 5 s, dots to pick one; autoplay starts on mount, pauses on hover or focus, and stays off for `prefers-reduced-motion`); with one photo or none it renders like `SectionPhoto`. Such a layout's `layoutPhotoCount` is the most it plays
   - `components/sections/SiteThemeScope.vue`: applies an event's `SiteTheme` (`--site-*` variables on a `.crephore-site` wrapper)
   - `components/sections/SectionThumbnail.vue`: a section rendered at desktop width and scaled into its box, for pickers (layouts, section types); not interactive
2. Layout components only take `SectionLayoutProps<T>` (`content`, `background`, `options`, `occasion`). No API calls, stores or route access, so the same component works everywhere, including server rendering.
   - `occasion` is the page's event (`startsAt` as a UTC instant, `timezone`). Details that belong to the event, like the countdown's target date, come from it and are never copied into section content, so they follow the event when it changes. Pages pass it to `SectionRenderer`; previews without an event get `sampleOccasion()` (112 days away).
3. Style only with site-theme variables (`bg-(--site-bg)`, `text-(--site-on-primary)`, `font-(family-name:--site-font-heading)`, `rounded-(--site-radius)`, …) and the shared `backgroundStyles`. Never use the Crephore app theme (`bg-primary`, `text-foreground`, …) inside a section; those are Crephore's colours, not the host's. The one exception is the white print border of photo frames (polaroids, framed mats), which is part of the look, not a colour.
   - Hosts can pick any colours, so never use the raw `--site-primary` or `--site-accent` as text. Use the contrast-checked versions: `--site-primary-text` (on light backgrounds), `--site-accent-on-photo`, and the `--site-on-*` text colours. New brand-coloured text needs a checked variable in `siteThemeVars` (via `ensureContrast`) and a case in `test/nuxt/site-theme/useSiteTheme.test.ts`.
   - Buttons always use the other brand colour: main colour on `light` and `accent`; accent on `primary` and `photo`. Never assume which colour is dark. Use `backgroundStyles[background].button` (`--site-button-<background>` / `--site-on-button-<background>`), which `siteThemeVars` adjusts to stand out (3:1) with readable text.
4. Each layout lists the backgrounds it supports (`backgrounds`, first = default): every layout offers `photo` (the optional background photo); `overlay-card` and the countdown's `photo` are photo-backed (`photo` only); `fullscreen` ("Full") starts on the photo; the others start on `light` (the strip on `primary`) with `photo` last. The picker only offers those, and `changeSectionLayout` keeps the background when the new layout supports it. Without a photo, the photo background renders exactly like `primary` (`SectionFrame` via `resolveBackground`). Background keys are stored on saved sections, so never rename one; display names live in `sectionBackgroundLabels`.
   - Responsive styles use container queries (`@sm:` … `@2xl:`, sized against `SiteThemeScope`, which is the `@container`), never viewport breakpoints (`sm:`, `md:` …), and don't name things `sm`/`md`/`lg`/`xl` either (the check reads `xl:` in an object key as a breakpoint). Sections then fit any frame: the full page, the playground's device preview, editor previews and thumbnails. `test/nuxt/sections/responsive.test.ts` enforces this. Use `@2xl:` (42rem) where you would otherwise use `sm:`, and `@3xl:` for the switch from stacked (phone) to side by side.
5. Pages render sections with `SectionRenderer` inside `SiteThemeScope`; never import layout components directly. Never set `--site-*` variables on `:root`.
6. Adding a layout: create the component, register it in `section.registry.ts` with a description, its backgrounds, options and `layoutPhotoCount` (the editor shows that many photo fields; `HeroLayouts.test.ts` checks it against what the layout shows) (its `key`, option keys and option values are stored on saved sections, so never rename them), add its key to the API's `WebsiteKeys` (`../crephore-backend`, `Features/EventWebsites/WebsiteKeys.cs`; the API rejects unknown keys on save), and check it in the playground (`/admin/section-types/playground`), which previews a page as a theme plus a list of sections (one of each type), across layouts and their options, backgrounds, colour presets, fonts, corners, device sizes and when the event starts (in 112 days, in 1 hour, passed). Each section type has its own content controls there (`Playground<Type>Content.vue`).
   - One component per layout, named after its key (`overlay-card` → `hero/HeroOverlayCard.vue`). Never let one component serve several layouts. Shared pieces that are not layouts live next to them so layouts stay consistent: `hero/HeroText.vue` (eyebrow, title, date · venue, RSVP; slots `#before-title`, `#after-title`, `#before-cta` let a layout place photos in the flow; `labelledDetails` puts the button first and the date and venue under it as "Date" / "Location" columns; `titleClass` colours the title); for every type, `SectionPhoto.vue` and `SectionPhotoCarousel.vue`.
   - Photos: always keep the background photo and the layout photos as separate fields, in every section type. Never let one photo field serve both.
     - `backgroundPhoto`: optional, and works with every layout. Every layout passes it to `SectionFrame` as `image-url`; the frame only shows it on the `photo` background, under the overlay. Never shown inside a layout; without it the section uses the primary colour.
     - Readability on the photo: the overlay must cover wherever text sits (`full` unless the text has a known place, then `overlayFor(position)`; `none` only when the text has its own solid card), and text, eyebrows and buttons use the background's `styles`, which are contrast-checked against the brightest photo under the overlay. Elements with their own surface (the calendar page, the overlay card) keep their own colours.
     - `layoutPhoto` (one) or `layoutPhotos` (several, in order): only inside the layout, through `SectionPhoto`. Never used as the background; missing ones show a placeholder.
     - The playground has a control for each (`PlaygroundOptionalPhoto.vue` for a single photo, `PlaygroundPhotoField.vue` per photo in a list), and layout tests check that each photo shows only in its own place.
   - Hero layouts all use the same fields (`eyebrow`, `title`, `date`, `venue`, `backgroundPhoto`, `layoutPhotos`, `cta`); only the arrangement changes: `fullscreen`, `split`, `arch`, `editorial`, `overlay-card`, `collage`, `banner`, `filmstrip`, `polaroid`, `framed`, `offset-frame`. `fullscreen` and `overlay-card` show `backgroundPhoto`; the others show as many of `layoutPhotos` as they have room for (in order). `offset-frame` lays its photo over a block in the background's button colour and plays up to five photos as a slideshow.
   - Countdown layouts all use the same fields (`eyebrow`, `title`, `showSeconds`, `backgroundPhoto`, `layoutPhoto`, `cta`; no venue, that's the hero's) and count down to `occasion.startsAt`: `boxes`, `minimal`, `photo`, `split`, `rings`, `flip`, `sentence`, `days-only`, `calendar`, `strip`. `photo` shows `backgroundPhoto` and `split` shows `layoutPhoto`. Shared pieces in `countdown/`: `CountdownHeading` (eyebrow + `h2` title), `CountdownButton`, `CountdownTiles` (boxes, split), `CountdownDividedNumbers` (minimal, photo, calendar).
     - `useCountdown(occasion, showSeconds)` ticks every second from mount only: the server and browser can't agree on "now", so server rendering (and the first render) shows "--" and the numbers appear after hydration. Once the occasion has started everything shows 0.
     - Dates are formatted in the occasion's timezone (`formatOccasionDate`: "Sunday, 14 February 2027" or "14 · 02 · 2027"), so they don't depend on the guest's timezone either.
     - Tiles, dividers and rings are drawn in the text colour at low strength (`border-current/15`, `bg-current/20`, `stroke="currentColor"`), so they work on every background; flip cards use the background's button colours.
   - Placement is a layout option, not a separate layout: e.g. `textPosition` / `cardPosition` (3×3 grid), `photoSide`, `photoPosition` (above/below), `textAlign`, `namesPlacement`. Give every layout at least one. Read them from `options` (always complete; use `positionClasses` for 3×3 positions).
   - Layouts never draw backgrounds: they wrap their content in `SectionFrame` (background colour, photo + overlay, primary fallback without a photo) and only position things. Pick the frame `overlay` (`full`, `top`, `bottom`, `start`, `end`, or `none` when the text has its own card) so it is at full strength wherever the text sits (`overlayFor(position)`).
7. Adding a section type: add its content interface to `SectionContentMap` (with `backgroundPhoto`), a registry entry with `defaultContent` and `contentVersion: 1`, its type and layout keys in the API's `WebsiteKeys`, a `components/sections/<type>/` folder, its cases in `section.photos.ts`, the event details it starts with in `event-website.ts` (`eventDetails`), and its text fields in the website editor (`Website<Type>Fields.vue`) and the playground (`Playground<Type>Content.vue`).
8. Tests in `test/nuxt/sections/`: each layout renders its content, shows its photos (or placeholders) only where they belong (background photo vs layout photos), hides missing optional content, applies each supported background, and each of its options changes the placement (`HeroLayouts.test.ts`, `CountdownLayouts.test.ts`, which freezes the clock with `vi.useFakeTimers({ toFake: ['Date'] })`).

---

## Website Editor
Hosts build their event's website in the event page's Website tab (`dashboard/events/[id]/_components/`).

1. Flow: `EventWebsiteTab.vue` loads the saved website (skeleton while loading, "Try again" if it fails). With one, it opens `website/WebsiteEditor.vue`; without one, `EventWebsiteStart.vue` offers "Start from a template" or "Start from scratch". Scratch opens the editor on an empty page; the template picker is a placeholder for now. "Start over" (confirmed when the page has sections or is saved) deletes the saved website (`DELETE`) and goes back to the choice.
2. Data: `features/event-websites/`.
   - `event-website.type.ts`: `EventWebsiteDraft` (`theme` + `sections` in page order) and `WebsiteSection` (a `Section` plus the editor's `key`, the saved `id` once saved, `isVisible`, and `visibility`: `Always` / `BeforeEvent` / `AfterEvent`, always `Always` for now, with no editor control yet; kept as loaded so saving doesn't reset it); `EventWebsite` / `UpdateEventWebsiteRequest` for the API.
   - `event-website.api.ts`: `getEventWebsite` (`data` null when none is saved), `updateEventWebsite` (saves the whole website), `deleteEventWebsite`.
   - `event-website.ts`: `createBlankWebsite`, `defaultWebsiteTheme`, `eventOccasion(event)`, `createWebsiteSection(type, event)` (fills in the event's name, date and venue), `duplicateWebsiteSection` (a new, unsaved copy), `moveItem`; for saving `websiteFromApi`, `mapWebsiteToRequest`, `isSameWebsite` (compares what would be saved) and `withSavedIds` (gives sections their ids after a save, by key, so edits made while saving stay).
   - Publishing: guests only see a published website, as it was when last published (see the backend's "Event Websites and Media"). The save bar shows "Not published", "Live" or "Live · changes not published" (`hasUnpublishedChanges` from the API, or unsaved edits). "Publish" / "Publish changes" saves unsaved changes first, then publishes (`publishEventWebsite`); it needs a visible section. "View live site" opens the real address (`urlOf`) in a new tab once published. The "More" menu has Unpublish (confirmed) and Start over (which also takes a published website offline).
   - Saving works like the Details form: the editor edits a copy; the save bar (above the editor) shows "Not saved yet" / "You have unsaved changes" / "All changes saved", with "Save changes" and "Discard changes" (back to the saved website). A blank page that was never saved has nothing to save. Leaving the page with unsaved changes asks first (`onBeforeRouteLeave` + `beforeunload`).
   - Edits always replace objects (`{ ...section, … }`), never change them in place: the saved copy shares objects with the draft until they change.
3. Editor layout: a panel with Sections and Style tabs, next to a live preview (`PreviewFrame` + `WebsitePreview`) in the event's theme with the event as the occasion.
   - Sections: `WebsiteSectionList` (drag or Arrow Up/Down on the handle to reorder, eye to hide, menu to move, duplicate or delete with confirmation). "Add a section" (`WebsiteAddSectionDialog`) inserts after the section being edited, else at the end. Clicking a section in the list or the preview opens `WebsiteSectionSettings`.
   - Section settings, top to bottom: layout (thumbnail; "Change layout" opens `WebsiteLayoutPickerDialog`, thumbnails of every layout with the section's own content), placement options (`WebsitePositionPicker` for 3×3 positions, `WebsiteChoiceGroup` cards otherwise), background (`WebsiteBackgroundPicker`: `WebsiteChoiceGroup` cards with swatches in the event's colours; the background photo field only on Photo), one photo field per `layoutPhotoCount`, and the text (`Website<Type>Fields.vue`).
   - Picking one of a few choices uses `WebsiteChoiceGroup`: separate cards, the chosen one with a primary border, bold label and a check badge (not the joined outline toggle group), so the choice stands out.
   - Photos (`WebsitePhotoField`): "Upload photo" sends the file to `POST /events/{id}/media` (`features/media/media.api.ts`, `uploadPhoto`) right away and stores the returned URL in the section's content; the section itself is saved with the website. JPG, PNG, WebP or GIF up to 10 MB, checked in the browser first (`photoContentTypes`, `photoMaxBytes`) and again by the API.
   - Style: the shared `ThemeControls`.
4. Hidden sections stay in the editor, faded in the preview, and are not shown to guests. Links inside sections don't navigate in the preview.
5. Editor chrome on the preview (selection outline, section labels) uses a fixed editor blue (`sky-500`), never the app's or the site's colours, so it can't be mistaken for part of a section on any background. The sections inside keep the site theme.
6. Tests: `test/nuxt/event-websites/` (`event-website.test.ts` incl. the save mappers, `event-website.api.test.ts`, `WebsiteEditor.test.ts`: adding, editing, layout picker, photo upload, hiding, reordering, save bar, start over; `EventWebsiteTab.test.ts`: loading, saving, discarding, publishing (saving first), unpublishing, start over deleting the saved website), `test/nuxt/media/media.api.test.ts`, `test/nuxt/sites/` (addresses, `getSite`, `EventSitePage`).

---

## Testing
1. Tests live in `test/nuxt/<feature>/` and are named `<file>.test.ts`.
2. Cover at least:
   - `*.api.ts`: each function calls the right route and payload (mock `~/lib/axios`)
   - `*.form.schema.ts`: valid values, each required field, each rule's message, and the mappers
   - stores: state changes and API failure handling (mock the feature's `*.api.ts`)
   - middleware: redirects for signed-in and signed-out users
3. Run before finishing: `pnpm test`, `pnpm typecheck`, and `pnpm build` for routing or config changes.

---

## Commands
```bash
pnpm install
pnpm dev            # http://localhost:3000 (needs the API on http://localhost:5180)
pnpm test
pnpm typecheck
pnpm build
```
