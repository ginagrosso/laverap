import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Package, Loader2, CheckCircle, AlertCircle, Archive, Clock, Truck, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { getAllOrders, updateOrderStatus, updateOrder, deleteOrder, getAllUsers, getServices } from "@/lib";
import { Order, OrderStatus, Service, UpdateOrderRequest } from "@/types";
import { toast } from "sonner";
import { useState, useMemo, useEffect } from "react";

export const OperationalPanel = () => {
  const { token, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  
  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [editFormData, setEditFormData] = useState({
    servicioId: "",
    cantidad: 1,
    incluyePlanchado: false,
    opcionSeleccionada: "",
    opcionesMultiples: {} as Record<string, string>,
    observaciones: "",
    estado: "" as OrderStatus,
  });

  // Delete modal states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Filter states
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [showDelivered, setShowDelivered] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);

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

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (dateRange === "all") return orders;

    const now = new Date();
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const daysAgo = daysMap[dateRange];
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysAgo);

    return orders.filter((order) => {
      // Handle Firestore timestamp format
      const orderDate = order.fechaCreacion?._seconds
        ? new Date(order.fechaCreacion._seconds * 1000)
        : new Date(order.fechaCreacion);
      return orderDate >= cutoffDate;
    });
  }, [orders, dateRange]);

  // Fetch all users to map client IDs to names
  const { data: usersResponse } = useQuery({
    queryKey: ["all-users-for-panel"],
    queryFn: async () => {
      if (!token || !hasRole("admin")) {
        return { success: true, data: [], pagination: { total: 0, page: 1, limit: 100, totalPages: 0 } };
      }
      return getAllUsers({ limit: 100 }, token);
    },
    enabled: !!token && hasRole("admin"),
  });

  // Fetch all active services for edit modal
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    enabled: editModalOpen,
  });

  // Create a map of clientId -> clientName for easy lookup
  const clientNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (usersResponse?.data) {
      usersResponse.data.forEach((user) => {
        map.set(user.id, user.nombre);
      });
    }
    return map;
  }, [usersResponse]);

  // Helper function to get client name or fallback to ID
  const getClientName = (clienteId: string): string => {
    return clientNameMap.get(clienteId) || clienteId;
  };

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

  // Mutation to update full order
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: UpdateOrderRequest }) => {
      if (!token) throw new Error("No token available");
      return updateOrder(orderId, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Pedido actualizado exitosamente");
      setEditModalOpen(false);
      setOrderToEdit(null);
    },
    onError: (error: any) => {
      console.error("Error updating order:", error);
      toast.error(error.message || "Error al actualizar el pedido");
    },
  });

  // Mutation to delete order
  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => {
      if (!token) throw new Error("No token available");
      return deleteOrder(orderId, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Pedido eliminado exitosamente");
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error deleting order:", error);
      const errorMessage = error.message || "Error al eliminar el pedido";
      toast.error(errorMessage);
    },
  });

  // Group orders by status (using filtered orders)
  const ordersByStatus = {
    Pendiente: filteredOrders.filter((o) => o.estado === "Pendiente"),
    "En Proceso": filteredOrders.filter((o) => o.estado === "En Proceso"),
    Finalizado: filteredOrders.filter((o) => o.estado === "Finalizado"),
    Entregado: filteredOrders.filter((o) => o.estado === "Entregado"),
    Cancelado: filteredOrders.filter((o) => o.estado === "Cancelado"),
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  // Handle opening edit modal
  const handleOpenEditModal = (order: Order) => {
    setOrderToEdit(order);
    
    // Pre-fill form with current order data
    const detalle = order.detalle as any;
    setEditFormData({
      servicioId: order.servicio.id,
      cantidad: detalle.cantidad || 1,
      incluyePlanchado: detalle.incluyePlanchado || false,
      opcionSeleccionada: detalle.opcion || detalle.opcionSeleccionada || "",
      opcionesMultiples: detalle.opciones || {},
      observaciones: order.observaciones || "",
      estado: order.estado,
    });
    
    setEditModalOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!orderToEdit) return;

    const selectedService = services.find((s) => s.id === editFormData.servicioId);
    if (!selectedService) {
      toast.error("Seleccioná un servicio válido");
      return;
    }

    // Build detalle based on service pricing model
    let detalle: any = { cantidad: editFormData.cantidad };

    switch (selectedService.modeloDePrecio) {
      case "paqueteConAdicional":
        detalle.incluyePlanchado = editFormData.incluyePlanchado;
        break;
      case "porOpciones":
        if (!editFormData.opcionSeleccionada) {
          toast.error("Seleccioná una opción");
          return;
        }
        detalle.opcion = editFormData.opcionSeleccionada;
        break;
      case "porOpcionesMultiples":
        if (!selectedService.opciones) {
          toast.error("Este servicio no tiene opciones configuradas");
          return;
        }
        const categorias = Object.keys(selectedService.opciones);
        for (const categoria of categorias) {
          if (!editFormData.opcionesMultiples[categoria]) {
            toast.error(`Seleccioná una opción para ${categoria}`);
            return;
          }
        }
        detalle.opciones = editFormData.opcionesMultiples;
        break;
    }

    // Build update request
    const updateData: UpdateOrderRequest = {
      servicioId: editFormData.servicioId,
      detalle,
      observaciones: editFormData.observaciones.trim() || undefined,
      estado: editFormData.estado,
    };

    updateOrderMutation.mutate({ orderId: orderToEdit.id, data: updateData });
  };

  // Reset form when service changes
  useEffect(() => {
    if (editFormData.servicioId && editModalOpen) {
      setEditFormData(prev => ({
        ...prev,
        opcionSeleccionada: "",
        opcionesMultiples: {},
        incluyePlanchado: false,
      }));
    }
  }, [editFormData.servicioId]);

  const selectedServiceForEdit = services.find((s) => s.id === editFormData.servicioId);

  // Handle opening delete dialog
  const handleOpenDeleteDialog = (order: Order) => {
    if (order.estado === "Entregado") {
      toast.error("No se puede eliminar un pedido ya entregado");
      return;
    }
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    if (!orderToDelete) return;
    deleteOrderMutation.mutate(orderToDelete.id);
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
                  Cliente: {getClientName(order.clienteId)}
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
                  <div className="mt-2 space-y-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => setSelectedOrder(order.id)}
                    >
                      Cambiar estado
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-xs"
                      onClick={() => handleOpenEditModal(order)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar pedido
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full text-xs"
                      onClick={() => handleOpenDeleteDialog(order)}
                      disabled={order.estado === "Entregado"}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Eliminar pedido
                    </Button>
                  </div>
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

        {/* Filter Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <Label htmlFor="date-range" className="whitespace-nowrap">
                  Mostrar:
                </Label>
                <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                  <SelectTrigger id="date-range" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Últimos 7 días</SelectItem>
                    <SelectItem value="30d">Últimos 30 días</SelectItem>
                    <SelectItem value="90d">Últimos 90 días</SelectItem>
                    <SelectItem value="all">Todos los pedidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Column Toggles */}
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-delivered"
                    checked={showDelivered}
                    onChange={(e) => setShowDelivered(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Label htmlFor="show-delivered" className="cursor-pointer text-sm">
                    Mostrar Entregados
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="show-canceled"
                    checked={showCanceled}
                    onChange={(e) => setShowCanceled(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Label htmlFor="show-canceled" className="cursor-pointer text-sm">
                    Mostrar Cancelados
                  </Label>
                </div>
              </div>

              {/* Summary */}
              <div className="text-sm text-muted-foreground">
                Mostrando <strong>{filteredOrders.length}</strong> de <strong>{orders.length}</strong> pedidos
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={`grid grid-cols-1 gap-4 mb-6 ${
          showDelivered && showCanceled ? 'md:grid-cols-3 lg:grid-cols-5' :
          showDelivered || showCanceled ? 'md:grid-cols-2 lg:grid-cols-4' :
          'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {renderStatusColumn("Pendiente", "Pendiente")}
          {renderStatusColumn("En Proceso", "En Proceso")}
          {renderStatusColumn("Finalizado", "Finalizado")}
          {showDelivered && renderStatusColumn("Entregado", "Entregado")}
          {showCanceled && renderStatusColumn("Cancelado", "Cancelado")}
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
                  <p className="font-semibold">Total Filtrados</p>
                  <p className="text-2xl font-bold text-slate-600">
                    {filteredOrders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Order Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Pedido</DialogTitle>
              <DialogDescription>
                Modificá cualquier campo del pedido. El precio se recalculará automáticamente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="edit-service">Servicio *</Label>
                <Select
                  value={editFormData.servicioId}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, servicioId: value })
                  }
                >
                  <SelectTrigger id="edit-service">
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
              </div>

              {/* Cantidad */}
              <div className="space-y-2">
                <Label htmlFor="edit-cantidad">
                  Cantidad *
                  {selectedServiceForEdit?.modeloDePrecio === "paqueteConAdicional" &&
                    " (paquetes)"}
                </Label>
                <Input
                  id="edit-cantidad"
                  type="number"
                  min="1"
                  value={editFormData.cantidad}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, cantidad: Number(e.target.value) })
                  }
                />
              </div>

              {/* Planchado option for paqueteConAdicional */}
              {selectedServiceForEdit?.modeloDePrecio === "paqueteConAdicional" &&
                selectedServiceForEdit.adicionales?.planchado && (
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      id="edit-planchado"
                      checked={editFormData.incluyePlanchado}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          incluyePlanchado: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor="edit-planchado" className="cursor-pointer">
                      Incluir planchado (+${selectedServiceForEdit.adicionales.planchado} por
                      paquete)
                    </Label>
                  </div>
                )}

              {/* Opción simple para porOpciones */}
              {selectedServiceForEdit?.modeloDePrecio === "porOpciones" &&
                selectedServiceForEdit.opciones && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-opcion">Seleccionar opción *</Label>
                    <Select
                      value={editFormData.opcionSeleccionada}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, opcionSeleccionada: value })
                      }
                    >
                      <SelectTrigger id="edit-opcion">
                        <SelectValue placeholder="Seleccioná una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(selectedServiceForEdit.opciones).map(([key, value]) =>
                          typeof value === "number" ? (
                            <SelectItem key={key} value={key}>
                              {key} - ${value}
                            </SelectItem>
                          ) : null
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {/* Opciones múltiples para porOpcionesMultiples */}
              {selectedServiceForEdit?.modeloDePrecio === "porOpcionesMultiples" &&
                selectedServiceForEdit.opciones && (
                  <div className="space-y-4">
                    {Object.entries(selectedServiceForEdit.opciones).map(
                      ([categoria, opciones]) => {
                        if (typeof opciones === "object" && !Array.isArray(opciones)) {
                          return (
                            <div key={categoria} className="space-y-2">
                              <Label htmlFor={`edit-opcion-${categoria}`}>{categoria} *</Label>
                              <Select
                                value={editFormData.opcionesMultiples[categoria] || ""}
                                onValueChange={(value) =>
                                  setEditFormData({
                                    ...editFormData,
                                    opcionesMultiples: {
                                      ...editFormData.opcionesMultiples,
                                      [categoria]: value,
                                    },
                                  })
                                }
                              >
                                <SelectTrigger id={`edit-opcion-${categoria}`}>
                                  <SelectValue
                                    placeholder={`Seleccioná ${categoria.toLowerCase()}`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(opciones).map(([opcion, precio]) => (
                                    <SelectItem key={opcion} value={opcion}>
                                      {opcion}{" "}
                                      {typeof precio === "number" && precio > 0
                                        ? `(+$${precio})`
                                        : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>
                )}

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="edit-observaciones">Observaciones</Label>
                <Textarea
                  id="edit-observaciones"
                  placeholder="Ej: sin suavizante, prenda delicada..."
                  value={editFormData.observaciones}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, observaciones: e.target.value })
                  }
                  rows={3}
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="edit-estado">Estado *</Label>
                <Select
                  value={editFormData.estado}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, estado: value as OrderStatus })
                  }
                >
                  <SelectTrigger id="edit-estado">
                    <SelectValue placeholder="Seleccioná un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Pendiente", "En Proceso", "Finalizado", "Entregado", "Cancelado"] as OrderStatus[]).map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Price Display */}
              {orderToEdit && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Precio actual estimado:</p>
                  <p className="text-2xl font-bold">${orderToEdit.precioEstimado}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    El precio se recalculará si cambiás el servicio o el detalle
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={updateOrderMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={updateOrderMutation.isPending}
              >
                {updateOrderMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Order Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong className="text-destructive">⚠️ Esta acción es irreversible.</strong>
                <br />
                <br />
                El pedido <strong>{orderToDelete?.id}</strong> será eliminado permanentemente del
                sistema. No se pueden eliminar pedidos que ya han sido entregados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteOrderMutation.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={deleteOrderMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteOrderMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
};
