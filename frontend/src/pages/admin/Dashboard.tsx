import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Users, DollarSign, Loader2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getSummary, getRevenue } from "@/lib/reports";

export default function Dashboard() {
  const { token } = useAuth();

  // Fetch summary statistics
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ["reports", "summary"],
    queryFn: () => {
      if (!token) throw new Error("No token available");
      return getSummary(token);
    },
    enabled: !!token,
  });

  // Fetch current month revenue
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString().split('T')[0];

  const { data: revenue, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ["reports", "revenue", firstDay, lastDay],
    queryFn: () => {
      if (!token) throw new Error("No token available");
      return getRevenue(firstDay, lastDay, token);
    },
    enabled: !!token,
  });

  const isLoading = summaryLoading || revenueLoading;
  const hasError = summaryError || revenueError;

  // Map API data to dashboard stats
  const stats = {
    pedidosHoy: summary?.totalPedidos || 0, // NOTE: Shows total orders, not filtered by today
    ingresosMes: revenue?.ingresoTotal || 0,
    pedidosPendientes: (summary?.pedidosPendientes || 0) + (summary?.pedidosEnProceso || 0),
    totalClientes: summary?.totalClientes || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-lg opacity-90">Vista general del negocio</p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {hasError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
              Error al cargar las estadísticas. Por favor, intenta recargar la página.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pedidos
                </CardTitle>
                <Package className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{stats.pedidosHoy}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registrados en el sistema
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ingresos del Mes
                </CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">${stats.ingresosMes.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mes actual
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clientes
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{stats.totalClientes}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registrados en el sistema
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendientes
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">{stats.pedidosPendientes}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pendientes + En proceso
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle>Gestionar Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4 flex-1">
                  Actualizar estados, ver detalles y gestionar el flujo de trabajo
                </p>
                <Button asChild className="w-full">
                  <Link to="/admin/orders">Ir a Pedidos</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle>Gestionar Usuarios</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4 flex-1">
                  Administrar clientes, roles y permisos del sistema
                </p>
                <Button asChild className="w-full">
                  <Link to="/admin/users">Gestionar Usuarios</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4 flex-1">
                  Análisis detallado de rendimiento y métricas del negocio
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/admin/stats">Ver Estadísticas</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle>Servicios</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4 flex-1">
                  Gestionar catálogo de servicios y precios
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/admin/services">Gestionar Servicios</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
