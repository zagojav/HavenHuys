import 'server-only';
import { supplierFor } from '@/data/suppliers';
import { formatPrice } from '@/lib/format';
import type { OutgoingEmail } from '@/lib/email';
import type { Order } from '@/lib/fulfilment';

/**
 * The "go and buy this" notification.
 *
 * Written in Portuguese because the only reader is whoever places the order at
 * CJ Dropshipping. It exists so that nothing has to be looked up anywhere
 * else: the supplier links, the address in paste-ready form and what the order
 * should cost are all in the message.
 */

/** Amounts are shown Dutch-style, matching the shop. */
const money = (cents: number) => formatPrice(cents, 'nl');

/** Last eight characters of the session id, enough to spot in an inbox. */
function shortReference(sessionId: string): string {
  return sessionId.slice(-8).toUpperCase();
}

/** Customer-supplied strings reach this template, so everything is escaped. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * The delivery address as one block, in the order a shipping form asks for it.
 * Empty lines are dropped so nothing has to be tidied up after pasting.
 */
function addressBlock(order: Order): string {
  const address = order.address;

  if (!address) return 'Endereço não informado pela Stripe.';

  const cityLine = [address.postal_code, address.city].filter(Boolean).join(' ');

  return [
    order.shippingName ?? order.name,
    address.line1,
    address.line2,
    cityLine,
    address.state,
    address.country,
    order.phone,
  ]
    .filter((line): line is string => Boolean(line && line.trim()))
    .join('\n');
}

interface PurchaseLine {
  name: string;
  quantity: number;
  supplierUrl: string | null;
  supplierCostCents: number | null;
  note: string | null;
  kitQuantity: number | null;
}

function purchaseLines(order: Order): PurchaseLine[] {
  return order.lines.map((line) => {
    const supplier = line.slug ? supplierFor(line.slug) : undefined;

    return {
      name: line.name,
      quantity: line.quantity,
      supplierUrl: supplier?.supplierUrl ?? null,
      supplierCostCents: supplier?.costCents ?? null,
      note: supplier?.note ?? null,
      kitQuantity: supplier?.kitQuantity ?? null,
    };
  });
}

/** What the supplier should charge in total, when every cost is known. */
function estimatedSupplierCost(lines: PurchaseLine[]): number | null {
  if (lines.some((line) => line.supplierCostCents === null)) return null;

  return lines.reduce(
    (total, line) => total + (line.supplierCostCents ?? 0) * line.quantity,
    0,
  );
}

