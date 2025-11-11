import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { Package, Clock, Loader2, CheckCircle, TruckIcon, AlertCircle, XCircle } from "lucide-react";
import { Footer } from "@/components/Footer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getMyOrders, cancelOrder } from "@/lib/orders";
import { useAuth } from "@/context/AuthContext";
import { Order } from "@/types";
import { toast } from "sonner";

const statusConfig = {
  "Pendiente": {
    icon: Clock,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    label: "Pendiente",
  },
  "En Proceso": {
    icon: Loader2,
    color: "bg-amber-500",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    label: "En Proceso",
  },
  "Finalizado": {
    icon: CheckCircle,
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    label: "Finalizado",
  },
  "Entregado": {
    icon: TruckIcon,
    color: "bg-slate-500",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50",
    label: "Entregado",
  },
  "Cancelado": {
    icon: XCircle,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    label: "Cancelado",
  },
};

const formatDate = (date: Date | string | { seconds: number; nanoseconds: number } | { _seconds: number; _nanoseconds: number }) => {
  try {
    if (!date) {
      return "Fecha no disponible";
    }

    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      return format(date, "dd MMM yyyy", { locale: es });
    }

    // Handle string dates
    if (typeof date === "string") {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return "Fecha inválida";
      }
      return format(parsedDate, "dd MMM yyyy", { locale: es });
    }

    // Handle Firestore timestamp (with underscores - this is how it comes from API)
    if (date && typeof date === "object" && "_seconds" in date) {
      const parsedDate = new Date((date as any)._seconds * 1000);
      if (isNaN(parsedDate.getTime())) {
        return "Fecha inválida";
      }
      return format(parsedDate, "dd MMM yyyy", { locale: es });
    }

    // Handle Firestore timestamp (without underscores - alternative format)
    if (date && typeof date === "object" && "seconds" in date) {
      const parsedDate = new Date((date as any).seconds * 1000);
      if (isNaN(parsedDate.getTime())) {
        return "Fecha inválida";
      }
      return format(parsedDate, "dd MMM yyyy", { locale: es });
    }

    return "Fecha no disponible";
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "Fecha inválida";
  }
};

export default function TrackOrder() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cancel order states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelObservaciones, setCancelObservaciones] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getMyOrders(token);
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("No pudimos cargar tus pedidos. Por favor, intentá nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [token, isAuthenticated]);

  const handleOpenCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setCancelObservaciones("");
    setCancelDialogOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || !token) return;

    try {
      setIsCanceling(true);
      await cancelOrder(orderToCancel.id, token, cancelObservaciones.trim() || undefined);
      
      toast.success("Pedido cancelado", {
        description: `El pedido ${orderToCancel.id} ha sido cancelado exitosamente.`,
      });

      // Refetch orders
      const data = await getMyOrders(token);
      setOrders(data);

      // Close dialog
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      setCancelObservaciones("");
    } catch (error) {
      console.error("Error canceling order:", error);
      const errorMessage = error instanceof Error ? error.message : "Por favor intentá nuevamente.";
      toast.error("Error al cancelar el pedido", {
        description: errorMessage,
      });
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">Mis Pedidos</h1>
          <p className="text-lg opacity-90">
            Seguí el estado de todos tus pedidos en tiempo real
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, j) => (
                        <Skeleton key={j} className="h-20 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && orders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tenés pedidos aún</h3>
                <p className="text-muted-foreground mb-6">
                  Creá tu primer pedido para comenzar
                </p>
                <Button asChild>
                  <Link to="/order/new">Crear pedido</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Orders List */}
          {!isLoading && !error && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => {
                const config = statusConfig[order.estado] || statusConfig["Pendiente"];
                const Icon = config.icon;

                return (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row items-start md:justify-between gap-3">
                        <div>
                          <CardTitle className="text-xl md:text-2xl">{order.id}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {order.servicio.nombre}
                          </CardDescription>
                        </div>
                        <Badge className={`${config.color} text-white px-3 py-1.5 md:px-4 md:py-2`}>
                          <Icon className="w-4 h-4 mr-2 inline" />
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-lg ${config.bgColor}`}>
                          <p className="text-sm text-muted-foreground mb-1">Estado</p>
                          <p className={`font-semibold ${config.textColor}`}>
                            {config.label}
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground mb-1">Precio Estimado</p>
                          <p className="font-semibold text-lg">${order.precioEstimado}</p>
                        </div>

                        <div className="p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground mb-1">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Fecha
                          </p>
                          <p className="font-semibold">
                            {formatDate(order.fechaCreacion)}
                          </p>
                        </div>
                      </div>

                      {/* Observaciones */}
                      {order.observaciones && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Observaciones:</p>
                          <p className="text-sm">{order.observaciones}</p>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progreso</span>
                          <span className="text-sm text-muted-foreground">
                            {order.estado === "Entregado" && "100%"}
                            {order.estado === "Finalizado" && "75%"}
                            {order.estado === "En Proceso" && "50%"}
                            {order.estado === "Pendiente" && "25%"}
                            {order.estado === "Cancelado" && "0%"}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`${config.color} h-2 rounded-full transition-all`}
                            style={{
                              width:
                                order.estado === "Entregado" ? "100%" :
                                order.estado === "Finalizado" ? "75%" :
                                order.estado === "En Proceso" ? "50%" :
                                order.estado === "Pendiente" ? "25%" :
                                "0%",
                            }}
                          />
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="mt-6 flex items-center justify-between text-xs">
                        <div className="text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-1 bg-blue-500`} />
                          <p className="text-muted-foreground">Pendiente</p>
                        </div>
                        <div className="flex-1 h-px bg-muted mx-2" />
                        <div className="text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                            ["En Proceso", "Finalizado", "Entregado"].includes(order.estado)
                              ? "bg-amber-500"
                              : "bg-muted"
                          }`} />
                          <p className="text-muted-foreground">En Proceso</p>
                        </div>
                        <div className="flex-1 h-px bg-muted mx-2" />
                        <div className="text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                            ["Finalizado", "Entregado"].includes(order.estado)
                              ? "bg-green-500"
                              : "bg-muted"
                          }`} />
                          <p className="text-muted-foreground">Finalizado</p>
                        </div>
                        <div className="flex-1 h-px bg-muted mx-2" />
                        <div className="text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                            order.estado === "Entregado" ? "bg-slate-500" : "bg-muted"
                          }`} />
                          <p className="text-muted-foreground">Entregado</p>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {order.estado === "Pendiente" && (
                        <div className="mt-6">
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleOpenCancelDialog(order)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar Pedido
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Cancel Order Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará el pedido <strong>{orderToCancel?.id}</strong>. 
              Solo se pueden cancelar pedidos que están en estado "Pendiente".
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="cancel-observaciones">
              Motivo de cancelación (opcional)
            </Label>
            <Textarea
              id="cancel-observaciones"
              placeholder="Ej: Ya no necesito el servicio, encontré otra opción, etc."
              value={cancelObservaciones}
              onChange={(e) => setCancelObservaciones(e.target.value)}
              rows={3}
              disabled={isCanceling}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>
              No, mantener pedido
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={isCanceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCanceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, cancelar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
}