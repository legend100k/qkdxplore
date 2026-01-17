import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { EnhancedTheorySection } from "@/components/EnhancedTheorySection";
import { PreQuiz } from "@/components/PreQuiz";
import { SimulationSection } from "@/components/SimulationSection";
import { ExperimentsSection } from "@/components/ExperimentsSection";
import { QuantumHardware } from "@/components/QuantumHardware";
import { QiskitIntegration } from "@/components/QiskitIntegration";
import PythonCodeEditor from "@/components/PythonCodeEditor";
import { ReportsSection } from "@/components/ReportsSection";
import { PostQuiz } from "@/components/PostQuiz";
import { AboutUs } from "@/components/AboutUs";
import Certificate from "@/components/Certificate";
import { ExperimentResult } from "@/components/ExperimentsSection";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [activeTab, setActiveTab] = useState("theory");
  const [postQuizScore, setPostQuizScore] = useState<number | null>(null);
  const [experimentResults, setExperimentResults] = useState<{ [key: string]: ExperimentResult }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSaveExperiment = (result: ExperimentResult) => {
    setExperimentResults(prev => ({
      ...prev,
      [result.id]: result
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "theory":
        return <EnhancedTheorySection />;
      case "pre-quiz":
        return <PreQuiz />;
      case "simulation":
        return <SimulationSection />;
      case "experiments":
        return <ExperimentsSection onSaveExperiment={handleSaveExperiment} />;
      case "hardware":
        return <QuantumHardware />;
      case "qiskit":
        return <QiskitIntegration />;
      case "python":
        return <PythonCodeEditor />;
      case "reports":
        return <ReportsSection availableExperiments={Object.values(experimentResults)} />;
      case "post-quiz":
        return <PostQuiz onQuizComplete={(score) => setPostQuizScore(score)} />;
      case "certificate":
        return <Certificate quizScore={postQuizScore || 0} />;
      case "about":
        return <AboutUs />;
      default:
        return <EnhancedTheorySection />;
    }
  };

  return (
    <div className="min-h-screen doc-shell flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-border/70 z-50 bg-background/95 backdrop-blur-md sticky top-0 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <img src="/qkd_temp_logo.png" alt="QKD" className="w-5 h-5 object-contain dark:brightness-0 dark:invert" />
          </div>
          <span className="font-semibold text-base text-foreground">
            QKD_Xplore
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted/60 rounded-md">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-none w-80">
            <Navigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onClose={() => setIsMobileMenuOpen(false)}
              className="h-full rounded-none border-none"
            />
          </SheetContent>
        </Sheet>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="hidden md:block w-72 flex-shrink-0 h-screen sticky top-0">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="p-6 md:p-8 lg:p-10 w-full doc-content mx-auto space-y-8 animate-in fade-in duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
