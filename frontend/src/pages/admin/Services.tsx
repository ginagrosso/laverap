import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  getAllServices,
  createService,
  updateService,
  deactivateService,
  activateService,
} from "@/lib/admin-services";
import { Service, ServiceFormData } from "@/types";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ApiError } from "@/lib/api";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Home, X, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

  // Temporary arrays for key-value UI (user-friendly instead of JSON)
  const [adicionalesArray, setAdicionalesArray] = useState<{ key: string; value: number }[]>([]);
  const [opcionesArray, setOpcionesArray] = useState<{ key: string; value: number }[]>([]);
  const [opcionesNestedArray, setOpcionesNestedArray] = useState<{
    categoria: string;
    opciones: { key: string; value: number }[];
  }[]>([]);

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
    onError: (error) => {
      console.error("Error creating service:", error);
      
      if (error instanceof ApiError) {
        if (error.isServiceNameAlreadyExists()) {
          toast.error("Nombre duplicado", {
            description: "Ya existe un servicio con ese nombre.",
          });
        } else if (error.isValidationError() && error.details && error.details.length > 0) {
          toast.error("Error de validación", {
            description: error.details[0],
          });
        } else {
          toast.error(error.message || "Error al crear el servicio");
        }
      } else {
        toast.error("Error al crear el servicio");
      }
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
    onError: (error) => {
      console.error("Error updating service:", error);
      
      if (error instanceof ApiError) {
        if (error.isServiceNameAlreadyExists()) {
          toast.error("Nombre duplicado", {
            description: "Ya existe otro servicio con ese nombre.",
          });
        } else if (error.isServiceNotFound()) {
          toast.error("Servicio no encontrado");
        } else if (error.isValidationError() && error.details && error.details.length > 0) {
          toast.error("Error de validación", {
            description: error.details[0],
          });
        } else {
          toast.error(error.message || "Error al actualizar el servicio");
        }
      } else {
        toast.error("Error al actualizar el servicio");
      }
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
    onError: (error) => {
      console.error("Error deactivating service:", error);
      
      if (error instanceof ApiError) {
        if (error.isServiceNotFound()) {
          toast.error("Servicio no encontrado");
        } else {
          toast.error(error.message || "Error al desactivar el servicio");
        }
      } else {
        toast.error("Error al desactivar el servicio");
      }
    },
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => activateService(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Servicio activado exitosamente");
    },
    onError: (error) => {
      console.error("Error activating service:", error);
      
      if (error instanceof ApiError) {
        if (error.isServiceNotFound()) {
          toast.error("Servicio no encontrado");
        } else {
          toast.error(error.message || "Error al activar el servicio");
        }
      } else {
        toast.error("Error al activar el servicio");
      }
    },
  });

  // Helper functions to convert between objects and arrays for user-friendly UI
  const objectToArray = (obj: Record<string, number>): { key: string; value: number }[] => {
    return Object.entries(obj || {}).map(([key, value]) => ({ key, value }));
  };

  const arrayToObject = (arr: { key: string; value: number }[]): Record<string, number> => {
    return arr
      .filter((item) => item.key.trim() !== "") // Filter out empty keys
      .reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
  };

  const nestedObjectToArray = (
    obj: Record<string, Record<string, number>>
  ): { categoria: string; opciones: { key: string; value: number }[] }[] => {
    return Object.entries(obj || {}).map(([categoria, opciones]) => ({
      categoria,
      opciones: Object.entries(opciones).map(([key, value]) => ({ key, value })),
    }));
  };

  const arrayToNestedObject = (
    arr: { categoria: string; opciones: { key: string; value: number }[] }[]
  ): Record<string, Record<string, number>> => {
    return arr
      .filter((cat) => cat.categoria.trim() !== "") // Filter out empty categories
      .reduce(
        (acc, cat) => ({
          ...acc,
          [cat.categoria]: cat.opciones
            .filter((op) => op.key.trim() !== "") // Filter out empty option keys
            .reduce((opAcc, op) => ({ ...opAcc, [op.key]: op.value }), {}),
        }),
        {}
      );
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      modeloDePrecio: "paqueteConAdicional",
      configuracionPrecios: { precioBase: 0, adicionales: {} },
    });
    setAdicionalesArray([]);
    setOpcionesArray([]);
    setOpcionesNestedArray([]);
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

    // Also initialize arrays for UI
    if (service.modeloDePrecio === "paqueteConAdicional") {
      config.precioBase = service.precioBase || 0;
      config.adicionales = service.adicionales || {};
      setAdicionalesArray(objectToArray(service.adicionales || {}));
    } else if (service.modeloDePrecio === "porOpciones") {
      config.opciones = service.opciones || {};
      setOpcionesArray(objectToArray((service.opciones as Record<string, number>) || {}));
    } else if (service.modeloDePrecio === "porOpcionesMultiples") {
      config.precioBase = service.precioBase || 0;
      config.minimoUnidades = service.minimoUnidades || 1;
      config.opciones = service.opciones || {};
      setOpcionesNestedArray(
        nestedObjectToArray((service.opciones as Record<string, Record<string, number>>) || {})
      );
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

    // Convert arrays back to objects before submitting
    const finalFormData = { ...formData };
    const config: any = { ...finalFormData.configuracionPrecios };

    if (formData.modeloDePrecio === "paqueteConAdicional") {
      config.adicionales = arrayToObject(adicionalesArray);
    } else if (formData.modeloDePrecio === "porOpciones") {
      config.opciones = arrayToObject(opcionesArray);
    } else if (formData.modeloDePrecio === "porOpcionesMultiples") {
      config.opciones = arrayToNestedObject(opcionesNestedArray);
    }

    finalFormData.configuracionPrecios = config;

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: finalFormData });
    } else {
      createMutation.mutate(finalFormData);
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Adicionales</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAdicionalesArray([...adicionalesArray, { key: "", value: 0 }])}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {adicionalesArray.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay adicionales. Haz clic en "Agregar" para añadir uno.
                </p>
              ) : (
                adicionalesArray.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Nombre (ej: planchado)"
                        value={item.key}
                        onChange={(e) => {
                          const newArray = [...adicionalesArray];
                          newArray[index].key = e.target.value;
                          setAdicionalesArray(newArray);
                        }}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Precio"
                        value={item.value}
                        onChange={(e) => {
                          const newArray = [...adicionalesArray];
                          newArray[index].value = parseFloat(e.target.value) || 0;
                          setAdicionalesArray(newArray);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setAdicionalesArray(adicionalesArray.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (modeloDePrecio === "porOpciones") {
      const config = configuracionPrecios as any;
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Opciones</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setOpcionesArray([...opcionesArray, { key: "", value: 0 }])}
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>
          <div className="space-y-2">
            {opcionesArray.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay opciones. Haz clic en "Agregar" para añadir una.
              </p>
            ) : (
              opcionesArray.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Nombre (ej: express)"
                      value={item.key}
                      onChange={(e) => {
                        const newArray = [...opcionesArray];
                        newArray[index].key = e.target.value;
                        setOpcionesArray(newArray);
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Precio"
                      value={item.value}
                      onChange={(e) => {
                        const newArray = [...opcionesArray];
                        newArray[index].value = parseFloat(e.target.value) || 0;
                        setOpcionesArray(newArray);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setOpcionesArray(opcionesArray.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Categorías de Opciones</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setOpcionesNestedArray([
                    ...opcionesNestedArray,
                    { categoria: "", opciones: [{ key: "", value: 0 }] },
                  ])
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Categoría
              </Button>
            </div>
            <div className="space-y-3">
              {opcionesNestedArray.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay categorías. Haz clic en "Agregar Categoría" para añadir una.
                </p>
              ) : (
                opcionesNestedArray.map((categoria, catIndex) => (
                  <Card key={catIndex}>
                    <CardHeader className="pb-3">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            placeholder="Nombre de categoría (ej: tamaño)"
                            value={categoria.categoria}
                            onChange={(e) => {
                              const newArray = [...opcionesNestedArray];
                              newArray[catIndex].categoria = e.target.value;
                              setOpcionesNestedArray(newArray);
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setOpcionesNestedArray(
                              opcionesNestedArray.filter((_, i) => i !== catIndex)
                            );
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-muted-foreground">Opciones</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newArray = [...opcionesNestedArray];
                            newArray[catIndex].opciones.push({ key: "", value: 0 });
                            setOpcionesNestedArray(newArray);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Opción
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {categoria.opciones.map((opcion, opIndex) => (
                          <div key={opIndex} className="flex gap-2 items-start">
                            <div className="flex-1">
                              <Input
                                placeholder="Nombre (ej: grande)"
                                value={opcion.key}
                                onChange={(e) => {
                                  const newArray = [...opcionesNestedArray];
                                  newArray[catIndex].opciones[opIndex].key = e.target.value;
                                  setOpcionesNestedArray(newArray);
                                }}
                              />
                            </div>
                            <div className="w-28">
                              <Input
                                type="number"
                                placeholder="Precio"
                                value={opcion.value}
                                onChange={(e) => {
                                  const newArray = [...opcionesNestedArray];
                                  newArray[catIndex].opciones[opIndex].value =
                                    parseFloat(e.target.value) || 0;
                                  setOpcionesNestedArray(newArray);
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const newArray = [...opcionesNestedArray];
                                newArray[catIndex].opciones = newArray[
                                  catIndex
                                ].opciones.filter((_, i) => i !== opIndex);
                                setOpcionesNestedArray(newArray);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">Gestión de Servicios</h1>
          <p className="text-lg opacity-90">Administra los servicios de lavandería disponibles</p>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin/dashboard" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Gestión de Servicios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
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
                          {service.activo === false ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => activateMutation.mutate(service.id)}
                              disabled={activateMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Activar
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(service)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
      </div>

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
