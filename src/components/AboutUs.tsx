import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AboutUs = () => {
  const teamMembers = [
    "Tejas Naringrekar",
    "Shantaram Chari",
    "Harsh Mhadgut",
    "Sharavani Kale",
    "Arundhati Nair",
    "Aniruddha Gharat"
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* About Us section */}
        <Card className="border-quantum-blue/30">
          <CardHeader>
            <CardTitle className="text-quantum-blue">About QkdXplore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This Quantum Key Distribution (QKD) E-Laboratory is developed as part of project for
                the Amravati Quantum Valley Hackathon (AQVH) 2025, IIC Andhra Pradesh by Team QuSec. The lab provides an interactive
                platform to understand and experiment with the BB84 protocol, a fundamental quantum cryptography
                protocol developed by Charles Bennett and Gilles Brassard in 1984.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credits section */}
        <Card className="border-quantum-purple/30">
          <CardHeader>
            <CardTitle className="text-quantum-purple">About Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold mb-2">Developed under guidance of:</h4>
                 <p className="text-sm text-muted-foreground"></p>
                  Dr. Ranjan Bala Jain<br />
                  Mrs.Anuradha Jadiya<br />
                  Department of Electronics and Telecommunication<br />
                  Vivekanand Education Society's Institute of Technology<br />
                <h5 className="font-bold mb-2">Team Members:</h5>
                <p className="text-sm text-muted-foreground"></p>
                  Aniruddha Gharat<br/>
                  Arundhati Nair<br/>
                  Harsh Mhadgut<br/>
                  Shantaram Chari<br/>
                  Sharavani Kale<br/>
                  Tejas Naringrekar<br/>
                 

              </div>

              <div>
                <h4 className="font-semibold mb-2">Suggestions & Feedback</h4>
                <div className="space-y-2">
                 
                  <Button
                    className="bg-quantum-blue hover:bg-quantum-blue/90"
                    onClick={() => window.location.href = 'mailto:qkdxplore@gmail.com'}
                  >
                    Mail Us
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Send your suggestions and feedback to improve this laboratory
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};