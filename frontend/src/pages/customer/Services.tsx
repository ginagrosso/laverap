import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Droplet, Wind, Shirt, Sparkles, Package, AlertCircle } from "lucide-react";
import { Footer } from "@/components/Footer";
import { getServices } from "@/lib/services";
import { Service } from "@/types";

// Icon mapping helper
const getServiceIcon = (nombre: string) => {
  const lower = nombre.toLowerCase();
  if (lower.includes("lavado")) return Droplet;
  if (lower.includes("secado")) return Wind;
  if (lower.includes("planchado")) return Shirt;
  if (lower.includes("delicado")) return Sparkles;
  return Package;
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getServices();
        setServices(data);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("No pudimos cargar los servicios. Por favor, intentá nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

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
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="w-12 h-12 rounded-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-24 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && services.length === 0 && (
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay servicios disponibles</h3>
                <p className="text-muted-foreground">
                  Estamos trabajando para ofrecerte los mejores servicios pronto.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Services List */}
          {!isLoading && !error && services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => {
                const Icon = getServiceIcon(service.nombre);

                return (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle>{service.nombre}</CardTitle>
                      <CardDescription>
                        {service.descripcion || "Servicio de lavandería profesional"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge variant="secondary">
                          {service.modeloDePrecio === "porCanasto" && "Por Canasto"}
                          {service.modeloDePrecio === "porUnidad" && "Por Unidad"}
                          {service.modeloDePrecio === "paqueteConAdicional" && "Paquete"}
                          {service.modeloDePrecio === "porOpciones" && "Por Opción"}
                          {service.modeloDePrecio === "porOpcionesMultiples" && "Múltiples Opciones"}
                        </Badge>

                        {service.modeloDePrecio === "porCanasto" && (
                          <div className="text-sm text-muted-foreground">
                            <p className="font-semibold text-lg text-foreground">
                              ${service.precioPorCanasto} por canasto
                            </p>
                            <p>Hasta {service.itemsPorCanasto} prendas</p>
                            <p>Mínimo: {service.minimoItems} prendas</p>
                          </div>
                        )}

                        {service.modeloDePrecio === "porUnidad" && (
                          <div className="text-sm text-muted-foreground">
                            <p className="font-semibold text-lg text-foreground">
                              Desde ${service.precioBase} por unidad
                            </p>
                            <p>Mínimo: {service.minimoUnidades} unidad(es)</p>
                          </div>
                        )}

                        {service.modeloDePrecio === "paqueteConAdicional" && (
                          <div className="text-sm text-muted-foreground">
                            <p className="font-semibold text-lg text-foreground">
                              Desde ${service.precioBase}
                            </p>
                            {service.adicionales && (
                              <p>+ Adicionales disponibles</p>
                            )}
                          </div>
                        )}

                        {(service.modeloDePrecio === "porOpciones" || service.modeloDePrecio === "porOpcionesMultiples") && (
                          <div className="text-sm text-muted-foreground">
                            <p className="font-semibold text-lg text-foreground">
                              {service.precioBase ? `Desde $${service.precioBase}` : "Precio variable"}
                            </p>
                            <p>Según opciones seleccionadas</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* CTA */}
          {!isLoading && !error && services.length > 0 && (
            <div className="text-center mt-12">
              <Button size="lg" asChild>
                <Link to="/order/new">Crear un pedido ahora</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}