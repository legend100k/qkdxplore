import { QuantumBit } from "./types";
import {
  OpticalNoiseParams,
  PolarizationState,
  applyOpticalNoise,
  legacyNoiseToOptical,
  getAttenuationCoeff
} from "@/lib/opticalNoise";

// Calculate dark count probability and optical misalignment error floor
const calculateDarkCountContribution = (fiberLength: number, hasNoise: boolean = false): number => {
  // Dark count rate typically 10-100 Hz for single photon detectors at 1550nm
  // At high clock rates, this contributes to the error rate
  const darkCountRate = 50; // Hz (example value)
  const clockRate = 1e9; // 1 GHz clock rate
  const darkCountProbability = darkCountRate / clockRate; // Probability per bit
  
  // For ideal conditions (short distance, no noise), dark count contribution is negligible
  if (fiberLength < 5 && !hasNoise) {
    return 0.02; // Very minimal contribution in ideal conditions
  }
  
  // With noise or increasing distance, dark counts become more significant
  if (hasNoise && fiberLength < 10) {
    // For noisy conditions at short distances, add modest dark count contribution
    return 0.5 + (fiberLength / 10) * 1.5; // 0.5-2% contribution
  }
  
  // With increasing distance, more photons are lost, so dark counts become a larger fraction
  const lossProbability = 1 - Math.pow(10, -(0.2 * fiberLength) / 10); // Typical fiber at 1550nm
  const relativeDarkCountContribution = darkCountProbability / (1 - lossProbability);
  
  // Limit to 50% max since dark counts are random
  return Math.min(relativeDarkCountContribution * 100, 50) * 0.5; // 50% error contribution
};

// Calculate optical misalignment/intrinsic floor error based on actual noise conditions
const calculateIntrinsicFloor = (opticalParams?: OpticalNoiseParams, noise?: number): number => {
  // For ideal conditions (no noise), intrinsic floor should be minimal
  // For noisy conditions, floor should be at least ~5% to clearly show the effect
  
  // Check if we're in truly ideal conditions (no noise at all)
  const isIdeal = (noise !== undefined && noise === 0) || 
                  (opticalParams && 
                   opticalParams.depolarization === 0 && 
                   opticalParams.phaseDamping === 0 &&
                   opticalParams.thermalNoise === 0);
  
  if (isIdeal) {
    // In perfect ideal conditions, only quantum shot noise and minimal detector imperfections
    // Return a very small floor (~0.1-0.5%)
    const minimalFloor = 0.1;
    const fluctuation = Math.random() * 0.4; // Small random variation
    return minimalFloor + fluctuation; // 0.1-0.5%
  }
  
  // For conditions with noise, ensure minimum ~5% base error
  // Scale with noise level beyond that
  const noiseLevel = noise !== undefined ? noise / 100 : 
                     (opticalParams ? (opticalParams.depolarization + opticalParams.phaseDamping) / 2 : 0.2);
  
  // Base floor starts at 5% for any non-zero noise, scales up with higher noise
  const baseFloor = 5 + noiseLevel * 10; // Scales from 5% to 15% with noise
  const fluctuation = (Math.random() - 0.5) * 1.0; // ±0.5% variation
  return Math.max(4.5, baseFloor + fluctuation);
};

// Apply statistical security check using Hoeffding's bound
const applySecurityCheck = (measuredQBER: number, sampleSize: number, securityThreshold: number = 11): { isSecure: boolean, upperBound: number } => {
  // Calculate statistical upper bound using Hoeffding's inequality
  const statisticalDeviation = Math.sqrt(Math.log(2 / 0.05) / (2 * sampleSize)); // 95% confidence
  const upperBound = measuredQBER + statisticalDeviation * 100; // Convert to percentage
  
  // Check against security threshold (typically 11% for BB84)
  const isSecure = upperBound < securityThreshold;
  
  return { isSecure, upperBound };
};

