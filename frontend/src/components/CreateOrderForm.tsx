import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Combobox } from "./ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Loader2, AlertCircle, Plus, Copy } from "lucide-react";
import { toast } from "sonner";
import { getServices } from "@/lib/services";
import { createOrder } from "@/lib/orders";
import { getAllUsers, createUser } from "@/lib/users";
import { useAuth } from "@/context/AuthContext";
import { Service, CreateOrderRequest, User, CreateUserRequest } from "@/types";

export const CreateOrderForm = () => {
  const navigate = useNavigate();
  const { token, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = hasRole("admin");

  // Fetch active services using React Query
  const { data: services = [], isLoading: isLoadingServices, error } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  // Fetch users for admin (filtered to only clients)
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "cliente"],
    queryFn: () => getAllUsers({ rol: "cliente", activo: true }, token!),
    enabled: isAdmin && !!token,
  });

  const users = usersResponse?.data || [];

  // Admin client selection state
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  // Password modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [tempPasswordData, setTempPasswordData] = useState<{
    clientName: string;
    email: string;
    password: string;
  } | null>(null);

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [incluyePlanchado, setIncluyePlanchado] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string>("");
  const [opcionesMultiples, setOpcionesMultiples] = useState<Record<string, string>>({});
  const [observaciones, setObservaciones] = useState<string>("");

  const selectedService = services.find((s) => s.id === selectedServiceId);

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data, token!),
    onSuccess: (response) => {
      // Refetch users to include the new client
      queryClient.invalidateQueries({ queryKey: ["users", "cliente"] });

      // Auto-select the new client
      setSelectedClientId(response.data.usuario.id);

      // Close modal and reset form
      setIsCreateClientModalOpen(false);
      setNewClientData({ nombre: "", email: "", telefono: "" });

      // Save password data and open password modal
      setTempPasswordData({
        clientName: response.data.usuario.nombre,
        email: response.data.usuario.email,
        password: response.data.credenciales.password,
      });
      setPasswordModalOpen(true);
    },
    onError: (error: any) => {
      toast.error("Error al crear cliente", {
        description: error.message || "Por favor intentá nuevamente.",
      });
    },
  });

  const handleCreateClient = () => {
    if (!newClientData.nombre.trim() || !newClientData.email.trim()) {
      toast.error("Nombre y email son obligatorios");
      return;
    }

    const requestData: CreateUserRequest = {
      nombre: newClientData.nombre.trim(),
      email: newClientData.email.trim(),
      telefono: newClientData.telefono.trim() || undefined,
      rol: "cliente",
    };

    createClientMutation.mutate(requestData);
  };

  const handleCopyPassword = async () => {
    if (tempPasswordData?.password) {
      await navigator.clipboard.writeText(tempPasswordData.password);
      toast.success("Contraseña copiada al portapapeles");
    }
  };

  // Reset options when service changes
  useEffect(() => {
    setOpcionSeleccionada("");
    setOpcionesMultiples({});
    setIncluyePlanchado(false);
    setCantidad(1);
  }, [selectedServiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate client selection for admins
    if (isAdmin && !selectedClientId) {
      toast.error("Por favor seleccioná un cliente");
      return;
    }

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

      // Include clienteId if admin is creating order for a client
      if (isAdmin && selectedClientId) {
        orderData.clienteId = selectedClientId;
      }

      const order = await createOrder(orderData, token);

      toast.success("¡Pedido creado exitosamente!", {
        description: `Tu pedido ${order.id} ha sido registrado.`,
      });

      // Redirect based on user role
      setTimeout(() => {
        navigate(isAdmin ? "/admin/orders" : "/order/track");
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

      default:
        total = 0;
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
                <AlertDescription>
                  No pudimos cargar los servicios disponibles. Por favor, intentá recargar la página.
                </AlertDescription>
              </Alert>
            )}

            {/* Form */}
            {!isLoadingServices && !error && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Admin: Client Selection */}
                {isAdmin && (
                  <div className="space-y-2 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Label>Cliente *</Label>
                      <Dialog open={isCreateClientModalOpen} onOpenChange={setIsCreateClientModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Crear cliente rápido
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Crear nuevo cliente</DialogTitle>
                            <DialogDescription>
                              Se generará una contraseña temporal aleatoria que se mostrará solo una vez después de crear el cliente.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="new-client-nombre">Nombre completo *</Label>
                              <Input
                                id="new-client-nombre"
                                value={newClientData.nombre}
                                onChange={(e) =>
                                  setNewClientData({ ...newClientData, nombre: e.target.value })
                                }
                                placeholder="Ej: Juan Pérez"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-client-email">Email *</Label>
                              <Input
                                id="new-client-email"
                                type="email"
                                value={newClientData.email}
                                onChange={(e) =>
                                  setNewClientData({ ...newClientData, email: e.target.value })
                                }
                                placeholder="ejemplo@correo.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-client-telefono">Teléfono (opcional)</Label>
                              <Input
                                id="new-client-telefono"
                                type="tel"
                                value={newClientData.telefono}
                                onChange={(e) =>
                                  setNewClientData({ ...newClientData, telefono: e.target.value })
                                }
                                placeholder="Ej: 3512345678"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsCreateClientModalOpen(false)}
                              disabled={createClientMutation.isPending}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              onClick={handleCreateClient}
                              disabled={createClientMutation.isPending}
                            >
                              {createClientMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Crear cliente
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Password Display Modal */}
                      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">¡Cliente creado exitosamente!</DialogTitle>
                            <DialogDescription>
                              Guardá esta contraseña temporal. Solo se mostrará una vez.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            {/* Client Info */}
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">Cliente:</div>
                              <div className="font-semibold text-lg">{tempPasswordData?.clientName}</div>
                              <div className="text-sm text-muted-foreground">{tempPasswordData?.email}</div>
                            </div>

                            {/* Password Display */}
                            <div className="space-y-2">
                              <div className="text-sm font-medium">Contraseña temporal:</div>
                              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
                                <code className="text-3xl font-mono font-bold text-gray-900 select-all">
                                  {tempPasswordData?.password}
                                </code>
                              </div>
                            </div>

                            {/* Warning Alert */}
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>¡Importante!</strong> Esta contraseña solo se muestra una vez. 
                                Copiala y compartila con el cliente de forma segura.
                              </AlertDescription>
                            </Alert>
                          </div>

                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button
                              type="button"
                              onClick={handleCopyPassword}
                              className="w-full sm:flex-1 bg-green-600 hover:bg-green-700"
                              size="lg"
                            >
                              <Copy className="mr-2 h-5 w-5" />
                              Copiar contraseña
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setPasswordModalOpen(false)}
                              className="w-full sm:flex-1"
                              size="lg"
                            >
                              Cerrar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {isLoadingUsers ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Combobox
                        items={users.map((user) => ({
                          value: user.id,
                          label: `${user.nombre} (${user.email})`,
                        }))}
                        value={selectedClientId}
                        onValueChange={setSelectedClientId}
                        placeholder="Seleccioná un cliente..."
                        searchPlaceholder="Buscar cliente..."
                        emptyMessage="No se encontraron clientes."
                        disabled={isSubmitting}
                      />
                    )}
                  </div>
                )}

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
                          {service.nombre}
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