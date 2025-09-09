import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const AboutUs = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* About Us section */}
        <Card className="border-quantum-blue/30">
          <CardHeader>
            <CardTitle className="text-quantum-blue">About Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
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
          </CardContent>
        </Card>
        
        {/* Credits section */}
        <Card className="border-quantum-purple/30">
          <CardHeader>
            <CardTitle className="text-quantum-purple">Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Project Team</h4>
                <p className="text-sm text-muted-foreground">
                  Team Members:<br />
                  Tejas Naringrekar - 2022.tejas.naringrekar@ves.ac.in<br />
                  Shantaram Chari - 2022.shantaram.chari@ves.ac.in<br />
                  Harsh Mhadgut - 2022.harsh.mhadgut@ves.ac.in<br />
                  <br />
                  Mentor: Dr. [Mentor Name] - [mentor.email@ves.ac.in]<br />
                  Department of Electronics and Telecommunication<br />
                  Vivekanand Education Society's Institute of Technology<br />
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Suggestions & Feedback</h4>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="flex-1 px-3 py-2 text-sm border rounded"
                  />
                  <Button 
                    className="bg-quantum-blue hover:bg-quantum-blue/90"
                  >
                    Send
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Send your suggestions and feedback to improve this laboratory
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};