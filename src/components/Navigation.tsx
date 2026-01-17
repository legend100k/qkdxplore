import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, Cpu, FlaskConical, Cable, Code, FilePieChart, FileQuestion, GraduationCap, Info, Newspaper } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";


interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void; // Changed from 'id' to 'tab' to match original, but original had (tab: string)
  className?: string;
  onClose?: () => void;
}

const navigationItems = [
  { id: "theory", label: "Concepts", icon: BookOpen },
  { id: "pre-quiz", label: "Knowledge Check", icon: FileQuestion },
  { id: "simulation", label: "BB84 Simulation", icon: Cpu },
  { id: "experiments", label: "Virtual Lab", icon: FlaskConical },
  { id: "hardware", label: "Lab Equipment", icon: Info },
  //{ id: "qiskit", label: "Qiskit"},
  { id: "python", label: "Code Explorer", icon: Code },
  { id: "reports", label: "Experiment Reports", icon: FilePieChart },
  { id: "post-quiz", label: "Assesment", icon: FileText },    
  { id: "certificate", label: "Certification", icon : Newspaper},
  { id: "about", label: "Credits", icon: GraduationCap }
];

const getIcon = (id: string) => {
  const item = navigationItems.find(navItem => navItem.id === id);
  return item?.icon || BookOpen;
};

export const Navigation = ({ activeTab, onTabChange, className, onClose }: NavigationProps) => {
  return (
    <Card className={cn(
      "h-full rounded-none border-r border-border border-l-0 border-t-0 border-b-0 bg-sidebar shadow-none doc-sidebar",
      className
    )}>
      <div className="px-5 py-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <img src="/qkd_temp_logo.png" alt="QKD Logo" className="w-5 h-5 object-contain dark:brightness-0 dark:invert" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-semibold text-foreground">
              QKD_Xplore
            </h1>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Documentation
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contents</p>
          {navigationItems.map((item) => {
            const IconComponent = getIcon(item.id);
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-9 px-2 text-left font-normal transition-all duration-150 rounded-md group",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                onClick={() => {
                  onTabChange(item.id);
                  if (onClose) onClose();
                }}
              >
                <IconComponent className={cn(
                  "w-4 h-4 mr-3 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-auto pt-4 border-t border-border/60">
          <div className="flex items-center justify-between mb-3">
             <span className="text-xs font-medium text-muted-foreground">Theme</span>
             <ThemeToggle />
          </div>
          <div className="text-[11px] text-muted-foreground">
            v1.0.0 • {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </Card>
  );
};