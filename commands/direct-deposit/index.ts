import { Command } from 'commander';
import { createDirectDepositGetCommand } from './get.ts';
import { createDirectDepositUpdateCommand } from './update.ts';
import { createDirectDepositDeleteCommand } from './delete.ts';

export type { DirectDepositEntry } from './types.ts';

export default function createDirectDepositCommands(): Command {
  const dd = new Command('direct-deposit')
    .alias('dd')
    .description("Manage employee direct deposit settings via the Greenshades API (get, update, delete)");

  dd.addCommand(createDirectDepositGetCommand());
  dd.addCommand(createDirectDepositUpdateCommand());
  dd.addCommand(createDirectDepositDeleteCommand());

  return dd;
}
