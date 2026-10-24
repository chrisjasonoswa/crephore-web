# Crephore Web: Agent Instructions

This file is the source of truth for this repository's structure, API, auth, form, and testing conventions.
Follow it for every change, and update it when conventions change.

The structure mirrors the Zao POS web app (`~/Projects/zao/zao-pos-web`). When something is not covered here, follow how that project does it.
Intentional differences from zao: npm instead of pnpm, SSR for public pages (zao is `ssr: false`), the `landing` layout and `site-theme/` for the public site and event websites, `config/navigation.ts` instead of inline sidebar data, and the `c-`/`C` prefix instead of `z-`/`Z`.
The API is `../crephore-backend` (see its `CLAUDE.md`); keep types in sync with its DTOs.

---

## Tech Stack
- Nuxt 4 (`app/` directory), Vue 3, TypeScript
- UI: shadcn-vue (`app/components/ui`, no prefix, auto-imported), Tailwind CSS 4, `@lucide/vue` icons
- State: Pinia (`@pinia/nuxt`)
- HTTP: axios through `app/lib/axios.ts`
- Forms: vee-validate + zod (`@vee-validate/zod`, zod 3 syntax: `z.string().email()`)
- Toasts: vue-sonner through `cToast()` in `app/lib/cToast.ts`
- Tests: vitest + `@nuxt/test-utils` (`environment: 'nuxt'`)
- Package manager: npm

---

## Project Structure
- `app/features/<feature>/`: everything that talks to the API for one backend feature
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
    - `c-form/CFormTextField.vue`: vee-validate field (label, input, first error, optional `#description` slot); `type="password"` renders `CPasswordInput`
    - `c-form/CPasswordInput.vue`: password input with show/hide toggle
    - `c-header/CPageHeader.vue`: page title, description, `#actions` slot
    - `c-toast/CToast.vue`: the toaster, mounted once in `app.vue`
  - `ui/`: shadcn-vue components. Add them with `npx shadcn-vue@latest add <name>` and do not edit them by hand.
  - Import app and custom components explicitly in `<script setup>` (as zao does); `ui/` components are used through auto-import.
- `app/lib/`: framework-level helpers
  - `axios.ts`: request helpers, error toasts, session-expiry handling, `isAuthFailure`, `getApiErrors`
  - `cToast.ts`: `cToast({ title, description?, type, button? })`
  - `form.ts`: `applyServerErrors(form, errors)` to show API field errors on a vee-validate form
  - `app-bootstrap.ts`: `init()` loads signed-in data (currently the user)
- `app/utils/styles/`: shared style maps (e.g. `toast-and-alert.ts` colours and icons per type)
- `app/plugins/api.ts`: provides the axios instance (`$api`) with `baseURL` from `runtimeConfig.public.apiUrl` and `withCredentials: true`
- `app/middleware/auth.global.ts`: route guard
- `app/types/api.ts`: `ApiResponse<T>` envelope
- `app/config/`: static app config (`navigation.ts` drives the sidebar, breadcrumbs and admin overview; `brand.ts`)
- `app/site-theme/`: theming for the event websites hosts build (Crephore-specific)
- `app/layouts/`: `default` (signed-in sidebar shell, calls `init()` on mount), `auth` (sign-in/up), `landing` (public site)
- `app/assets/css/`: `tailwind.css` (entry) imports `tailwind-tweakcn.css` (theme tokens from tweakcn; edit with the tweakcn editor and paste back)

---

## API Conventions
1. Every endpoint returns `ApiResponse<T>` (`{ success, data, message, errors }`); type API functions as `post<ApiResponse<T>>(...)`.
2. Never call axios directly from pages or components; add a function to `features/<feature>/<feature>.api.ts`.
3. The API client already shows the API's `message` as an error toast (except for `SILENT_URLS`), so callers should not toast errors again. Use `applyServerErrors(form, getApiErrors(error))` to also show field errors inline.
4. The API URL comes from `NUXT_PUBLIC_API_URL` (`.env`, see `.env.example`); never hard-code it.

---

## Auth
1. Auth is cookie-based. Login sets an HttpOnly `accessToken` cookie that JavaScript cannot read; requests send it via `withCredentials`.
2. `useAuthStore` keeps `user` in memory plus an `isAuthenticated` flag in localStorage. The flag only drives route guarding; the API stays the authority.
3. Login (and sign-up, which logs in right after) calls `authStore.setAuth({ user })` from the login response.
4. The default (sidebar) layout calls `init()` on mount, which loads `GET /auth/me` and restores the user after a refresh.
5. Logout: `authStore.logout()` calls the API and always clears the local session, even if the API call fails.
6. There are no refresh tokens. Any 401 (except from login/logout) clears the session and redirects to `/sign-in?reason=session-expired`.
7. `auth.global.ts` sends signed-out visitors away from `protectedPaths` (`/dashboard`, `/admin`) and signed-in users away from `/sign-in` and `/sign-up`. It only runs on the client because the flag lives in localStorage. Add new signed-in areas to `protectedPaths`.

---

## Forms
1. Use `useForm({ validationSchema: toTypedSchema(schema), initialValues })` and `CFormTextField` for inputs. Add new field types as `custom/c-form/CForm<Type>Field.vue`, following zao's `ZForm*Field` components.
2. Keep client validation in sync with the backend request DTO (lengths, required fields, password rules).
3. Return one error per field: use `.pipe(...)` for format checks that should only run after a "required" check.
4. Trim text in the `mapFormValuesTo<Request>()` mapper, never the password.
5. Disable the submit button while `isSubmitting` and change its label (e.g. "Signing in…").

---

## Testing
1. Tests live in `test/nuxt/<feature>/` and are named `<file>.test.ts`.
2. Cover at least:
   - `*.api.ts`: each function calls the right route and payload (mock `~/lib/axios`)
   - `*.form.schema.ts`: valid values, each required field, each rule's message, and the mappers
   - stores: state changes and API failure handling (mock the feature's `*.api.ts`)
   - middleware: redirects for signed-in and signed-out users
3. Run before finishing: `npm test`, `npm run typecheck`, and `npx nuxi build` for routing or config changes.

---

## Commands
```bash
npm install
npm run dev        # http://localhost:3000 (needs the API on http://localhost:5180)
npm test
npm run typecheck
npm run build
```
