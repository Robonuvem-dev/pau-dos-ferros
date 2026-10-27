import { createFileRoute } from "@tanstack/react-router";
import { WebmailFrame } from "@/components/admin/WebmailFrame";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/admin/webmail")({
  head: () => pageHead("Webmail institucional", "Acesso ao correio eletrônico institucional."),
  component: WebmailFrame,
});