export const simulateBB84 = (
  qubits: number,
  eavesdropping: number,
  noise: number,
  opticalParams?: OpticalNoiseParams
) => {
  let matchingBases = 0;
  let errors = 0;
  let keyBits = 0;
  const simulationBits: QuantumBit[] = [];

  // Convert legacy noise to optical parameters if not provided
  const noiseParams = opticalParams || legacyNoiseToOptical(noise, 10);

  // Convert eavesdropping to probability (0-5 Eves -> 0-100% probability)
  const eavesProbability = eavesdropping / 5;

  for (let i = 0; i < qubits; i++) {
    const aliceBasis = Math.random() > 0.5;
    const aliceBit = Math.random() > 0.5 ? 1 : 0;
    const isEavesdropped = Math.random() < eavesProbability;

    // Create polarization state for the photon
    let photonState: PolarizationState = {
      basis: aliceBasis ? 'diagonal' : 'rectilinear',
      bit: aliceBit,
      amplitude: 1.0,
      phase: 0
    };

    // If eavesdropped, Eve measures with her random basis
    let eveMeasurement: number | null = null;
    let eveMeasureBasis: boolean | null = null;
    let eveResendBasis: boolean | null = null;
    if (isEavesdropped) {
      eveMeasureBasis = Math.random() > 0.5; // Eve's random basis selection for measurement
      // Eve measures the qubit in her basis
      eveMeasurement = aliceBit; // Initially same as Alice's bit
      // If Eve's basis doesn't match Alice's, she has a 50% chance of getting the wrong result
      if (eveMeasureBasis !== aliceBasis) {
        eveMeasurement = Math.random() > 0.5 ? 1 - aliceBit : aliceBit;
      }
      
      // Eve chooses a random basis to resend the photon
      eveResendBasis = Math.random() > 0.5;
      
      // Eve re-prepares the photon based on her measurement and resend basis
      photonState = {
        basis: eveResendBasis ? 'diagonal' : 'rectilinear',
        bit: eveMeasurement,
        amplitude: 0.9, // Eve's measurement reduces amplitude slightly
        phase: 0
      };
    }

    // Apply optical noise to the photon during transmission
    const noisyPhoton = applyOpticalNoise(photonState, noiseParams);
    
    // If photon is lost (null), Bob doesn't detect it
    if (!noisyPhoton) {
      // Photon lost - don't add to simulation bits (or add as undetected)
      continue;
    }

    // Bob receives the noisy photon
    let bobResult = noisyPhoton.bit;

    // Bob measures in his basis
    const bobBasis = Math.random() > 0.5;
    
    // If Bob's basis doesn't match the photon's current basis (after noise)
    // he gets a random result (quantum measurement collapse)
    const photonBasisBool = noisyPhoton.basis === 'diagonal';
    if (bobBasis !== photonBasisBool) {
      bobResult = Math.random() > 0.5 ? 1 : 0;
    }

    const basisMatch = aliceBasis === bobBasis;
    const kept = basisMatch;

    if (basisMatch) {
      matchingBases++;
      keyBits++;
      if (bobResult !== aliceBit) {
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
      eavesdropped: isEavesdropped,
      eveMeasureBasis: isEavesdropped ? (eveMeasureBasis ? "Diagonal" : "Rectilinear") : null,
      eveMeasurement: isEavesdropped ? eveMeasurement : null,
      eveResendBasis: isEavesdropped ? (eveResendBasis ? "Diagonal" : "Rectilinear") : null
    });
  }

  // Calculate additive error model contributions
  const fiberLength = opticalParams?.fiberLength || 10; // Use provided fiber length or default 10km
  const hasNoise = (noise !== undefined && noise > 0) || 
                   (opticalParams && (opticalParams.depolarization > 0 || 
                                     opticalParams.phaseDamping > 0 || 
                                     opticalParams.thermalNoise > 0));
  const hasEavesdropper = eavesdropping > 0;
  
  // Calculate measured QBER from raw errors (this includes eavesdropping effects)
  const rawQBER = keyBits > 0 ? (errors / keyBits) * 100 : 0;
  
  // Add quantum shot noise (statistical fluctuation) - decreases as 1/sqrt(N)
  // This simulates the statistical uncertainty in quantum measurements
  const shotNoiseStdDev = keyBits > 0 ? (1 / Math.sqrt(keyBits)) * 100 : 0;
  const shotNoise = (Math.random() - 0.5) * 2 * shotNoiseStdDev; // Random fluctuation
  
  // If there's an eavesdropper, the raw QBER from errors should dominate
  // Only apply intrinsic floor and dark counts when they would be significant
  let measuredQBER: number;
  let totalQBER: number;
  let darkCountContribution: number;
  let intrinsicFloor: number;
  
  if (hasEavesdropper) {
    // With eavesdropper, use raw QBER (which includes eavesdropping errors)
    // Add minimal intrinsic contributions
    intrinsicFloor = 0.5; // Small baseline for detector imperfections
    measuredQBER = Math.max(rawQBER + shotNoise, intrinsicFloor);
    darkCountContribution = calculateDarkCountContribution(fiberLength, hasNoise);
    totalQBER = measuredQBER + darkCountContribution * 0.2; // Reduced dark count impact
  } else {
    // No eavesdropper - apply full intrinsic floor and noise contributions
    darkCountContribution = calculateDarkCountContribution(fiberLength, hasNoise);
    intrinsicFloor = calculateIntrinsicFloor(opticalParams, noise);
    
    // Calculate realistic QBER with intrinsic error floor
    measuredQBER = Math.max(rawQBER + shotNoise, intrinsicFloor);
    
    // Calculate total QBER with additive error contributions (dark counts, etc.)
    totalQBER = measuredQBER + darkCountContribution;
  }
  
  // Apply statistical security check
  const securityCheck = applySecurityCheck(totalQBER, keyBits);
  const secureKeyRate = securityCheck.isSecure ? (keyBits / qubits) * 100 : 0;

  return {
    errorRate: totalQBER, // Total QBER including all realistic contributions (never zero)
    totalQBER: totalQBER,    // Total QBER with all contributions
    darkCountContribution: darkCountContribution,
    intrinsicFloor: intrinsicFloor,
    keyRate: (keyBits / qubits) * 100,
    secureKeyRate: secureKeyRate,
    keyLength: keyBits,
    basisMatchRate: (matchingBases / qubits) * 100,
    statisticalUpperBound: securityCheck.upperBound,
    isSecure: securityCheck.isSecure
  };
};

