"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  Settings,
  BarChart3,
  Calculator,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Calculator, label: "Simulations", href: "/simulations" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: FileText, label: "Documentation", href: "/docs" },
  { icon: Users, label: "Team", href: "/team" },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.div
      className={cn("flex flex-col h-full transition-all duration-300", isOpen ? "w-72" : "w-16")}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">VL</span>
          </div>
          {isOpen && <span className="font-semibold text-slate-800">Virtual Lab</span>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <motion.li
              key={item.href}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 * index }}
            >
              <Link href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start px-3 py-2 rounded-lg",
                    pathname === item.href ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </Button>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Toggle Button */}
      <motion.div
        className="p-2 border-t border-slate-200"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full justify-center p-2 rounded-lg hover:bg-slate-100"
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </motion.div>
    </motion.div>
  );
}