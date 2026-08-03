/**
 * Regressionsschutz für die Abreisetag-Regel (Same-Day-Turnover).
 *
 * Fachliche Zusage: Reist ein Gast bis 11:00 Uhr ab, kann am selben Tag ab
 * 14:00 Uhr der nächste Gast anreisen. Der Abreisetag einer Buchung darf
 * deshalb NIE automatisch als belegt gelten.
 *
 * Läuft ohne Netzwerk gegen synthetische iCal-Feeds: npm run verify-turnover
 */
import { blockedDatesFromICal } from "@/lib/ical";
import { findUnbookableStartDates, findValidCheckOutDates } from "@/lib/availability";
import { MIN_NIGHTS } from "@/lib/apartments";

interface TestCase {
  name: string;
  ical: string;
  expected: string[];
}

/** Baut einen minimalen iCal-Feed mit einem ganztägigen VEVENT. */
function feed(dtstart: string, dtend: string): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    "SUMMARY:CLOSED - Not available",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

const CASES: TestCase[] = [
  {
    name: "Abreisetag bleibt frei (Buchung 10.–14.)",
    ical: feed("20260810", "20260814"),
    expected: ["2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13"],
  },
  {
    name: "Einzelne Nacht blockiert nur den Anreisetag",
    ical: feed("20260803", "20260804"),
    expected: ["2026-08-03"],
  },
  {
    name: "Monatsübergreifende Buchung endet exklusiv",
    ical: feed("20261030", "20261101"),
    expected: ["2026-10-30", "2026-10-31"],
  },
  {
    name: "Lückenlose Anschlussbuchung: Wechseltag genau einmal belegt",
    ical:
      feed("20260805", "20260809").replace("END:VCALENDAR", "") +
      feed("20260809", "20260811").replace("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n", ""),
    expected: [
      "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08",
      "2026-08-09", "2026-08-10",
    ],
  },
  {
    name: "TRANSP:TRANSPARENT blockiert nicht",
    ical: feed("20260810", "20260814").replace(
      "SUMMARY:CLOSED - Not available",
      "TRANSP:TRANSPARENT"
    ),
    expected: [],
  },
];

let failed = 0;

for (const testCase of CASES) {
  const actual = blockedDatesFromICal(testCase.ical);
  const ok =
    actual.length === testCase.expected.length &&
    actual.every((d, i) => d === testCase.expected[i]);

  if (ok) {
    console.log(`  ✓ ${testCase.name}`);
  } else {
    failed++;
    console.error(`  ✗ ${testCase.name}`);
    console.error(`      erwartet: ${JSON.stringify(testCase.expected)}`);
    console.error(`      erhalten: ${JSON.stringify(actual)}`);
  }
}

// Mindestaufenthalt bleibt die einzige Quelle für die 2-Nächte-Regel
if (MIN_NIGHTS !== 2) {
  failed++;
  console.error(`  ✗ MIN_NIGHTS ist ${MIN_NIGHTS}, erwartet 2`);
} else {
  console.log("  ✓ MIN_NIGHTS = 2");
}

/**
 * Anreisetage ohne mögliche Buchung.
 * Nachgestellter Realfall vom 03.08.2026: pro Nacht ist zwar irgendeine Einheit
 * frei, aber keine einzelne Einheit zwei Nächte am Stück.
 */
