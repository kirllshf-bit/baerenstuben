import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { USPs } from "@/components/sections/USPs";
import { Welcome } from "@/components/sections/Welcome";
import { Location } from "@/components/sections/Location";
import { Amenities } from "@/components/sections/Amenities";
import { Gallery } from "@/components/sections/Gallery";
import { AvailabilityInquiry } from "@/components/sections/AvailabilityInquiry";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Bärenstuben Ferienwohnungen",
  description:
    "Komfortable Ferienwohnungen in Esens. Modern eingerichtete Apartments für Ihren erholsamen Aufenthalt.",
  url: "https://www.xn--brenstuben-q5a.de",
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Esens",
    addressCountry: "DE",
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "WLAN", value: true },
    { "@type": "LocationFeatureSpecification", name: "Parkplatz", value: true },
    { "@type": "LocationFeatureSpecification", name: "Bettwäsche", value: true },
  ],
  numberOfRooms: 5,
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <USPs />
        <Welcome />
        <Location />
        <Amenities />
        <Gallery />
        <AvailabilityInquiry />
      </main>
      <Footer />
    </>
  );
}
