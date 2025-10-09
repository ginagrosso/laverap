import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Droplet, Wind, Shirt, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";

// TODO: Replace with actual API call when backend is integrated
const mockServices = [
  {
    id: "1",
    nombre: "Lavado Express",
    descripcion: "Lavado rápido de ropa común",
    modeloDePrecio: "porCanasto" as const,
    precioPorCanasto: 800,
    itemsPorCanasto: 10,
    minimoItems: 5,
    icon: Droplet,
  },
  {
    id: "2",
    nombre: "Secado",
    descripcion: "Secado profesional de prendas",
    modeloDePrecio: "porCanasto" as const,
    precioPorCanasto: 600,
    itemsPorCanasto: 10,
    minimoItems: 5,
    icon: Wind,
  },
  {
    id: "3",
    nombre: "Planchado",
    descripcion: "Planchado y doblado de ropa",
    modeloDePrecio: "porUnidad" as const,
    precioBase: 150,
    minimoUnidades: 1,
    icon: Shirt,
  },
  {
    id: "4",
    nombre: "Lavado Delicado",
    descripcion: "Lavado especial para prendas delicadas",
    modeloDePrecio: "porUnidad" as const,
    precioBase: 300,
    minimoUnidades: 1,
    icon: Sparkles,
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestros Servicios</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Ofrecemos una amplia gama de servicios de lavandería para satisfacer todas tus necesidades
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{service.nombre}</CardTitle>
                    <CardDescription>{service.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant="secondary">
                        {service.modeloDePrecio === "porCanasto" ? "Por Canasto" : "Por Unidad"}
                      </Badge>

                      {service.modeloDePrecio === "porCanasto" ? (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-semibold text-lg text-foreground">
                            ${service.precioPorCanasto} por canasto
                          </p>
                          <p>Hasta {service.itemsPorCanasto} prendas</p>
                          <p>Mínimo: {service.minimoItems} prendas</p>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-semibold text-lg text-foreground">
                            Desde ${service.precioBase} por prenda
                          </p>
                          <p>Mínimo: {service.minimoUnidades} unidad</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/order/new">Crear un pedido ahora</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
