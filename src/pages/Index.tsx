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
      
      {/* Persistent About Us panel */}
      <div className="bg-secondary border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* About Us section */}
            <div>
              <h3 className="text-xl font-bold mb-4">About Us</h3>
              <p className="text-muted-foreground mb-4">
                This Quantum Key Distribution (QKD) E-Laboratory is developed as part of the Virtual Labs 
                initiative by the Ministry of Education, Government of India. The lab provides an interactive 
                platform to understand and experiment with the BB84 protocol, a fundamental quantum cryptography 
                protocol developed by Charles Bennett and Gilles Brassard in 1984.
              </p>
              <p className="text-muted-foreground">
                The simulation allows users to explore the principles of quantum key distribution, understand 
                the impact of eavesdropping, and analyze the security aspects of quantum communication.
              </p>
            </div>
            
            {/* Suggestion box and credits */}
            <div>
              <h3 className="text-xl font-bold mb-4">Feedback & Credits</h3>
              
              {/* Suggestion box */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Suggestions/Feedback</h4>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="flex-1 px-3 py-2 text-sm border rounded"
                  />
                  <a 
                    href="mailto:feedback@example.com" 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                  >
                    Send
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Send your suggestions and feedback to improve this laboratory
                </p>
              </div>
              
              {/* Credits */}
              <div>
                <h4 className="font-semibold mb-2">Credits</h4>
                <p className="text-sm text-muted-foreground">
                  Created by: Tejas Naringrekar, Shantaram Chari, Harsh Mhadgut<br />
                  Department of Electronics and Telecommunication<br />
                  Vivekanand Education Society's Institute of Technology<br />
                  Email: 2022.tejas.naringrekar@ves.ac.in
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