const START_CASES: { name: string; units: Record<string, { blockedDates: string[] }>; from: string; expected: string[] }[] = [
  {
    name: "Keine Einheit 2 Nächte am Stück frei → 4. und 5. gesperrt",
    units: {
      "apt-1": { blockedDates: ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06"] },
      "apt-2": { blockedDates: ["2026-08-03", "2026-08-05", "2026-08-06", "2026-08-07"] },
      "apt-3": { blockedDates: ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07"] },
      "apt-gross": { blockedDates: ["2026-08-03", "2026-08-04", "2026-08-06", "2026-08-07"] },
      "apt-premium": { blockedDates: ["2026-08-03", "2026-08-04", "2026-08-06", "2026-08-07"] },
    },
    from: "2026-08-03",
    expected: ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06"],
  },
  {
    name: "Eine Einheit durchgehend frei → kein Tag gesperrt",
    units: {
      "apt-1": { blockedDates: ["2026-08-04", "2026-08-05"] },
      "apt-2": { blockedDates: [] },
    },
    from: "2026-08-03",
    expected: [],
  },
  {
    name: "Einzelner freier Tag zwischen zwei Sperren → als Anreise ungültig",
    units: {
      "apt-1": { blockedDates: ["2026-08-04", "2026-08-06"] },
    },
    from: "2026-08-03",
    expected: ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06"],
  },
];

for (const testCase of START_CASES) {
  const result = findUnbookableStartDates(
    testCase.units,
    new Date(testCase.from),
    MIN_NIGHTS,
    6 // nur das Testfenster prüfen
  );
  const actual = [...result].sort();
  const ok =
    actual.length === testCase.expected.length &&
    actual.every((d, i) => d === testCase.expected[i]);

  if (ok) {
    console.log(`  ✓ ${testCase.name}`);
  } else {
    failed++;
    console.error(`  ✗ ${testCase.name}`);
    console.error(`      erwartet: ${JSON.stringify(testCase.expected)}`);
    console.error(`      erhalten: ${JSON.stringify(actual)}`);
  }
}

/**
 * Mögliche Abreisetage.
 * Kernregel: Der Abreisetag selbst darf belegt sein – dort wird nur bis
 * Check-out ausgecheckt, der neue Gast reist erst am Nachmittag an.
 */
const CHECKOUT_CASES: {
  name: string;
  units: Record<string, { blockedDates: string[] }>;
  checkIn: string;
  expected: string[];
}[] = [
  {
    name: "Abreise am Anreisetag der Folgebuchung möglich (13. → 15.)",
    units: {
      // Nachstellung apt-gross: 15. belegt, 13. + 14. frei
      "apt-gross": { blockedDates: ["2026-08-12", "2026-08-15", "2026-08-16"] },
    },
    checkIn: "2026-08-13",
    expected: ["2026-08-15"],
  },
  {
    name: "Erster Sperrtag blockiert die Abreise nicht, spätere Nächte schon",
    units: {
      "apt-1": { blockedDates: ["2026-08-14"] },
    },
    checkIn: "2026-08-10",
    expected: ["2026-08-12", "2026-08-13", "2026-08-14"],
  },
  {
    name: "Anreisenacht belegt → gar keine Abreise möglich",
    units: {
      "apt-1": { blockedDates: ["2026-08-10"] },
    },
    checkIn: "2026-08-10",
    expected: [],
  },
  {
    name: "Mehrere Einheiten: längste durchgehende Kette gewinnt",
    units: {
      "apt-1": { blockedDates: ["2026-08-12"] },
      "apt-2": { blockedDates: ["2026-08-14"] },
    },
    checkIn: "2026-08-10",
    expected: ["2026-08-12", "2026-08-13", "2026-08-14"],
  },
];

for (const testCase of CHECKOUT_CASES) {
  const result = findValidCheckOutDates(
    testCase.units,
    new Date(testCase.checkIn),
    MIN_NIGHTS,
    6 // nur das Testfenster prüfen
  );
  const actual = [...result].sort();
  const ok =
    actual.length === testCase.expected.length &&
    actual.every((d, i) => d === testCase.expected[i]);

  if (ok) {
    console.log(`  ✓ ${testCase.name}`);
  } else {
    failed++;
    console.error(`  ✗ ${testCase.name}`);
    console.error(`      erwartet: ${JSON.stringify(testCase.expected)}`);
    console.error(`      erhalten: ${JSON.stringify(actual)}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} Prüfung(en) fehlgeschlagen.`);
  process.exit(1);
}
console.log("\nAlle Prüfungen bestanden.");
