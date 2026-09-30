import { Command } from "commander";
import chalk from "chalk";
import apiClient from "../../lib/api.ts";

export function createWebhookListCommand(): Command {
  const list = new Command("list").description(
    "Get all webhooks for the workspace"
  );

  list.action(async () => {
    try {
      console.log(chalk.blue("--- Fetching all webhooks..."));

      const response = await apiClient.get("/webhooks/subscriptions");

      console.log(JSON.stringify(response?.data, null, 2) + chalk.green("✅ Successfully retrieved webhooks."));
    } catch (error: any) {
      console.error(chalk.red("Error fetching webhooks:", error.message));

      process.exit(1);
    }
  });

  return list;
}
