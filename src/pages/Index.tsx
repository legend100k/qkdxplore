import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { EnhancedTheorySection } from "@/components/EnhancedTheorySection";
import { PreQuiz } from "@/components/PreQuiz";
import { SimulationSection } from "@/components/SimulationSection";
import { ExperimentsSection } from "@/components/ExperimentsSection";
import { QuantumHardware } from "@/components/QuantumHardware";
import { QiskitIntegration } from "@/components/QiskitIntegration";
import { ReportsSection } from "@/components/ReportsSection";
import { PostQuiz } from "@/components/PostQuiz";
import { AboutUs } from "@/components/AboutUs";
import { Certificate } from "@/components/Certificate";
import { ExperimentResult } from "@/components/ExperimentsSection";

const Index = () => {
  const [activeTab, setActiveTab] = useState("theory");
  const [postQuizScore, setPostQuizScore] = useState<number | null>(null);
  const [experimentResults, setExperimentResults] = useState<{ [key: string]: ExperimentResult }>({});

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
      case "reports":
        return <ReportsSection availableExperiments={Object.values(experimentResults)} />;
      case "post-quiz":
        return <PostQuiz onQuizComplete={(score) => setPostQuizScore(score)} />;
      case "certificate":
        return <Certificate postQuizScore={postQuizScore || 0} />;
      case "about":
        return <AboutUs />;
      default:
        return <EnhancedTheorySection />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
