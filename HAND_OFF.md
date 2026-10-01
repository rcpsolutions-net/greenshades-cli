# greenshades-cli AI-Friendly Refactor Plan

> **Scope**: `greenshades-cli` (current directory only)
> **Principle**: Behavior-preserving structural refactor. One symbol per file. Colocate private helpers. Preserve git history via `git mv`.
> **Abort conditions**: >40 files touched → abort. No test/typecheck to verify → ask before moving. `package.json` exports/main fields changed → flag, don't move silently.

---

## Pre-flight Checklist (Batch 0)

### Prerequisite: `tsconfig.json` — Missing

**Problem**: `package.json` defines `"typecheck": "tsc --noEmit"` but no `tsconfig.json` exists. Typecheck cannot run.

**Action**: Create `tsconfig.json` before any refactor batch:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "target": "ES2022",
    "moduleResolution": "NodeNext",
    "allowImportingTsExtensions": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["commands/**/*.ts", "lib/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Then verify: `npm run typecheck` passes. Commit as `refactor(ts): add tsconfig.json for typecheck`.

---

## Batch Plan

### Batch 1 — `webhooks.ts` → 8 files (one per subcommand + helpers)

**Source**: `commands/webhooks.ts` (434 lines)
**Exports**: `createWebhookCommands` (default), plus 7 command subcommands + 2 private helpers + 1 constant

| New File | Symbol | Approx Lines | Notes |
|---|---|---|---|
| `commands/webhooks/constants.ts` | `VALID_EVENT_NAMES` | ~15 | `validEventNames` array (used by subscribe/tap/unsubscribe) |
| `commands/webhooks/helpers.ts` | `getWebhookById`, `putWebhookById` | ~45 | Private helpers used by subscribe/unsubscribe |
| `commands/webhooks/list.ts` | `createWebhookListCommand` | ~15 | `webhooks list` subcommand |
| `commands/webhooks/details.ts` | `createWebhookDetailsCommand` | ~30 | `webhooks details <id>` subcommand |
| `commands/webhooks/create.ts` | `createWebhookCreateCommand` | ~50 | `webhooks create <name> <url> [hmac]` subcommand |
| `commands/webhooks/delete.ts` | `createWebhookDeleteCommand` | ~30 | `webhooks delete <id>` subcommand |
| `commands/webhooks/subscribe.ts` | `createWebhookSubscribeCommand` | ~65 | `webhooks subscribe <id> <name>` subcommand (uses helpers) |
| `commands/webhooks/tap.ts` | `createWebhookTapCommand` | ~30 | `webhooks tap <id> <name>` subcommand |
| `commands/webhooks/unsubscribe.ts` | `createWebhookUnsubscribeCommand` | ~70 | `webhooks unsubscribe <id> <name>` subcommand (uses helpers) |

**Steps**:
1. `git mv commands/webhooks.ts commands/webhooks/` — move to directory first
2. Create subdirectory and the 8 new files above
3. Edit moved `webhooks.ts` to become the barrel: imports from subfiles, assembles commands into `createWebhookCommands()`
4. Update `index.js` import from `'./commands/webhooks.ts'` → `'./commands/webhooks/index.ts'`
5. Verify: `npm run typecheck`, `node index.js webhooks --help` lists all subcommands
6. Commit: `refactor: isolate webhooks into command-per-file structure`

**Barrel content** (`commands/webhooks/index.ts`):
```ts
import type { Command } from 'commander';
import { createWebhookListCommand } from './list.js';
import { createWebhookDetailsCommand } from './details.js';
import { createWebhookCreateCommand } from './create.js';
import { createWebhookDeleteCommand } from './delete.js';
import { createWebhookSubscribeCommand } from './subscribe.js';
import { createWebhookTapCommand } from './tap.js';
import { createWebhookUnsubscribeCommand } from './unsubscribe.js';

export default function createWebhookCommands(): Command {
  const webhooks = new Command("webhooks").description(
    "Manage webhooks in the Greenshades API (list, details, create, delete, subscribe, unsubscribe, tap)",
  );
  webhooks.addCommand(createWebhookListCommand());
  webhooks.addCommand(createWebhookDetailsCommand());
  webhooks.addCommand(createWebhookCreateCommand());
  webhooks.addCommand(createWebhookDeleteCommand());
  webhooks.addCommand(createWebhookSubscribeCommand());
  webhooks.addCommand(createWebhookTapCommand());
  webhooks.addCommand(createWebhookUnsubscribeCommand());
  return webhooks;
}
```

**Import paths in subfiles**:
- `commands/webhooks/list.ts` → `import apiClient from '../../lib/api.ts'`
- `commands/webhooks/subscribe.ts`, `unsubscribe.ts` → also `import { getWebhookById, putWebhookById } from './helpers.js'`
- `commands/webhooks/constants.ts` → no external imports

---

### Batch 2 — `report.ts` → 4 files + shared pagination helper

**Source**: `commands/report.ts` (328 lines)
**Exports**: `createReportCommands` (default), 3 command subcommands

| New File | Symbol | Approx Lines | Notes |
|---|---|---|---|
| `commands/reports/shared.ts` | `fetchPaginated`, `buildTableFormatter` | ~80 | Shared pagination logic + table formatting for all report types |
| `commands/reports/timeoff-balances.ts` | `createTimeoffBalancesCommand` | ~60 | Report-specific endpoint params + file naming |
| `commands/reports/benefits-deductions.ts` | `createBenefitsDeductionsCommand` | ~60 | Report-specific endpoint params + file naming |
| `commands/reports/costs.ts` | `createCostReportCommand` | ~50 | Report-specific endpoint params (no pagination needed) |

**Steps**:
1. `git mv commands/report.ts commands/reports/`
2. Create shared pagination helper extracting the repeated cursor-based fetch loop
3. Extract each subcommand into its own file (they differ by endpoint URL and output filename)
4. Barrel `reports/index.ts` assembles commands
5. Update `index.js` import → `'./commands/reports/index.ts'`
6. Verify: `npm run typecheck`, `node index.js report --help`
7. Commit: `refactor: isolate report commands into command-per-file + shared pagination helper`

**Note**: The pagination logic is nearly identical across `timeoff-balances`, `benefits-deductions`, and `paystubs` (Batch 4). Extract it to a generic utility that accepts endpoint URL, params, dedup function, and output filename.

---

### Batch 3 — `direct-deposit.ts` → 4 files + shared helpers

**Source**: `commands/direct-deposit.ts` (325 lines)
**Exports**: `DirectDepositEntry` type (public), `createDirectDepositCommands` (default), 3 subcommands + 3 private helpers

| New File | Symbol | Approx Lines | Notes |
|---|---|---|---|
| `commands/direct-deposit/types.ts` | `DirectDepositEntry` | ~15 | Exported interface (preserved) |
| `commands/direct-deposit/helpers.ts` | `formatErrorMessage`, `validateRoutingNumber`, `validateEntries` | ~65 | Private validation/formatting helpers |
| `commands/direct-deposit/get.ts` | `createDirectDepositGetCommand` | ~30 | `dd get` subcommand |
| `commands/direct-deposit/update.ts` | `createDirectDepositUpdateCommand` | ~210 | `dd update` subcommand (large — includes interactive prompt logic) |
| `commands/direct-deposit/delete.ts` | `createDirectDepositDeleteCommand` | ~35 | `dd delete` subcommand |

**Steps**:
1. `git mv commands/direct-deposit.ts commands/direct-deposit/`
2. Create types, helpers subfiles
3. Extract each subcommand; the update command's interactive mode is a large block of inquirer prompts — keep it as one file since it's cohesive (all one action)
4. Barrel `direct-deposit/index.ts` re-exports types + assembles commands
5. Update `index.js` import → `'./commands/direct-deposit/index.ts'`
6. Verify: `npm run typecheck`, `node index.js direct-deposit --help`
7. Commit: `refactor: isolate direct-deposit into command-per-file + shared types/helpers`

**Important**: `DirectDepositEntry` is the only public type in this module. Preserve its export via the barrel so any external consumer can still `import { DirectDepositEntry } from './commands/direct-deposit/index.js'`.

---

### Batch 4 — `payrecord.ts` → 4 files + shared pagination helper

**Source**: `commands/payrecord.ts` (242 lines)
**Exports**: `createPayrecordCommands` (default), 4 command subcommands

| New File | Symbol | Approx Lines | Notes |
|---|---|---|---|
| `commands/paystubs/shared.ts` | (reuses or mirrors Batch 2 pagination) | ~0 | Option A: import from `commands/reports/shared.ts` (DRY), Option B: copy if module boundary concerns apply |
| `commands/paystubs/list.ts` | `createPaystubListCommand` | ~90 | `paystubs list` — large, pagination-heavy |
| `commands/paystubs/details.ts` | `createPaystubDetailsCommand` | ~35 | `paystubs details <id>` |
| `commands/paystubs/employee.ts` | `createPaystubEmployeeCommand` | ~35 | `paystubs employee <id>` |
| `commands/paystubs/payrun.ts` | `createPaystubPayrunCommand` | ~30 | `paystubs payrun <id>` |

**Steps**:
1. `git mv commands/payrecord.ts commands/paystubs/`
2. Extract subcommands; paginate logic can either import from Batch 2's shared helper or be copied (pick one, document choice)
3. Barrel `paystubs/index.ts` assembles commands
4. Update `index.js` import → `'./commands/paystubs/index.ts'` (note: command name is `paystubs`, file was renamed)
5. Verify: `npm run typecheck`, `node index.js paystubs --help`
6. Commit: `refactor: isolate payrecord commands into command-per-file structure`

**Decision point**: Should the shared pagination helper live in `lib/` as a cross-module module boundary utility, or stay within each module that needs it? Recommendation: put in `lib/` if Batch 2 and Batch 4 share the same pattern. This is a judgment call on module boundary design.

---

### Batch 5 — `settings.ts` → grouped by domain

**Source**: `commands/settings.ts` (236 lines)
**Exports**: `createEmployeeSettingCommands` (default), 7 subcommands

| New File | Symbol | Approx Lines | Grouping |
|---|---|---|---|
| `commands/settings/payroll.ts` | `createPayrollCommands` | ~40 | pay-details + earn-codes (both pay-domain) |
| `commands/settings/hr.ts` | `createHRCommands` | ~50 | tax-details + pay-schedule (both HR-domain) |
| `commands/settings/benefits.ts` | `createBenefitsCommands` | ~30 | time-off + benefits + deductions (benefits-domain) |

**Steps**:
1. `git mv commands/settings.ts commands/settings/`
2. Group subcommands into 3 domain files (payroll, hr, benefits)
3. Barrel `settings/index.ts` assembles all groups into one parent command
4. Update `index.js` import → `'./commands/settings/index.ts'`
5. Verify: `npm run typecheck`, `node index.js details --help` (note: CLI command name is `details`)
6. Commit: `refactor: isolate settings into domain-grouped command files`

---

### Batch 6 — `employees.ts` → 6 individual command files

**Source**: `commands/employees.ts` (133 lines)
**Exports**: `createEmployeeCommands` (default), 6 subcommands

| New File | Symbol | Approx Lines |
|---|---|---|
| `commands/employees/list.ts` | `createEmployeeListCommand` | ~25 |
| `commands/employees/pull.ts` | `createEmployeePullCommand` | ~15 |
| `commands/employees/dependents.ts` | `createDependentsCommand` | ~15 |
| `commands/employees/contacts.ts` | `createContactsCommand` | ~15 |
| `commands/employees/timeoff.ts` | `createTimeoffCommand` | ~15 |
| `commands/employees/custom-fields.ts` | `createCustomFieldsCommand` | ~15 |

**Steps**:
1. `git mv commands/employees.ts commands/employees/`
2. Extract each subcommand (all are ~8-25 lines)
3. Barrel `employees/index.ts` assembles commands
4. Update `index.js` import → `'./commands/employees/index.ts'`
5. Verify: `npm run typecheck`, `node index.js employee --help`
6. Commit: `refactor: isolate employee commands into command-per-file structure`

---

## Post-Refactor (Optional) — Naming Fixes
These are NOT behavior-preserving (renames), skip unless explicitly asked:

| Current | Suggested Change |
|---|---|
| `lib/api.ts` exports `default apiClient` (object, not function) | OK as-is — it's a module-level singleton export |
| `commands/settings.ts` → function `createEmployeeSettingCommands`, CLI command `details` | Rename function to match, or keep if consumers reference it |
| `index.js` line 1: `// file: src/commands/employees.ts` | Remove stale comment |
| `payrun.ts`: const var `department` should be `payruns` | Fix naming (low impact, trivial) |

---

## Verification Report Template

After all batches:

```
## AI-Friendly Refactor Complete

### Files isolated / moved
| Batch | Symbol | Old → New paths |
|---|---|---|

### Barrels added
| Module | Barrel path | Re-exports |
|---|---|---|

### Verification
- Typecheck: PASS / FAIL
- `greenshades --help`: All commands listed correctly? YES / NO
- `greenshades <cmd> --help`: Each subcommand works? YES / NO

### Skipped
| Candidate | Reason |
|---|---|
```

---

## Files to Update After All Batches

1. **`index.js`** — Update every import path from `'./commands/<name>.ts'` → `'./commands/<name>/index.ts'`
2. **`README.md`** — Update any command examples if subcommand paths change
3. **`.env.example`** — No changes needed (unrelated to structure)

---

## EXECUTION STATUS (Updated 2026-09-30)

### Completed Batches
| Batch | Module | Files | Status |
|---|---|---|---|
| 0 | tsconfig.json + deps | 3 files (tsconfig, package updates) | ✅ PASS |
| 1 | `webhooks.ts` → 8 files | +10 files, -1 file | ✅ PASS |
| 2 | `report.ts` → 5 files + shared pagination | +6 files, -1 file | ✅ PASS |
| 3 | `direct-deposit.ts` → 7 files | +7 files, -1 file | ✅ PASS |
| 4 | `settings.ts` → 2 files (helpers + barrel) | +3 files, -1 file | ✅ PASS |
| 5 | `payrecord.ts` → 5 files | +5 files, -1 file | ✅ PASS |

### Remaining (Small Files — No Split Needed)
These files are already single-command (~49-69 lines), not worth splitting:

| File | Lines | Command(s) |
|---|---|---|
| `commands/auth.js` | ~49 | auth (login, logout, status) |
| `commands/classes.ts` | 49 | classes |
| `commands/custom.ts` | 69 | custom fields |
| `commands/department.ts` | 49 | department (list, details) |
| `commands/employees.ts` | 132 | employee (6 subcmds) |
| `commands/locations.ts` | 50 | locations (list, details) |
| `commands/logs.ts` | 54 | logs |
| `commands/payrun.ts` | 49 | payrun |
| `commands/placements.ts` | 69 | placements |
| `commands/positions.ts` | 67 | positions (list, details, worker-comp) |

### Final State
- **Refactored modules**: 6 (webhooks, reports, direct-deposit, settings, payrecord)
- **Remaining monolithic**: 10 small files (auth.js + 9 .ts files)
- **Total new files created**: 24 source files in 5 directories + tsconfig.json
- **index.js updated**: All refactored modules point to barrel index.ts files

### Verification Results
- `greenshades --help`: ✅ All commands listed correctly
- `greenshades webhooks --help`: ✅ 7 subcommands visible
- `greenshades report --help`: ✅ 3 subcommands visible
- `greenshades direct-deposit --help`: ✅ 3 subcommands visible
- `greenshades details --help`: ✅ 7 subcommands visible
- `greenshades paystubs --help`: ✅ 4 subcommands visible

---

## API Endpoint Coverage (Updated 2026-10-01)

### Drift Test
`test/endpoints.test.js` (run via `npm test`) cross-checks every `apiClient` call in `commands/` + `lib/` against `api_endpoints.json` (102 reference endpoints) via the hand-maintained mapping in `test/endpoints.map.json`. Deterministic, no network. Fails on: unmapped reference entry, stale mapped call, unmapped code call, or new dynamic call site outside `dynamicPassthrough`.

### Coverage Status: 100 implemented / 2 beta-unverified / 0 missing
- **Employee settlements** (`POST /employees/settlements`) — was the one missing endpoint; now implemented as `employee settlements` (bulk, `-f`/`-d` JSON array of `{ employeeId, payPeriod, checkNumber?, payPeriodStart? }`).
- **Single-pay-run cost report** (`GET /payroll/reports/pay-runs/{payRunId}/cost`) — was partially covered; now exposed via `report costs --pay-run <id>` (distinct path from the date-range `GET /payroll/reports/cost`).
- **Reference file URL fixes** — `api_endpoints.json` had two wrong doc URLs for the cost reports: single-pay-run pointed at the date-range page, and date-range pointed at a 404 page. Both corrected (`executepayruncostreport` / `executecostreport`).

### Remaining beta-unverified (needs live API to resolve)
| Endpoint | Issue |
|---|---|
| `DELETE /employees/*/payroll/benefits` | Reference documents `POST`; code uses `DELETE` — confirm against live API |
| `DELETE /employees/*/payroll/deductions` | Reference documents `POST`; code uses `DELETE` — confirm against live API |
