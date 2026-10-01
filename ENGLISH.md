# greenshades-cli — Capabilities & API Endpoints

Base URL `https://api.greenshadesonline.com` · OAuth2 bearer token (`auth login`) · `workspaceId` sent as query param · 19 command groups.

## auth / system

| Command | Endpoint |
|---|---|
| `auth login` | OAuth2 client-credentials token exchange (stored locally) |
| `auth logout` / `auth status` | local config only |
| `test` | connectivity check |

## employee

| Command | Endpoint |
|---|---|
| `employee list` | GET `/employees` |
| `employee pull <id>` | GET `/employees/{id}` |
| `employee create` | POST `/employees` |
| `employee update <id>` | PUT `/employees/{id}` |
| `employee bulk` | POST `/employees/bulk` |
| `employee dependents <id>` | GET `/employees/{id}/dependents` |
| `employee contacts <id>` | GET `/employees/{id}/contacts` |
| `employee timeoff <id>` | GET `/employees/{id}/payroll/time-off/balances` |
| `employee customFields <id>` | GET `/employees/{id}/customfields` |
| `employee dd <id>` | GET `/employees/{id}/directdeposit` |
| `employee dd-update <id>` | PUT `/employees/{id}/directdeposit` |
| `employee dd-delete <id>` | DELETE `/employees/{id}/directdeposit` |
| `employee earnings <id>` | GET `/employees/{id}/payroll/earnings` |
| `employee payroll-tax <id> <taxId>` | GET `/employees/{id}/payroll/taxes/{taxId}` |
| `employee payroll-tax-update <id> <taxId>` | PUT `/employees/{id}/payroll/taxes/{taxId}` |
| `employee pay-schedule <id>` | GET `/employees/{id}/payroll/payschedule` |
| `employee pay-schedule-set <id> <schedId>` | PUT `/employees/{id}/payroll/payschedule` |
| `employee pay-schedule-remove <id>` | DELETE `/employees/{id}/payroll/payschedule` |
| `employee timeoff-code <id> <codeId>` | PUT `/employees/{id}/payroll/time-off/codes/{codeId}` |
| `employee benefits <id>` | GET `/employees/{id}/payroll/benefits` |
| `employee benefits-update <id>` | PUT `/employees/{id}/payroll/benefits` |
| `employee benefits-remove <id> [codes...]` | POST `/employees/{id}/payroll/benefits/delete` |
| `employee deductions <id>` | GET `/employees/{id}/payroll/deductions` |
| `employee deductions-update <id>` | PUT `/employees/{id}/payroll/deductions` |
| `employee deductions-remove <id> [codes...]` | POST `/employees/{id}/payroll/deductions/delete` |
| `employee settlements` | POST `/employees/settlements` |

## dd (direct deposit)

| Command | Endpoint |
|---|---|
| `dd get <id>` | GET `/employees/{id}/directdeposit` |
| `dd update <id>` | PUT `/employees/{id}/directdeposit` |
| `dd delete <id>` | DELETE `/employees/{id}/directdeposit` |

## details (employee views)

| Command | Endpoint |
|---|---|
| `details pay-details <id>` | GET `/employees/{id}/directdeposit` |
| `details earn-codes <id>` | GET `/employees/{id}/payroll/earnings` |
| `details tax-details <id>` | GET `/payroll/taxes` |
| `details pay-schedule <id>` | GET `/employees/{id}/payroll/payschedule` |
| `details time-off <id>` | GET `/employees/{id}/payroll/time-off/balances` |
| `details benefits <id>` | GET `/employees/{id}/payroll/benefits` |
| `details deductions <id>` | GET `/employees/{id}/payroll/deductions` |

## paystubs

| Command | Endpoint |
|---|---|
| `paystubs list` | GET `/pay-records` |
| `paystubs details <payRecordId>` | GET `/payroll/pay-records/{id}` |
| `paystubs employee <id>` | GET `/employees/{id}/pay-records` |
| `paystubs payrun <payRunId>` | GET `/payroll/pay-runs/{id}/pay-records` |
| `paystubs link <payRecordId>` | GET `/payroll/pay-records/{id}/link` (one-use auth link) |
| `paystubs document <payRecordId>` | GET `/payroll/pay-records/{id}/document` |

## department

| Command | Endpoint |
|---|---|
| `department list` | GET `/departments` |
| `department details <code>` | GET `/departments/{code}` |
| `department create` | POST `/departments` |
| `department update <code>` | PUT `/departments/{code}` |
| `department delete <code>` | DELETE `/departments/{code}` |

## locations

| Command | Endpoint |
|---|---|
| `locations list` | GET `/worklocations` |
| `locations details <code>` | GET `/worklocations/{code}` |
| `locations create` | POST `/worklocations` |
| `locations update <code>` | PUT `/worklocations/{code}` |
| `locations delete <code>` | DELETE `/worklocations/{code}` |

## positions