export function buildOrderEmail(order: Order): OutgoingEmail {
  const reference = shortReference(order.sessionId);
  const lines = purchaseLines(order);
  const supplierCost = estimatedSupplierCost(lines);
  const address = addressBlock(order);

  const text = [
    `PEDIDO ${reference}`,
    `Referência Stripe: ${order.sessionId}`,
    '',
    `Cliente: ${order.name ?? '—'}`,
    `E-mail: ${order.email ?? '—'}`,
    `Telefone: ${order.phone ?? 'não coletado no checkout'}`,
    '',
    `Total pago pelo cliente: ${money(order.amountTotalCents)}`,
    `  dos quais frete: ${money(order.shippingCents)}`,
    supplierCost === null
      ? 'Custo estimado no CJ: indisponível, algum item está sem custo cadastrado'
      : `Custo estimado no CJ: ${money(supplierCost)}`,
    supplierCost === null
      ? null
      : `Sobra: ${money(order.amountTotalCents - supplierCost)} (antes das taxas da Stripe e do imposto de importação)`,
    '',
    '--- COMPRAR NO CJ ---',
    ...lines.flatMap((line) => [
      '',
      `${line.quantity}× ${line.name}`,
      line.supplierUrl ?? 'SEM LINK DE FORNECEDOR — conferir data/suppliers.ts',
      line.supplierCostCents === null
        ? null
        : `Custo unitário: ${money(line.supplierCostCents)}`,
      line.kitQuantity ? `Atenção: o site vende como kit de ${line.kitQuantity}.` : null,
      line.note ? `Nota: ${line.note}` : null,
    ]),
    '',
    '--- ENDEREÇO DE ENTREGA (copiar e colar) ---',
    address,
  ]
    .filter((row) => row !== null)
    .join('\n');

  const itemsHtml = lines
    .map((line) => {
      const details = [
        line.supplierCostCents === null
          ? null
          : `Custo unitário: <strong>${money(line.supplierCostCents)}</strong>`,
        line.kitQuantity
          ? `<span style="color:#b5533c">Atenção: o site vende como kit de ${line.kitQuantity}.</span>`
          : null,
        line.note ? `<span style="color:#b5533c">${escapeHtml(line.note)}</span>` : null,
      ].filter(Boolean);

      const link = line.supplierUrl
        ? `<a href="${escapeHtml(line.supplierUrl)}" style="color:#8f5f3b">Abrir no CJ Dropshipping &rarr;</a>`
        : `<span style="color:#b5533c">Sem link de fornecedor &mdash; conferir data/suppliers.ts</span>`;

      return [
        '<tr><td style="padding:14px 0;border-bottom:1px solid #e3dbcc">',
        `<div style="font-size:15px"><strong>${line.quantity}&times;</strong> ${escapeHtml(line.name)}</div>`,
        `<div style="margin-top:6px">${link}</div>`,
        details.length
          ? `<div style="margin-top:6px;font-size:13px;color:#6b635a">${details.join('<br>')}</div>`
          : '',
        '</td></tr>',
      ].join('');
    })
    .join('');

  const totalsRow = (label: string, value: string, muted = false) => {
    const tone = muted ? ';color:#6b635a' : '';
    return [
      '<tr>',
      `<td style="padding:10px 0;border-top:1px solid #e3dbcc;font-size:14px${tone}">${label}</td>`,
      `<td style="padding:10px 0;border-top:1px solid #e3dbcc;font-size:14px;text-align:right${tone}">${value}</td>`,
      '</tr>',
    ].join('');
  };

  const html = [
    '<!doctype html>',
    '<html lang="pt-BR"><body style="margin:0;padding:24px;background:#faf7f2;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#2b2622">',
    '<div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">',
    '<p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8f5f3b">Novo pedido</p>',
    `<h1 style="margin:6px 0 0;font-size:26px">Pedido ${reference}</h1>`,
    `<p style="margin:6px 0 0;font-size:12px;color:#6b635a">Referência Stripe: ${escapeHtml(order.sessionId)}</p>`,
    '<table style="width:100%;margin-top:24px;border-collapse:collapse">',
    totalsRow(
      'Total pago pelo cliente',
      `<strong>${money(order.amountTotalCents)}</strong>`,
    ),
    totalsRow('dos quais frete', money(order.shippingCents), true),
    totalsRow(
      'Custo estimado no CJ',
      supplierCost === null ? 'indisponível' : money(supplierCost),
    ),
    supplierCost === null
      ? ''
      : totalsRow(
          'Sobra, antes das taxas da Stripe e do imposto',
          money(order.amountTotalCents - supplierCost),
          true,
        ),
    '</table>',
    '<h2 style="margin:32px 0 0;font-size:18px">Comprar no CJ</h2>',
    `<table style="width:100%;border-collapse:collapse">${itemsHtml}</table>`,
    '<h2 style="margin:32px 0 8px;font-size:18px">Endereço de entrega</h2>',
    '<p style="margin:0 0 8px;font-size:13px;color:#6b635a">Copiar e colar no formulário do CJ.</p>',
    `<pre style="margin:0;padding:16px;background:#f3ede3;border-radius:12px;font-size:14px;line-height:1.5;white-space:pre-wrap">${escapeHtml(address)}</pre>`,
    '<h2 style="margin:32px 0 8px;font-size:18px">Cliente</h2>',
    '<p style="margin:0;font-size:14px;line-height:1.6">',
    `${escapeHtml(order.name ?? '—')}<br>`,
    `${escapeHtml(order.email ?? '—')}<br>`,
    `<span style="color:#6b635a">${order.phone ? escapeHtml(order.phone) : 'telefone não coletado no checkout'}</span>`,
    '</p></div></body></html>',
  ].join('');

  return {
    subject: `Novo pedido Haven Huis — ${reference}`,
    html,
    text,
    // Keyed on the session, so a redelivered webhook cannot send this twice.
    idempotencyKey: `order-${order.sessionId}`,
  };
}
