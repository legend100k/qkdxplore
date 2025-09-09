import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const Certificate = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <Card className="border-quantum-glow/30 max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="border-b border-quantum-glow/30 pb-6">
              <h1 className="text-4xl font-bold text-quantum-glow mb-2">Certificate of Completion</h1>
              <p className="text-muted-foreground">This certificate is proudly presented to</p>
            </div>
            
            <div className="py-8">
              <h2 className="text-3xl font-bold mb-4">[Student Name]</h2>
              <p className="text-lg text-muted-foreground mb-2">
                For successfully completing the Quantum Key Distribution (QKD) E-Laboratory
              </p>
              <p className="text-lg text-muted-foreground">
                BB84 Protocol Simulation and Experiments
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
              <div>
                <p className="font-semibold">Instructor</p>
                <p className="text-muted-foreground">Dr. [Instructor Name]</p>
              </div>
              <div>
                <p className="font-semibold">Date</p>
                <p className="text-muted-foreground">{currentDate}</p>
              </div>
              <div>
                <p className="font-semibold">Institution</p>
                <p className="text-muted-foreground">Vivekanand Education Society's Institute of Technology</p>
              </div>
            </div>
            
            <div className="flex justify-center pt-6">
              <Button className="bg-quantum-blue hover:bg-quantum-blue/90">
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};