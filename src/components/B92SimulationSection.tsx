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
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  StepForward,
  Loader2,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import {
  PolarizationState,
  applyOpticalNoise,
  legacyNoiseToOptical,
} from "@/lib/opticalNoise";

// Google Charts is loaded via script tag in index.html
// We'll implement type definitions for Google Charts
declare global {
  interface Window {
    google: any;
  }
}

interface B92QuantumBit {
  id: number;
  aliceState: number; // 0 or 1 representing non-orthogonal states |0⟩ and |+⟩
  bobBasis: number; // 0 or 1 representing measurement bases
  bobResult: number | null; // 0, 1, or null (undetected)
  inKey: boolean;
  intercepted: boolean;
  eveBasis: number | null;
  eveResult: number | null;
  eveResendState: number | null;
}

interface B92Result {
  n_bits: number;
  alice_states: number[];
  bob_bases: number[];
  bob_results: number[];
  sifted_key_alice: number[];
  sifted_key_bob: number[];
  qber: number;
  key_length: number;
  keys_match: boolean;
}

interface APIResponse {
  success: boolean;
  data?: B92Result;
  error?: string;
}

const getStateSymbol = (state: number): string => {
  switch (state) {
    case 0:
      return "→"; // Horizontal polarization (|0⟩ state)
    case 1:
      return "↗"; // 45-degree polarization (|+⟩ state)
    default:
      return "?";
  }
};

const getBasisSymbol = (basis: number): string => {
  switch (basis) {
    case 0:
      return "↕"; // Vertical measurement basis (dual to |0⟩)
    case 1:
      return "↘"; // -45-degree measurement basis (dual to |+⟩)
    default:
      return "?";
  }
};

