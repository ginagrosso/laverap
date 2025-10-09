import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Precios Transparentes</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Sin sorpresas. Sabés exactamente cuánto vas a pagar antes de confirmar tu pedido.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Por Canasto */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl">Servicios por Canasto</CardTitle>
                <CardDescription>Para lavado y secado en grandes cantidades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-primary">$800</div>
                <p className="text-muted-foreground">por canasto de hasta 10 prendas</p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Lavado express de ropa común</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Secado profesional incluido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Las sábanas de 2 plazas cuentan como 2 prendas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Mínimo 5 prendas por pedido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Tiempo estimado: 24-48 horas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Por Unidad */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl">Servicios por Unidad</CardTitle>
                <CardDescription>Para prendas especiales y planchado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-primary">Desde $150</div>
                <p className="text-muted-foreground">por prenda</p>

                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Planchado profesional - $150/prenda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Lavado delicado - $300/prenda</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Tratamiento especial para telas delicadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Doblado y empaquetado cuidadoso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Tiempo estimado: 12-24 horas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="mt-12 space-y-6">
            <Card className="bg-accent/10">
              <CardHeader>
                <CardTitle>¿Cómo funciona el precio estimado?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>
                  • Al crear tu pedido, seleccionás el servicio y la cantidad de prendas
                </p>
                <p>
                  • El sistema calcula automáticamente un precio estimado
                </p>
                <p>
                  • Cuando dejás tu ropa en el local, confirmamos el peso/cantidad exacta
                </p>
                <p>
                  • El precio final se ajusta si es necesario (siempre te informamos antes)
                </p>
                <p>
                  • Pagás al retirar tu pedido (efectivo o transferencia)
                </p>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link to="/order/new">Calcular mi pedido</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
