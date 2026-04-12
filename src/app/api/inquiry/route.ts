import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

// Einfacher In-Memory Rate-Limiter (pro IP, max 5 Anfragen pro 10 Min.)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

interface InquiryBody {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  childAges?: number[];
  displayLabel: string;
  totalPrice: number;
  totalAfterDiscount: number;
  discount: number;
  discountPercent: number;
  /** Honeypot-Feld: muss leer sein */
  website?: string;
}

function validate(body: InquiryBody): string | null {
  if (!body.name?.trim() || body.name.trim().length < 2) return "Name fehlt.";
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return "Ungültige E-Mail.";
  if (!body.checkIn || !body.checkOut) return "Zeitraum fehlt.";
  if (body.nights < 2) return "Mindestaufenthalt: 2 Nächte.";
  if (!body.displayLabel) return "Unterkunftsauswahl fehlt.";
  // Honeypot
  if (body.website && body.website.trim().length > 0) return "SPAM";
  return null;
}

function formatPrice(cents: number): string {
  return `${cents.toLocaleString("de-DE")} €`;
}

function buildOwnerEmail(d: InquiryBody): string {
  const childAgesStr = d.childAges && d.childAges.length > 0
    ? d.childAges.map((a) => `${a} Jahre`).join(", ")
    : "–";

  const priceLine = d.discount > 0
    ? `${formatPrice(d.totalAfterDiscount)} (${formatPrice(d.totalPrice)} abzgl. ${d.discountPercent}% Rabatt)`
    : formatPrice(d.totalPrice);

  return `Neue Anfrage über bärenstuben.de

Unterkunft: ${d.displayLabel}
Anreise: ${d.checkIn}
Abreise: ${d.checkOut}
Nächte: ${d.nights}

Erwachsene: ${d.adults}
Kinder: ${d.children}${d.children > 0 ? ` (${childAgesStr})` : ""}

Geschätzter Preis: ${priceLine}

---

Name: ${d.name.trim()}
E-Mail: ${d.email.trim()}
Telefon: ${d.phone?.trim() || "–"}

Nachricht:
${d.message?.trim() || "–"}
`;
}

function buildGuestEmail(d: InquiryBody): string {
  const priceLine = d.discount > 0
    ? `${formatPrice(d.totalAfterDiscount)} (inkl. ${d.discountPercent}% Langzeit-Rabatt)`
    : formatPrice(d.totalPrice);

  return `Liebe/r ${d.name.trim()},

vielen Dank für Ihre Anfrage bei den Bärenstuben!

Wir haben folgende Daten erhalten:

Unterkunft: ${d.displayLabel}
Anreise: ${d.checkIn}
Abreise: ${d.checkOut}
Nächte: ${d.nights}
Personen: ${d.adults} Erwachsene${d.children > 0 ? `, ${d.children} Kinder` : ""}
Geschätzter Preis: ${priceLine}

Wir prüfen die Verfügbarkeit und melden uns schnellstmöglich bei Ihnen – in der Regel innerhalb von 24 Stunden.

Dies ist eine automatisch generierte Bestätigung. Bitte antworten Sie nicht direkt auf diese E-Mail, sondern nutzen Sie info@bärenstuben.de.

Mit freundlichen Grüßen
Bärenstuben Ferienwohnungen
Vor dem Drostentor 7
26427 Esens
+49 (0) 162 3994428
`;
}

export async function POST(request: NextRequest) {
  // Rate Limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut." },
      { status: 429 }
    );
  }

  let body: InquiryBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    if (validationError === "SPAM") {
      // Honeypot getriggert: so tun als ob es funktioniert hat
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const fromAddress = process.env.SMTP_USER || "info@xn--brenstuben-q5a.de";
  const toAddress = process.env.EMAIL_TO || fromAddress;

  try {
    // 1. E-Mail an Betreiber
    await transporter.sendMail({
      from: `"Bärenstuben Website" <${fromAddress}>`,
      to: toAddress,
      replyTo: body.email.trim(),
      subject: `Neue Anfrage: ${body.displayLabel} | ${body.checkIn} – ${body.checkOut}`,
      text: buildOwnerEmail(body),
    });

    // 2. Bestätigungsmail an den Gast
    await transporter.sendMail({
      from: `"Bärenstuben Ferienwohnungen" <${fromAddress}>`,
      to: body.email.trim(),
      subject: "Ihre Anfrage bei den Bärenstuben – Eingangsbestätigung",
      text: buildGuestEmail(body),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("E-Mail-Versand fehlgeschlagen:", error);
    return NextResponse.json(
      { error: "Die Anfrage konnte leider nicht versendet werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt per E-Mail." },
      { status: 500 }
    );
  }
}
