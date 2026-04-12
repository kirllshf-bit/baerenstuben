import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Welcome() {
  return (
    <section className="py-(--spacing-section-sm) md:py-(--spacing-section)">
      <Container narrow>
        <SectionHeading
          title="Ihr Zuhause auf Zeit"
          subtitle="Ankommen, wohlfühlen, genießen"
        />
        <div className="text-center max-w-2xl mx-auto space-y-5 text-warm-700 text-base md:text-lg leading-relaxed">
          <p>
            Die Bärenstuben bieten Ihnen mehr als nur eine Übernachtungsmöglichkeit.
            Unsere liebevoll eingerichteten Ferienwohnungen verbinden modernen Komfort
            mit einer warmen, einladenden Atmosphäre – damit Sie sich vom ersten Moment
            an wie zu Hause fühlen.
          </p>
          <p>
            Ob Städtereise, Familienurlaub oder geschäftlicher Aufenthalt: Bei uns
            finden Sie den perfekten Rückzugsort. Jedes unserer Apartments ist
            vollständig ausgestattet und bietet alles, was Sie für einen entspannten
            Aufenthalt benötigen.
          </p>
          <p className="text-warm-500 text-base md:text-base italic border-l-2 border-secondary pl-4 text-left">
            Planen Sie einen längeren Aufenthalt in Esens? Ob aus geschäftlichen Gründen
            oder für eine ausgedehnte Auszeit – wir bieten Ihnen gerne passende
            Langzeitmietoptionen an.
          </p>
        </div>
      </Container>
    </section>
  );
}
