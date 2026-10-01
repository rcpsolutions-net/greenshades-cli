import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createWorkspaceCommands() {
  const workspace = new Command('workspace')
    .description('Manage workspaces in the Greenshades API (list, contacts, create)');

  // --- GET ALL WORKSPACES (GET /workspaces) ---
  workspace.command('list')
    .description('Get all authorized workspaces')
    .action(async () => {
      try {
        console.log(chalk.blue('--- Fetching all authorized workspaces...'));

        const response = await apiClient.get('/workspaces');

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved workspaces.'));
      } catch (error: any) {
        console.error(chalk.red('Error fetching workspaces:', error.message));
        process.exit(1);
      }
    });

  // --- GET WORKSPACE CONTACTS (GET /workspaces/{workspaceId}/contacts) ---
  workspace.command('contacts <workspace-id>')
    .description('Get contacts for a workspace')
    .option('--include-dealer', 'Include contacts of type Dealer')
    .action(async (workspaceId: string, options: any) => {
      try {
        console.log(chalk.blue(`--- Fetching contacts for workspace ${workspaceId}...`));

        const params: any = {};
        if (options.includeDealer) {
          params.includeDealer = true;
        }

        const response = await apiClient.get(`/workspaces/${workspaceId}/contacts`, { params });

        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved workspace contacts.'));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching contacts for workspace ${workspaceId}:`, error.message));
        process.exit(1);
      }
    });

  // --- CREATE WORKSPACE (POST /workspaces?parentCompanyId=<id>) ---
  workspace.command('create')
    .description('Create a new workspace under a parent company')
    .requiredOption('-p, --parent-company-id <parentId>', 'Id of the parent company')
    .requiredOption('--company-name <name>', 'Company name for the new workspace')
    .requiredOption('--address1 <address1>', 'Street address (line 1)')
    .requiredOption('--city <city>', 'City')
    .requiredOption('--state <state>', 'State')
    .requiredOption('--zip-code <zipCode>', 'ZIP code')
    .requiredOption('--ein <ein>', 'Employer Identification Number (9 digits, format: XX-XXXXXXX)')
    .requiredOption('--billing-contact-id <contactId>', 'ID of a contact belonging to parent company (integer > 0)')
    .option('-c, --company-id <companyId>', 'Unique identifier for the new workspace (max 15 chars, must start with letter/underscore)')
    .option('-a2, --address2 <address2>', 'Street address (line 2, optional)')
    .option('-a3, --address3 <address3>', 'Street address (line 3, optional)')
    .action(async (options: any) => {
      try {
        const bodyData: Record<string, unknown> = {
          companyID: options.companyId || undefined,
          companyName: options.companyName,
          address1: options.address1,
          city: options.city,
          state: options.state,
          zipCode: options.zipCode,
          ein: options.ein,
          billingContactID: parseInt(options.billingContactId, 10),
        };

        // Only add optional fields if provided
        if (options.address2) {
          bodyData.address2 = options.address2;
        }
        if (options.address3) {
          bodyData.address3 = options.address3;
        }

        console.log(chalk.blue(`Creating new workspace under parent company ${options.parentCompanyId}...`));

        const response = await apiClient.post(`/workspaces?parentCompanyId=${options.parentCompanyId}`, bodyData);
        console.log(chalk.green('✅ Successfully created workspace.'));
        console.log(JSON.stringify(response.data, null, 2));
      } catch (error: any) {
        console.error(chalk.red('Error creating workspace:', error.message));
        process.exit(1);
      }
    });

  return workspace;
}

export default createWorkspaceCommands;
