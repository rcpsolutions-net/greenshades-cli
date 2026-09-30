import { Command } from "commander";
import { createWebhookListCommand } from "./list.ts";
import { createWebhookDetailsCommand } from "./details.ts";
import { createWebhookCreateCommand } from "./create.ts";
import { createWebhookDeleteCommand } from "./delete.ts";
import { createWebhookSubscribeCommand } from "./subscribe.ts";
import { createWebhookTapCommand } from "./tap.ts";
import { createWebhookUnsubscribeCommand } from "./unsubscribe.ts";

export default function createWebhookCommands(): Command {
  const webhooks = new Command("webhooks").description(
    "Manage webhooks in the Greenshades API (list, details, create, delete, subscribe, unsubscribe, tap)",
  );
  webhooks.addCommand(createWebhookListCommand());
  webhooks.addCommand(createWebhookDetailsCommand());
  webhooks.addCommand(createWebhookCreateCommand());
  webhooks.addCommand(createWebhookDeleteCommand());
  webhooks.addCommand(createWebhookSubscribeCommand());
  webhooks.addCommand(createWebhookTapCommand());
  webhooks.addCommand(createWebhookUnsubscribeCommand());
  return webhooks;
}
