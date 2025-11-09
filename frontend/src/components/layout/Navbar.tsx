import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, LayoutDashboard, Package, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const customerLinks = [
    { to: "/", label: "Inicio" },
    { to: "/services", label: "Servicios" },
  ];

  const isAdminUser = hasRole("admin");

  const authenticatedLinks = [
    { to: "/order/new", label: "Crear Pedido" },
    { to: isAdminUser ? "/admin/orders" : "/order/track", label: "Mis Pedidos" },
  ];

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-primary justify-self-start">
            <img src="/laverap-logo.svg" alt="Laverap Logo" className="w-10 h-10" />
            <span>Laverap</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-6">
            {customerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.to)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && authenticatedLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.to)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4 justify-self-end">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Ingresar</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Registrarse</Link>
                </Button>
              </>
            ) : (
              <>
                {isAdminUser && (
                  <Button variant="outline" asChild>
                    <Link to="/admin/dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <User className="w-4 h-4" />
                      {user?.nombre}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{user?.nombre}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        {/* <p className="text-xs text-muted-foreground">Rol: {user?.rol}</p> */}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={isAdminUser ? "/admin/orders" : "/order/track"}>
                        <Package className="w-4 h-4 mr-2" />
                        Mis Pedidos
                      </Link>
                    </DropdownMenuItem>
                    {isAdminUser && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/dashboard">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Panel Admin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/admin/users">
                            <Users className="w-4 h-4 mr-2" />
                            Gestionar Usuarios
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden justify-self-end col-start-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  {customerLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium ${
                        isActive(link.to) ? "text-primary" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {isAuthenticated && authenticatedLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium ${
                        isActive(link.to) ? "text-primary" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="border-t pt-4 mt-4">
                    {!isAuthenticated ? (
                      <div className="flex flex-col gap-2">
                        <Button asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/login">Ingresar</Link>
                        </Button>
                        <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/register">Registrarse</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="mb-2">
                          <p className="font-medium">{user?.nombre}</p>
                          <p className="text-sm text-muted-foreground">{user?.rol}</p>
                        </div>
                        {isAdminUser && (
                          <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                            <Link to="/admin/dashboard">Panel Admin</Link>
                          </Button>
                        )}
                        <Button variant="destructive" onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}>
                          Cerrar Sesión
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
