import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { EnhancedTheorySection } from "@/components/EnhancedTheorySection";
import { PreQuiz } from "@/components/PreQuiz";
import { SimulationSection } from "@/components/SimulationSection";
import { ExperimentsSection } from "@/components/ExperimentsSection";
import { ReportsSection } from "@/components/ReportsSection";
import { PostQuiz } from "@/components/PostQuiz";

const Index = () => {
  const [activeTab, setActiveTab] = useState("theory");

  const renderContent = () => {
    switch (activeTab) {
      case "theory":
        return <EnhancedTheorySection />;
      case "pre-quiz":
        return <PreQuiz />;
      case "simulation":
        return <SimulationSection />;
      case "experiments":
        return <ExperimentsSection />;
      case "reports":
        return <ReportsSection />;
      case "post-quiz":
        return <PostQuiz />;
      default:
        return <EnhancedTheorySection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
