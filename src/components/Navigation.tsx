import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-quantum-blue to-quantum-purple polarization-animation flex items-center justify-center">
            <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-quantum-glow rounded-full"></div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-secondary/50">
            <TabsTrigger value="theory" className="data-[state=active]:bg-primary">
              Theory
            </TabsTrigger>
            <TabsTrigger value="pre-quiz" className="data-[state=active]:bg-primary">
              Pre-Quiz
            </TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-primary">
              Simulation
            </TabsTrigger>
            <TabsTrigger value="experiments" className="data-[state=active]:bg-primary">
              Experiments
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary">
              Reports
            </TabsTrigger>
            <TabsTrigger value="post-quiz" className="data-[state=active]:bg-primary">
              Post-Quiz
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </Card>
  );
};