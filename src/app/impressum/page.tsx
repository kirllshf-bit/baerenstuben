import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-28 pb-20">
        <Container narrow>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-primary-dark mb-10">
            Impressum
          </h1>

          <div className="space-y-8 text-warm-700 text-base leading-relaxed">
            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                Angaben gemäß § 5 DDG
              </h2>
              <p>
                Javed Mirza<br />
                Bahnhofstraße 65<br />
                26427 Esens
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                Kontakt
              </h2>
              <p>
                Telefon: <a href="tel:+491623994428" className="hover:text-primary transition-colors">+49 (0) 162 3994428</a><br />
                E-Mail: info@bärenstuben.de
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                Umsatzsteuer-ID
              </h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE61257009842
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                EU-Streitschlichtung
              </h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
                bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary-light"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                .<br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                Verbraucherstreitbeilegung / Universalschlichtungsstelle
              </h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
                vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                Haftung für Inhalte
              </h2>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
                auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
                bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
                übermittelte oder gespeicherte fremde Informationen zu überwachen oder
                nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
              <p className="mt-2">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
                nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche
                Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
                Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
                Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                Haftung für Links
              </h2>
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
                wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte
                auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist
                stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die
                verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
                Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
                Verlinkung nicht erkennbar.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                Urheberrecht
              </h2>
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
                Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
                bzw. Erstellers.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-warm-200">
            <Link
              href="/"
              className="text-primary font-medium hover:text-primary-light transition-colors"
            >
              ← Zurück zur Startseite
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
