import { WEBMAIL_URL } from "@/lib/admin-modules";

export function WebmailFrame() {
  return (
    <iframe
      src={WEBMAIL_URL}
      title="Webmail institucional"
      className="block h-dvh w-full border-0"
      allow="clipboard-read; clipboard-write"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
