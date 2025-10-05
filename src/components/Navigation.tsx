import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookOpen, FileText, Cpu, FlaskConical, Cable, Code, FilePieChart, FileQuestion, GraduationCap, Info } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "theory", label: "Theory", icon: BookOpen },
  { id: "pre-quiz", label: "Pre-Quiz", icon: FileQuestion },
  { id: "simulation", label: "Simulation", icon: Cpu },
  { id: "experiments", label: "Experiments", icon: FlaskConical },
  { id: "hardware", label: "Info about quantum hardware", icon: Info },
  //{ id: "qiskit", label: "Qiskit"},
  { id: "python", label: "Try it using python!", icon: Code },
  { id: "reports", label: "Reports", icon: FilePieChart },
  { id: "post-quiz", label: "Post-Quiz", icon: FileText },    
  //{ id: "certificate", label: "Certificate"},
  { id: "about", label: "About", icon: GraduationCap },
];

const getIcon = (id: string) => {
  const item = navigationItems.find(navItem => navItem.id === id);
  return item?.icon || BookOpen;
};

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <Card className="h-full quantum-glow border-quantum-blue/30">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-quantum-blue to-quantum-purple rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm"><img src="qkd_temp_logo.png"></img></span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-quantum-blue to-quantum-purple bg-clip-text text-transparent">
                QKD Xplore
              </h1>
              <p className="text-xs text-muted-foreground">
                Quantum Lab
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = getIcon(item.id);
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start h-12 text-left ${
                  activeTab === item.id
                    ? "bg-quantum-blue text-white hover:bg-quantum-blue/90"
                    : "hover:bg-secondary/50"
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <IconComponent className="text-lg mr-3" />
                <span className="font-medium flex-1 text-left truncate">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </Card>
  );
};