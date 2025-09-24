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
                  {teamMembers.map((member, index) => (
                    <span key={index}>
                      {member}<br />
                    </span>
                  ))}
                  <br />
                  Mentor: Mrs.Anuradha Jadiya<br />
                  Mentor: Dr. Ranjan Bala Jain<br />
                  Department of Electronics and Telecommunication<br />
                  Vivekanand Education Society's Institute of Technology<br />
                </p>
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