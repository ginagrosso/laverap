import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  getAllUsers,
  changeUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
} from "@/lib/users";
import { User, UserFilters } from "@/types";
import { toast } from "sonner";
import { Link } from "react-router-dom";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MoreVertical, Home, Shield, User as UserIcon, Trash2, Power, PowerOff } from "lucide-react";

export default function Users() {
  const { token, user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Filter states
  const [filters, setFilters] = useState<UserFilters>({
    rol: undefined,
    activo: undefined,
    search: "",
  });

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"cliente" | "admin">("cliente");

  // AlertDialog states
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"activate" | "deactivate" | "delete">("activate");
  const [userToAction, setUserToAction] = useState<User | null>(null);

  // Fetch users
  const { data: usersResponse, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => {
      if (!token) throw new Error("No token available");
      return getAllUsers(filters, token);
    },
    enabled: !!token,
  });

  const users = usersResponse?.data || [];

  // Mutations
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, rol }: { id: string; rol: "cliente" | "admin" }) => {
      if (!token) throw new Error("No token available");
      return changeUserRole(id, rol, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Rol actualizado correctamente");
      setRoleDialogOpen(false);
      setUserToEdit(null);
    },
    onError: (error) => {
      console.error("Error changing role:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al cambiar rol";
      toast.error(errorMessage);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No token available");
      return deactivateUser(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuario desactivado");
      setActionDialogOpen(false);
      setUserToAction(null);
    },
    onError: (error) => {
      console.error("Error deactivating user:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al desactivar usuario";
      toast.error(errorMessage);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No token available");
      return activateUser(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuario activado");
      setActionDialogOpen(false);
      setUserToAction(null);
    },
    onError: (error) => {
      console.error("Error activating user:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al activar usuario";
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("No token available");
      return deleteUser(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuario eliminado permanentemente");
      setActionDialogOpen(false);
      setUserToAction(null);
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar usuario";
      toast.error(errorMessage);
    },
  });

  // Handlers
  const handleOpenRoleDialog = (user: User) => {
    setUserToEdit(user);
    setNewRole(user.rol as "cliente" | "admin");
    setRoleDialogOpen(true);
  };

  const handleChangeRole = () => {
    if (!userToEdit) return;
    if (userToEdit.id === currentUser?.id) {
      toast.error("No podés cambiar tu propio rol");
      return;
    }
    changeRoleMutation.mutate({ id: userToEdit.id, rol: newRole });
  };

  const handleOpenActionDialog = (
    user: User,
    action: "activate" | "deactivate" | "delete"
  ) => {
    if (user.id === currentUser?.id && action !== "activate") {
      toast.error("No podés realizar esta acción sobre tu propio usuario");
      return;
    }
    setUserToAction(user);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!userToAction) return;

    switch (actionType) {
      case "activate":
        activateMutation.mutate(userToAction.id);
        break;
      case "deactivate":
        deactivateMutation.mutate(userToAction.id);
        break;
      case "delete":
        deleteMutation.mutate(userToAction.id);
        break;
    }
  };

  const isPending =
    changeRoleMutation.isPending ||
    deactivateMutation.isPending ||
    activateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-lg opacity-90">Administrar roles y permisos</p>
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
                <BreadcrumbPage>Gestión de Usuarios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                Visualiza y gestiona todos los usuarios registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    Buscar
                  </Label>
                  <Input
                    id="search"
                    placeholder="Buscar por nombre o email..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={filters.rol || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        rol: value === "all" ? undefined : (value as "cliente" | "admin"),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={
                      filters.activo === undefined
                        ? "all"
                        : filters.activo
                        ? "active"
                        : "inactive"
                    }
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        activo:
                          value === "all"
                            ? undefined
                            : value === "active"
                            ? true
                            : false,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2">Cargando usuarios...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron usuarios
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nombre}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.telefono || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={user.rol === "admin" ? "default" : "secondary"}
                            >
                              {user.rol === "admin" ? (
                                <Shield className="w-3 h-3 mr-1" />
                              ) : (
                                <UserIcon className="w-3 h-3 mr-1" />
                              )}
                              {user.rol}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.activo ? "default" : "outline"}
                              className={
                                user.activo
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "text-muted-foreground"
                              }
                            >
                              {user.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleOpenRoleDialog(user)}
                                  disabled={user.id === currentUser?.id}
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Cambiar Rol
                                </DropdownMenuItem>
                                {user.activo ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleOpenActionDialog(user, "deactivate")
                                    }
                                    disabled={user.id === currentUser?.id}
                                  >
                                    <PowerOff className="w-4 h-4 mr-2" />
                                    Desactivar
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleOpenActionDialog(user, "activate")}
                                  >
                                    <Power className="w-4 h-4 mr-2" />
                                    Activar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleOpenActionDialog(user, "delete")}
                                  disabled={user.id === currentUser?.id || user.activo}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination Info */}
              {usersResponse && (
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  Mostrando {users.length} de {usersResponse.pagination.total} usuarios
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Estás a punto de cambiar el rol de <strong>{userToEdit?.nombre}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">Nuevo Rol</Label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as "cliente" | "admin")}
              >
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>Rol actual:</strong> {userToEdit?.rol}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleChangeRole}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cambiar Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "delete" && "¿Eliminar usuario permanentemente?"}
              {actionType === "deactivate" && "¿Desactivar usuario?"}
              {actionType === "activate" && "¿Activar usuario?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "delete" && (
                <>
                  <strong className="text-destructive">⚠️ Esta acción es irreversible.</strong>
                  <br />
                  El usuario <strong>{userToAction?.nombre}</strong> será eliminado
                  permanentemente del sistema. Solo se pueden eliminar usuarios inactivos.
                </>
              )}
              {actionType === "deactivate" && (
                <>
                  El usuario <strong>{userToAction?.nombre}</strong> no podrá acceder al
                  sistema hasta que sea reactivado.
                </>
              )}
              {actionType === "activate" && (
                <>
                  El usuario <strong>{userToAction?.nombre}</strong> podrá acceder nuevamente
                  al sistema.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isPending}
              className={
                actionType === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "delete" && "Sí, eliminar"}
              {actionType === "deactivate" && "Sí, desactivar"}
              {actionType === "activate" && "Sí, activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

