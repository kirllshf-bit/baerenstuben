import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center pt-20 pb-20">
        <Container narrow className="text-center">
          <p className="text-7xl font-serif font-medium text-primary/20 mb-4">404</p>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-primary-dark mb-4">
            Seite nicht gefunden
          </h1>
          <p className="text-warm-500 text-lg mb-8">
            Die gesuchte Seite existiert leider nicht oder wurde verschoben.
          </p>
          <Link href="/">
            <Button variant="primary" size="lg">
              Zur Startseite
            </Button>
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  );
}
