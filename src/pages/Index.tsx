import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { EnhancedTheorySection } from "@/components/EnhancedTheorySection";
import { PreQuiz } from "@/components/PreQuiz";
import { SimulationSection } from "@/components/SimulationSection";
import { ExperimentsSection } from "@/components/ExperimentsSection";
import { ReportsSection } from "@/components/ReportsSection";
import { PostQuiz } from "@/components/PostQuiz";
import { AboutUs } from "@/components/AboutUs";
import { Certificate } from "@/components/Certificate";

const Index = () => {
  const [activeTab, setActiveTab] = useState("theory");
  const [postQuizScore, setPostQuizScore] = useState<number | null>(null);

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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Header with college logo */}
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img 
                src="https://vesit.ves.ac.in/website_tour/skin/Image_A0096B4D_B18D_2BFC_41B8_ED811B459B6B_mobile_en.png?v=1656663582984" 
                alt="Vivekanand Education Society's Institute of Technology" 
                className="h-16 w-auto object-contain"
              />
              <h1 className="text-xl font-bold text-foreground">Vivekanand Education Society's Institute of Technology</h1>
            </div>
            <p className="text-sm text-muted-foreground">Department of Electronics and Telecommunication</p>
          </div>
        </div>
        
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
