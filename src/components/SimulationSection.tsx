import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  RotateCw,
  Zap,
  Eye,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  StepForward,
  Loader2,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
// Google Charts is loaded via script tag in index.html
// We'll implement type definitions for Google Charts
declare global {
  interface Window {
    google: any;
  }
}

// Add CSS animations
const animationStyles = `
  @keyframes photon-vibrate {
    0% { transform: translate(0, 0); }
    25% { transform: translate(-1px, -1px); }
    50% { transform: translate(1px, -1px); }
    75% { transform: translate(-1px, 1px); }
    100% { transform: translate(1px, 1px); }
  }

  @keyframes photon-fall {
    0% { 
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% { 
      transform: translateY(100px) rotate(180deg);
      opacity: 0;
    }
  }

  @keyframes eve-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }

  @keyframes photon-transmission {
    0% { 
      left: 0%; 
      opacity: 1; 
    }
    100% { 
      left: 100%; 
      opacity: 1; 
    }
  }

  .animate-vibrate {
    animation: photon-vibrate 0.1s infinite;
  }

  .animate-fall {
    animation: photon-fall 1s ease-in forwards;
    transition: none;
  }

  .animate-pulse {
    animation: eve-pulse 1s infinite;
  }

  .animate-photon-transmission {
    animation: photon-transmission 2s ease-in-out forwards;
  }
`;

// Inject CSS animations into the document (only once)
let styleSheetAdded = false;
if (typeof document !== "undefined" && !styleSheetAdded) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "quantum-bb84-animations";
  styleSheet.innerText = animationStyles;
  document.head.appendChild(styleSheet);
  styleSheetAdded = true;
}

interface QuantumBit {
  id: number;
  aliceBit: number;
  aliceBasis: string;
  bobBasis: string;
  bobMeasurement: number | null;
  isMatching: boolean | null;
  inKey: boolean;
}

interface BB84Result {
  alice_bits: number[];
  alice_bases: number[];
  bob_bases: number[];
  bob_results: number[];
  alice_key: number[];
  bob_key: number[];
  qber: number;
  job_id: string;
  key_length: number;
  keys_match: boolean;
}

interface APIResponse {
  success: boolean;
  data?: BB84Result;
  error?: string;
}

const getBasisSymbol = (basis: string): string => {
  switch (basis) {
    case "+":
      return "→"; // Rectilinear basis (Horizontal/Vertical)
    case "×":
      return "↗"; // Diagonal basis (Diagonal/Anti-diagonal)
    default:
      return basis;
  }
};

const getPolarization = (bit: number, basis: string): string => {
  if (basis === "+") {
    return bit === 0 ? "H" : "V";
  } else {
    return bit === 0 ? "+45°" : "-45°";
  }
};

const getPolarizationSymbol = (bit: number, basis: string): string => {
  if (basis === "+") {
    return bit === 0 ? "→" : "↑";
  } else {
    return bit === 0 ? "↗" : "↖";
  }
};

