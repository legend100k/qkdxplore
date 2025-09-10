import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <Card className="mb-8 quantum-glow border-quantum-blue/30">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-quantum-blue to-quantum-purple bg-clip-text text-transparent">
              QKD_Xplore
            </h1>
            <p className="text-muted-foreground mt-2">
              Quantum Key Distribution E-Laboratory
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-secondary/50">
            <TabsTrigger value="theory" className="data-[state=active]:bg-quantum-blue data-[state=active]:text-white">
              Theory
            </TabsTrigger>
            <TabsTrigger value="pre-quiz" className="data-[state=active]:bg-quantum-blue data-[state=active]:text-white">
              Pre-Quiz
            </TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-quantum-blue data-[state=active]:text-white">
              Simulation
            </TabsTrigger>
            <TabsTrigger value="experiments" className="data-[state=active]:bg-quantum-blue data-[state=active]:text-white">
              Experiments
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-quantum-blue data-[state=active]:text-white">
              Reports
            </TabsTrigger>
            <TabsTrigger value="post-quiz" className="data-[state=active]:bg-quantum-blue data-[state=active]:text-white">
              Post-Quiz
            </TabsTrigger>
            <TabsTrigger value="certificate" className="data-[state=active]:bg-quantum-blue data-[state=active]:text-white">
              Certificate
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-quantum-blue data-[state=active]:text-white">
              About
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </Card>
  );
};