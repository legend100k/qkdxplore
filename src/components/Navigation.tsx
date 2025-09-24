import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "theory", label: "Theory"},
  { id: "pre-quiz", label: "Pre-Quiz"},
  { id: "simulation", label: "Simulation"},
  { id: "experiments", label: "Experiments"},
  { id: "hardware", label: "Info about quantum hardware"},
  //{ id: "qiskit", label: "Qiskit"},
  { id: "python", label: "Try it using python!"},
  { id: "reports", label: "Reports"},
  { id: "post-quiz", label: "Post-Quiz"},
  { id: "certificate", label: "Certificate"},
  { id: "about", label: "About"},
];

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <Card className="h-full quantum-glow border-quantum-blue/30">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-quantum-blue to-quantum-purple rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
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
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start h-12 ${
                activeTab === item.id
                  ? "bg-quantum-blue text-white hover:bg-quantum-blue/90"
                  : "hover:bg-secondary/50"
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="text-lg mr-3"></span>
              <span className="font-medium">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </Card>
  );
};