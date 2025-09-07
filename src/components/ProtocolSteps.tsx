import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users, Send, Shuffle, Key } from "lucide-react";

export const ProtocolSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Step 1: Alice's Preparation",
      icon: <Users className="w-6 h-6" />,
      description: "Alice generates a random sequence of bits and randomly chooses a basis (rectilinear + or diagonal ×) for each bit.",
      details: [
        "Generate random bit sequence: 1, 0, 1, 1, 0, 0, 1, 0...",
        "Choose random basis for each bit: +, ×, +, ×, +, ×, +, ×...",
        "Prepare photons according to bit value and basis",
        "Each combination creates a specific polarization state"
      ],
      animation: "polarization-animation"
    },
    {
      title: "Step 2: Quantum Transmission",
      icon: <Send className="w-6 h-6" />,
      description: "Alice sends the prepared photons through a quantum channel to Bob.",
      details: [
        "Photons travel through optical fiber or free space",
        "Each photon carries quantum information",
        "No classical information is transmitted",
        "Quantum states cannot be cloned (No-cloning theorem)"
      ],
      animation: "photon-animation"
    },
    {
      title: "Step 3: Bob's Measurement",
      icon: <Shuffle className="w-6 h-6" />,
      description: "Bob randomly chooses a measurement basis for each photon and measures its polarization.",
      details: [
        "Bob doesn't know Alice's chosen bases",
        "Randomly selects measurement basis for each photon",
        "Measures photon polarization",
        "Records measurement results"
      ],
      animation: "measurement-pulse"
    },
    {
      title: "Step 4: Basis Comparison",
      icon: <Users className="w-6 h-6" />,
      description: "Alice and Bob publicly compare their chosen bases (not the bit values).",
      details: [
        "Public announcement of basis choices only",
        "No revelation of actual bit values",
        "Identify positions where bases match",
        "Discard measurements from mismatched bases"
      ],
      animation: "quantum-glow"
    },
    {
      title: "Step 5: Key Sifting",
      icon: <Key className="w-6 h-6" />,
      description: "Keep only the bits where Alice and Bob used the same basis to form the raw key.",
      details: [
        "Extract bits from matching basis positions",
        "Discard all mismatched measurements",
        "Remaining bits form the 'raw key'",
        "Typically ~50% of original bits remain"
      ],
      animation: "quantum-glow"
    },
    {
      title: "Step 6: Error Detection & Privacy Amplification",
      icon: <Key className="w-6 h-6" />,
      description: "Test for eavesdropping and perform error correction and privacy amplification.",
      details: [
        "Compare subset of key bits publicly",
        "Calculate error rate (QBER)",
        "If error rate is low, proceed with error correction",
        "Apply privacy amplification to remove Eve's information"
      ],
      animation: "quantum-glow"
    }
  ];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  return (
    <div className="space-y-6">
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            {steps[currentStep].icon}
            BB84 Protocol Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={prevStep}
              variant="outline"
              className="border-quantum-purple/50 hover:bg-quantum-purple/10"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            <Button
              onClick={nextStep}
              variant="outline"
              className="border-quantum-purple/50 hover:bg-quantum-purple/10"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-quantum-blue to-quantum-purple' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-quantum-purple/30">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-quantum-blue to-quantum-purple flex items-center justify-center text-white ${steps[currentStep].animation}`}>
              {steps[currentStep].icon}
            </div>
            <h2 className="text-2xl font-bold text-quantum-purple mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-foreground/80 max-w-2xl mx-auto">
              {steps[currentStep].description}
            </p>
          </div>

          <Card className="bg-secondary/30 border-quantum-glow/20">
            <CardHeader>
              <CardTitle className="text-lg text-quantum-glow">Step Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {steps[currentStep].details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-quantum-blue rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-foreground/90">{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-quantum-blue/10 border-quantum-blue/30">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-quantum-blue rounded-full mx-auto mb-2"></div>
                <h3 className="font-semibold text-quantum-blue">Alice (Sender)</h3>
                <p className="text-xs text-muted-foreground">Prepares and sends qubits</p>
              </CardContent>
            </Card>
            
            <Card className="bg-quantum-glow/10 border-quantum-glow/30">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-quantum-glow rounded-full mx-auto mb-2 quantum-glow"></div>
                <h3 className="font-semibold text-quantum-glow">Quantum Channel</h3>
                <p className="text-xs text-muted-foreground">Transmits quantum states</p>
              </CardContent>
            </Card>
            
            <Card className="bg-quantum-purple/10 border-quantum-purple/30">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-quantum-purple rounded-full mx-auto mb-2"></div>
                <h3 className="font-semibold text-quantum-purple">Bob (Receiver)</h3>
                <p className="text-xs text-muted-foreground">Measures received qubits</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};