export const generateAnalysis = (experimentId: string, data: Record<string, unknown>[]) => {
  switch (experimentId) {
    case "effect-of-qubits": {
      if (data.length === 0) {
        return `Experiment 1: Effect of Number of Qubits
Aim: To investigate how the number of transmitted qubits affects key length and statistical security in the BB84 protocol.
Objective: To understand the relationship between sample size (number of qubits) and the reliability of security analysis.
Apparatus: Q-Xplore Virtual Lab

Theory:
In BB84, Alice and Bob transmit quantum bits (qubits) using randomly chosen polarization bases. Due to the random basis selection:
- Only ~50% of qubits have matching bases (basis reconciliation)
- These matching qubits form the "sifted key"
- The sifted key length ≈ (Total qubits transmitted) / 2

Statistical Security:
The security of QKD depends on accurately estimating the QBER from a sample of the sifted key. With more qubits:
1. Larger sample size → More reliable QBER estimation
2. Statistical fluctuations decrease as ~1/√N (where N = number of qubits)
3. Hoeffding's inequality bounds the confidence: The true QBER is within ε of measured QBER with probability 1-δ, where ε ∝ 1/√N

Security Threshold:
- QBER < 11%: Key is secure (after error correction and privacy amplification)
- QBER ≥ 11%: Key is compromised; abort protocol

Key Length vs. Security Trade-off:
- More qubits → Longer final key (useful for encrypting more data)
- More qubits → Better statistical certainty (more confident in security analysis)
- Fewer qubits → Faster transmission but less reliable security guarantees

Procedure:
Set eavesdropper = OFF, Channel Noise = LOW (to isolate the effect of qubit number)
Vary the number of qubits from small (10) to large (100)
Observe how key length and statistical security improve with more qubits
Note that QBER remains stable (intrinsic floor ~1.5-2%) regardless of qubit count

Expected Observation:
- Key length increases linearly with number of qubits
- QBER remains constant (no eavesdropping, low noise)
- Statistical confidence improves with more qubits
                                                       
Screenshot: [Paste your experimental results here]

Conclusion:
[Based on your data, explain how increasing the number of qubits affects the final key length and the reliability of security analysis. Note that while more qubits give a longer key and better statistics, the QBER itself remains constant under fixed channel conditions.]`;
      }
      
      // Calculate statistics for the analysis
      const qubitCounts = data.map(d => Number(d.qubits));
      const keyLengths = data.map(d => Number(d.keyLength));
      const qberValues = data.map(d => Number(d.qber));
      
      const minQubits = Math.min(...qubitCounts);
      const maxQubits = Math.max(...qubitCounts);
      const minKeyLength = Math.min(...keyLengths);
      const maxKeyLength = Math.max(...keyLengths);
      const avgQBER = qberValues.reduce((sum, val) => sum + val, 0) / qberValues.length;
      
      // Calculate approximate key rate (key length / total qubits)
      const keyRates = data.map(d => (Number(d.keyLength) / Number(d.qubits)) * 100);
      const avgKeyRate = keyRates.reduce((sum, val) => sum + val, 0) / keyRates.length;
      
      // Check if key length scales linearly with qubits
      const expectedRatio = maxKeyLength / maxQubits;
      const actualMinKey = minQubits * expectedRatio;
      const scalingQuality = minKeyLength / actualMinKey;
      const isLinear = scalingQuality > 0.4 && scalingQuality < 0.6; // Should be ~0.5 for perfect linear scaling
      
      return `Experiment 1: Effect of Number of Qubits - Analysis

Key Findings:
- Qubit range tested: ${minQubits} to ${maxQubits} qubits
- Key length range: ${minKeyLength} to ${maxKeyLength} bits
- Average key rate: ${avgKeyRate.toFixed(1)}% (expected ~50% due to basis reconciliation)
- Average QBER: ${avgQBER.toFixed(2)}% (remains constant across all qubit counts)

Relationship Analysis:
${isLinear ? 
  `✓ Key length scales linearly with number of qubits, as expected.
  This confirms that approximately 50% of transmitted qubits survive basis reconciliation to form the sifted key.` :
  `⚠ Key length scaling shows some deviation from perfect linearity.
  This may be due to statistical fluctuations in basis matching at small sample sizes.`
}

Statistical Security:
- With ${minQubits} qubits: Statistical uncertainty is higher (~${(100 / Math.sqrt(minQubits)).toFixed(1)}%)
- With ${maxQubits} qubits: Statistical uncertainty is lower (~${(100 / Math.sqrt(maxQubits)).toFixed(1)}%)
- Larger sample sizes provide more confident security guarantees

Practical Implications:
1. More qubits → Longer encryption key (can secure more data)
2. More qubits → Better statistical confidence in QBER measurement
3. The QBER (${avgQBER.toFixed(2)}%) remains stable regardless of qubit count, confirming that channel conditions, not sample size, determine error rate
4. For real-world QKD: Balance between transmission time (more qubits = longer) and security confidence

Conclusion:
This experiment demonstrates that while the number of qubits directly determines the final key length (~50% of transmitted qubits), it does not affect the QBER itself. The QBER is determined by channel noise and eavesdropping, not by sample size. However, more qubits provide better statistical confidence when estimating the QBER and making security decisions.`;
    }
    
    case "effect-of-channel-noise": {
      if (data.length === 0) {
        return `Experiment 4: Effect of Channel Noise
Aim: To investigate how noise in the quantum channel affects the security of the BB84 protocol by increasing the Quantum Bit Error Rate (QBER).
Objective: To isolate and observe the impact of channel noise on the QBER.
Apparatus: Q-Xplore Virtual Lab

Theory: Channel noise stems from physical imperfections like photon scattering, polarization drift, and detector dark counts. Unlike photon loss, noise directly causes bit errors: Bob detects a photon but records the wrong bit value. This directly increases the QBER. A high QBER can render the key insecure, even without an evesdropper, as it becomes impossible to distinguish these errors from a malicious attack.
Procedure:
Set evesdropper = OFF, Distance = SHORT (to minimize other effects).
Set Channel Noise = LOW. Run the simulation. Record the QBER and Final Key Length. This is your baseline.
Set Channel Noise = MEDIUM. Run the simulation. Record the QBER and Final Key Length.
Set Channel Noise = HIGH. Run the simulation. Record the QBER and Final Key Length.
Observation:
[Note: The QBER should increase significantly with higher noise levels, while the Final Key Length decreases only slightly. This proves noise creates errors.]
                                                       Screenshot: [Paste screenshot for High Noise setting here]
Conclusion:
[Explain that channel noise directly increases the QBER, which threatens the security of the key by making it indistinguishable from an eavesdropped channel.]`;
      }
      
      // Calculate statistics for the analysis
      const noiseLevels = data.map(d => Number(d.noise));
      const qberValues = data.map(d => Number(d.qber));
      const maxNoise = Math.max(...noiseLevels);
      const minNoise = Math.min(...noiseLevels);
      const maxQBER = Math.max(...qberValues);
      const minQBER = Math.min(...qberValues);
      
      // Calculate average QBER
      const avgQBER = qberValues.reduce((sum, val) => sum + val, 0) / qberValues.length;
      
      // Check if the relationship is as expected (higher noise -> higher QBER)
      const isMonotonic = qberValues.every((qber, i) => 
        i === 0 || qber >= qberValues[i - 1]
      );
      
      return `Experiment 4: Effect of Channel Noise - Analysis

Key Findings:
- Noise range tested: ${minNoise}% to ${maxNoise}%
- QBER range observed: ${minQBER.toFixed(2)}% to ${maxQBER.toFixed(2)}%
- Average QBER: ${avgQBER.toFixed(2)}%

Interpretation:
${isMonotonic ? 
  "✓ The QBER increases monotonically with channel noise, confirming that noise directly affects the error rate." :
  "⚠ The QBER does not increase monotonically with channel noise. This might indicate other factors influencing the results."
}

Security Implications:
- Low noise (${minNoise}%): QBER = ${minQBER.toFixed(2)}% - Secure key generation possible
- High noise (${maxNoise}%): QBER = ${maxQBER.toFixed(2)}% - Security compromised, key should not be used

The relationship demonstrates that channel noise is a significant factor in QBER, which can make it difficult to distinguish between legitimate errors and eavesdropping attempts. In real-world QKD systems, maintaining low channel noise is crucial for security.`;
    }
    
    case "without-eavesdropper": {
      return `Experiment 2: BB84 Without an Evesdropper
Aim: To establish a baseline for the BB84 protocol's performance under ideal, secure conditions.
Objective: To observe the key generation process and resulting QBER when the quantum channel is secure.
Apparatus: Q-Xplore Virtual Lab
Theory:
This experiment establishes the optimal operating conditions for the BB84 protocol. In the complete absence of an evesdropper, the only factors affecting the Quantum Bit Error Rate (QBER) are the inherent channel noise and system imperfections, as described in Experiment 2. Under well-controlled laboratory conditions with high-quality components, this intrinsic QBER can be very low, often below 2%.
The process proceeds as follows:
Quantum Transmission: Alice sends a sequence of qubits, each randomly prepared in one of the two bases.
Quantum Measurement: Bob independently and randomly chooses a basis for each incoming qubit and measures it.
Sifting: Alice and Bob publicly communicate the bases they used for each qubit (but not the bit values) over a classical channel. They discard all bits where their bases did not match. The remaining bits form the sifted key.
Error Estimation: They compare a random subset of the sifted key to calculate the QBER. A low QBER confirms the channel is secure.
Key Finalization: The remaining portion of the sifted key is then processed through error correction (to fix the few remaining errors) and privacy amplification (to reduce any partial information a potential evesdropper might have) to produce a final, identical, and perfectly secret key.
This scenario demonstrates the protocol's maximum efficiency and serves as a control to identify the disruptive effects of an evesdropper.
Procedure:
Go to the Q-Xplore Virtual Lab simulator.
Set the "evesdropper" parameter to OFF and "Channel Noise" to LOW.
Run the simulation and note the low QBER and efficient key generation.
Take a screenshot of the successful results.
Observation:
[Your Observation Here]
Screenshot of Experiment 3:
[Paste Your Screenshot Here]
Conclusion :
[Based on your observation and results, write what you learned.]`;
    }
    
    case "with-eavesdropper": {
      return `Experiment 3: With an Evesdropper
Aim: To demonstrate the detection of an evesdropper (Eve) using the BB84 protocol.
Objective: To observe how Eve's interception attempts disturb the quantum states and significantly increase the QBER.
Apparatus: Q-Xplore Virtual Lab
Theory:
This experiment demonstrates the core security feature of BB84: the detectable disruption caused by any interception attempt. The most straightforward attack is the intercept-resend attack:
Interception: Eve intercepts the qubit sent by Alice.
Measurement: She randomly chooses a basis (rectilinear or diagonal) to measure it. She has a 50% chance of choosing the wrong basis.
Disturbance: If she chooses the wrong basis, the qubit's state collapses randomly. She records this random result as the bit value.
Resending: To hide her presence, she must send a new qubit to Bob prepared in the state she measured.
This action introduces errors. The probability that Eve chooses the wrong basis is 1/2. If she chooses wrong, she sends the wrong state to Bob. However, Bob also has a 50% chance of choosing the wrong basis for his measurement. The overall probability that an error is introduced for a bit that Eve tampered with is calculated as:
P(Eve chooses wrong basis) = 1/2
P(Bob gets wrong bit | Eve was wrong) = 1/2
Therefore, P(Error) = (1/2) * (1/2) = 1/4 or 25%
Thus, Eve's activity raises the Quantum Bit Error Rate (QBER) to approximately 25%, which is far above the typical tolerable threshold of ~11%. This dramatic and predictable increase is an unambiguous signature of eavesdropping, forcing Alice and Bob to discard the compromised key.
Procedure:
Go to the Q-Xplore Virtual Lab simulator.
Set the "evesdropper" parameter to ON.
Run the simulation and observe the QBER.
Take a screenshot of the results showing the high (~25%) QBER.
Observation:
[Your Observation Here]
Screenshot of Experiment 4:
[Paste Your Screenshot Here]
Conclusion :
[Based on your observation and results, write what you learned.]`;
    }
    
    case "effect-of-distance": {
      return `Experiment 5: Effect of Distance
Aim: To analyze how increasing the transmission distance impacts the efficiency and performance of the BB84 protocol.
Objective: To observe the relationship between distance, photon loss (key rate), and error rate (QBER).
Apparatus: Q-Xplore Virtual Lab
Theory: The primary effect of distance is exponential photon loss (attenuation), which drastically reduces the number of photons reaching Bob and thus the final key rate. Furthermore, over longer distances, effects like polarization drift have more time to occur, which can also cause errors and lead to a slight increase in the QBER alongside the major issue of loss.
Procedure:
Set evesdropper = OFF, Channel Noise = LOW.
Set Distance = SHORT. Run the simulation. Record the QBER and Final Key Length. This is your baseline.
Set Distance = MEDIUM. Run the simulation. Record the QBER and Final Key Length.
Set Distance = LONG. Run the simulation. Record the QBER and Final Key Length.
Observation:
[Note: The Final Key Length should drop dramatically with distance. The QBER may also see a slight increase. This shows distance causes loss and can worsen errors.]
                                            Screenshot: [Paste screenshot for Long Distance setting here]
Conclusion:
[Explain that distance primarily causes photon loss, reducing key generation efficiency. It can also secondarily increase QBER, making it a critical practical limitation for QKD.]`;
    }
    
    case "overall": {
      return `Experiment 6: Effect of Photon Loss
Aim: To study the specific impact of photon loss on the efficiency of the BB84 protocol and distinguish it from bit errors.
Objective: To demonstrate that photon loss reduces the key rate but does not directly increase the QBER.
Theory: It is crucial to distinguish between Photon Loss and Bit Errors.
Photon Loss: A photon is sent but not detected. This reduces the raw number of bits, lowering the key rate, but it does not increase the QBER (a lost photon isn't an error; it's just missing data).
Bit Errors: A photon is detected but its value is wrong. This increases the QBER and compromises security.
An evesdropper causes errors. Channel noise causes errors. Distance causes loss (which can lead to errors indirectly). This experiment isolates the pure effect of loss.
Procedure:
Set evesdropper = OFF, Channel Noise = LOW (to ensure no errors are introduced).
Find a "Photon Loss" or "Attenuation" parameter. If not available, use Distance = LONG.
Set loss to HIGH (or use max distance). Run the simulation.
Record the very short (or zero) Final Key Length and the QBER.
Observation:
[Note: You should observe a very low Key Rate or failed key generation, but the QBER should remain LOW. This proves loss affects quantity, not quality.]
                                              Screenshot: [Paste screenshot showing high loss but low QBER here]
Conclusion:
[Explain that photon loss severely reduces the key rate and efficiency but, unlike noise or eavesdropping, does not by itself increase the QBER or compromise the security of the successfully received bits.]`;
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