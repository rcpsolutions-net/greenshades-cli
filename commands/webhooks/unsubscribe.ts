import { Command } from "commander";
import chalk from "chalk";
import { getWebhookById, putWebhookById } from "./helpers.ts";
import { validEventNames } from "./constants.ts";

export function createWebhookUnsubscribeCommand(): Command {
  const unsubscribe = new Command("unsubscribe <id> <eventName>").description(
    "Remove an event subscription from an existing webhook subscription by their Greenshades webhookId and event name"
  );

  unsubscribe.action(async (id: string, eventName: string) => {
    try {
      if (!validEventNames.includes(eventName)) {
        return console.log(
          chalk.yellow(
            `⚠️ Event name ${eventName} is not in the list of valid event names. Please provide a valid event name and try again.`,
          ) +
            " " +
            chalk.blue(
              `Valid event names are: ${validEventNames.join(", ")}`,
            ),
        );
      }

      const wh = await getWebhookById(id);
      if (!wh)
        return console.log(
          chalk.yellow(
            `⚠️ No existing webhook subscription found with Id ${id}. Cannot remove event subscription. Please check the Id and try again.`,
          ),
        );

      const events = wh.subscribedEvents || [];
      console.log(
        chalk.redBright(
          `Current subscribed events for webhook subscription ${id}: ${events.join(
            ", ",
          )}`,
        ),
      );

      if (!events.includes(eventName)) {
        return console.log(
          chalk.yellow(
            `⚠️ Webhook subscription with Id ${id} is NOT subscribed to event ${eventName}. No action taken.`,
          ),
        );
      } else {
        console.log(
          chalk.blue(
            `Webhook subscription ${id} is currently subscribed to event ${eventName}. Proceeding to remove subscription...`,
          ),
        );

        await putWebhookById(
          id,
          wh.url,
          wh.hmacKey,
          events.filter((e: any) => e !== eventName),
        );

        console.log(
          chalk.green(
            `✅ Successfully removed event subscription for event ${eventName} from webhook subscription with Id ${id}.`,
          ),
        );
      }
    } catch (error: any) {
      console.error(
        chalk.red(
          `Error removing event subscription for event ${eventName} from webhook subscription with Id ${id}:`,
          error.message,
        ),
      );

      process.exit(1);
    }
  });

  return unsubscribe;
}
