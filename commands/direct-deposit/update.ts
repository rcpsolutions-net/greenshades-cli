import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readFileSync, existsSync } from 'node:fs';
import apiClient from '../../lib/api.ts';
import type { DirectDepositEntry } from './types.ts';
import { formatErrorMessage, validateEntries, validateRoutingNumber } from './helpers.ts';

export function createDirectDepositUpdateCommand(): Command {
  const update = new Command('update')
    .alias('put')
    .alias('set')
    .description("Update an employee's direct deposit settings (overwrites existing; use --clear or empty list to clear)")
    .option('-f, --file <filePath>', 'Path to JSON file containing direct deposit entries array')
    .option('-d, --data <jsonData>', 'Raw JSON string of direct deposit entries array')
    .option('--clear', 'Clear all direct deposit accounts (sends an empty list)')
    .option('-r, --routing <routingNumber>', 'Routing number (9 digits)')
    .option('-a, --account <accountNumber>', 'Account number (up to 25 chars)')
    .option('-t, --type <accountType>', 'Account type: Checking or Savings', 'Checking')
    .option('--amount <amount>', 'Fixed dollar amount for deposit', parseFloat)
    .option('-p, --percent <percent>', 'Percentage of pay for deposit', parseFloat)
    .option('--remainder', 'Designate this account for remainder of pay', false)
    .option('--prenote', 'Mark account as prenote', false)
    .option('--paycard-type <type>', 'Paycard type (e.g. rapid!)');

  update.action(async (employeeId: string, options: any) => {
    try {
      let entries: DirectDepositEntry[] = [];

      if (options.clear) {
        entries = [];
      } else if (options.file) {
        if (!existsSync(options.file)) {
          console.error(chalk.red(`File not found: ${options.file}`));
          process.exit(1);
        }
        const raw = readFileSync(options.file, 'utf-8');
        entries = JSON.parse(raw);
      } else if (options.data) {
        entries = JSON.parse(options.data);
      } else if (options.routing || options.account) {
        if (!options.routing || !options.account) {
          console.error(chalk.red('Both --routing and --account are required when configuring via flags.'));
          process.exit(1);
        }

        if (options.type && !['checking', 'savings'].includes(options.type.toLowerCase())) {
          console.error(chalk.red(`Account type must be 'Checking' or 'Savings' (got "${options.type}").`));
          process.exit(1);
        }

        const normalizedType = options.type?.toLowerCase() === 'savings' ? 'Savings' : 'Checking';
        const singleEntry: DirectDepositEntry = {
          ordinal: 1,
          routingNumber: String(options.routing).trim(),
          accountNumber: String(options.account).trim(),
          accountType: normalizedType,
          isRemainder: !!options.remainder,
          isPrenote: !!options.prenote,
          paycardType: options.paycardType || null,
        };

        if (options.amount !== undefined && !isNaN(options.amount)) {
          singleEntry.amount = options.amount;
        }
        if (options.percent !== undefined && !isNaN(options.percent)) {
          singleEntry.percent = options.percent;
        }

        entries = [singleEntry];
      } else {
        // Interactive prompt mode
        console.log(chalk.blue(`Direct deposit interactive setup for employee ${chalk.cyan(employeeId)}:`));

        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
              { name: 'Add/configure a single direct deposit account', value: 'add' },
              { name: 'Clear all direct deposit accounts', value: 'clear' },
              { name: 'Cancel', value: 'cancel' }
            ]
          }
        ]);

        if (action === 'cancel') {
          console.log(chalk.yellow('Operation cancelled.'));
          return;
        }

        if (action === 'clear') {
          entries = [];
        } else {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'routingNumber',
              message: 'Enter 9-digit Routing Number:',
              validate: (input: string) => validateRoutingNumber(input) ? true : 'Routing number must be exactly 9 digits'
            },
            {
              type: 'input',
              name: 'accountNumber',
              message: 'Enter Account Number (max 25 characters):',
              validate: (input: string) => input.trim().length > 0 && input.trim().length <= 25 ? true : 'Account number required (max 25 characters)'
            },
            {
              type: 'list',
              name: 'accountType',
              message: 'Account Type:',
              choices: ['Checking', 'Savings']
            },
            {
              type: 'list',
              name: 'splitType',
              message: 'Deposit allocation:',
              choices: [
                { name: 'Remainder (entire remaining net pay)', value: 'remainder' },
                { name: 'Fixed dollar amount', value: 'amount' },
                { name: 'Percentage of net pay', value: 'percent' }
              ]
            },
            {
              type: 'input',
              name: 'amount',
              message: 'Enter dollar amount:',
              when: (ans: any) => ans.splitType === 'amount',
              validate: (input: string) => !isNaN(Number(input)) && Number(input) > 0 ? true : 'Please enter a valid amount'
            },
            {
              type: 'input',
              name: 'percent',
              message: 'Enter percentage (e.g. 50 for 50%):',
              when: (ans: any) => ans.splitType === 'percent',
              validate: (input: string) => !isNaN(Number(input)) && Number(input) > 0 && Number(input) <= 100 ? true : 'Please enter a percentage between 1 and 100'
            },
            {
              type: 'confirm',
              name: 'isPrenote',
              message: 'Is this account a prenote verification?',
              default: false
            }
          ]);

          const newEntry: DirectDepositEntry = {
            ordinal: 1,
            routingNumber: answers.routingNumber.trim(),
            accountNumber: answers.accountNumber.trim(),
            accountType: answers.accountType,
            isRemainder: answers.splitType === 'remainder',
            isPrenote: answers.isPrenote,
            paycardType: null
          };

          if (answers.splitType === 'amount') {
            newEntry.amount = Number(answers.amount);
          } else if (answers.splitType === 'percent') {
            newEntry.percent = Number(answers.percent);
          }

          entries = [newEntry];
        }
      }

      // Validate payload
      validateEntries(entries);

      console.log(chalk.blue(`Updating direct deposit settings for employee ${chalk.cyan(employeeId)} (${entries.length} account(s))...`));

      await apiClient.put(`/employees/${encodeURIComponent(employeeId)}/directdeposit`, entries);

      if (entries.length === 0) {
        console.log(chalk.green(`✅ Successfully cleared all direct deposit settings for employee ${employeeId}.`));
      } else {
        console.log(chalk.green(`✅ Successfully updated direct deposit settings for employee ${employeeId}.`));
      }
    } catch (error: any) {
      console.error(chalk.red(`Error updating direct deposit settings for employee ${employeeId}:`, formatErrorMessage(error)));
      process.exit(1);
    }
  });

  return update;
}
