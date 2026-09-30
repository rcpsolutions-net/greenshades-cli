import { Command } from "commander";
import chalk from "chalk";
import apiClient from "../../lib/api.ts";

export function createWebhookCreateCommand(): Command {
  const create = new Command("create <eventName> <callback-url> [hmac-key]").description(
    "Create a new webhook subscription for a given event name, callback URL, and HMAC key"
  );

  create.action(async (eventName: string, callbackUrl: string, hmacKey: string | null = null) => {
    try {
      const hmacKeyToUse =
        hmacKey || process.env.GREENSHADES_WEBHOOK_HMAC_KEY;

      console.log(
        chalk.blue(
          `--- Creating new webhook subscription for event: ${eventName} with callback URL: ${callbackUrl}...`,
        ),
      );
      console.log(
        chalk.blue(
          `--- Using HMAC key: ${
            hmacKeyToUse || "No HMAC key provided"
          } (if not provided as argument, will use GREENSHADES_WEBHOOK_HMAC_KEY env variable)`,
        ),
      );

      const response = await apiClient.post(
        `/webhooks/subscriptions?eventName=${eventName}`,
        {
          id: 1,
          url: callbackUrl,
          hmacKey: hmacKeyToUse,
          subscribedEvents: ["payRun.completed"], 
        },
      );

      console.log(JSON.stringify(response.data, null, 2));

      console.log(
        chalk.green(
          `✅ Successfully created webhook subscription for event ${eventName}.`,
        ),
      );
    } catch (error: any) {
      console.error(
        chalk.red(
          `Error creating webhook subscription for event ${eventName}:`,
          error.message,
        ),
      );

      process.exit(1);
    }
  });

  return create;
}
