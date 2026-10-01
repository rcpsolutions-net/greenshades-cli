<div align="center" style="background: #cccccc;">

```text
greenshades-cli 

 ⢀⡀ ⡀⣀ ⢀⡀ ⢀⡀ ⣀⡀ ⢀⣀ ⣇⡀ ⢀⣀ ⢀⣸ ⢀⡀ ⢀⣀    ⢀⣀ ⡇ ⠄ 
⣑⡺ ⠏  ⠣⠭ ⠣⠭ ⠇⠸ ⠭⠕ ⠇⠸ ⠣⠼ ⠣⠼ ⠣⠭ ⠭⠕ ⠉⠉ ⠣⠤ ⠣ ⠇
 
v0.1a (beta)
```

<!-- Badges -->

[![Node.js >= 22](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-3DA643?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-6BCBFB?style=flat-square)](LICENSE)
[![Commands](https://img.shields.io/badge/Commands-116-blue?style=flat-square)](#commands)
[![Command Groups](https://img.shields.io/badge/Command%20Groups-19-purple?style=flat-square)](#commands)

A command-line interface for interacting with the [Greenshades](https://www.greenshades.com/) HR/Payroll API. Query employees, paystubs, payroll settings, departments, positions, placements, and more directly from your terminal.

### At a Glance

| 📥 Get | ✏️ Create | ✂️ Update | 🗑 Delete | 🔐 Auth |
|---|---|---|---|---|
| `employee pull 123` | `employee create ...` | `employee update 123 ...` | `placements delete 456` | `auth login` |

| 💵 Paystubs | 🏦 Direct Deposit | 🧾 Payruns | 🪝 Webhooks | 📊 Reports |
|---|---|---|---|---|
| `paystubs list` | `dd get 123` | `payruns list` | `webhooks list` | `report costs` |

</div>

---

## Requirements

- Node.js (ES modules support required)
- A Greenshades account with API access (OAuth2 credentials)

## Installation

```bash
git clone <repo-url>
cd greenshades-cli
npm install
npm link
```

After linking, the `greenshades` command will be available globally.

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
GREENSHADES_CLIENT_ID=your_client_id
GREENSHADES_CLIENT_SECRET=your_client_secret
GREENSHADES_WORKSPACE_ID=your_workspace_id
GREENSHADES_API_SCOPE=GO.Api.COR.read GO.Api.PAY.read GO.Api.PAY.Setup.read GO.Api.PAY.PayRuns.read GO.Api.PAY.Reporting.read
```

1. Authenticate:

```bash
greenshades auth login
```

You'll be prompted for your Client ID, Client Secret, and Workspace ID (defaults to `.env` values). On success, the token and workspace ID are stored locally for subsequent commands.

1. Verify setup:

```bash
greenshades test
greenshades auth status
```

## Commands

### Authentication

```bash
greenshades auth login       # Authenticate and save credentials
greenshades auth logout      # Clear stored credentials
greenshades auth status      # Show current authentication status
```

### Employees

```bash
greenshades employee list [--nativeId <id>]                  # List all employees, optionally filtered
greenshades employee pull <employeeId>                       # Get a single employee by ID
greenshades employee dependents <employeeId>                 # Get employee dependents
greenshades employee contacts <employeeId>                   # Get employee contacts
greenshades employee timeoff <employeeId>                    # Get employee time-off balances
greenshades employee customFields <employeeId>               # Get employee custom fields
greenshades employee update [options] <employeeId>           # Modify an employee's profile
greenshades employee create [options]                        # Create a new employee
greenshades employee bulk [options]                          # Bulk create/update employees (upsert by nativeId)
greenshades employee dd <employeeId>                         # Get direct deposit settings
greenshades employee dd-update [options] <employeeId>        # Update direct deposit settings (overwrites all)
greenshades employee dd-delete <employeeId>                  # Delete all direct deposit settings
greenshades employee earnings <employeeId>                   # Get assigned earning codes with rates/maximums
greenshades employee payroll-tax <employeeId> <taxId>        # Get payroll tax setup for a tax
greenshades employee payroll-tax-update [options] <employeeId> <taxId>   # Save/update payroll tax setup
greenshades employee pay-schedule <employeeId>               # Get assigned pay schedule
greenshades employee pay-schedule-set <employeeId> <payScheduleId>       # Assign a pay schedule
greenshades employee pay-schedule-remove <employeeId>        # Remove pay schedule assignment
greenshades employee timeoff-code [options] <employeeId> <codeId>        # Assign/update a time-off code
```

#### Payroll codes (benefits & deductions)

```bash
greenshades employee benefits <employeeId>                     # Get assigned benefit codes
greenshades employee benefits-update [options] <employeeId>    # Replace all benefit codes (-f/-d/-c)
greenshades employee benefits-remove <employeeId> [codeIds...] # Remove benefit codes (all of them if no code IDs given)
greenshades employee deductions <employeeId>                   # Get assigned deduction codes
greenshades employee deductions-update [options] <employeeId>  # Replace all deduction codes (-f/-d/-c)
greenshades employee deductions-remove <employeeId> [codeIds...] # Remove deduction codes (all of them if no code IDs given)
```

`benefits-remove` / `deductions-remove` call `POST /employees/{id}/payroll/benefits|deductions/delete` with a body of code-ID strings. With no code IDs they fetch the employee's current codes and remove all of them. Code IDs are large snowflakes — pass them as strings.

```bash
greenshades employee settlements [options]                     # Create new employee settlements (bulk, -f/-d)
```

### Direct Deposit

```bash
greenshades dd get <employeeId> [-o table|json]                # Get direct deposit settings
greenshades dd update <employeeId> [options]                   # Update settings (--clear, -f/-d, or CLI flags; interactive if none)
greenshades dd delete <employeeId> [--force]                   # Delete all direct deposit settings
```

### Employee Details

```bash
greenshades details pay-details <employeeId>    # Direct deposit settings
greenshades details earn-codes <employeeId>     # Earning codes
greenshades details tax-details <employeeId>    # Tax information
greenshades details pay-schedule <employeeId>   # Pay schedule
greenshades details time-off <employeeId>       # Time-off balances
greenshades details benefits <employeeId>       # Benefit codes
greenshades details deductions <employeeId>     # Deduction codes
```

### Paystubs

```bash
greenshades paystubs list                       # List paystubs from the last 2 days
greenshades paystubs details <payRecordId>      # Get a single paystub
greenshades paystubs employee <employeeId>      # Get all paystubs for an employee
greenshades paystubs payrun <payRunId>          # Get all paystubs for a pay run
```

### Departments

```bash
greenshades department list                     # List all departments
greenshades department details <code>           # Get a department by code
```

### Locations

```bash
greenshades locations list                      # List all work locations
greenshades locations details <code>            # Get a location by code
```

### Positions

```bash
greenshades positions list                          # List all positions
greenshades positions details <code>                # Get a position by code
greenshades positions worker-compensation-codes     # List worker compensation codes
```

### Placements

```bash
greenshades placements list                     # List all placements
greenshades placements employee <employeeId>    # Get placements for an employee
greenshades placements details <placementId>    # Get a single placement
greenshades placements create [options] <placementId>   # Create a new placement
greenshades placements update [options] <placementId>   # Modify an existing placement
greenshades placements delete <placementId>     # Delete a single placement
greenshades placements bulk [options]           # Update or create a list of placements
```

### Employee Classes

```bash
greenshades classes list                        # Get all employee classes
greenshades classes details <class-code>        # Get a single employee class
```

### Custom Fields

```bash
greenshades custom list                         # Get all custom fields
greenshades custom details <field-id>           # Get a single custom field
greenshades custom employee <employee-id>       # Get all custom fields for a specific employee
```

### Payruns

```bash
greenshades payruns list                        # Get all payruns for the workspace
greenshades payruns info <payrun-id>            # Get earning codes for a specific payrun
greenshades payruns details <payrun-id>         # Get a single pay run
greenshades payruns cancel <payrun-id>          # Cancel an existing pay run
greenshades payruns employee-add [options] <payrun-id> <employee-id>    # Add an employee to a pay run
greenshades payruns employee-update [options] <payrun-id> <employee-id> # Modify an employee in a pay run
greenshades payruns employee-remove <payrun-id> <employee-id>           # Remove an employee from a pay run
greenshades payruns earning <payrun-id> <earning-id>                    # Get a pay run earning by ID
greenshades payruns earning-add [options] <payrun-id>                   # Create new pay run earnings
greenshades payruns earning-update [options] <payrun-id>                # Update existing pay run earnings
greenshades payruns earning-remove <payrun-id> <earning-id>             # Remove a pay run earning
```

### Reports

```bash
greenshades report timeoff-balances             # Get all time-off balances for the workspace (exports to JSON)
greenshades report timeoff-balances -o table    # View time-off balances output format as a table
greenshades report benefits-deductions          # Get benefits and deductions report
greenshades report costs -s <YYYY-MM-DD> -e <YYYY-MM-DD> [-o table]   # Cost report for a date range
greenshades report costs --pay-run <payRunId>   # Cost report for a single pay run
```

### Earning Codes (workspace)

```bash
greenshades earnings list                       # Get all earning codes
greenshades earnings details <earning-code>     # Get a single earning code
greenshades earnings create [options]           # Create a new earning code
greenshades earnings update [options] <earning-code>  # Modify an existing earning code
greenshades earnings delete <earning-code>      # Remove an existing earning code
```

### Pay Schedules (workspace)

```bash
greenshades payschedules-setup list             # Get all pay schedules
greenshades payschedules-setup details <schedule-id>  # Get a single pay schedule
greenshades payschedules-setup employees <schedule-id> # Get employees assigned to a pay schedule
```

### Tax Setup (workspace)

```bash
greenshades tax-setup info                      # Get workspace payroll tax setup information
```

### Workspaces

```bash
greenshades workspace list                      # Get all authorized workspaces
greenshades workspace contacts <workspace-id>   # Get contacts for a workspace
greenshades workspace create [options]          # Create a new workspace under a parent
```

### Logs

```bash
greenshades logs list                           # Get all request logs (defaults to the last 24 hours)
greenshades logs list -s <date> -e <date>       # Get request logs for a specific date range (YYYY-MM-DD)
greenshades logs details <request-id>           # Get a single request log by its ID
```

### Webhooks

```bash
greenshades webhooks list                                          # List all webhook subscriptions
greenshades webhooks details <webhookId>                           # Get a webhook subscription by ID
greenshades webhooks create <event-name> <callback-url> [hmac-key] # Create a new webhook subscription
greenshades webhooks delete <id>                                   # Delete a webhook subscription
greenshades webhooks subscribe <id> <event-name>                   # Add an event to an existing subscription
greenshades webhooks tap <id> <event-name>                         # Tap into an event for an existing subscription
greenshades webhooks unsubscribe <id> <event-name>                 # Remove an event from an existing subscription
```

## Configuration

After login, credentials are persisted locally via [`conf`](https://github.com/sindresorhus/conf):

| Platform | Path                                        |
|----------|---------------------------------------------|
| Linux    | `~/.config/gs-cli/config.json`              |
| macOS    | `~/Library/Preferences/gs-cli/config.json`  |
| Windows  | `%APPDATA%\gs-cli\config.json`              |

The stored config contains the access token and workspace ID. Treat this file as sensitive.

## License

ISC