export const SimulationSection = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [quantumBits, setQuantumBits] = useState<QuantumBit[]>([]);
  const [finalKey, setFinalKey] = useState<string>("");
  const [photonPosition, setPhotonPosition] = useState(0);
  const [numQubits, setNumQubits] = useState([16]);
  const [eavesdroppingRate, setEavesdroppingRate] = useState([0]);
  const [noiseLevel, setNoiseLevel] = useState([0]);
  const [simulationData, setSimulationData] = useState<Array<{name: string, value: number | string}>>([]);
  const [showGraphs, setShowGraphs] = useState(false);
  const [isStepByStep, setIsStepByStep] = useState(false);
  const [currentBitIndex, setCurrentBitIndex] = useState(0);
  const [stepByStepBits, setStepByStepBits] = useState<QuantumBit[]>([]);
  const [bitStep, setBitStep] = useState(0);

  // Animation state variables
  const [isPhotonVisible, setIsPhotonVisible] = useState(false);
  const [isPhotonVibrating, setIsPhotonVibrating] = useState(false);
  const [isPhotonFalling, setIsPhotonFalling] = useState(false);
  const [statusInfo, setStatusInfo] = useState("Ready...");
  const [isStatusInfoVisible, setIsStatusInfoVisible] = useState(false);
  const [activeEve, setActiveEve] = useState<number | null>(null);
  const [aliceBit, setAliceBit] = useState("-");
  const [aliceBasis, setAliceBasis] = useState("-");
  const [alicePol, setAlicePol] = useState("-");
  const [bobBasis, setBobBasis] = useState("-");
  const [bobBit, setBobBit] = useState("-");
  const [bobResult, setBobResult] = useState("-");
  const [alicePolarizer, setAlicePolarizer] = useState("+");
  const [bobPolarizer, setBobPolarizer] = useState("+");
  const [evePolarizers, setEvePolarizers] = useState<
    Array<{ measure: string; send: string }>
  >([
    { measure: "+", send: "+" },
    { measure: "+", send: "+" },
    { measure: "+", send: "+" },
    { measure: "+", send: "+" },
    { measure: "+", send: "+" },
  ]);
  const [numEves, setNumEves] = useState(0);

  // Calculate number of Eves based on eavesdropping rate
  useEffect(() => {
    // Calculate number of Eves based on eavesdropping rate (0-100%)
    const calculatedNumEves = Math.floor((eavesdroppingRate[0] / 100) * 5); // Max 5 Eves in the visualization
    setNumEves(calculatedNumEves);
    
    // Randomize Eve polarizers when eavesdropping rate changes
    if (eavesdroppingRate[0] > 0) {
      randomizeEvePolarizers();
    }
  }, [eavesdroppingRate]);

  const steps = [
    "Alice generates random bits and bases",
    "Alice sends photons to Bob",
    "Photon transmitted",
    "Bob randomly chooses measurement bases",
    "Bob measures photons",
    "Public basis comparison",
    "Key sifting and final key generation",
  ];

  // Initialize animation on mount
  useEffect(() => {
    // Set initial state for animation
    setAliceBit("-");
    setAliceBasis("-");
    setAlicePol("-");
    setBobBasis("-");
    setBobBit("-");
    setBobResult("-");
    setAlicePolarizer("+");
    setBobPolarizer("+");
    setEvePolarizers([
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
    ]);
    setNumEves(0);
    hidePhoton();
    hideStatusInfo();

    // Cleanup function for component unmount
    return () => {
      const photonElement = document.querySelector('.photon-particle') as HTMLElement;
      if (photonElement) {
        photonElement.classList.remove('animate-photon-transmission', 'animate-vibrate', 'animate-fall');
      }
    };
  }, []);

  // Load Google Charts when component mounts
  useEffect(() => {
    loadGoogleCharts();
  }, []);

  const generateRandomBits = () => {
    const bits: QuantumBit[] = [];
    const totalBits = numQubits[0];
    const eavesProbability = eavesdroppingRate[0] / 100;
    const noise = noiseLevel[0] / 100;

    for (let i = 0; i < totalBits; i++) {
      const aliceBit = Math.random() > 0.5 ? 1 : 0;
      const aliceBasis = Math.random() > 0.5 ? "+" : "×";
      const bobBasis = Math.random() > 0.5 ? "+" : "×";

      const isMatching = aliceBasis === bobBasis;
      let bobMeasurement = null;
      let inKey = false;

      // Bob measures the photon
      if (isMatching) {
        // When bases match, Bob should get the same bit as Alice (in ideal conditions)
        bobMeasurement = aliceBit;
        inKey = true;

        // Apply eavesdropping effect
        if (eavesProbability > 0 && Math.random() < eavesProbability) {
          // Eve intercepts the photon and randomly changes the bit with 75% probability
          // This simulates Eve measuring in a random basis and sending a new photon
          if (Math.random() < 0.75) {
            bobMeasurement = 1 - bobMeasurement;
          }
          // Activate one of the Eves visually in the animation
          const eveIndex = Math.floor(Math.random() * 5); // Choose a random Eve to activate
          setTimeout(() => activateEve(eveIndex), 100); // Delay activation for better visual effect
        }

        // Apply noise effect
        if (noise > 0 && Math.random() < noise) {
          bobMeasurement = 1 - bobMeasurement;
        }
      } else {
        // When bases don't match, Bob gets a random result
        bobMeasurement = Math.random() > 0.5 ? 1 : 0;
        inKey = false;
      }

      bits.push({
        id: i,
        aliceBit,
        aliceBasis,
        bobBasis,
        bobMeasurement,
        isMatching,
        inKey,
      });
    }
    return bits;
  };

  // Animation control functions
  const updateAliceInfo = useCallback((bit: number, basis: string) => {
    setAliceBit(bit.toString());
    setAliceBasis(getBasisSymbol(basis));
    setAlicePol(getPolarization(bit, basis));
  }, []);

  const updateBobInfo = useCallback((
    basis: string,
    bit: number | null,
    result: number | null,
  ) => {
    setBobBasis(getBasisSymbol(basis));
    setBobBit(bit !== null ? bit.toString() : "-");
    setBobResult(result !== null ? result.toString() : "-");
  }, []);

  const updatePolarizers = useCallback((aliceBasis: string, bobBasis: string) => {
    setAlicePolarizer(getBasisSymbol(aliceBasis));
    setBobPolarizer(getBasisSymbol(bobBasis));
  }, []);

  const updateEvePolarizers = useCallback((
    index: number,
    measureBasis: string,
    sendBasis: string,
  ) => {
    setEvePolarizers((prev) => {
      const newPolarizers = [...prev];
      newPolarizers[index] = {
        measure: getBasisSymbol(measureBasis),
        send: getBasisSymbol(sendBasis),
      };
      return newPolarizers;
    });
  }, []);

  const randomizeEvePolarizers = useCallback(() => {
    setEvePolarizers((prev) => {
      return prev.map(() => ({
        measure: Math.random() > 0.5 ? "+" : "×",
        send: Math.random() > 0.5 ? "+" : "×",
      }));
    });
  }, []);

  const activateEve = useCallback((index: number) => {
    setActiveEve(index);
    setTimeout(() => setActiveEve(null), 1500);
  }, []);

  const showPhoton = useCallback(() => {
    setIsPhotonVisible(true);
  }, []);

  const hidePhoton = useCallback(() => {
    setIsPhotonVisible(false);
    setIsPhotonVibrating(false);
    setIsPhotonFalling(false);
  }, []);

  const vibratePhoton = useCallback(() => {
    setIsPhotonVibrating(true);
  }, []);

  const stopVibratingPhoton = useCallback(() => {
    setIsPhotonVibrating(false);
  }, []);

  const fallPhoton = useCallback(() => {
    setIsPhotonFalling(true);
  }, []);

  const animatePhotonTransmission = useCallback(async () => {
    // Reset photon position and show it
    setPhotonPosition(0);
    showPhoton();
    
    // Use CSS animation for smoother transmission
    const photonElement = document.querySelector('.photon-particle') as HTMLElement;
    if (photonElement) {
      photonElement.classList.add('animate-photon-transmission');
    }
    
    // Animate photon from left to right with smoother steps
    for (let pos = 0; pos <= 100; pos += 2) {
      setPhotonPosition(pos);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    // Clean up animation class
    if (photonElement) {
      photonElement.classList.remove('animate-photon-transmission');
    }
  }, [showPhoton]);

  const updateStatusInfo = (text: string) => {
    setStatusInfo(text);
    setIsStatusInfoVisible(true);
  };

  const hideStatusInfo = () => {
    setIsStatusInfoVisible(false);
  };

  const setPhotonPositionAnimated = (position: number) => {
    setPhotonPosition(position);
  };

  const updateNumEves = (num: number) => {
    setNumEves(num);
  };

  const generateStepByStepBits = () => {
    const bits: QuantumBit[] = [];
    const totalBits = numQubits[0];

    for (let i = 0; i < totalBits; i++) {
      const aliceBit = Math.random() > 0.5 ? 1 : 0;
      const aliceBasis = Math.random() > 0.5 ? "+" : "×";
      const bobBasis = Math.random() > 0.5 ? "+" : "×";

      bits.push({
        id: i,
        aliceBit,
        aliceBasis,
        bobBasis,
        bobMeasurement: null,
        isMatching: null,
        inKey: false,
      });
    }
    return bits;
  };

  const processBitStep = (bitIndex: number, step: number) => {
    const eavesProbability = eavesdroppingRate[0] / 100;
    const noise = noiseLevel[0] / 100;

    setStepByStepBits((prevBits) => {
      const newBits = [...prevBits];
      const bit = newBits[bitIndex];

      if (step === 3) {
        // Bob measures
        const isMatching = bit.aliceBasis === bit.bobBasis;
        bit.isMatching = isMatching;

        if (isMatching) {
          // When bases match, Bob should get the same bit as Alice (in ideal conditions)
          let aliceBitToBob = bit.aliceBit;
          bit.inKey = true;

          // Apply eavesdropping effect - Eve intercepts the photon before Bob measures
          if (eavesProbability > 0 && Math.random() < eavesProbability) {
            // Eve chooses a random basis to measure the photon
            const eveBasis = Math.random() > 0.5 ? "+" : "×";

            if (eveBasis === bit.aliceBasis) {
              // If Eve chooses the same basis as Alice, she gets the correct bit
              // But if she forwards it in a different basis, there's a 50% chance it changes
              if (eveBasis !== bit.bobBasis) {
                // When Eve measures correctly but forwards in different basis, Bob has 50% chance of getting wrong result
                if (Math.random() > 0.5) {
                  aliceBitToBob = 1 - aliceBitToBob;
                }
              }
            } else {
              // If Eve chooses different basis than Alice, the quantum state collapses to Eve's measurement
              // This means when Eve forwards it, Bob has a 50% chance of getting either value regardless of Alice's original bit
              aliceBitToBob =
                Math.random() > 0.5 ? aliceBitToBob : 1 - aliceBitToBob;
            }
          }

          // Apply noise effect
          if (noise > 0 && Math.random() < noise) {
            aliceBitToBob = 1 - aliceBitToBob;
          }

          // Bob receives the possibly altered bit
          bit.bobMeasurement = aliceBitToBob;
        } else {
          // When bases don't match, Bob gets a random result
          bit.bobMeasurement = Math.random() > 0.5 ? 1 : 0;
          bit.inKey = false;
        }
      }

      return newBits;
    });

    // Update animation state for current bit
    if (bitIndex < stepByStepBits.length) {
      const currentBit = stepByStepBits[bitIndex];
      if (currentBit) {
        updateAliceInfo(currentBit.aliceBit, currentBit.aliceBasis);
        updateBobInfo(currentBit.bobBasis, currentBit.aliceBit, currentBit.bobMeasurement);
        updatePolarizers(currentBit.aliceBasis, currentBit.bobBasis);
      }
    }
  };

  const startStepByStepMode = () => {
    setIsStepByStep(true);
    const bits = generateStepByStepBits();
    setStepByStepBits(bits);
    setCurrentBitIndex(0);
    setBitStep(0);
    setShowGraphs(false);
    setFinalKey("");
    toast.success(
      "Step-by-step mode started. Use the controls to step through each bit.",
    );
  };

  const nextBitStep = async () => {
    if (bitStep < 4) {
      // Handle photon animation for step 2 (photon transmission)
      if (bitStep === 1) { // When moving from step 1 to step 2 (photon transmission)
        await animatePhotonTransmission();
        // Only increment step after animation completes
        setBitStep(bitStep + 1);
      } else {
        const newBitStep = bitStep + 1;
        setBitStep(newBitStep);
        
        // Process bit step after state update
        if (newBitStep === 3) {
          // Use setTimeout to ensure state is updated before processing
          setTimeout(() => {
            processBitStep(currentBitIndex, newBitStep);
          }, 0);
        }
      }
    } else if (currentBitIndex < stepByStepBits.length - 1) {
      // Before moving to the next bit, clear Bob's measurement if bases don't match
      setStepByStepBits(prevBits => {
        const newBits = [...prevBits];
        const currentBit = newBits[currentBitIndex];
        
        // If bases don't match, clear Bob's measurement for this bit to show that it's discarded
        if (currentBit && !currentBit.isMatching && currentBit.inKey === false) {
          currentBit.bobMeasurement = null;
        }
        
        return newBits;
      });
      
      setCurrentBitIndex(currentBitIndex + 1);
      setBitStep(0);
    } else {
      // Finished all bits
      const finalBits = stepByStepBits.filter((bit) => bit.inKey);
      const key = finalBits.map((bit) => bit.aliceBit).join("");
      setFinalKey(key);
      generateAnalysisData(stepByStepBits);
      setShowGraphs(true);
      toast.success(
        `Step-by-step simulation complete! Generated ${key.length}-bit key.`,
      );
    }
  };

  const previousBitStep = () => {
    if (bitStep > 0) {
      setBitStep(bitStep - 1);
    } else if (currentBitIndex > 0) {
      setCurrentBitIndex(currentBitIndex - 1);
      setBitStep(4);
    }
  };

  const runSimulation = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setFinalKey("");

    for (let step = 0; step <= 5; step++) {
      setCurrentStep(step);

      if (step === 1) {
        // Animate photon transmission with improved animation
        await animatePhotonTransmission();
        hidePhoton();
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const bits = generateRandomBits();
    setQuantumBits(bits);

    const key = bits
      .filter((bit) => bit.inKey)
      .map((bit) => bit.aliceBit)
      .join("");
    setFinalKey(key);

    // Generate analysis data
    generateAnalysisData(bits);
    setShowGraphs(true);

    toast.success(`Simulation complete! Generated ${key.length}-bit key.`);
    setIsRunning(false);
  };

  const generateAnalysisData = (bits: QuantumBit[]) => {
    // Calculate QBER (Quantum Bit Error Rate) as: mismatched bits / total bits
    // This counts the total number of mismatched bits between Alice and Bob over all bits
    const mismatchedBits = bits.filter(
      (bit) => bit.bobMeasurement !== null && bit.aliceBit !== bit.bobMeasurement
    );
    const qber = bits.length > 0
      ? (mismatchedBits.length / bits.length) * 100
      : 0;

    // Prepare data for display
    const data = [
      { name: "Total Bits", value: bits.length },
      { name: "Matching Bases", value: bits.filter((bit) => bit.isMatching).length },
      { name: "Key Bits", value: bits.filter((bit) => bit.inKey).length },
      { name: "QBER (%)", value: qber.toFixed(2) }, // Fixed to be QBER instead of error rate
    ];

    setSimulationData(data);
    
    // Render the chart with the new data
    setTimeout(() => renderSimulationMetricsChart(data), 100);
  };

  // Function to load Google Charts
  const loadGoogleCharts = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        window.google.load('visualization', '1', { packages: ['corechart', 'bar'] });
        window.google.setOnLoadCallback(() => resolve(window.google));
        return;
      }
      
      // Load the Google Charts script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/charts/loader.js';
      script.async = true;
      script.onload = () => {
        window.google.charts.load('current', { packages: ['corechart', 'bar'] });
        window.google.charts.setOnLoadCallback(() => resolve(window.google));
      };
      script.onerror = () => reject(new Error('Failed to load Google Charts'));
      document.head.appendChild(script);
    });
  };

  // Function to render the simulation metrics chart (counts only)
  const renderSimulationMetricsChart = (data: Array<{name: string, value: number | string}>) => {
    loadGoogleCharts().then(() => {
      const totalBits = Number(data[0]?.value || 0);
      const matchingBases = Number(data[1]?.value || 0);
      const keyBits = Number(data[2]?.value || 0);

      const chartData = [
        ['Metric', 'Value'],
        [data[0]?.name || 'Total Bits', totalBits],
        [data[1]?.name || 'Matching Bases', matchingBases],
        [data[2]?.name || 'Key Bits', keyBits],
      ];

      const dataTable = window.google.visualization.arrayToDataTable(chartData);

      const options = {
        title: 'Simulation Metrics',
        chartArea: { width: '70%', height: '70%' },
        hAxis: {
          title: 'Count',
          minValue: 0,
        },
        vAxis: {
          title: 'Metrics',
        },
        colors: ['#3b82f6'],
        legend: { position: 'none' },
      };

      const chart = new window.google.visualization.BarChart(
        document.getElementById('simulation-metrics-chart')
      );
      chart.draw(dataTable, options);
    }).catch(error => {
      console.error('Error loading Google Charts:', error);
      const chartDiv = document.getElementById('simulation-metrics-chart');
      if (chartDiv) {
        chartDiv.innerHTML = '<p>Chart failed to load. Metrics: ' + JSON.stringify(data) + '</p>';
      }
    });
  };

  // (Reverted) No separate QBER gauge chart

  const resetSimulation = () => {
    setCurrentStep(0);
    setQuantumBits([]);
    setFinalKey("");
    setPhotonPosition(0);
    setIsRunning(false);
    setShowGraphs(false);
    setSimulationData([]);
    setIsStepByStep(false);
    setCurrentBitIndex(0);
    setStepByStepBits([]);
    setBitStep(0);

    // Reset animation state
    setAliceBit("-");
    setAliceBasis("-");
    setAlicePol("-");
    setBobBasis("-");
    setBobBit("-");
    setBobResult("-");
    setAlicePolarizer("+");
    setBobPolarizer("+");
    setEvePolarizers([
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
      { measure: "+", send: "+" },
    ]);
    setNumEves(0);
    hidePhoton();
    hideStatusInfo();
    setActiveEve(null);

    // Clean up any running animations
    const photonElement = document.querySelector('.photon-particle') as HTMLElement;
    if (photonElement) {
      photonElement.classList.remove('animate-photon-transmission', 'animate-vibrate', 'animate-fall');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alice-Bob Animation Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Quantum Transmission Animation
          </h2>
        </div>
        <div className="flex items-center justify-between min-h-[250px] relative">
          {/* Alice */}
          <div className="flex flex-col items-center w-32 z-10">
            <div className="w-20 h-20 rounded-full mb-3 flex items-center justify-center text-3xl border-4 border-pink-400 bg-gradient-to-r from-pink-200 to-pink-300 shadow-lg">
              👩‍🦰
            </div>
            <div className="font-bold text-gray-800 mb-3">Alice</div>
            <div className="bg-gray-100 p-3 rounded-lg text-sm w-full text-center border border-gray-200">
              <div className="font-medium">
                Bit: <strong>{aliceBit}</strong>
              </div>
              <div className="font-medium">
                Basis: <strong>{aliceBasis}</strong>
              </div>
              
            </div>
          </div>

          {/* Channel Area */}
          <div className="flex-1 h-16 mx-8 relative flex items-center justify-center">
            <div
              className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 relative shadow-sm"
              style={{ boxShadow: "0 0 15px rgba(52, 152, 219, 0.4)" }}
            >
              <div
                className={`photon-particle absolute w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full top-[-11px] flex items-center justify-center font-bold text-gray-800 shadow-lg transition-all duration-300 ${
                  isPhotonVisible ? "opacity-100" : "opacity-0"
                } ${isPhotonVibrating ? "animate-vibrate" : ""} ${isPhotonFalling ? "animate-fall" : ""}`}
                style={{
                  left: `${photonPosition}%`,
                  boxShadow: "0 0 20px rgba(241, 196, 15, 0.7)",
                  transform: `translateX(${photonPosition}%)`,
                }}
              >
                →
              </div>
              <div
                className={`absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-opacity whitespace-nowrap ${
                  isStatusInfoVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                {statusInfo}
              </div>
            </div>

            {/* Alice Polarizer */}
            <div className="absolute left-[10%] top-1/2 transform -translate-y-1/2 z-20">
              <div
                className={`w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 border-4 border-gray-700 flex items-center justify-center font-bold text-xl text-gray-800 shadow-lg ${
                  alicePolarizer === "×" ? "rotate-[45deg]" : ""
                }`}
              >
                {alicePolarizer}
              </div>
            </div>

            {/* Eve Polarizer Pairs */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`absolute top-1/2 transform -translate-y-1/2 z-20 ${i === 0 ? "left-[25%]" : i === 1 ? "left-[35%]" : i === 2 ? "left-[45%]" : i === 3 ? "left-[55%]" : "left-[65%]"} ${
                  i < numEves ? "block" : "hidden"
                }`}
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-xs text-white border-2 border-red-600 shadow-lg mb-2 font-bold transition-all ${
                    activeEve === i ? "animate-pulse scale-110" : ""
                  }`}
                >
                  E{i + 1}
                </div>
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r from-red-100 to-red-200 border-3 border-red-600 flex items-center justify-center font-bold text-lg text-red-600 shadow ${
                      evePolarizers[i]?.measure === "×" ? "rotate-[45deg]" : ""
                    }`}
                  >
                    {evePolarizers[i]?.measure || "+"}
                  </div>
                  <div
                    className={`w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 border-3 border-green-600 flex items-center justify-center font-bold text-lg text-green-600 shadow ${
                      evePolarizers[i]?.send === "×" ? "rotate-[45deg]" : ""
                    }`}
                  >
                    {evePolarizers[i]?.send || "+"}
                  </div>
                </div>
              </div>
            ))}

            {/* Bob Polarizer */}
            <div className="absolute right-[10%] top-1/2 transform -translate-y-1/2 z-20">
              <div
                className={`w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 border-4 border-gray-700 flex items-center justify-center font-bold text-xl text-gray-800 shadow-lg ${
                  bobPolarizer === "×" ? "rotate-[45deg]" : ""
                }`}
              >
                {bobPolarizer}
              </div>
            </div>
          </div>

          {/* Bob */}
          <div className="flex flex-col items-center w-32 z-10">
            <div className="w-20 h-20 rounded-full mb-3 flex items-center justify-center text-3xl border-4 border-indigo-500 bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-lg">
              👨‍💼
            </div>
            <div className="font-bold text-gray-800 mb-3">Bob</div>
            <div className="bg-gray-100 p-3 rounded-lg text-sm w-full text-center border border-gray-200">
              <div className="font-medium">
                Basis: <strong>{bobBasis}</strong>
              </div>
              <div className="font-medium">
                Measures: <strong>{bobBit}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-quantum-blue/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-quantum-blue flex items-center gap-2">
              <Zap className="w-6 h-6" />
              BB84 Protocol Simulation
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => setIsStepByStep(!isStepByStep)}
                variant={isStepByStep ? "default" : "outline"}
                className={`border-quantum-purple/30 ${isStepByStep ? "bg-quantum-purple hover:bg-quantum-purple/90" : ""}`}
                size="sm"
              >
                <StepForward className="w-4 h-4 mr-1" />
                {isStepByStep ? "Step" : "Auto"}
              </Button>
              {!isStepByStep ? (
                <Button
                  onClick={runSimulation}
                  disabled={isRunning}
                  className="bg-quantum-blue hover:bg-quantum-blue/90"
                  size="sm"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Running
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={startStepByStepMode}
                  disabled={stepByStepBits.length > 0}
                  className="bg-quantum-blue hover:bg-quantum-blue/90"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-quantum-glow/30"
                size="sm"
              >
                <RotateCw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-column layout for simulation controls and results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Controls */}

            <div className="space-y-6">
              {/* Simulation Parameters */}
              {!isStepByStep || stepByStepBits.length === 0 ? (
                <Card className="border-quantum-blue/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Simulation Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Qubits:
                        </label>
                        <Slider
                          value={numQubits}
                          onValueChange={setNumQubits}
                          max={50}
                          min={8}
                          step={2}
                          className="flex-1"
                          disabled={isRunning}
                        />
                        <span className="text-sm w-8">{numQubits[0]}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Eavesdrop:
                        </label>
                        <Slider
                          value={eavesdroppingRate}
                          onValueChange={setEavesdroppingRate}
                          max={100}
                          min={0}
                          step={5}
                          className="flex-1"
                          disabled={isRunning}
                        />
                        <span className="text-sm w-8">
                          {eavesdroppingRate[0]}%
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium whitespace-nowrap">
                          Noise:
                        </label>
                        <Slider
                          value={noiseLevel}
                          onValueChange={setNoiseLevel}
                          max={20}
                          min={0}
                          step={1}
                          className="flex-1"
                          disabled={isRunning}
                        />
                        <span className="text-sm w-8">{noiseLevel[0]}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Place the progress visualization here when simulation is running */}
                  <Card className="border-quantum-glow/30">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Step-by-Step Visualization - Bit {currentBitIndex + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                                    {/* Step-by-step controls */}
              {isStepByStep && stepByStepBits.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={previousBitStep}
                    disabled={currentBitIndex === 0 && bitStep === 0}
                    variant="outline"
                    className="border-quantum-purple/30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={nextBitStep}
                    disabled={
                      currentBitIndex === stepByStepBits.length - 1 &&
                      bitStep === 4 &&
                      !!finalKey
                    }
                    className="bg-quantum-purple hover:bg-quantum-purple/90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <span className="text-sm px-3 py-2 bg-muted rounded border whitespace-nowrap">
                    Bit {currentBitIndex + 1}/{stepByStepBits.length} - Step{" "}
                    {bitStep + 1}/5
                  </span>
                </div>
              )}
                      {stepByStepBits[currentBitIndex] && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-quantum-blue/30">
                              <CardHeader>
                                <CardTitle className="text-quantum-blue flex items-center gap-2 text-sm">
                                  <span className="text-lg">👩‍🔬</span>
                                  Alice (Sender)
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Bit Value:</span>
                                  <span
                                    className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 0 ? "bg-quantum-blue/20 text-quantum-blue" : "bg-muted/20 text-muted-foreground"}`}
                                  >
                                    {bitStep >= 0
                                      ? stepByStepBits[currentBitIndex].aliceBit
                                      : "?"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Basis Choice:</span>
                                  <span
                                    className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 0 ? "bg-quantum-blue/20 text-quantum-blue" : "bg-muted/20 text-muted-foreground"}`}
                                  >
                                    {bitStep >= 0
                                      ? getBasisSymbol(
                                          stepByStepBits[currentBitIndex]
                                            .aliceBasis,
                                        )
                                      : "?"}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="border-quantum-purple/30">
                              <CardHeader>
                                <CardTitle className="text-quantum-purple flex items-center gap-2 text-sm">
                                  <span className="text-lg">👨‍🔬</span>
                                  Bob (Receiver)
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Basis Choice:</span>
                                  <span
                                    className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 1 ? "bg-quantum-purple/20 text-quantum-purple" : "bg-muted/20 text-muted-foreground"}`}
                                  >
                                    {bitStep >= 1
                                      ? getBasisSymbol(
                                          stepByStepBits[currentBitIndex]
                                            .bobBasis,
                                        )
                                      : "?"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Measurement:</span>
                                  <span
                                    className={`font-mono text-lg px-2 py-1 rounded ${bitStep >= 3 ? "bg-quantum-purple/20 text-quantum-purple" : "bg-muted/20 text-muted-foreground"}`}
                                  >
                                    {bitStep >= 3
                                      ? stepByStepBits[currentBitIndex]
                                          .bobMeasurement
                                      : "?"}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">
                              Current Step:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {[
                                "Alice prepares qubit",
                                "Photon transmitted",
                                "Bob selects measurement basis",
                                "Bob measures qubit",
                                "Bases compared",
                              ].map((step, index) => (
                                <div
                                  key={index}
                                  className={`p-4 rounded text-sm text-center transition-all ${
                                    bitStep === index
                                      ? "bg-quantum-glow/20 border-2 border-quantum-glow text-quantum-glow font-semibold"
                                      : bitStep > index
                                        ? "bg-green-400/20 border border-green-400/30 text-green-400"
                                        : "bg-muted/20 border border-muted/30 text-muted-foreground"
                                  }`}
                                >
                                  {step}
                                </div>
                              ))}
                            </div>
                          </div>

                          {bitStep >= 4 && (
                            <Card
                              className={`${stepByStepBits[currentBitIndex].isMatching ? "bg-green-400/10 border-green-400/30" : "bg-red-400/10 border-red-400/30"}`}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Basis Match:
                                  </span>
                                  <span
                                    className={`font-bold ${stepByStepBits[currentBitIndex].isMatching ? "text-green-400" : "text-red-400"}`}
                                  >
                                    {stepByStepBits[currentBitIndex].isMatching
                                      ? "✓ Yes - Key bit!"
                                      : "X No - Discarded"}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-4">
                {currentStep > 0 && !isStepByStep && (
                  <Card className="bg-quantum-blue/5 border-quantum-blue/20">
                    <CardContent className="p-3">
                      <p className="font-semibold text-quantum-blue">
                        Current Step:
                      </p>
                      <p className="text-sm">{steps[currentStep - 1]}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {false && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive rounded">
                    <Eye className="w-4 h-4 text-destructive" />
                    
                  </div>
                )}

                {noiseLevel[0] > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500 rounded">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-500">
                      Noise ({noiseLevel[0]}%)
                    </span>
                  </div>
                )}
              </div>




              {/* Photon transmission visualization */}
              {currentStep === 1 && !isStepByStep && (
                <Card className="border-quantum-glow/30">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Photon Transmission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-20 bg-muted rounded-lg overflow-hidden">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-quantum-blue font-bold">
                        Alice
                      </div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-quantum-purple font-bold">
                        Bob
                      </div>
                      <div
                        className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-quantum-glow rounded-full transition-all duration-100"
                        style={{ left: `${photonPosition}%` }}
                      ></div>
                      {eavesdroppingRate[0] > 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-destructive font-bold">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column - Results */}
            <div className="space-y-6">
              {/* Results Display */}
              {(quantumBits.length > 0 ||
                (isStepByStep && stepByStepBits.length > 0)) && (
                <Card className="border-quantum-purple/30">
                  <CardHeader>
                    <CardTitle className="text-quantum-purple flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      Simulation Results
                      {isStepByStep && (
                        <span className="text-sm font-normal ml-2 px-2 py-1 bg-quantum-glow/20 rounded">
                          Step-by-Step Mode
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-quantum-blue/30">
                            <th className="text-left p-2">Bit #</th>
                            <th className="text-left p-2 bg-quantum-blue/10 border-l border-r border-quantum-blue/30">
                              <div className="text-center">
                                <div className="font-bold text-quantum-blue">
                                  Alice (Transmitter)
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Sending
                                </div>
                              </div>
                            </th>
                            <th className="text-left p-2 bg-quantum-blue/10 border-r border-quantum-blue/30">
                              Basis
                            </th>
                            <th className="text-left p-2 bg-quantum-purple/10 border-l border-r border-quantum-purple/30">
                              <div className="text-center">
                                <div className="font-bold text-quantum-purple">
                                  Bob (Receiver)
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Receiving
                                </div>
                              </div>
                            </th>
                            <th className="text-left p-2 bg-quantum-purple/10 border-r border-quantum-purple/30">
                              Basis
                            </th>
                            <th className="text-left p-2 bg-quantum-purple/10 border-r border-quantum-purple/30">
                              Result
                            </th>
                            <th className="text-left p-2">Match</th>
                            <th className="text-left p-2">In Key</th>
                          </tr>
                          <tr className="border-b border-quantum-blue/20 text-xs">
                            <th className="p-1"></th>
                            <th className="p-1 bg-quantum-blue/5 text-center text-quantum-blue">
                              Transmitted Bit
                            </th>
                            <th className="p-1 bg-quantum-blue/5 text-center text-quantum-blue">
                              Polarization
                            </th>
                            <th className="p-1 bg-quantum-purple/5 text-center text-quantum-purple">
                              Received Bit
                            </th>
                            <th className="p-1 bg-quantum-purple/5 text-center text-quantum-purple">
                              Measurement
                            </th>
                            <th className="p-1 bg-quantum-purple/5 text-center text-quantum-purple">
                              Outcome
                            </th>
                            <th className="p-1 text-center">Basis</th>
                            <th className="p-1 text-center">Secure</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(isStepByStep 
                            ? stepByStepBits.slice(0, currentBitIndex + 1) // Only show rows up to current bit in step-by-step mode
                            : quantumBits
                          ).map(
                            (bit, index) => (
                              <tr
                                key={bit.id}
                                className={`border-b ${bit.inKey ? "bg-quantum-glow/10" : ""} ${isStepByStep && index === currentBitIndex ? "ring-2 ring-quantum-glow/50" : ""}`}
                              >
                                <td className="p-2">{bit.id + 1}</td>
                                <td className="p-2 font-mono text-center bg-quantum-blue/5 border-l border-r border-quantum-blue/20">
                                  <span className="inline-block w-6 h-6 bg-quantum-blue/20 rounded-full text-center leading-6 text-quantum-blue font-bold">
                                    {bit.aliceBit}
                                  </span>
                                </td>
                                <td className="p-2 font-mono text-quantum-blue bg-quantum-blue/5 border-r border-quantum-blue/20 text-center">
                                  <span className="text-lg font-bold">
                                    {getBasisSymbol(bit.aliceBasis)}
                                  </span>
                                </td>
                                <td className="p-2 font-mono text-center bg-quantum-purple/5 border-l border-r border-quantum-purple/20">
                                  <span className="inline-block w-6 h-6 bg-quantum-purple/20 rounded-full text-center leading-6 text-quantum-purple font-bold">
                                    {bit.bobMeasurement ?? "-"}
                                  </span>
                                </td>
                                <td className="p-2 font-mono text-quantum-purple bg-quantum-purple/5 border-r border-quantum-purple/20 text-center">
                                  <span className="text-lg font-bold">
                                    {getBasisSymbol(bit.bobBasis)}
                                  </span>
                                </td>
                                <td className="p-2 bg-quantum-purple/5 border-r border-quantum-purple/20 text-center">
                                  {bit.bobMeasurement !== null ? (
                                    <span
                                      className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-bold ${
                                        bit.aliceBit === bit.bobMeasurement
                                          ? "bg-green-400/20 text-green-400"
                                          : "bg-red-400/20 text-red-400"
                                      }`}
                                    >
                                      {bit.bobMeasurement}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-center">
                                  {bit.isMatching === null ? (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  ) : (
                                    <span
                                      className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-bold ${
                                        bit.isMatching
                                          ? "bg-green-400/20 text-green-400"
                                          : "bg-red-400/20 text-red-400"
                                      }`}
                                    >
                                      {bit.isMatching ? "✓" : "X"}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-center">
                                  {bit.inKey ? (
                                    <span className="inline-block w-6 h-6 bg-quantum-glow/20 rounded-full text-center leading-6 text-quantum-glow font-bold">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>

                    {finalKey && (
                      <Card className="bg-quantum-glow/10 border-quantum-glow/30">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <h3 className="font-bold text-quantum-glow mb-2">
                              Final Shared Key
                            </h3>
                            <div className="font-mono text-lg bg-background/50 p-3 rounded border">
                              {finalKey}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              Length: {finalKey.length} bits
                              {eavesdroppingRate[0] > 0 && (
                                <span className="block text-destructive">
                                  ⚠️ Eavesdropping detected! Key may be
                                  compromised.
                                </span>
                              )}
                              {noiseLevel[0] > 0 && (
                                <span className="block text-yellow-500">
                                  ⚠️ Channel noise present! Some errors
                                  expected.
                                </span>
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Analysis Graphs */}
              {showGraphs && simulationData.length > 0 && (
                <Card className="border-quantum-glow/30">
                  <CardHeader>
                    <CardTitle className="text-quantum-glow flex items-center gap-2">
                      <BarChart3 className="w-6 h-6" />
                      Simulation Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-secondary/20">
                        <CardHeader>
                          <CardTitle className="text-sm">
                          Simulation Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64" id="simulation-metrics-chart">
                            {/* Google Chart will be rendered here */}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-secondary/20">
                        <CardHeader>
                          <CardTitle className="text-sm">
                          Error Rate (QBER)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-4">
                          {simulationData.slice(3).map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-background/50 rounded"
                            >
                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                              <span
                                className={`text-lg font-bold ${
                                  item.name.includes("Error") || item.name.includes("QBER")
                                    ? "text-red-400"
                                    : "text-green-400"
                                }`}
                              >
                                {item.value}%
                              </span>
                            </div>
                          ))}

                          <div className="mt-4 p-3 bg-quantum-glow/10 border border-quantum-glow/30 rounded">
                            <h4 className="font-semibold text-quantum-glow text-sm mb-2">
                              Security Assessment
                            </h4>
                            <p className="text-xs">
                              {parseFloat(
                                String(simulationData[3]?.value || "0"),
                              ) > 10
                                ? "⚠️ High error rate detected! Possible eavesdropping or excessive noise."
                                : "✅ Error rate within acceptable limits for secure communication."}
                            </p>
                            <div className="mt-2 text-xs">
                              <p className="font-medium">
                                Key Security Status:
                              </p>
                              <p
                                className={
                                  parseFloat(
                                    String(simulationData[3]?.value || "0"),
                                  ) > 10
                                    ? "text-destructive"
                                    : parseFloat(
                                          String(
                                            simulationData[3]?.value || "0",
                                          ),
                                        ) > 5
                                      ? "text-yellow-500"
                                      : "text-green-400"
                                }
                              >
                                {parseFloat(
                                  String(simulationData[3]?.value || "0"),
                                ) > 10
                                  ? "Key may be compromised! Discard and restart."
                                  : parseFloat(
                                        String(
                                          simulationData[3]?.value || "0",
                                        ),
                                      ) > 5
                                    ? "Possible eavesdropping detected. Review key."
                                    : "Key appears secure for communication."}
                              </p>
                            </div>
                          </div>
                        </div>
                        </CardContent>
                      </Card>
                      
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
