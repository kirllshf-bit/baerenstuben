import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
};

export default function DatenschutzPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-28 pb-20">
        <Container narrow>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-primary-dark mb-10">
            Datenschutzerklärung
          </h1>

          <div className="space-y-8 text-warm-700 text-base leading-relaxed">
            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                1. Verantwortlicher
              </h2>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="mt-2">
                Javed Mirza<br />
                Bahnhofstraße 65<br />
                26427 Esens<br />
                E-Mail: info@bärenstuben.de<br />
                Telefon: +49 (0) 162 3994428
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                2. Allgemeine Hinweise zur Datenverarbeitung
              </h2>
              <p>
                Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Wir verarbeiten
                personenbezogene Daten ausschließlich im Rahmen der geltenden gesetzlichen
                Vorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO).
              </p>
              <p className="mt-2">
                Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert
                werden können. Dazu gehören insbesondere Name, E-Mail-Adresse, Telefonnummer,
                IP-Adresse sowie weitere Angaben, die Sie uns freiwillig übermitteln.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                3. Hosting
              </h2>
              <p>
                Diese Website wird bei Hostinger gehostet. Im Rahmen des Hostings können
                personenbezogene Daten verarbeitet werden, die für den technischen Betrieb
                der Website erforderlich sind. Dazu gehören insbesondere technische
                Verbindungs- und Nutzungsdaten, die bei der Bereitstellung und Absicherung
                von Websites typischerweise anfallen. Die Verarbeitung erfolgt zum Zweck der
                sicheren Bereitstellung, Stabilität und Sicherheit dieser Website.
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                4. Kontaktaufnahme / Anfrageformular
              </h2>
              <p>
                Wenn Sie uns per Anfrageformular oder per E-Mail kontaktieren, verarbeiten
                wir die von Ihnen mitgeteilten Daten zur Bearbeitung Ihrer Anfrage. Dabei
                können insbesondere folgende Daten verarbeitet werden:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Name</li>
                <li>E-Mail-Adresse</li>
                <li>Telefonnummer</li>
                <li>Inhalt Ihrer Nachricht</li>
                <li>weitere freiwillig angegebene Angaben</li>
              </ul>
              <p className="mt-2">
                Die über das Formular übermittelten Angaben werden an uns weitergeleitet und
                in unserem IONOS-Postfach empfangen. Die Verarbeitung erfolgt zur Bearbeitung
                Ihrer Anfrage und zur Kommunikation mit Ihnen.
              </p>
              <p className="mt-2">
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der
                Anbahnung oder Durchführung eines Vertrags zusammenhängt. In allen übrigen
                Fällen erfolgt die Verarbeitung auf Grundlage unseres berechtigten Interesses
                an einer ordnungsgemäßen Bearbeitung von Anfragen gemäß Art. 6 Abs. 1
                lit. f DSGVO.
              </p>
              <p className="mt-2">
                Wir speichern Ihre Daten nur so lange, wie dies zur Bearbeitung Ihrer Anfrage
                erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                5. Google Fonts
              </h2>
              <p>
                Auf dieser Website werden Google Fonts genutzt. Sofern die Schriftarten nicht
                lokal gespeichert sind, werden sie beim Aufruf der Website von Servern von
                Google geladen. Die Nutzung dient einer einheitlichen und ansprechenden
                Darstellung unseres Onlineangebots. Rechtsgrundlage ist Art. 6 Abs. 1
                lit. f DSGVO.
              </p>
              <p className="mt-2">
                Dabei kann es auch zu einer Übermittlung personenbezogener Daten in die USA kommen.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                6. Mapbox
              </h2>
              <p>
                Auf dieser Website werden Funktionen von Mapbox verwendet. Bei der Nutzung
                solcher Karten- oder Standortfunktionen kann es technisch erforderlich sein,
                dass personenbezogene Daten, insbesondere die IP-Adresse, an Mapbox übermittelt
                werden. Die Verarbeitung erfolgt zur Bereitstellung der Karten- und
                Standortfunktionen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; sofern
                eine vorgeschaltete Einwilligungslösung verwendet wird, kann die Verarbeitung
                auch auf Art. 6 Abs. 1 lit. a DSGVO beruhen.
              </p>
              <p className="mt-2">
                Auch hierbei kann eine Übermittlung in die USA stattfinden.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                7. Google Maps
              </h2>
              <p>
                Auf dieser Website ist Google Maps eingebettet. Beim Aufruf einer Seite mit
                eingebetteter Karte wird eine Verbindung zu Servern von Google hergestellt.
                Dabei können insbesondere Ihre IP-Adresse sowie weitere technische
                Nutzungsdaten verarbeitet werden.
              </p>
              <p className="mt-2">
                Die Einbindung erfolgt zur nutzerfreundlichen Darstellung unseres Standorts
                und zur besseren Auffindbarkeit. Rechtsgrundlage ist Art. 6 Abs. 1
                lit. f DSGVO; sofern die Karte erst nach einer Einwilligung geladen wird,
                ist Art. 6 Abs. 1 lit. a DSGVO maßgeblich.
              </p>
              <p className="mt-2">
                Dabei kann es zu einer Übermittlung personenbezogener Daten in die USA kommen.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                8. Instagram
              </h2>
              <p>
                Auf unserer Website befindet sich ein Button/Link zu Instagram. Es handelt
                sich nicht um einen eingebetteten Feed und nicht um ein Social-Plugin, sondern
                um einen externen Verweis. Wenn Sie diesen Button anklicken, verlassen Sie
                unsere Website und werden auf die Seiten von Meta bzw. Instagram weitergeleitet.
                Ab diesem Zeitpunkt erfolgt die Datenverarbeitung durch den jeweiligen Anbieter
                in eigener Verantwortung.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                9. Externe Links
              </h2>
              <p>
                Diese Website enthält externe Links, insbesondere zu Instagram und
                gegebenenfalls weiteren Drittanbietern. Für Inhalte und Datenverarbeitung
                auf externen Websites sind ausschließlich deren jeweilige Betreiber
                verantwortlich.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                10. Empfänger von Daten
              </h2>
              <p>
                Empfänger personenbezogener Daten können insbesondere sein:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Hostinger als Hosting-Anbieter</li>
                <li>IONOS als E-Mail-Anbieter/Postfachdienst</li>
                <li>Google im Zusammenhang mit Google Fonts und Google Maps</li>
                <li>Mapbox im Zusammenhang mit Karten- und Standortfunktionen</li>
                <li>Meta/Instagram nach dem Anklicken externer Links</li>
              </ul>
              <p className="mt-2">
                Eine Übermittlung an Dritte erfolgt nur, soweit dies zur technischen
                Bereitstellung der Website, zur Bearbeitung Ihrer Anfrage oder zur Nutzung
                eingebundener Funktionen erforderlich ist.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                11. Speicherdauer
              </h2>
              <p>
                Wir speichern personenbezogene Daten nur so lange, wie dies für die jeweiligen
                Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
                Anschließend werden die Daten gelöscht, sofern keine weitere Aufbewahrung
                rechtlich erforderlich ist.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                12. Ihre Rechte
              </h2>
              <p>
                Sie haben nach der DSGVO insbesondere folgende Rechte:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Recht auf Auskunft</li>
                <li>Recht auf Berichtigung</li>
                <li>Recht auf Löschung</li>
                <li>Recht auf Einschränkung der Verarbeitung</li>
                <li>Recht auf Datenübertragbarkeit</li>
                <li>Recht auf Widerspruch</li>
                <li>Recht auf Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-medium text-primary-dark mb-3">
                13. Beschwerderecht bei einer Aufsichtsbehörde
              </h2>
              <p>
                Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren,
                insbesondere in dem Mitgliedstaat Ihres gewöhnlichen Aufenthaltsorts, Ihres
                Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.
              </p>
            </section>

            <section>
              <p className="text-warm-500 text-sm">
                Stand: April 2026
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-warm-200">
            <Link
              href="/"
              className="text-primary font-medium hover:text-primary-light transition-colors"
            >
              &larr; Zurück zur Startseite
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
