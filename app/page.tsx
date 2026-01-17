"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ControlPanel } from "@/components/ControlPanel";
import { LabWorkbench } from "@/components/LabWorkbench";
import { LiveResultsCard } from "@/components/LiveResultsCard";
import { motion } from "framer-motion";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading } = useAuth();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 64 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="border-r border-slate-200 bg-white shadow-sm"
      >
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <motion.header
          className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-xl font-semibold text-slate-800">Quantum Simulation Lab</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-500 italic">Guest Mode</div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <motion.div
          className="flex-1 overflow-auto p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {/* Control Panel - Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ControlPanel />
            </motion.div>

            {/* Lab Workbench - Main Simulation Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <LabWorkbench />
            </motion.div>

            {/* Live Results Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <LiveResultsCard />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}