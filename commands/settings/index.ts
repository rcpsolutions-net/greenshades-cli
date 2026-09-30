import { Command } from 'commander';
import { createPayDetailsCommand, createEarnCodesCommand, createTaxDetailsCommand, createPayScheduleCommand, createTimeOffCommand, createBenefitsCommand, createDeductionsCommand } from './helpers.ts';

export default function createEmployeeSettingCommands(): Command {
  const payroll = new Command('details')
    .description('View Employee specific data via the Greenshades API (pay-details, earn-codes, tax-details, pay-schedule, time-off, benefits, deductions)');

  payroll.addCommand(createPayDetailsCommand());
  payroll.addCommand(createEarnCodesCommand());
  payroll.addCommand(createTaxDetailsCommand());
  payroll.addCommand(createPayScheduleCommand());
  payroll.addCommand(createTimeOffCommand());
  payroll.addCommand(createBenefitsCommand());
  payroll.addCommand(createDeductionsCommand());

  return payroll;
}
