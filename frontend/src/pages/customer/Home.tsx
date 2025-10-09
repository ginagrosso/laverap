import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Hero />

      {/* CTA Section */}
      <section className="py-12 bg-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Listo para comenzar?</h2>
          {isAuthenticated ? (
            <Button size="lg" asChild>
              <Link to="/order/new">Crear mi primer pedido</Link>
            </Button>
          ) : (
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">Registrarse</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/services">Ver servicios</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
}
