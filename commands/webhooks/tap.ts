import { Command } from "commander";
import chalk from "chalk";
import apiClient from "../../lib/api.ts";

export function createWebhookTapCommand(): Command {
  const tap = new Command("tap <id> <eventName>").description(
    "Send a test webhook event to the callback URL for a given webhook subscription Id and event name"
  );

  tap.action(async (id: string, eventName: string) => {
    try {
      console.log(
        chalk.blue(
          `--- Sending test webhook event ${eventName} for webhook subscription with Id ${id}...`,
        ),
      );

      await apiClient.post(`/webhooks/subscriptions/${id}/test/${eventName}`);

      console.log(
        chalk.green(
          `✅ Successfully sent test webhook event ${eventName} for webhook subscription with Id ${id}.`,
        ),
      );
    } catch (error: any) {
      console.error(
        chalk.red(
          `Error sending test webhook event ${eventName} for webhook subscription with Id ${id}:`,
          error.message,
        ),
      );

      process.exit(1);
    }
  });

  return tap;
}
