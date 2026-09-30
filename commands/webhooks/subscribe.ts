import { Command } from "commander";
import chalk from "chalk";
import { getWebhookById, putWebhookById } from "./helpers.ts";
import { validEventNames } from "./constants.ts";

export function createWebhookSubscribeCommand(): Command {
  const subscribe = new Command("subscribe <id> <eventName>").description(
    "Add an event subscription to an existing webhook subscription by their Greenshades webhookId and event name"
  );

  subscribe.action(async (id: string, eventName: string) => {
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
            `⚠️ No existing webhook subscription found with Id ${id}. Cannot add event subscription. Please check the Id and try again.`,
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

      if (events.includes(eventName)) {
        return console.log(
          chalk.yellow(
            `⚠️ Webhook subscription with Id ${id} is ALREADY subscribed to event ${eventName}. No action taken.`,
          ),
        );
      } else {
        console.log(
          chalk.blue(
            `Webhook subscription ${id} is not currently subscribed to event ${eventName}. Proceeding to add subscription...`,
          ),
        );

        const resp = await putWebhookById(id, wh.url, wh.hmacKey, [
          ...events,
          eventName,
        ]);

        console.log(
          chalk.green(
            `✅ Successfully added event subscription for event ${eventName} to webhook subscription with Id ${id}.`,
          ),
        );
      }
    } catch (error: any) {
      console.error(
        chalk.red(
          `Error adding event subscription for event ${eventName} to webhook subscription with Id ${id}:`,
          error.message,
        ),
      );

      process.exit(1);
    }
  });

  return subscribe;
}
