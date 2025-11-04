import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  getAllServices,
  createService,
  updateService,
  deactivateService,
} from "@/lib/admin-services";
import { Service, ServiceFormData } from "@/types";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

export default function Services() {
  const { token, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Service | null>(null);
  const [showInactive, setShowInactive] = useState(true);

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    nombre: "",
    descripcion: "",
    modeloDePrecio: "paqueteConAdicional",
    configuracionPrecios: { precioBase: 0, adicionales: {} },
  });

  // Fetch all services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => getAllServices(token!),
    enabled: !!token && hasRole("admin"),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ServiceFormData) => createService(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Servicio creado exitosamente");
      resetForm();
      setShowDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear el servicio");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ServiceFormData }) =>
      updateService(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Servicio actualizado exitosamente");
      resetForm();
      setShowDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al actualizar el servicio");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deactivateService(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Servicio desactivado");
      setDeleteConfirm(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al desactivar el servicio");
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      modeloDePrecio: "paqueteConAdicional",
      configuracionPrecios: { precioBase: 0, adicionales: {} },
    });
    setEditingService(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    // Map service to form data
    const config: any = {};
    if (service.modeloDePrecio === "paqueteConAdicional") {
      config.precioBase = service.precioBase || 0;
      config.adicionales = service.adicionales || {};
    } else if (service.modeloDePrecio === "porOpciones") {
      config.opciones = service.opciones || {};
    } else if (service.modeloDePrecio === "porOpcionesMultiples") {
      config.precioBase = service.precioBase || 0;
      config.minimoUnidades = service.minimoUnidades || 1;
      config.opciones = service.opcionesDePrecio || {};
    }

    setFormData({
      nombre: service.nombre,
      descripcion: service.descripcion || "",
      modeloDePrecio: service.modeloDePrecio as any,
      configuracionPrecios: config,
    });
    setShowDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (service: Service) => {
    setDeleteConfirm(service);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  // Dynamic form fields based on price model
  const renderPriceConfigFields = () => {
    const { modeloDePrecio, configuracionPrecios } = formData;

    if (modeloDePrecio === "paqueteConAdicional") {
      const config = configuracionPrecios as any;
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="precioBase">Precio Base</Label>
            <Input
              id="precioBase"
              type="number"
              value={config.precioBase || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  configuracionPrecios: {
                    ...config,
                    precioBase: parseFloat(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div>
            <Label>Adicionales (key: valor)</Label>
            <Textarea
              placeholder='{"planchado": 50, "express": 100}'
              value={JSON.stringify(config.adicionales || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData({
                    ...formData,
                    configuracionPrecios: { ...config, adicionales: parsed },
                  });
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
            />
          </div>
        </div>
      );
    }

    if (modeloDePrecio === "porOpciones") {
      const config = configuracionPrecios as any;
      return (
        <div>
          <Label>Opciones (key: valor)</Label>
          <Textarea
            placeholder='{"express": 100, "normal": 50}'
            value={JSON.stringify(config.opciones || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData({
                  ...formData,
                  configuracionPrecios: { opciones: parsed },
                });
              } catch (err) {
                // Invalid JSON, ignore
              }
            }}
          />
        </div>
      );
    }

    if (modeloDePrecio === "porOpcionesMultiples") {
      const config = configuracionPrecios as any;
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="precioBase">Precio Base</Label>
            <Input
              id="precioBase"
              type="number"
              value={config.precioBase || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  configuracionPrecios: {
                    ...config,
                    precioBase: parseFloat(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="minimoUnidades">Mínimo Unidades</Label>
            <Input
              id="minimoUnidades"
              type="number"
              value={config.minimoUnidades || 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  configuracionPrecios: {
                    ...config,
                    minimoUnidades: parseInt(e.target.value) || 1,
                  },
                })
              }
            />
          </div>
          <div>
            <Label>Opciones (categoría: opciones)</Label>
            <Textarea
              placeholder='{"tamaño": {"grande": 50, "pequeño": 30}, "tipo": {"delicado": 20}}'
              value={JSON.stringify(config.opciones || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData({
                    ...formData,
                    configuracionPrecios: { ...config, opciones: parsed },
                  });
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const filteredServices = showInactive
    ? services
    : services.filter((s) => s.activo !== false);

  if (!hasRole("admin")) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Acceso denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl">Gestión de Servicios</CardTitle>
              <CardDescription>
                Administra los servicios de lavandería disponibles
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ocultar inactivos
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Mostrar inactivos
                  </>
                )}
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Servicio
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Modelo de Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No hay servicios disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        {service.nombre}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {service.descripcion}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {service.modeloDePrecio}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {service.activo === false ? (
                          <Badge variant="destructive">Inactivo</Badge>
                        ) : (
                          <Badge variant="default">Activo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(service)}
                            disabled={service.activo === false}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Servicio" : "Nuevo Servicio"}
            </DialogTitle>
            <DialogDescription>
              Complete los datos del servicio. Los cambios se guardarán al hacer
              clic en Guardar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="modeloDePrecio">Modelo de Precio</Label>
              <Select
                value={formData.modeloDePrecio}
                onValueChange={(value: any) => {
                  // Reset config when model changes
                  let newConfig: any = {};
                  if (value === "paqueteConAdicional") {
                    newConfig = { precioBase: 0, adicionales: {} };
                  } else if (value === "porOpciones") {
                    newConfig = { opciones: {} };
                  } else if (value === "porOpcionesMultiples") {
                    newConfig = { precioBase: 0, minimoUnidades: 1, opciones: {} };
                  }
                  setFormData({
                    ...formData,
                    modeloDePrecio: value,
                    configuracionPrecios: newConfig,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paqueteConAdicional">
                    Paquete con Adicional
                  </SelectItem>
                  <SelectItem value="porOpciones">Por Opciones</SelectItem>
                  <SelectItem value="porOpcionesMultiples">
                    Por Opciones Múltiples
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderPriceConfigFields()}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará el servicio "{deleteConfirm?.nombre}". El
              servicio no se eliminará permanentemente, pero ya no estará
              disponible para nuevos pedidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
