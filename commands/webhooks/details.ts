import { Command } from "commander";
import chalk from "chalk";
import apiClient from "../../lib/api.ts";

export function createWebhookDetailsCommand(): Command {
  const details = new Command("details <webhook-id>").description(
    "Get a single webhook subscription by their Greenshades webhookId"
  );

  details.action(async (webhookId: string) => {
    try {
      console.log(
        chalk.blue(
          `Fetching webhook subscription details with subscription Id: ${webhookId}...`,
        ),
      );

      const response = await apiClient.get(
        `/webhooks/subscriptions/${webhookId}`,
      );

      console.log("WebHook Record: ", JSON.stringify(response.data, null, 2));

      console.log(
        chalk.green(
          `✅ Successfully retrieved webhook subscription ${webhookId}.`,
        ),
      );
    } catch (error: any) {
      console.error(
        chalk.red(
          `Error fetching webhook subscription ${webhookId}:`,
          error.message,
        ),
      );

      process.exit(1);
    }
  });

  return details;
}