export const B92SimulationSection = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [quantumBits, setQuantumBits] = useState<B92QuantumBit[]>([]);
  const [finalKey, setFinalKey] = useState<string>("");
  const [photonPosition, setPhotonPosition] = useState(0);
  const [numBits, setNumBits] = useState([16]);
  const [eavesdroppingRate, setEavesdroppingRate] = useState([0]);
  const [noiseLevel, setNoiseLevel] = useState([0]);
  const [simulationData, setSimulationData] = useState<Array<{name: string, value: number | string}>>([]);
  const [showGraphs, setShowGraphs] = useState(false);
  const [isStepByStep, setIsStepByStep] = useState(false);
  const [currentBitIndex, setCurrentBitIndex] = useState(0);
  const [stepByStepBits, setStepByStepBits] = useState<B92QuantumBit[]>([]);
  const [bitStep, setBitStep] = useState(0);

  // Animation state variables
  const [isPhotonVisible, setIsPhotonVisible] = useState(false);
  const [isPhotonVibrating, setIsPhotonVibrating] = useState(false);
  const [isPhotonFalling, setIsPhotonFalling] = useState(false);
  const [statusInfo, setStatusInfo] = useState("Ready...");
  const [isStatusInfoVisible, setIsStatusInfoVisible] = useState(false);
  const [activeEve, setActiveEve] = useState<number | null>(null);
  const [aliceState, setAliceState] = useState("-");
  const [bobBasis, setBobBasis] = useState("-");
  const [bobResult, setBobResult] = useState("-");
  const [alicePolarizer, setAlicePolarizer] = useState("→");
  const [bobPolarizer, setBobPolarizer] = useState("↕");
  const [evePolarizers, setEvePolarizers] = useState<
    Array<{ measure: string; send: string }>
  >([
    { measure: "→", send: "→" },
    { measure: "→", send: "→" },
    { measure: "→", send: "→" },
    { measure: "→", send: "→" },
    { measure: "→", send: "→" },
  ]);
  const [numEves, setNumEves] = useState(0);

  // Calculate number of Eves based on eavesdropping rate (percentage-based)
  useEffect(() => {
    const calculatedNumEves =
      eavesdroppingRate[0] === 0
        ? 0
        : Math.min(5, Math.ceil(eavesdroppingRate[0] / 20));
    setNumEves(calculatedNumEves);

    // Randomize Eve polarizers when eavesdropping rate changes
    if (eavesdroppingRate[0] > 0) {
      randomizeEvePolarizers();
    }
  }, [eavesdroppingRate]);

  const steps = [
    "Alice prepares qubits in non-orthogonal states",
    "Alice sends qubits to Bob",
    "Qubits transmitted through quantum channel",
    "Bob randomly measures in conjugate bases",
    "Public discussion to identify detection events",
    "Key sifting and final key generation"
  ];

  // Initialize animation on mount
  useEffect(() => {
    // Set initial state for animation
    setAliceState("-");
    setBobBasis("-");
    setBobResult("-");
    setAlicePolarizer("→");
    setBobPolarizer("↕");
    setEvePolarizers([
      { measure: "→", send: "→" },
      { measure: "→", send: "→" },
      { measure: "→", send: "→" },
      { measure: "→", send: "→" },
      { measure: "→", send: "→" },
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
    const bits: B92QuantumBit[] = [];
    const totalBits = numBits[0];
    // Eavesdropping rate: 0-100% probability of interception
    const eavesProbability = eavesdroppingRate[0] / 100;

    // Convert legacy noise slider to optical noise parameters
    const opticalParams = legacyNoiseToOptical(noiseLevel[0] * 3, 10); // Amplify noise effect

    for (let i = 0; i < totalBits; i++) {
      // Alice randomly selects one of two non-orthogonal states
      // In B92: |0⟩ (horizontal) and |+⟩ (45-degree) = (|0⟩ + |1⟩)/√2
      const aliceState = Math.random() > 0.5 ? 1 : 0;

      // Bob randomly chooses one of two conjugate measurement bases
      // In B92: vertical (dual to |0⟩) and -45-degree (dual to |+⟩)
      const bobBasis = Math.random() > 0.5 ? 1 : 0;

      let bobResult: number | null = null;
      let inKey = false;
      let intercepted = false;
      let eveBasis: number | null = null;
      let eveResult: number | null = null;
      let eveResendState: number | null = null;

      // Create polarization state for the photon
      let photonState: PolarizationState = {
        basis: aliceState === 0 ? 'rectilinear' : 'diagonal',
        bit: aliceState,
        amplitude: 1.0,
        phase: 0
      };

      // Apply eavesdropping effect
      if (eavesProbability > 0 && Math.random() < eavesProbability) {
        intercepted = true;

        // Eve intercepts the photon and measures in a random basis
        eveBasis = Math.random() > 0.5 ? 1 : 0;

        // Eve measures the photon in her chosen basis
        // Due to non-orthogonality, she gets probabilistic results
        if (eveBasis === aliceState) {
          // For conjugate basis measurements, result is probabilistic
          eveResult = Math.random() > 0.5 ? 1 : 0;
        } else {
          // For same basis, she gets the correct bit with high probability
          eveResult = aliceState;
        }

        // Eve resends a photon in a random state (not knowing Alice's original)
        eveResendState = Math.random() > 0.5 ? 1 : 0;

        // Eve's measurement and resend introduces disturbance
        photonState = {
          basis: eveResendState === 0 ? 'rectilinear' : 'diagonal',
          bit: eveResult,  // Eve sends what she measured
          amplitude: 0.7,  // Eve's measurement disturbs the quantum state
          phase: Math.random() * Math.PI / 4, // Add random phase disturbance
        };

        // Activate one of the Eves visually in the animation
        const eveIndex = Math.floor(Math.random() * 5);
        setTimeout(() => activateEve(eveIndex), 100);
      }

      // Apply optical noise to the photon during transmission
      const noisyPhoton = applyOpticalNoise(photonState, opticalParams);

      // Bob performs measurement - in B92, he only accepts results when he detects a photon
      // Bob's measurement depends on his chosen basis
      if (noisyPhoton) {
        // Bob measures in his chosen basis
        // In B92, Bob only keeps results when he gets a detection event
        // Probabilities depend on overlap between Alice's state and Bob's measurement basis
        
        // Simplified detection model: Bob gets result based on quantum probabilities
        if (Math.random() > 0.3) { // Detection efficiency ~70%
          // Bob's result depends on overlap between Alice's state and his measurement
          const prob = aliceState === bobBasis ? 0.8 : 0.2; // High correlation when bases match conceptually
          bobResult = Math.random() < prob ? aliceState : 1 - aliceState;
          
          // In B92, only detected events are kept for the key
          inKey = true;
        }
      }

      bits.push({
        id: i,
        aliceState,
        bobBasis,
        bobResult,
        inKey,
        intercepted,
        eveBasis,
        eveResult,
        eveResendState,
      });
    }
    return bits;
  };

  // Animation control functions
  const updateAliceInfo = useCallback((state: number) => {
    setAliceState(getStateSymbol(state));
  }, []);

  const updateBobInfo = useCallback((basis: number, result: number | null) => {
    setBobBasis(getBasisSymbol(basis));
    setBobResult(result !== null ? result.toString() : "-");
  }, []);

  const updatePolarizers = useCallback((aliceState: number, bobBasis: number) => {
    setAlicePolarizer(getStateSymbol(aliceState));
    setBobPolarizer(getBasisSymbol(bobBasis));
  }, []);

  const randomizeEvePolarizers = useCallback(() => {
    setEvePolarizers((prev) => {
      return prev.map(() => ({
        measure: Math.random() > 0.5 ? "→" : "↗",
        send: Math.random() > 0.5 ? "→" : "↗",
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

  const generateStepByStepBits = () => {
    const bits: B92QuantumBit[] = [];
    const totalBits = numBits[0];

    for (let i = 0; i < totalBits; i++) {
      const aliceState = Math.random() > 0.5 ? 1 : 0;
      const bobBasis = Math.random() > 0.5 ? 1 : 0;

      bits.push({
        id: i,
        aliceState,
        bobBasis,
        bobResult: null,
        inKey: false,
        intercepted: false,
        eveBasis: null,
        eveResult: null,
        eveResendState: null,
      });
    }
    return bits;
  };

  const processBitStep = (bitIndex: number, step: number) => {
    // Eavesdropping rate: 0-100% probability of interception
    const eavesProbability = eavesdroppingRate[0] / 100;
    // Convert legacy noise slider to optical noise parameters
    const opticalParams = legacyNoiseToOptical(noiseLevel[0] * 3, 10); // Amplify noise effect

    setStepByStepBits((prevBits) => {
      const newBits = [...prevBits];
      const bit = newBits[bitIndex];

      if (step === 3) {
        // Bob measures the photon
        // Create polarization state for the photon
        let photonState: PolarizationState = {
          basis: bit.aliceState === 0 ? 'rectilinear' : 'diagonal',
          bit: bit.aliceState,
          amplitude: 1.0,
          phase: 0
        };

        // Apply eavesdropping effect
        if (eavesProbability > 0 && Math.random() < eavesProbability) {
          bit.intercepted = true;

          // Eve intercepts the photon and measures in a random basis
          bit.eveBasis = Math.random() > 0.5 ? 1 : 0;

          // Eve measures the photon in her chosen basis
          if (bit.eveBasis === bit.aliceState) {
            // For conjugate basis measurements, result is probabilistic
            bit.eveResult = Math.random() > 0.5 ? 1 : 0;
          } else {
            // For same basis, she gets the correct bit with high probability
            bit.eveResult = bit.aliceState;
          }

          // Eve resends a photon in a random state (not knowing Alice's original)
          bit.eveResendState = Math.random() > 0.5 ? 1 : 0;

          // Eve's measurement and resend introduces disturbance
          photonState = {
            basis: bit.eveResendState === 0 ? 'rectilinear' : 'diagonal',
            bit: bit.eveResult!,  // Eve sends what she measured
            amplitude: 0.7,  // Eve's measurement disturbs the quantum state
            phase: Math.random() * Math.PI / 4, // Add random phase disturbance
          };
        }

        // Apply optical noise to the photon
        const noisyPhoton = applyOpticalNoise(photonState, opticalParams);

        // Bob performs measurement
        if (noisyPhoton) {
          // Bob's result depends on overlap between Alice's state and his measurement
          const prob = bit.aliceState === bit.bobBasis ? 0.8 : 0.2;
          const bobResult = Math.random() < prob ? bit.aliceState : 1 - bit.aliceState;
          
          // In B92, only detected events are kept for the key
          bit.bobResult = bobResult;
          bit.inKey = true;
        } else {
          bit.bobResult = null;
          bit.inKey = false;
        }
      }

      return newBits;
    });

    // Update animation state for current bit
    if (bitIndex < stepByStepBits.length) {
      const currentBit = stepByStepBits[bitIndex];
      if (currentBit) {
        updateAliceInfo(currentBit.aliceState);
        updateBobInfo(currentBit.bobBasis, currentBit.bobResult);
        updatePolarizers(currentBit.aliceState, currentBit.bobBasis);
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
      setCurrentBitIndex(currentBitIndex + 1);
      setBitStep(0);
      hidePhoton();
      setPhotonPosition(0);
    } else {
      // Finished all bits
      const finalBits = stepByStepBits.filter((bit) => bit.inKey);
      const key = finalBits.map((bit) => bit.aliceState).join("");
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
    try {
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
        .map((bit) => bit.aliceState)
        .join("");
      setFinalKey(key);

      // Generate analysis data
      generateAnalysisData(bits);
      setShowGraphs(true);

      toast.success(`Simulation complete! Generated ${key.length}-bit key.`);
    } catch (error) {
      console.error("Simulation failed:", error);
      toast.error("Simulation failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  // Calculate dark count probability and optical misalignment error floor
  const calculateDarkCountContribution = (fiberLength: number): number => {
    // Dark count rate typically 10-100 Hz for single photon detectors at 1550nm
    // At high clock rates, this contributes to the error rate
    const darkCountRate = 50; // Hz (example value)
    const clockRate = 1e9; // 1 GHz clock rate
    const darkCountProbability = darkCountRate / clockRate; // Probability per bit

    // With increasing distance, more photons are lost, so dark counts become a larger fraction
    const lossProbability = 1 - Math.pow(10, -(0.2 * fiberLength) / 10); // Typical fiber at 1550nm
    const relativeDarkCountContribution = darkCountProbability / (1 - lossProbability);

    // Limit to 50% max since dark counts are random
    return Math.min(relativeDarkCountContribution * 100, 50) * 0.5; // 50% error contribution
  };

  // Calculate optical misalignment/intrinsic floor error
  const calculateIntrinsicFloor = (): number => {
    // Typical intrinsic errors: 1-3% from misalignment, reflections, imperfect components
    // Add small random fluctuation to simulate varying alignment conditions
    const baseFloor = 1.5;
    const fluctuation = (Math.random() - 0.5) * 0.6; // ±0.3% variation
    return Math.max(0.8, baseFloor + fluctuation); // Keep it between 0.8% and 2.1%
  };

  // Apply statistical security check using Hoeffding's bound
  const applySecurityCheck = (measuredQBER: number, sampleSize: number, securityThreshold: number = 11): { isSecure: boolean, upperBound: number } => {
    // Calculate statistical upper bound using Hoeffding's inequality
    const statisticalDeviation = Math.sqrt(Math.log(2 / 0.05) / (2 * sampleSize)); // 95% confidence
    const upperBound = measuredQBER + statisticalDeviation * 100; // Convert to percentage

    // Check against security threshold (typically 11% for B92 as well)
    const isSecure = upperBound < securityThreshold;

    return { isSecure, upperBound };
  };

  const generateAnalysisData = (bits: B92QuantumBit[]) => {
    try {
      // Calculate B92-specific metrics

      // Sifted key = bits where Bob successfully detected a photon
      const siftedKeyBits = bits.filter(bit => bit.inKey);
      const siftedKeyCount = siftedKeyBits.length;

      // Calculate QBER based on mismatches between Alice's states and Bob's results
      const errorsInSiftedKey = siftedKeyBits.filter(
        bit => bit.aliceState !== bit.bobResult
      );

      // Calculate the QBER
      let actualQBER = siftedKeyCount > 0
        ? (errorsInSiftedKey.length / siftedKeyCount) * 100
        : 0;

      // Add contributions from different error sources for a more realistic QBER
      const eavesdroppingRateValue = eavesdroppingRate[0];
      const noiseLevelValue = noiseLevel[0];

      // Eavesdropping creates significant QBER in B92: when Eve intercepts,
      // she disturbs the quantum states, causing errors
      let eavesdroppingContribution = 0;
      if (eavesdroppingRateValue > 0) {
        // If Eve intercepts photons, it introduces ~30-40% error rate depending on her strategy
        eavesdroppingContribution = Math.min((eavesdroppingRateValue / 100) * 40, 40);
      }

      // Noise contributes directly to QBER - more realistic noise model
      const noiseContribution = noiseLevelValue * 2.5; // Each 1% noise contributes ~2.5% to QBER

      // Intrinsic floor for realistic optical imperfections
      const intrinsicFloor = 1.5; // Increase to 1.5% for more realistic baseline

      // Calculate combined QBER based on error sources
      let combinedQBER = actualQBER + eavesdroppingContribution + noiseContribution + intrinsicFloor;

      // Apply upper bound based on theoretical maximum
      const totalQBER = Math.min(combinedQBER, 75); // Allow up to 75% for extreme scenarios

      // Also count total errors for display
      const totalBits = bits.length;
      const allDetectedBits = bits.filter(
        bit => bit.bobResult !== null
      );

      // Apply statistical security check
      const securityCheck = applySecurityCheck(totalQBER, siftedKeyCount);
      const secureKeyRate = securityCheck.isSecure ? (siftedKeyCount / totalBits) * 100 : 0;

      // Prepare data for display
      const data = [
        { name: "Total Bits", value: totalBits },
        { name: "Detected Bits", value: allDetectedBits.length },
        { name: "Sifted Key", value: siftedKeyCount },
        { name: "Errors in Sifted Key", value: errorsInSiftedKey.length },
        { name: "QBER (%)", value: totalQBER.toFixed(2) },
        { name: "Security Status", value: securityCheck.isSecure ? "✅ Secure" : "❌ Compromised" }
      ];

      setSimulationData(data);

      // Render the chart with the new data
      setTimeout(() => renderSimulationMetricsChart(data), 100);
    } catch (error) {
      console.error("Analysis generation failed:", error);
    }
  };

  // Function to load Google Charts
  const loadGoogleCharts = () => {
    return new Promise((resolve, reject) => {
      try {
        if (window.google?.visualization) {
          resolve(window.google);
          return;
        }
        if (window.google?.charts?.load) {
          window.google.charts.load('current', { packages: ['corechart', 'bar'] });
          window.google.charts.setOnLoadCallback(() => resolve(window.google));
          return;
        }
        if (window.google?.load) {
          window.google.load('visualization', '1', { packages: ['corechart', 'bar'] });
          window.google.setOnLoadCallback(() => resolve(window.google));
          return;
        }

        // Load the Google Charts script if not already loaded
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.async = true;
        script.onload = () => {
          if (!window.google?.charts?.load) {
            reject(new Error('Google Charts loader not available'));
            return;
          }
          window.google.charts.load('current', { packages: ['corechart', 'bar'] });
          window.google.charts.setOnLoadCallback(() => resolve(window.google));
        };
        script.onerror = () => reject(new Error('Failed to load Google Charts'));
        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Function to render the simulation metrics chart (counts only)
  const renderSimulationMetricsChart = (data: Array<{name: string, value: number | string}>) => {
    loadGoogleCharts().then(() => {
      const chartContainer = document.getElementById('b92-simulation-metrics-chart');
      if (!chartContainer || !window.google?.visualization) {
        return;
      }
      const totalBits = Number(data[0]?.value || 0);
      const detectedBits = Number(data[1]?.value || 0);
      const siftedKeyCount = Number(data[2]?.value || 0);

      const chartData = [
        ['Metric', 'Value'],
        [data[0]?.name || 'Total Bits', totalBits],
        [data[1]?.name || 'Detected Bits', detectedBits],
        [data[2]?.name || 'Sifted Key', siftedKeyCount],
      ];

      const dataTable = window.google.visualization.arrayToDataTable(chartData);

      const options = {
        title: 'B92 Simulation Metrics',
        width: '100%',
        height: 300,
        chartArea: {
          width: '85%',
          height: '70%',
          left: 100,
          right: 30
        },
        bar: { groupWidth: '60%' },
        hAxis: {
          title: 'Count',
          minValue: 0,
          textStyle: { fontSize: 11 }
        },
        vAxis: {
          title: 'Metrics',
          textStyle: { fontSize: 11 }
        },
        titleTextStyle: { fontSize: 14 },
        colors: ['#ef4444'], // Red color for B92
        legend: { position: 'none' },
      };

      const chart = new window.google.visualization.BarChart(chartContainer);
      chart.draw(dataTable, options);
    }).catch(error => {
      console.error('Error loading Google Charts:', error);
      const chartDiv = document.getElementById('b92-simulation-metrics-chart');
      if (chartDiv) {
        chartDiv.innerHTML = '<p>Chart failed to load. Metrics: ' + JSON.stringify(data) + '</p>';
      }
    });
  };

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
    setAliceState("-");
    setBobBasis("-");
    setBobResult("-");
    setAlicePolarizer("→");
    setBobPolarizer("↕");
    setEvePolarizers([
      { measure: "→", send: "→" },
      { measure: "→", send: "→" },
      { measure: "→", send: "→" },
      { measure: "→", send: "→" },
      { measure: "→", send: "→" },
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
    <div className="space-y-8 pb-4">
      {/* Alice-Bob Animation Section */}
      <Card className="border-none shadow-soft overflow-hidden">
        <CardHeader className="bg-red-50/50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">B92 Protocol</Badge>
              <h2 className="text-lg font-bold text-foreground">
                Non-Orthogonal States Visualization
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-10 relative bg-white dark:bg-slate-950/30 min-h-[300px] flex flex-col justify-center">
          <div className="flex flex-col md:flex-row items-center md:items-stretch justify-between gap-8 md:gap-6 min-h-[250px] relative w-full max-w-none">
            {/* Alice */}
            <div className="flex flex-col items-center w-full md:w-32 z-10 group cursor-pointer">
              <div className="w-24 h-24 rounded-2xl mb-4 flex items-center justify-center text-4xl bg-white dark:bg-slate-900 shadow-soft border border-gray-100 dark:border-gray-800 transition-transform group-hover:scale-105 duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                👩‍🔬
                <div className="absolute -bottom-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded-full border border-red-200 dark:border-red-800">Alice</div>
              </div>
              <div className="font-bold text-foreground text-lg">Alice</div>
              {isStepByStep && (
                <div className="mt-2 bg-white dark:bg-slate-900 p-3 rounded-xl text-sm w-full text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-500 text-xs">State</span>
                    <span className="font-mono font-bold text-red-600">{aliceState}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Channel Area */}
            <div className="flex-1 h-24 w-full md:w-auto mx-2 md:mx-12 relative flex items-center justify-center">
              {/* Quantum Channel */}
              <div className="absolute w-full h-3 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/30 to-transparent w-1/2 animate-[shimmer_2s_infinite]"></div>
              </div>

              <div
                className="w-full h-0.5 bg-gradient-to-r from-red-400 via-orange-500 to-red-500 relative z-0"
              >
                <div
                  className={`photon-particle absolute w-10 h-10 bg-white dark:bg-slate-900 rounded-full top-[-20px] flex items-center justify-center font-bold text-xl shadow-lg border-2 border-red-400 transition-all duration-300 z-30 ${
                    isPhotonVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                  style={{
                    left: `${photonPosition}%`,
                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
                    transform: `translateX(${photonPosition}%)`,
                  }}
                >
                  <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping"></div>
                  ↠
                </div>

                <div
                  className={`absolute top-[-60px] left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 text-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md border border-gray-100 dark:border-gray-700 whitespace-nowrap z-40 ${
                    isStatusInfoVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
                >
                  {statusInfo}
                </div>
              </div>

              {/* Alice Polarizer */}
              <div className="absolute left-[10%] top-1/2 transform -translate-y-1/2 z-20">
                <div
                  className={`w-16 h-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-2xl text-red-600 shadow-md rounded-xl transition-all duration-500 ${
                    alicePolarizer === "↗" ? "rotate-[45deg]" : alicePolarizer === "↕" ? "rotate-[90deg]" : ""
                  }`}
                >
                  {alicePolarizer}
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source</div>
              </div>

              {/* Eve Polarizer Pairs */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`absolute top-1/2 transform -translate-y-1/2 z-20 transition-all duration-500 ${i === 0 ? "left-[25%]" : i === 1 ? "left-[35%]" : i === 2 ? "left-[45%]" : i === 3 ? "left-[55%]" : "left-[65%]"} ${
                    i < numEves ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
                  }`}
                >
                  <div
                    className={`w-8 h-8 bg-red-500 mx-auto rounded-full flex items-center justify-center text-[10px] text-white shadow-md mb-2 font-bold transition-transform ${
                      activeEve === i ? "scale-125 ring-4 ring-red-500/20" : ""
                    }`}
                  >
                    E{i + 1}
                  </div>
                  <div className="flex gap-2 p-1 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 backdrop-blur-sm">
                    <div
                      className={`w-10 h-10 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center font-bold text-lg text-red-500 shadow-sm ${
                        evePolarizers[i]?.measure === "↗" ? "rotate-[45deg]" : evePolarizers[i]?.measure === "↕" ? "rotate-[90deg]" : ""
                      }`}
                    >
                      {evePolarizers[i]?.measure || "→"}
                    </div>
                    <div
                      className={`w-10 h-10 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center font-bold text-lg text-red-500 shadow-sm ${
                        evePolarizers[i]?.send === "↗" ? "rotate-[45deg]" : evePolarizers[i]?.send === "↕" ? "rotate-[90deg]" : ""
                      }`}
                    >
                      {evePolarizers[i]?.send || "→"}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bob Polarizer */}
              <div className="absolute right-[10%] top-1/2 transform -translate-y-1/2 z-20">
                <div
                  className={`w-16 h-16 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-2xl text-blue-600 shadow-md rounded-xl transition-all duration-500 ${
                    bobPolarizer === "↗" ? "rotate-[45deg]" : bobPolarizer === "↘" ? "rotate-[135deg]" : bobPolarizer === "↕" ? "rotate-[90deg]" : ""
                  }`}
                >
                  {bobPolarizer}
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Detector</div>
              </div>
            </div>

            {/* Bob */}
            <div className="flex flex-col items-center w-full md:w-32 z-10 group cursor-pointer">
              <div className="w-24 h-24 rounded-2xl mb-4 flex items-center justify-center text-4xl bg-white dark:bg-slate-900 shadow-soft border border-gray-100 dark:border-gray-800 transition-transform group-hover:scale-105 duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                👨‍🔬
                <div className="absolute -bottom-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-200 dark:border-blue-800">Bob</div>
              </div>
              <div className="font-bold text-foreground text-lg">Bob</div>
              {isStepByStep && (
                <div className="mt-2 bg-white dark:bg-slate-900 p-3 rounded-xl text-sm w-full text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-500 text-xs">Basis</span>
                    <span className="font-mono font-bold text-blue-600">{bobBasis}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Result</span>
                    <span className="font-mono font-bold text-blue-600">{bobResult}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-soft">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Zap className="w-6 h-6 text-red-600" />
              B92 Protocol Simulation
            </CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
                <Button
                    onClick={() => setIsStepByStep(!isStepByStep)}
                    variant="ghost"
                    size="sm"
                    className={`rounded-md text-xs font-medium transition-all ${!isStepByStep ? 'text-gray-500' : 'bg-white dark:bg-slate-700 shadow-sm text-red-600'}`}
                >
                    Step-by-Step
                </Button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1"></div>
                 <Button
                    onClick={() => setIsStepByStep(false)}
                    variant="ghost"
                    size="sm"
                    className={`rounded-md text-xs font-medium transition-all ${isStepByStep ? 'text-gray-500' : 'bg-white dark:bg-slate-700 shadow-sm text-red-600'}`}
                >
                    Auto-Run
                </Button>
              </div>

              <Button
                onClick={runSimulation}
                disabled={isRunning}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Protocol...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Run Simulation
                  </>
                )}
              </Button>

              <Button
                onClick={resetSimulation}
                variant="outline"
                className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left column - Controls */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6 flex flex-col">
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-6 border border-gray-100 dark:border-gray-800 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-gray-500" />
                  Simulation Parameters
                </h3>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-medium text-foreground">Qubits</label>
                      <span className="font-mono font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">{numBits[0]}</span>
                    </div>
                    <Slider
                      value={numBits}
                      onValueChange={setNumBits}
                      max={50}
                      min={8}
                      step={2}
                      className="py-2"
                      disabled={isRunning}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-medium text-foreground">Eavesdrop</label>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${eavesdroppingRate[0] > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-gray-500 bg-gray-100'}`}>
                        {eavesdroppingRate[0]}%
                      </span>
                    </div>
                    <Slider
                      value={eavesdroppingRate}
                      onValueChange={setEavesdroppingRate}
                      max={100}
                      min={0}
                      step={5}
                      className="py-2"
                      disabled={isRunning}
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Simulates an eavesdropper intercepting qubits. Higher percentage = more interception.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <label className="font-medium text-foreground">Channel Noise</label>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded ${noiseLevel[0] > 0 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' : 'text-gray-500 bg-gray-100'}`}>
                        {noiseLevel[0]}%
                      </span>
                    </div>
                    <Slider
                      value={noiseLevel}
                      onValueChange={setNoiseLevel}
                      max={20}
                      min={0}
                      step={1}
                      className="py-2"
                      disabled={isRunning}
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Experiment Presets</h3>
                      <Zap className="w-3 h-3 text-red-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNumBits([16]);
                          setEavesdroppingRate([0]);
                          setNoiseLevel([2]);
                        }}
                        className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-800 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-red-700 dark:group-hover:text-red-300 uppercase tracking-tighter">No Eavesdropper</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNumBits([16]);
                          setEavesdroppingRate([40]);
                          setNoiseLevel([2]);
                        }}
                        className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-800 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Eye className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-red-700 dark:group-hover:text-red-300 uppercase tracking-tighter">With Eavesdropper</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNumBits([16]);
                          setEavesdroppingRate([0]);
                          setNoiseLevel([15]);
                        }}
                        className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-100 dark:hover:border-amber-800 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 uppercase tracking-tighter">High Noise</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNumBits([50]);
                          setEavesdroppingRate([0]);
                          setNoiseLevel([2]);
                        }}
                        className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Cpu className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 uppercase tracking-tighter">More Qubits</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNumBits([32]);
                          setEavesdroppingRate([25]);
                          setNoiseLevel([8]);
                        }}
                        className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-transparent hover:border-purple-100 dark:hover:border-purple-800 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Settings className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 uppercase tracking-tighter">Mixed Conditions</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNumBits([16]);
                          setEavesdroppingRate([0]);
                          setNoiseLevel([0]);
                        }}
                        className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 hover:bg-green-50 dark:hover:bg-green-900/20 border border-transparent hover:border-green-100 dark:hover:border-green-800 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <RotateCw className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-green-700 dark:group-hover:text-green-300 uppercase tracking-tighter">Ideal System</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentStep > 1 && !isStepByStep && (
                   <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                        Live Status
                      </p>
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">{steps[currentStep - 1]}</p>
                   </div>
                )}
              </div>

               {/* Step-by-step Status */}
              {currentStep === 1 && !isStepByStep && (
                 <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 p-4 rounded-xl flex items-center justify-center gap-3 animate-pulse">
                     <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                     <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Qubit In Transit</span>
                     {eavesdroppingRate[0] > 0 && (
                         <Badge variant="destructive" className="ml-2 animate-bounce">INTERCEPTION RISK</Badge>
                     )}
                 </div>
              )}
            </div>

            {/* Right column - Results */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-8 min-w-0 flex flex-col">
              {quantumBits.length === 0 && (!isStepByStep || stepByStepBits.length === 0) && (
                <div className="rounded-lg border border-dashed border-border bg-card/60 p-8 text-center flex-1 flex flex-col items-center justify-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Results will appear here</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Run the simulation to generate the results log, charts, and key analysis.
                  </p>
                </div>
              )}
              {/* Results Display */}
              {(quantumBits.length > 0 ||
                (isStepByStep && stepByStepBits.length > 0)) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      Results Log
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-normal">
                          {isStepByStep && stepByStepBits.length > 0 ? Math.min(currentBitIndex + 1, stepByStepBits.length) : quantumBits.length} / {numBits[0]} Bits Processed
                      </Badge>
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="w-full overflow-x-auto max-h-[600px] overflow-y-auto">
                      <table className="w-full text-sm min-w-[900px]">
                        <thead className="sticky top-0 bg-gray-50 dark:bg-slate-950 z-10">
                          <tr className="border-b border-gray-200 dark:border-gray-800">
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-12">#</th>

                            {/* Alice Group */}
                            <th colSpan={1} className="px-4 py-2 border-l border-r border-gray-200 dark:border-gray-800 bg-red-50/50 dark:bg-red-900/10">
                              <div className="text-center text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Alice (Source)</div>
                            </th>

                            {/* Eve Group */}
                            {eavesdroppingRate[0] > 0 && (
                              <th colSpan={3} className="px-4 py-2 border-r border-gray-200 dark:border-gray-800 bg-red-50/50 dark:bg-red-900/10">
                                <div className="text-center text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center justify-center gap-1">
                                    <Eye className="w-3 h-3" /> Eve
                                </div>
                              </th>
                            )}

                            {/* Bob Group */}
                            <th colSpan={2} className="px-4 py-2 border-r border-gray-200 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/10">
                               <div className="text-center text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Bob (Detector)</div>
                            </th>

                            <th colSpan={1} className="px-4 py-2">
                                <div className="text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Analysis</div>
                            </th>
                          </tr>
                          <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50">
                            <th className="p-2"></th>
                            <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase border-l border-gray-200 dark:border-gray-800">State</th>

                            {eavesdroppingRate[0] > 0 && (
                              <>
                                <th className="px-2 py-2 text-center text-[10px] text-red-400 font-medium uppercase">Basis</th>
                                <th className="px-2 py-2 text-center text-[10px] text-red-400 font-medium uppercase">Res.</th>
                                <th className="px-2 py-2 text-center text-[10px] text-red-400 font-medium uppercase border-r border-gray-200 dark:border-gray-800">Send</th>
                              </>
                            )}

                            <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase">Basis</th>
                            <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase border-r border-gray-200 dark:border-gray-800">Result</th>

                            <th className="px-2 py-2 text-center text-[10px] text-gray-500 font-medium uppercase">Key?</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-gray-800">
                          {(isStepByStep
                            ? stepByStepBits.slice(0, currentBitIndex + 1)
                            : quantumBits
                          ).map(
                            (bit, index) => (
                              <tr
                                key={bit.id}
                                className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${bit.inKey ? "bg-green-50/30 dark:bg-green-900/10" : ""} ${isStepByStep && index === currentBitIndex ? "bg-red-50 dark:bg-red-900/20" : ""}`}
                              >
                                <td className="p-3 text-center text-xs font-medium text-gray-500">{bit.id + 1}</td>

                                {/* ALICE DATA */}
                                <td className="p-2 text-center border-l border-gray-100 dark:border-gray-800">
                                  <span className="font-mono text-lg font-bold text-gray-700 dark:text-gray-300">
                                    {getStateSymbol(bit.aliceState)}
                                  </span>
                                </td>

                                {/* EVE DATA */}
                                {eavesdroppingRate[0] > 0 && (
                                  <>
                                    <td className="p-2 text-center">
                                      {bit.intercepted ? (
                                        <span className="font-mono font-bold text-red-500">
                                          {getBasisSymbol(bit.eveBasis!)}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center">
                                      {bit.intercepted ? (
                                        <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                          {bit.eveResult}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </td>
                                    <td className="p-2 text-center border-r border-gray-100 dark:border-gray-800">
                                      {bit.intercepted ? (
                                        <span className="font-mono font-bold text-red-500">
                                          {getStateSymbol(bit.eveResendState!)}
                                        </span>
                                      ) : (
                                        <span className="text-gray-300">-</span>
                                      )}
                                    </td>
                                  </>
                                )}

                                {/* BOB DATA */}
                                <td className="p-2 text-center border-r border-gray-100 dark:border-gray-800">
                                  <span className="font-mono text-lg font-bold text-gray-700 dark:text-gray-300">
                                    {getBasisSymbol(bit.bobBasis)}
                                  </span>
                                </td>
                                <td className="p-2 text-center border-r border-gray-100 dark:border-gray-800">
                                   <span
                                     className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                                       bit.bobResult !== null
                                         ? bit.aliceState === bit.bobResult
                                           ? "bg-green-100 text-green-700"  // Correct result
                                           : "bg-red-100 text-red-700"    // Error
                                         : "bg-gray-100 text-gray-500"  // No detection
                                     }`}
                                   >
                                     {bit.bobResult !== null ? bit.bobResult : 'N'}
                                   </span>
                                 </td>

                                {/* KEY */}
                                <td className="p-2 text-center">
                                  {bit.inKey ? (
                                    <div className="flex justify-center">
                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm shadow-green-200">
                                            <Shield className="w-3 h-3" />
                                        </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300">
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

                    {isStepByStep && currentBitIndex === 0 && bitStep === 0 && (
                        <div className="text-center py-12 bg-gray-50/50">
                          <p className="text-gray-500 font-medium">Ready to start visualization...</p>
                          <Button variant="link" onClick={nextBitStep} className="text-red-600">Click to begin</Button>
                        </div>
                   )}
                  </div>

                    {/* Final Key Display */}
                    {finalKey && (
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-100 dark:border-red-900/30">
                        <div className="flex flex-col items-center justify-center text-center">
                           <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 shadow-sm">
                               <ShieldCheck className="w-6 h-6" />
                           </div>
                           <h3 className="font-bold text-red-800 dark:text-red-300 mb-2 text-lg">
                              Secure Shared Key Generated (B92)
                            </h3>
                            <div className="font-mono text-xl bg-white dark:bg-black/20 px-6 py-3 rounded-lg border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 tracking-widest shadow-inner mb-3">
                              {finalKey}
                            </div>
                            <div className="flex gap-4 text-xs font-medium text-red-700/70">
                                <span>Length: {finalKey.length} bits</span>
                                <span>Status: Verified</span>
                            </div>

                            {(eavesdroppingRate[0] > 0 || noiseLevel[0] > 0) && (
                                <div className="mt-4 flex gap-2">
                                    {eavesdroppingRate[0] > 0 && (
                                        <Badge variant="destructive" className="flex gap-1 items-center">
                                            <AlertCircle className="w-3 h-3" /> Eavesdropping Detected
                                        </Badge>
                                    )}
                                    {noiseLevel[0] > 0 && (
                                        <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 flex gap-1 items-center">
                                            <Zap className="w-3 h-3" /> Noise Present
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Analysis Graphs */}
              {showGraphs && simulationData.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      Post-Processing Analysis
                    </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border-none shadow-soft overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                          <CardTitle className="text-sm font-bold text-gray-700">
                          Transfer Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="w-full min-h-[300px] flex items-center justify-center" id="b92-simulation-metrics-chart">
                            {/* Google Chart will be rendered here */}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-soft overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                          <CardTitle className="text-sm font-bold text-gray-700">
                          Security Assessment (B92)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                        <div className="space-y-6">

                            <div className="flex items-center justify-center py-6">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100" />
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent"
                                            strokeDasharray={440}
                                            strokeDashoffset={440 - (440 * parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0"))) / 100}
                                            className={`${parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0")) > 15 ? 'text-red-500' : 'text-green-500'}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-3xl font-bold ${parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0")) > 15 ? 'text-red-500' : 'text-green-500'}`}>
                                            {simulationData.find(d => d.name === "QBER (%)")?.value}%
                                        </span>
                                        <span className="text-xs text-gray-400 font-medium uppercase mt-1">Error Rate</span>
                                    </div>
                                </div>
                            </div>

                          <div className="grid grid-cols-2 gap-4">
                              {simulationData.slice(0, 4).map((item, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-gray-800"
                                >
                                  <span className="text-xs font-medium text-gray-500 mb-1">
                                    {item.name}
                                  </span>
                                  <span className="text-lg font-bold text-foreground">
                                    {item.value}
                                  </span>
                                </div>
                              ))}
                          </div>

                          <div className={`p-4 rounded-xl border ${parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0")) > 11 ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                            <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                              {parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0")) > 11 ? <AlertCircle className="w-4 h-4"/> : <ShieldCheck className="w-4 h-4"/>}
                              Security Status
                            </h4>
                            <p className="text-xs leading-relaxed">
                              {(() => {
                                const totalQBER = parseFloat(String(simulationData.find(d => d.name === "QBER (%)")?.value || "0"));
                                const eavesdropperRate = eavesdroppingRate[0];
                                const noise = noiseLevel[0];

                                if (eavesdropperRate === 0 && noise === 0) {
                                  if (totalQBER < 0.1) return "System secure. No interference detected.";
                                  return "Ideal conditions. Minimal quantum variation.";
                                }

                                if (totalQBER > 11) {
                                  return `CRITICAL: QBER is ${totalQBER}%, exceeding the 11% safety threshold. This indicates strong evidence of eavesdropping or severe channel noise. This key is unsafe to use.`;
                                }

                                return `SECURE: QBER is ${totalQBER}%, which is within acceptable safety limits. Error correction can handle this noise level.`;
                              })()}
                            </p>
                          </div>
                        </div>
                        </CardContent>
                      </Card>

                    </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};