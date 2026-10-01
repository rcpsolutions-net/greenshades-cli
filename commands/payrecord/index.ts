import { Command } from 'commander';
import { createPaystubsListCommand } from './list.ts';
import { createPaystubsDetailsCommand } from './details.ts';
import { createPaystubsEmployeeCommand } from './employee.ts';
import { createPaystubsPayrunCommand } from './payrun.ts';
import { createPayrecordLinkCommand } from './link.ts';
import { createPayrecordDocumentCommand } from './document.ts';

export default function createPayrecordCommands(): Command {
  const payrecord = new Command('paystubs')
    .description('View paystub records in the Greenshades API (list, details, employee, payrun, link, document)');

  payrecord.addCommand(createPaystubsListCommand());
  payrecord.addCommand(createPaystubsDetailsCommand());
  payrecord.addCommand(createPaystubsEmployeeCommand());
  payrecord.addCommand(createPaystubsPayrunCommand());
  payrecord.addCommand(createPayrecordLinkCommand());
  payrecord.addCommand(createPayrecordDocumentCommand());

  return payrecord;
}
