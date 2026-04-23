import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Users,
  GraduationCap,
  UserCheck,
  ClipboardList,
  AlertCircle,
  School,
  BarChart3,
  Shield,
  FileText,
  Home,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const adminMenuItems = [
  { icon: Home, label: "Página Inicial", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard Estratégico", path: "/dashboard" },
  { icon: BarChart3, label: "Dashboard Gerencial", path: "/dashboard-gerencial" },
  { icon: FileText, label: "Quadro de Mediadores", path: "/cadastros" },
  { icon: School, label: "Escolas", path: "/escolas" },
  { icon: GraduationCap, label: "Alunos", path: "/alunos" },
  { icon: UserCheck, label: "Mediadores", path: "/mediadores" },
  { icon: ClipboardList, label: "Atendimentos", path: "/atendimentos" },
  { icon: AlertCircle, label: "Demandas Externas", path: "/demandas" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
  { icon: Shield, label: "Usuários", path: "/usuarios" },
];

const schoolMenuItems = [
  { icon: Home, label: "Página Inicial", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard Estratégico", path: "/dashboard" },
  { icon: FileText, label: "Quadro de Mediadores", path: "/cadastros" },
  { icon: GraduationCap, label: "Alunos", path: "/alunos" },
  { icon: UserCheck, label: "Mediadores", path: "/mediadores" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center border border-border">
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <img
                  src="/manus-storage/nexus-logo_be12f249.png"
                  alt="NEXUS"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-primary">NEXUS</h1>
              <p className="text-sm text-muted-foreground mt-1">Plataforma de Gestão e Articulação da Rede de Inclusão</p>
              <p className="text-xs text-muted-foreground mt-1">NEXUS — SEMED/SAIN</p>
              <p className="text-xs text-muted-foreground">Prefeitura Municipal de Betim</p>
            </div>
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              Entrar no Sistema
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const menuItems = user?.role === "admin" ? adminMenuItems : schoolMenuItems;
  const activeMenuItem = menuItems.find(item => item.path === location);

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          {/* Header da Sidebar */}
          <SidebarHeader className="h-16 justify-center border-b border-white/10">
            <div className="flex items-center gap-3 px-2 w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shrink-0"
                aria-label="Recolher menu"
              >
                <PanelLeft className="h-4 w-4 text-white/80" />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src="/manus-storage/nexus-logo_be12f249.png"
                    alt="NEXUS"
                    className="h-7 w-auto rounded-md object-contain bg-white p-0.5 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm leading-none truncate">NEXUS</p>
                    <p className="text-white/60 text-xs truncate">SEMED/SAIN</p>
                  </div>
                </div>
              )}
            </div>
          </SidebarHeader>

          {/* Itens de Navegação */}
          <SidebarContent className="gap-0 py-2">
            <SidebarMenu className="px-2">
              {menuItems.map(item => {
                const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal text-white/80 hover:text-white hover:bg-white/10 ${
                        isActive ? "bg-white/20 text-white font-medium" : ""
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          {/* Footer com perfil do usuário */}
          <SidebarFooter className="p-3 border-t border-white/10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/10 transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
                  <Avatar className="h-8 w-8 border border-white/20 shrink-0">
                    <AvatarFallback className="bg-white/20 text-white text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate leading-none">
                        {user?.name || "-"}
                      </p>
                      <p className="text-xs text-white/60 truncate mt-1">
                        {user?.role === "admin" ? "Administrador SAIN" : "Usuário Escola"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do Sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Handle de redimensionamento */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-white/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {/* Header mobile */}
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-primary px-3 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg text-white hover:bg-white/10" />
              <span className="font-medium text-white text-sm">
                {activeMenuItem?.label ?? "NEXUS"}
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
        {/* Rodapé institucional */}
        <footer className="border-t border-border/50 px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-muted-foreground bg-muted/20">
          <span>NEXUS — Plataforma de Gestão e Articulação da Rede de Inclusão</span>
          <span>SEMED/SAIN — Prefeitura Municipal de Betim</span>
        </footer>
      </SidebarInset>
    </>
  );
}
