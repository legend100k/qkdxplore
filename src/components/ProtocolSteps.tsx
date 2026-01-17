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
      animation: "animate-pulse"
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
      animation: "animate-bounce"
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
      animation: "animate-pulse"
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
      animation: "animate-pulse"
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
      animation: "animate-pulse"
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
      animation: "animate-pulse"
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
      <Card className="border-none shadow-soft bg-white dark:bg-slate-950">
        <CardHeader className="pl-6 border-b border-gray-100 dark:border-gray-800 pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                {steps[currentStep].icon}
            </span>
            BB84 Protocol Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={prevStep}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="text-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            <Button
              onClick={nextStep}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-10">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-500/40 dark:to-purple-500/40' 
                    : 'bg-gray-200 dark:bg-gray-800'
                }`}
              />
            ))}
          </div>

          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-500/60 dark:to-purple-500/60 shadow-lg shadow-blue-500/20 dark:shadow-none flex items-center justify-center text-white ${steps[currentStep].animation}`}>
              {steps[currentStep].icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {steps[currentStep].description}
            </p>
          </div>

          <Card className="bg-slate-50 dark:bg-slate-900/50 border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Step Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {steps[currentStep].details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/20 shadow-none">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-5 h-5"/>
                </div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Alice (Sender)</h3>
                <p className="text-xs text-blue-700/70 dark:text-blue-400/70">Prepares and sends qubits</p>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/20 shadow-none">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Send className="w-5 h-5"/>
                </div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Quantum Channel</h3>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70">Transmits quantum states</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/20 shadow-none">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Shuffle className="w-5 h-5"/>
                </div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">Bob (Receiver)</h3>
                <p className="text-xs text-purple-700/70 dark:text-purple-400/70">Measures received qubits</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};