import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Package, Loader2, CheckCircle, AlertCircle, Archive, Clock, Truck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getAllOrders, updateOrderStatus } from "@/lib";
import { Order, OrderStatus } from "@/types";
import { toast } from "sonner";
import { useState } from "react";

export const OperationalPanel = () => {
  const { token, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Fetch all orders (for admins) or show demo for non-admins
  const { data: ordersResponse, isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => {
      if (!token || !hasRole("admin")) {
        return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
      }
      return getAllOrders({}, token); // Pass empty filters object
    },
    enabled: !!token && hasRole("admin"),
  });

  // Extract orders array from paginated response
  const orders = ordersResponse?.data || [];

  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: OrderStatus }) => {
      if (!token) throw new Error("No token available");
      return updateOrderStatus(orderId, newStatus, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Estado del pedido actualizado");
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      console.error("Error updating order status:", error);
      toast.error(error.message || "Error al actualizar el estado del pedido");
    },
  });

  // Group orders by status
  const ordersByStatus = {
    Pendiente: orders.filter((o) => o.estado === "Pendiente"),
    "En Proceso": orders.filter((o) => o.estado === "En Proceso"),
    Finalizado: orders.filter((o) => o.estado === "Finalizado"),
    Entregado: orders.filter((o) => o.estado === "Entregado"),
    Cancelado: orders.filter((o) => o.estado === "Cancelado"),
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pendiente":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "En Proceso":
        return <Loader2 className="w-5 h-5 text-amber-500" />;
      case "Finalizado":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Entregado":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "Cancelado":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-blue-50 border-blue-200";
      case "En Proceso":
        return "bg-amber-50 border-amber-200";
      case "Finalizado":
        return "bg-green-50 border-green-200";
      case "Entregado":
        return "bg-purple-50 border-purple-200";
      case "Cancelado":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const renderStatusColumn = (status: OrderStatus, title: string) => {
    const columnOrders = ordersByStatus[status as keyof typeof ordersByStatus] || [];

    return (
      <Card key={status}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getStatusIcon(status)}
            {title}
            <Badge variant="secondary">{columnOrders.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {columnOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay pedidos
            </p>
          ) : (
            columnOrders.map((order) => (
              <div
                key={order.id}
                className={`p-3 border rounded-lg ${getStatusColor(order.estado)} transition-all`}
              >
                <p className="font-semibold text-sm">{order.id}</p>
                <p className="text-xs text-muted-foreground">
                  Cliente: {order.clienteId}
                </p>
                <p className="text-xs">Servicio: {order.servicio.nombre}</p>
                <p className="text-xs font-medium">${order.precioEstimado}</p>

                {hasRole("admin") && selectedOrder === order.id && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold mb-1">Cambiar estado:</p>
                    {(["Pendiente", "En Proceso", "Finalizado", "Entregado", "Cancelado"] as OrderStatus[])
                      .filter((s) => s !== order.estado)
                      .map((newStatus) => (
                        <Button
                          key={newStatus}
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => handleStatusChange(order.id, newStatus)}
                          disabled={updateStatusMutation.isPending}
                        >
                          → {newStatus}
                        </Button>
                      ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-xs"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                {hasRole("admin") && selectedOrder !== order.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 text-xs"
                    onClick={() => setSelectedOrder(order.id)}
                  >
                    Cambiar estado
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  };

  if (!hasRole("admin")) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Panel operativo</h2>
          <p className="text-center text-muted-foreground mb-8 text-lg">
            Vista previa del tablero de operaciones (solo para administradores)
          </p>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Panel operativo</h2>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Cargando pedidos...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Panel operativo</h2>
          <div className="text-center text-red-500 py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p>Error al cargar los pedidos</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Panel operativo</h2>
        <p className="text-center text-muted-foreground mb-8 text-lg">
          Gestión de pedidos en tiempo real
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {renderStatusColumn("Pendiente", "Pendiente")}
          {renderStatusColumn("En Proceso", "En Proceso")}
          {renderStatusColumn("Finalizado", "Finalizado")}
          {renderStatusColumn("Entregado", "Entregado")}
          {renderStatusColumn("Cancelado", "Cancelado")}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-semibold">Total Activos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {ordersByStatus.Pendiente.length +
                     ordersByStatus["En Proceso"].length +
                     ordersByStatus.Finalizado.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-semibold">Entregados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {ordersByStatus.Entregado.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Archive className="w-8 h-8 text-slate-500" />
                <div>
                  <p className="font-semibold">Total Pedidos</p>
                  <p className="text-2xl font-bold text-slate-600">
                    {orders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
