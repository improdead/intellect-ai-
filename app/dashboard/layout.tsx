"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  MessageSquare,
  BarChart,
  Brain,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Home,
  History,
  Search,
  User,
  Sparkles,
  Compass,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  // Check if mobile on mount and add resize listener
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login?connection=google-oauth2");
    }
  }, [user, isLoading, router]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "intelect", href: "/dashboard/intelect", icon: MessageSquare },
    { name: "Quiz", href: "/dashboard/quiz", icon: Brain },
    { name: "Research", href: "/dashboard/research", icon: BookOpen },
    { name: "Progress", href: "/dashboard/progress", icon: BarChart },
    { name: "History", href: "/dashboard/history", icon: History },
  ];

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(isSidebarOpen || !isMobile) && (
          <motion.aside
            initial={{ x: isMobile ? -280 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-card border-r border-border/30 shadow-lg",
              isMobile ? "shadow-xl" : ""
            )}
          >
            {/* Sidebar header */}
            <div className="flex h-16 items-center justify-between px-4 py-4">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent float-slow">
                  <motion.div
                    className="absolute inset-0 opacity-80"
                    animate={{
                      background: [
                        "radial-gradient(circle at 20% 30%, rgba(25, 167, 206, 0.8) 0%, rgba(25, 167, 206, 0) 70%)",
                        "radial-gradient(circle at 70% 60%, rgba(25, 167, 206, 0.8) 0%, rgba(25, 167, 206, 0) 70%)",
                        "radial-gradient(circle at 40% 80%, rgba(25, 167, 206, 0.8) 0%, rgba(25, 167, 206, 0) 70%)",
                        "radial-gradient(circle at 20% 30%, rgba(25, 167, 206, 0.8) 0%, rgba(25, 167, 206, 0) 70%)",
                      ],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
                <span className="text-lg font-bold group-hover:text-primary transition-colors duration-300">
                  intelect
                </span>
              </Link>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "mr-3 h-5 w-5 transition-transform duration-300",
                            isActive ? "text-primary" : "text-muted-foreground",
                            "group-hover:scale-110"
                          )}
                        />
                        <span>{item.name}</span>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-indicator"
                            className="absolute left-0 h-full w-1.5 rounded-r-md bg-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* User section */}
            <div className="border-t border-border/30 p-4 mt-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : user ? (
                <>
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name || "User"}
                          className="h-9 w-9 rounded-full shadow-sm object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center shadow-sm">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-sm font-medium">
                          {user.name || "User"}
                        </p>
                        <Link
                          href="/profile"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors duration-300"
                        >
                          View profile
                        </Link>
                      </div>
                    </div>
                    <ThemeToggle />
                  </motion.div>
                  <motion.div
                    className="mt-4 flex items-center justify-between gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 group"
                    >
                      <Link href="/profile">
                        <Settings className="mr-2 h-4 w-4 group-hover:rotate-45 transition-transform duration-300" />
                        Settings
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="flex-1 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </motion.div>
                </>
              ) : null}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out bg-background",
          isSidebarOpen && !isMobile ? "ml-64" : "ml-0"
        )}
      >
        <motion.div
          className="container mx-auto p-6 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
