import { QuantumBit } from "./types";

export const simulateBB84 = (qubits: number, eavesdropping: number, noise: number) => {
  let matchingBases = 0;
  let errors = 0;
  let keyBits = 0;
  const simulationBits: QuantumBit[] = [];

  for (let i = 0; i < qubits; i++) {
    const aliceBasis = Math.random() > 0.5;
    const aliceBit = Math.random() > 0.5 ? 1 : 0;
    const isEavesdropped = Math.random() < eavesdropping / 100;

    // If eavesdropped, Eve measures with her random basis
    let evesMeasurement: number | null = null;
    let evesBasis: boolean | null = null;
    if (isEavesdropped) {
      evesBasis = Math.random() > 0.5; // Eve's random basis selection
      // Eve measures the qubit in her basis
      evesMeasurement = aliceBit; // Initially same as Alice's bit
      // If Eve's basis doesn't match Alice's, she has a 50% chance of getting the wrong result
      if (evesBasis !== aliceBasis) {
        evesMeasurement = Math.random() > 0.5 ? 1 - aliceBit : aliceBit;
      }
    }

    // Bob receives the possibly tampered qubit
    let bobResult = isEavesdropped ? (evesMeasurement !== null ? evesMeasurement : aliceBit) : aliceBit;

    // Bob measures in his basis
    const bobBasis = Math.random() > 0.5;
    // If Bob's basis doesn't match Alice's (original) basis, we have a measurement issue
    // In a real quantum system, only the basis matching matters, so we'll keep the bit value
    // but account for potential measurement differences if Eve interfered

    let hasError = false;

    // Apply noise
    if (Math.random() < noise / 100) {
      bobResult = 1 - bobResult;
      hasError = true;
    }

    const basisMatch = aliceBasis === bobBasis;
    const kept = basisMatch;

    if (basisMatch) {
      matchingBases++;
      keyBits++;
      if (bobResult !== aliceBit && !hasError) {
        errors++;
      }
    }

    simulationBits.push({
      id: i,
      aliceBit,
      aliceBasis: aliceBasis ? "Diagonal" : "Rectilinear",
      bobBasis: bobBasis ? "Diagonal" : "Rectilinear", 
      bobMeasurement: bobResult,
      match: basisMatch,
      kept: kept && bobResult === aliceBit,
      eavesdropped: isEavesdropped
    });
  }

  return {
    errorRate: matchingBases > 0 ? (errors / matchingBases) * 100 : 0,
    keyRate: (keyBits / qubits) * 100,
    keyLength: keyBits,
    basisMatchRate: (matchingBases / qubits) * 100
  };
};

export const generateAnalysis = (experimentId: string, data: Record<string, unknown>[]) => {
  switch (experimentId) {
    case "effect-of-qubits": {
      const maxQubits = Math.max(...data.map(d => Number(d.qubits)));
      const keyAtMax = data.find(d => Number(d.qubits) === maxQubits)?.keyLength || 0;
      return `Qubit scaling demonstrates improved statistical security. With ${maxQubits} qubits, ${keyAtMax} key bits generated. Higher qubit counts provide better eavesdropping detection confidence.`;
    }
    
    case "effect-of-channel-noise": {
      const maxNoise = Math.max(...data.map(d => Number(d.noise)));
      const errorAtMaxNoise = data.find(d => Number(d.noise) === maxNoise)?.errorRate || 0;
      return `Channel noise significantly affects BB84 performance. At ${maxNoise}% noise, error rate reaches ${errorAtMaxNoise.toFixed(1)}%. The linear relationship demonstrates quantum channel sensitivity.`;
    }
    
    case "without-eavesdropper": {
      const errorRate = data[0]?.errorRate || 0;
      return `Baseline experiment without eavesdropping shows ${errorRate.toFixed(2)}% error rate. This establishes a baseline for protocol performance with minimal errors due to quantum channel imperfections.`;
    }
    
    case "with-eavesdropper": {
      const maxEaves = Math.max(...data.map(d => Number(d.eavesdropping)));
      const detectionAtMax = data.find(d => Number(d.eavesdropping) === maxEaves)?.detectionProbability || 0;
      return `Eavesdropping detection shows clear correlation with error rates. At ${maxEaves}% interception, detection probability reaches ${detectionAtMax.toFixed(1)}%, demonstrating quantum security principles. The BB84 protocol successfully detects eavesdropping attempts by monitoring error rates.`;
    }
    
    case "effect-of-distance": {
      const maxDistance = Math.max(...data.map(d => Number(d.distance)));
      const lossAtMax = data.find(d => Number(d.distance) === maxDistance)?.photonLoss || 0;
      return `Distance significantly impacts quantum key distribution. At ${maxDistance}km, photon loss reaches ${lossAtMax.toFixed(1)}% due to fiber optic attenuation. This demonstrates the practical limitations of terrestrial QKD systems.`;
    }
    
    case "overall": {
      const avgError = data.reduce((sum, d) => sum + Number(d.errorRate), 0) / data.length;
      return `Comprehensive analysis combining all factors shows average error rate of ${avgError.toFixed(1)}%. This experiment demonstrates how multiple parameters (distance, noise, eavesdropping) interact to affect the BB84 protocol performance in real-world conditions.`;
    }
    
    default:
      return "Experiment completed successfully. Data shows expected quantum behavior patterns.";
  }
};

export const getXAxisLabel = (experimentId: string) => {
  switch (experimentId) {
    case "effect-of-qubits":
      return "Number of Qubits";
    case "effect-of-channel-noise":
      return "Noise Level (%)";
    case "without-eavesdropper":
      return "Run";
    case "with-eavesdropper":
      return "Eavesdropping Rate (%)";
    case "effect-of-distance":
      return "Distance (km)";
    case "overall":
      return "Iteration";
    default:
      return "X-Axis";
  }
};