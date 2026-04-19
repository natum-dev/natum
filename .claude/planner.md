# natum-ui Component Development Plan

> Component library development plan for the **Vault** (Private Data Storage) project.
> Components are organized into tiers based on when they are first needed by the Vault app phases.

## Current Components (Tier 0)

| Component | Status | Props |
|-----------|--------|-------|
| Button | Done | `size`, `variant`, `color`, `disabled`, `fullWidth` |
| TextField | Done | `size`, `variant`, `color`, `label`, `errorMessage`, `helperText`, `leftSection`, `rightSection`, `clearable` |
| Typography | Done | `tag`, `variant`, `color` |
| Container | Done | `as`, `className` |
| ThemeProvider | Done | `defaultTheme`, `children` |

---

## Tier 1 — Foundation Primitives

**Required by**: Phase 0 (before Alpha Sprint 1)
**Estimated effort**: 1 week

| Component | Description | Priority | Status | Notes |
|-----------|-------------|:--------:|--------|-------|
| Icon | SVG icon wrapper; accepts `name`, `size`, `color`; renders from in-house SVGs | P0 | Done | Implemented as part of IconButton; uses @natum/icons |
| IconButton | Button rendering only an icon with proper hit target and `aria-label` | P0 | Done | File row actions (download, delete, more) |
| Card | Surface container with `padding`, `border`, `shadow` variants | P0 | Done | Polymorphic `as` prop, isInteractive/isSelected, box-shadow selection |
| Toast / Notification | Temporary feedback (success/error/info); auto-dismiss with optional action | P0 | Done | Upload success/failure, delete confirmation, auth errors |
| Divider | Horizontal/vertical line separator | P1 | Done | `<hr>` horizontal / `<div>` vertical, logical CSS properties |

---

## Tier 2 — Form and Feedback

**Required by**: Phase 0 (before Alpha Sprint 3)
**Estimated effort**: 1 week

| Component | Description | Priority | Status | Notes |
|-----------|-------------|:--------:|--------|-------|
| Modal / Dialog | Overlay with title, body, actions; focus trap + ESC close | P0 | Done | Portal, focus trap, animation state machine, scroll lock |
| Breadcrumb | Path navigation with clickable segments | P0 | Done | Overflow collapse with dropdown, configurable separator |
| Figure | Generic layout (replaces EmptyState) + EmptyState illustration | P1 | Done | Horizontal/vertical layout, data-figure-section attributes |
| Skeleton | Loading placeholder mimicking content shape | P1 | Done | text/rectangular/circular variants, shimmer animation |
| Checkbox | Controlled/uncontrolled with label, supports indeterminate | P1 | Done | Filled style, 44px hit area, ReactNode label |
| Tooltip | Hover/focus tooltip positioned relative to trigger | P1 | Done | Portal, useAnchorPosition hook, fade animation |

---

## Tier 3 — Data Display and File Interaction

**Required by**: Phase 2 Beta Sprint 1
**Estimated effort**: 2 weeks

| Component | Description | Priority | Status | Notes |
|-----------|-------------|:--------:|--------|-------|
| Sidebar / NavRail | Collapsible vertical navigation panel | P0 | Planned | Main app nav: folder tree, user menu |
| Table / DataGrid | Sortable, selectable table with column definitions | P0 | Planned | File list view (name, size, type, date, actions) |
| DropZone | Drag-and-drop target area with visual feedback on dragover | P0 | Planned | Drag files from desktop to upload |
| UploadPanel | Collapsible panel showing upload queue with per-file status | P0 | Planned | Gmail-style bottom-right; multi-file upload tracking |
| StorageQuotaBar | Progress bar showing used/total storage with labels | P0 | Planned | Sidebar and settings page |
| FileCard | Card variant showing file icon/thumbnail, name, size, type | P1 | Planned | Grid view of files |
| Badge | Small label/count indicator | P1 | Done | Inline pill; filled/outlined/soft × 7 colors × sm/md; dot mode; leftSection; polymorphic as=span/a/button with auto-derived interactive styling |

---

## Tier 4 — Search and Settings

**Required by**: Phase 2 Beta Sprint 3
**Estimated effort**: 1 week

| Component | Description | Priority | Status | Notes |
|-----------|-------------|:--------:|--------|-------|
| SearchInput | TextField variant with search icon, debounced `onChange`, clear button | P0 | Planned | Global file search |
| Progress Bar | Determinate/indeterminate progress indicator | P0 | Planned | Upload progress, storage quota |
| Tabs | Horizontal tab bar with content switching | P1 | Planned | Settings sections; "My Files" vs "Shared with Me" |
| Avatar | User avatar with initials fallback | P1 | Planned | Header user menu, sharing UI |
| Toggle / Switch | On/off toggle input | P2 | Planned | Settings toggles (dark mode, notifications) |

