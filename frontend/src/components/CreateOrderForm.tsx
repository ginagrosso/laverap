import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getServices } from "@/lib/services";
import { createOrder } from "@/lib/orders";
import { useAuth } from "@/context/AuthContext";
import { Service, CreateOrderRequest } from "@/types";

export const CreateOrderForm = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [incluyePlanchado, setIncluyePlanchado] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string>("");
  const [opcionesMultiples, setOpcionesMultiples] = useState<Record<string, string>>({});
  const [observaciones, setObservaciones] = useState<string>("");

  // Load services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const data = await getServices();
        setServices(data);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("No pudimos cargar los servicios disponibles.");
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Reset options when service changes
  useEffect(() => {
    setOpcionSeleccionada("");
    setOpcionesMultiples({});
    setIncluyePlanchado(false);
    setCantidad(1);
  }, [selectedServiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedServiceId) {
      toast.error("Por favor seleccioná un servicio");
      return;
    }

    if (!token) {
      toast.error("Necesitás iniciar sesión para crear un pedido");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build the order request based on service type
      let detalle: any = { cantidad };

      switch (selectedService?.modeloDePrecio) {
        case "paqueteConAdicional":
          detalle.incluyePlanchado = incluyePlanchado;
          break;
        case "porOpciones":
          if (!opcionSeleccionada) {
            toast.error("Por favor seleccioná una opción");
            setIsSubmitting(false);
            return;
          }
          detalle.opcion = opcionSeleccionada;
          break;
        case "porOpcionesMultiples":
          if (!selectedService.opciones) {
            toast.error("Este servicio no tiene opciones configuradas");
            setIsSubmitting(false);
            return;
          }
          const categorias = Object.keys(selectedService.opciones);
          for (const categoria of categorias) {
            if (!opcionesMultiples[categoria]) {
              toast.error(`Por favor seleccioná una opción para ${categoria}`);
              setIsSubmitting(false);
              return;
            }
          }
          detalle.opciones = opcionesMultiples;
          break;
      }

      const orderData: CreateOrderRequest = {
        servicioId: selectedServiceId,
        detalle,
        observaciones: observaciones.trim() || null,
      };

      const order = await createOrder(orderData, token);

      toast.success("¡Pedido creado exitosamente!", {
        description: `Tu pedido ${order.id} ha sido registrado.`,
      });

      // Redirect to track orders page
      setTimeout(() => {
        navigate("/order/track");
      }, 1500);
    } catch (err: any) {
      console.error("Error creating order:", err);
      toast.error("Error al crear el pedido", {
        description: err.message || "Por favor intentá nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate estimated price
  const calculateEstimatedPrice = () => {
    if (!selectedService) return 0;

    let total = 0;

    switch (selectedService.modeloDePrecio) {
      case "paqueteConAdicional":
        total = cantidad * (selectedService.precioBase || 0);
        if (incluyePlanchado && selectedService.adicionales?.planchado) {
          total += cantidad * selectedService.adicionales.planchado;
        }
        break;

      case "porOpciones":
        if (opcionSeleccionada && selectedService.opciones) {
          const precioOpcion = selectedService.opciones[opcionSeleccionada];
          if (typeof precioOpcion === 'number') {
            total = cantidad * precioOpcion;
          }
        }
        break;

      case "porOpcionesMultiples":
        if (selectedService.opciones) {
          let precioCalculado = selectedService.precioBase || 0;
          const categorias = Object.keys(selectedService.opciones);

          for (const categoria of categorias) {
            const seleccion = opcionesMultiples[categoria];
            if (seleccion) {
              const opcionesCat = selectedService.opciones[categoria];
              if (typeof opcionesCat === 'object' && !Array.isArray(opcionesCat)) {
                const valorOpcion = opcionesCat[seleccion];
                if (typeof valorOpcion === 'number') {
                  precioCalculado += valorOpcion;
                }
              }
            }
          }

          total = cantidad * precioCalculado;
        }
        break;

      case "porCanasto":
        total = Math.ceil(cantidad / (selectedService.itemsPorCanasto || 1)) * (selectedService.precioPorCanasto || 0);
        break;

      case "porUnidad":
        total = cantidad * (selectedService.precioBase || 0);
        break;

      default:
        total = cantidad * (selectedService.precioBase || 100);
    }

    return total;
  };

  const estimatedPrice = calculateEstimatedPrice();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Crear Pedido</CardTitle>
            <CardDescription className="text-center text-lg">
              Seleccioná un servicio y configurá tu pedido
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {isLoadingServices && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoadingServices && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            {!isLoadingServices && !error && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Selection */}
                <div className="space-y-2">
                  <Label htmlFor="service">Servicio *</Label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Seleccioná un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.nombre} - {service.modeloDePrecio === "porCanasto" && `$${service.precioPorCanasto}/canasto`}
                          {service.modeloDePrecio === "porUnidad" && `$${service.precioBase}/unidad`}
                          {service.modeloDePrecio === "paqueteConAdicional" && `$${service.precioBase} base`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedService?.descripcion && (
                    <p className="text-sm text-muted-foreground">{selectedService.descripcion}</p>
                  )}
                </div>

                {/* Cantidad */}
                <div className="space-y-2">
                  <Label htmlFor="cantidad">
                    Cantidad *{" "}
                    {selectedService?.modeloDePrecio === "porCanasto" && "(prendas)"}
                    {selectedService?.modeloDePrecio === "porUnidad" && "(unidades)"}
                    {selectedService?.modeloDePrecio === "paqueteConAdicional" && "(paquetes)"}
                  </Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    required
                    disabled={isSubmitting}
                  />
                  {selectedService?.minimoUnidades && (
                    <p className="text-sm text-muted-foreground">
                      Mínimo: {selectedService.minimoUnidades} unidad(es)
                    </p>
                  )}
                  {selectedService?.minimoItems && (
                    <p className="text-sm text-muted-foreground">
                      Mínimo: {selectedService.minimoItems} prendas
                    </p>
                  )}
                </div>

                {/* Planchado option for paqueteConAdicional */}
                {selectedService?.modeloDePrecio === "paqueteConAdicional" &&
                  selectedService.adicionales?.planchado && (
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <input
                        type="checkbox"
                        id="planchado"
                        checked={incluyePlanchado}
                        onChange={(e) => setIncluyePlanchado(e.target.checked)}
                        className="w-4 h-4"
                        disabled={isSubmitting}
                        aria-label="Incluir planchado"
                      />
                      <Label htmlFor="planchado" className="cursor-pointer">
                        Incluir planchado (+${selectedService.adicionales.planchado} por paquete)
                      </Label>
                    </div>
                  )}

                {/* Opción simple para porOpciones */}
                {selectedService?.modeloDePrecio === "porOpciones" && selectedService.opciones && (
                  <div className="space-y-2">
                    <Label htmlFor="opcion">Seleccionar opción *</Label>
                    <Select value={opcionSeleccionada} onValueChange={setOpcionSeleccionada}>
                      <SelectTrigger id="opcion">
                        <SelectValue placeholder="Seleccioná una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(selectedService.opciones).map(([key, value]) => (
                          typeof value === 'number' && (
                            <SelectItem key={key} value={key}>
                              {key} - ${value}
                            </SelectItem>
                          )
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Opciones múltiples para porOpcionesMultiples */}
                {selectedService?.modeloDePrecio === "porOpcionesMultiples" && selectedService.opciones && (
                  <div className="space-y-4">
                    {Object.entries(selectedService.opciones).map(([categoria, opciones]) => {
                      if (typeof opciones === 'object' && !Array.isArray(opciones)) {
                        return (
                          <div key={categoria} className="space-y-2">
                            <Label htmlFor={`opcion-${categoria}`}>{categoria} *</Label>
                            <Select
                              value={opcionesMultiples[categoria] || ""}
                              onValueChange={(value) =>
                                setOpcionesMultiples(prev => ({ ...prev, [categoria]: value }))
                              }
                            >
                              <SelectTrigger id={`opcion-${categoria}`}>
                                <SelectValue placeholder={`Seleccioná ${categoria.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(opciones).map(([opcion, precio]) => (
                                  <SelectItem key={opcion} value={opcion}>
                                    {opcion} {typeof precio === 'number' && precio > 0 ? `(+$${precio})` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                {/* Observaciones */}
                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Ej: sin suavizante, prenda delicada..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Price Estimate */}
                {selectedServiceId && (
                  <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Precio estimado:</span>
                      <span className="text-3xl font-bold text-accent">${estimatedPrice}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Este es un precio estimado. El precio final será confirmado en el local.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full text-lg py-6"
                  disabled={!selectedServiceId || isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isSubmitting ? "Creando pedido..." : "Confirmar pedido"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};