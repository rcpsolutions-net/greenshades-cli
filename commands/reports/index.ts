import { Command } from 'commander';
import { createTimeoffBalancesCommand } from './timeoff-balances.ts';
import { createBenefitsDeductionsCommand } from './benefits-deductions.ts';
import { createCostReportCommand } from './costs.ts';

export default function createReportCommands(): Command {
  const report = new Command('report')
    .description('View report results in the Greenshades API');

  report.addCommand(createTimeoffBalancesCommand());
  report.addCommand(createBenefitsDeductionsCommand());
  report.addCommand(createCostReportCommand());

  return report;
}