---

## Tier 5 — Collaboration and Advanced

**Required by**: Phase 3 v1.0 Sprint 1
**Estimated effort**: 1.5 weeks

| Component | Description | Priority | Status | Notes |
|-----------|-------------|:--------:|--------|-------|
| Dropdown / Menu | Trigger + positioned menu with items; supports nested menus | P0 | Planned | Context menu on files (rename, move, share, delete) |
| FilePreviewPanel | Side panel rendering file previews (image, text, PDF) | P0 | Planned | In-browser file viewing; 400px desktop, full-screen mobile |
| ShareDialog | Specialized dialog: user search, permission picker, share list | P0 | Planned | File sharing flow |
| PermissionBadge | Badge variant showing permission level (owner, read, write) | P1 | Planned | Shared file indicators |

---

## Vault Project Phases → Component Dependencies

```
Phase 0: Foundation (Week 1-2) ✅ COMPONENTS COMPLETE
├── Tier 1 + Tier 2 components built ✅
├── Vault app scaffold (apps/vault) — NOT STARTED
└── Gate: all Tier 1/2 in Storybook ✅, vault scaffold pending

Phase 1: Alpha (Week 3-5)
├── Features: Auth, Upload, List/Download, Delete
├── Uses: Button, TextField, Typography, Container + Tier 1/2
└── Gate: full CRUD works, files encrypted, auth enforced

Phase 2: Beta (Week 6-8)
├── Features: Folders, Quotas, Upload UX, Search
├── Needs: Tier 3 + Tier 4 components
└── Gate: folder hierarchy, drag-drop upload, quota enforcement

Phase 3: v1.0 GA (Week 9-11)
├── Features: Preview, Sharing, Admin, Security Hardening, Docker
├── Needs: Tier 5 components
└── Gate: preview works, sharing enforced, deployable via Docker

Phase 4: v1.1 (Week 12-14)
├── Features: Trash/soft-delete, Activity log, Dark mode, Mobile
├── No new components needed
└── Gate: trash retention, audit trail, mobile-usable
```

---

## Feature Priority Matrix

| Feature | Phase | Priority | Dependencies |
|---------|-------|:--------:|-------------|
| F-1: Project Scaffold | 0 | P0 | None |
| F-2: Authentication | 1 | P0 | F-1 |
| F-3: File Upload | 1 | P0 | F-1, F-2 |
| F-4: File Listing & Download | 1 | P0 | F-3 |
| F-5: File Deletion | 1 | P0 | F-4 |
| F-6: Folder Management | 2 | P0 | F-4, Tier 3 |
| F-7: Storage Quotas | 2 | P0 | F-3, Tier 3 |
| F-8: Upload UX Polish | 2 | P1 | F-3, Tier 3/4 |
| F-10: File Search | 2 | P1 | F-4, Tier 4 |
| F-9: File Preview | 3 | P0 | F-4, Tier 5 |
| F-11: File Sharing | 3 | P1 | F-2, F-4, Tier 5 |
| F-12: Admin Dashboard | 3 | P1 | F-2, F-7, Tier 3/4 |
| Trash / Soft Delete | 4 | P1 | F-5 |
| Activity Log | 4 | P1 | F-2 |
| Dark Mode | 4 | P2 | Design tokens (exists) |
| Mobile Responsive | 4 | P1 | All layout components |

---

## Tech Stack (Vault App)

### Frontend (inside natum monorepo — `apps/vault`)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14, App Router, React 18, SCSS Modules |
| UI Library | @natum/natum-ui (workspace dep) |
| State | Jotai + TanStack React Query |
| Validation | Zod |
| Auth (client) | JWT stored in httpOnly cookies, refresh token rotation |

### Backend (separate repo — `vault-api/`)

| Layer | Technology |
|-------|-----------|
| Language | Go |
| HTTP | stdlib `net/http` or Chi/Echo (TBD) |
| Database | PostgreSQL |
| ORM / Query | GORM |
| Auth | JWT (issued by Go backend) |
| File Storage | Local filesystem, AES-256-GCM encryption at rest |
| Migrations | golang-migrate |

---

## Open Decisions

1. **App name**: `vault` (working name) — confirm or rename
2. **React version**: React 18 (matching natum-web) vs React 19
3. **Storage location**: `/data/vault/` or relative to repo root
4. **Max upload size**: 500MB default — adjust?
5. **First admin**: Seed via `VAULT_ADMIN_EMAIL` env var on first registration
6. **Component strategy for Tier 3+**: Build in natum-ui (benefits whole monorepo) vs. app-local first
7. **Go HTTP router**: stdlib `net/http` (Go 1.22+) vs Chi vs Echo
8. **Go DB layer**: GORM — decided
9. **Backend repo location**: separate Git repo (`vault-api`) — decided
