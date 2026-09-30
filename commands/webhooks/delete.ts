import { Command } from "commander";
import chalk from "chalk";
import apiClient from "../../lib/api.ts";

export function createWebhookDeleteCommand(): Command {
  const del = new Command("delete <id>").description(
    "Delete a webhook subscription by their Greenshades webhookId"
  );

  del.action(async (id: string) => {
    try {
      console.log(
        chalk.blue(
          `--- Deleting webhook subscription with subscription Id: ${id}...`,
        ),
      );

      await apiClient.delete(`/webhooks/subscriptions/${id}`);

      console.log(
        chalk.green(
          `✅ Successfully deleted webhook subscription with Id ${id}.`,
        ),
      );
    } catch (error: any) {
      console.error(
        chalk.red(
          `Error deleting webhook subscription with Id ${id}:`,
          error.message,
        ),
      );

      process.exit(1);
    }
  });

  return del;
}
