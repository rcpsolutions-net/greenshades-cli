import { Command } from "commander";
import chalk from "chalk";
import apiClient from "../../lib/api.ts";

export async function getWebhookById(webhookId: string) {
  try {
    console.log(
      chalk.redBright(
        "Retrieving existing webhook subscription details to get current subscribed events...",
      ),
    );

    const resp = await apiClient.get(`/webhooks/subscriptions/${webhookId}`);

    return resp.data;
  } catch (error: any) {
    console.error(
      chalk.red(
        `Error fetching webhook subscription ${webhookId}:`,
        error.message,
      ),
    );

    process.exit(1);
  }
}

export async function putWebhookById(
  webhookId: string,
  url: string,
  hmacKey: string,
  subscribedEvents: string[],
) {
  try {
    console.log(
      chalk.redBright(
        "Updating webhook subscription with new subscribed events...",
      ),
    );

    const resp = await apiClient.put(`/webhooks/subscriptions/${webhookId}`, {
      id: webhookId,
      url: url,
      hmacKey: hmacKey,
      subscribedEvents: subscribedEvents,
    });

    return resp;
  } catch (error: any) {
    console.error(
      chalk.red(
        `Error updating webhook subscription ${webhookId}:`,
        error.message,
      ),
    );

    process.exit(1);
  }
}
