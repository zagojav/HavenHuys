import 'server-only';
import { Resend } from 'resend';

/**
 * Outbound email, through Resend.
 *
 * The client is created on first use for the same reason as the Stripe one:
 * a build without the key must still succeed.
 */
let client: Resend | null = null;

function resend(): Resend {
  if (client) return client;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set, so no mail can be sent.');
  }

  client = new Resend(apiKey);
  return client;
}

/** Whether sending is configured at all — lets callers skip without failing. */
export function canSendEmail(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Where order notifications go, and who they come from.
 *
 * The default sender is Resend's shared `onboarding@resend.dev`, which works
 * with no domain set up but will only deliver to the address that owns the
 * Resend account. Once havenhuis.nl (or whichever domain) is verified in
 * Resend, set ORDER_NOTIFICATION_FROM to an address on it.
 */
const NOTIFICATION_TO = process.env.ORDER_NOTIFICATION_TO ?? 'hello.havenhuys@gmail.com';
const NOTIFICATION_FROM =
  process.env.ORDER_NOTIFICATION_FROM ?? 'Haven Huis <onboarding@resend.dev>';

export interface OutgoingEmail {
  subject: string;
  html: string;
  text: string;
  /**
   * Passed to Resend as an idempotency key. A webhook Stripe delivers twice
   * therefore cannot produce two notifications for the same order.
   */
  idempotencyKey?: string;
}

export async function sendOperationsEmail(email: OutgoingEmail): Promise<string> {
  const { data, error } = await resend().emails.send(
    {
      from: NOTIFICATION_FROM,
      to: NOTIFICATION_TO,
      subject: email.subject,
      html: email.html,
      text: email.text,
    },
    email.idempotencyKey ? { idempotencyKey: email.idempotencyKey } : undefined,
  );

  // Resend reports API failures in the payload rather than by throwing.
  if (error) {
    throw new Error(`Resend refused the message: ${error.name} — ${error.message}`);
  }

  return data?.id ?? 'unknown';
}
