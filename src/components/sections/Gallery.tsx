import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GallerySlider } from "./GallerySlider";

const GALLERY_SECTIONS = [
  {
    title: "Apartment",
    subtitle: "49 m² · Bis zu 4 Personen · Ab 130 € / Nacht",
    images: [
      "/images/apartments/apartment/IMG_6489.jpeg",
      "/images/apartments/apartment/IMG_6497.jpeg",
      "/images/apartments/apartment/IMG_6500.jpeg",
      "/images/apartments/apartment/IMG_6525.jpeg",
      "/images/apartments/apartment/IMG_6545.jpeg",
      "/images/apartments/apartment/IMG_6552.jpeg",
      "/images/apartments/apartment/IMG_6563.jpeg",
      "/images/apartments/apartment/IMG_6590.jpeg",
      "/images/apartments/apartment/IMG_6623.jpeg",
      "/images/apartments/apartment/IMG_6784.jpeg",
      "/images/apartments/apartment/IMG_6804 2.jpeg",
      "/images/apartments/apartment/IMG_6811.jpeg",
      "/images/apartments/apartment/IMG_3988.jpeg",
    ],
  },
  {
    title: "Apartment Groß",
    subtitle: "58 m² · Bis zu 4 Personen · Ab 140 € / Nacht",
    images: [
      "/images/apartments/apartment-gross/IMG_6635.jpeg",
      "/images/apartments/apartment-gross/IMG_6636.jpeg",
      "/images/apartments/apartment-gross/IMG_6639.jpeg",
      "/images/apartments/apartment-gross/IMG_6643.jpeg",
      "/images/apartments/apartment-gross/IMG_6644.jpeg",
      "/images/apartments/apartment-gross/IMG_6668.jpeg",
      "/images/apartments/apartment-gross/IMG_6673.jpeg",
      "/images/apartments/apartment-gross/IMG_6676.jpeg",
      "/images/apartments/apartment-gross/IMG_6747.jpeg",
      "/images/apartments/apartment/IMG_3988.jpeg",
    ],
  },
  {
    title: "Apartment Premium",
    subtitle: "60 m² · Bis zu 5 Personen · Ab 170 € / Nacht",
    images: [
      "/images/apartments/apartment-premium/IMG_6704.jpeg",
      "/images/apartments/apartment-premium/IMG_6708.jpeg",
      "/images/apartments/apartment-premium/IMG_6712.jpeg",
      "/images/apartments/apartment-premium/IMG_6727.jpeg",
      "/images/apartments/apartment-premium/IMG_6730.jpeg",
      "/images/apartments/apartment/IMG_3988.jpeg",
    ],
  },
];

export function Gallery() {
  return (
    <section id="galerie" className="py-(--spacing-section-sm) md:py-(--spacing-section) bg-primary-pale/50">
      <Container>
        <SectionHeading
          title="Einblicke in unsere Apartments"
          subtitle="Machen Sie sich ein Bild von Ihrem Zuhause auf Zeit"
        />

        <div className="space-y-14 md:space-y-20">
          {GALLERY_SECTIONS.map((section) => (
            <GallerySlider
              key={section.title}
              title={section.title}
              subtitle={section.subtitle}
              images={section.images}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
