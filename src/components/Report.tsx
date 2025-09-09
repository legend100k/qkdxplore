import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export const Report = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-quantum-glow">Experiment Report</h1>
        <Button className="bg-quantum-blue hover:bg-quantum-blue/90">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
      
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Quantum Key Distribution - BB84 Protocol Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Experiment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This report documents the analysis of the BB84 quantum key distribution protocol 
                  through various simulated experiments. The BB84 protocol, developed by Charles 
                  Bennett and Gilles Brassard in 1984, is a fundamental quantum cryptography protocol 
                  that enables secure communication by exploiting the principles of quantum mechanics.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Channel noise significantly affects key generation efficiency</li>
                  <li>Eavesdropping detection is possible through increased error rates</li>
                  <li>Qubit scaling improves statistical security of the protocol</li>
                  <li>Basis mismatch rate aligns with theoretical predictions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-secondary/20">
            <CardHeader>
              <CardTitle className="text-sm">Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-semibold text-quantum-purple">Noise Impact Analysis</h3>
                <p className="text-muted-foreground">
                  Our experiments demonstrate that channel noise has a direct linear relationship 
                  with error rates in the BB84 protocol. As noise levels increase from 0% to 20%, 
                  the error rate proportionally increases, reducing the efficiency of key generation.
                </p>
                
                <h3 className="font-semibold text-quantum-purple">Eavesdropping Detection</h3>
                <p className="text-muted-foreground">
                  The fundamental principle of quantum mechanics that measurement disturbs quantum 
                  states enables eavesdropping detection. Our results show that as eavesdropping 
                  probability increases, the error rate in the sifted key also increases, allowing 
                  legitimate parties to detect the presence of an eavesdropper.
                </p>
                
                <h3 className="font-semibold text-quantum-purple">Qubit Scaling Effects</h3>
                <p className="text-muted-foreground">
                  Larger numbers of qubits provide better statistical security. As the number of 
                  qubits increases, the confidence in the security of the generated key also increases, 
                  making it more difficult for an eavesdropper to remain undetected.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Tejas Naringrekar</li>
                  <li>Shantaram Chari</li>
                  <li>Harsh Mhadgut</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Dr. [Instructor Name]</p>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Institution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Vivekanand Education Society's Institute of Technology<br />
                  Department of Electronics and Telecommunication
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};