| Command | Endpoint |
|---|---|
| `positions list` | GET `/positions` |
| `positions details <code>` | GET `/positions/{code}` |
| `positions worker-compensation-codes` | GET `/workerscompcodes` |
| `positions create` | POST `/positions` |
| `positions update <code>` | PUT `/positions/{code}` |
| `positions delete <code>` | DELETE `/positions/{code}` |

## placements

| Command | Endpoint |
|---|---|
| `placements list` | GET `/placements` |
| `placements employee <id>` | GET `/employees/{id}/placements` |
| `placements details <id>` | GET `/placements/{id}` |
| `placements create <id>` | POST `/placements/{id}` |
| `placements update <id>` | PUT `/placements/{id}` |
| `placements delete <id>` | DELETE `/placements/{id}` |
| `placements bulk` | POST `/placements` |

## classes

| Command | Endpoint |
|---|---|
| `classes list` | GET `/employees/classes` |
| `classes details <code>` | GET `/employees/classes/{code}` |
| `classes create` | POST `/employees/classes` |
| `classes update <code>` | PUT `/employees/classes/{code}` |
| `classes delete <code>` | DELETE `/employees/classes/{code}` |

## custom (custom fields)

| Command | Endpoint |
|---|---|
| `custom list` | GET `/employees/customfields` |
| `custom details <fieldId>` | GET `/employees/customfields/{id}` |
| `custom employee <id>` | GET `/employees/{id}/customfields` |
| `custom create` | POST `/employees/customfields` |
| `custom update <fieldId>` | PUT `/employees/customfields/{id}` |
| `custom delete <fieldId>` | DELETE `/employees/customfields/{id}` |
| `custom patch <id>` | PATCH `/employees/{id}/customfields` |

## payruns

| Command | Endpoint |
|---|---|
| `payruns list` | GET `/payroll/pay-runs` |
| `payruns details <id>` | GET `/payroll/pay-runs/{id}` |
| `payruns info <id>` | GET `/payroll/pay-runs/{id}/earnings` |
| `payruns cancel <id>` | DELETE `/payroll/pay-runs/{id}` |
| `payruns employee-add <id> <empId>` | POST `/payroll/pay-runs/{id}/employees` |
| `payruns employee-update <id> <empId>` | PUT `/payroll/pay-runs/{id}/employees` |
| `payruns employee-remove <id> <empId>` | DELETE `/payroll/pay-runs/{id}/employees` |
| `payruns earning <id> <earningId>` | GET `/payroll/pay-runs/{id}/earnings/{earningId}` |
| `payruns earning-add <id>` | POST `/payroll/pay-runs/{id}/earnings` |
| `payruns earning-update <id>` | PUT `/payroll/pay-runs/{id}/earnings` |
| `payruns earning-remove <id> <earningId>` | DELETE `/payroll/pay-runs/{id}/earnings/{earningId}` |

## report

| Command | Endpoint |
|---|---|
| `report timeoff-balances` | GET `/payroll/time-off/balances` |
| `report benefits-deductions` | GET `/payroll/reports/benefits-deductions` |
| `report costs -s <date> -e <date>` | GET `/payroll/reports/cost` |
| `report costs --pay-run <id>` | GET `/payroll/reports/pay-runs/{id}/cost` |

## earnings (workspace earning codes)

| Command | Endpoint |
|---|---|
| `earnings list` | GET `/payroll/earnings` |
| `earnings details <code>` | GET `/payroll/earnings/{code}` |
| `earnings create` | POST `/payroll/earnings` |
| `earnings update <code>` | PUT `/payroll/earnings/{code}` |
| `earnings delete <code>` | DELETE `/payroll/earnings/{code}` |

## payschedules-setup

| Command | Endpoint |
|---|---|
| `payschedules-setup list` | GET `/payroll/payschedules` |
| `payschedules-setup details <id>` | GET `/payroll/payschedules/{id}` |
| `payschedules-setup employees <id>` | GET `/payroll/pay-runs/{id}/employees` |

## tax-setup

| Command | Endpoint |
|---|---|
| `tax-setup info` | GET `/payroll/tax-setup` |

## workspace

| Command | Endpoint |
|---|---|
| `workspace list` | GET `/workspaces` |
| `workspace contacts <id>` | GET `/workspaces/{id}/contacts` |
| `workspace create` | POST `/workspaces?parentCompanyId=...` |

## logs

| Command | Endpoint |
|---|---|
| `logs list` | GET `/logs/requests` |
| `logs details <requestId>` | GET `/logs/requests/{id}` |

## webhooks

| Command | Endpoint |
|---|---|
| `webhooks list` | GET `/webhooks/subscriptions` |
| `webhooks details <id>` | GET `/webhooks/subscriptions/{id}` |
| `webhooks create <event> <url> [hmac]` | POST `/webhooks/subscriptions` |
| `webhooks delete <id>` | DELETE `/webhooks/subscriptions/{id}` |
| `webhooks subscribe <id> <event>` | PUT `/webhooks/subscriptions/{id}` |
| `webhooks tap <id> <event>` | POST `/webhooks/subscriptions/{id}/test/{event}` |
| `webhooks unsubscribe <id> <event>` | PUT `/webhooks/subscriptions/{id}` |
