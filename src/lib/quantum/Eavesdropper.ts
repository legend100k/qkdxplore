/**
 * Eavesdropper (Eve) Models
 * 
 * Implements various attack strategies that Eve can use to intercept the quantum key.
 * Each attack introduces characteristic disturbances that can be detected by Alice and Bob.
 */

import { Complex } from './Complex';
import { DensityMatrix, applyUnitary, measureInBasis, zeroState, oneState, plusState, minusState } from './QuantumState';
import { depolarizingChannel, bitFlipChannel } from './QuantumChannel';

/**
 * Eve's attack configuration
 */
export interface EveAttackConfig {
  attackType: 'intercept-resend' | 'beam-splitting' | 'entanglement-cloning' | 'optimal-cloning';
  interceptionProbability: number; // 0-1, probability of attacking each qubit
  attackStrength?: number; // For cloning attacks, how strong the coupling is
}

/**
 * Eve's attack result
 */
export interface EveAttackResult {
  eveKnowledge: number[]; // Eve's measurement results
  disturbanceIntroduced: number; // QBER introduced by Eve
  mutualInformation: number; // Eve's mutual information with Alice
  stateAfterAttack: DensityMatrix | null; // State sent to Bob after attack
}

/**
 * Intercept-Resend Attack
 * 
 * Eve intercepts the photon, measures it in a randomly chosen basis,
 * and sends a new photon to Bob based on her measurement result.
 * 
 * This attack introduces a characteristic 25% QBER in BB84.
 * For B92, the error rate depends on the non-orthogonality angle.
 */
export function interceptResendAttack(
  transmittedState: DensityMatrix,
  aliceBit: number,
  aliceBasis: 'rectilinear' | 'diagonal',
  protocol: 'BB84' | 'B92'
): EveAttackResult {
  // Eve randomly chooses a measurement basis
  const eveBasisChoice = Math.random() > 0.5 ? 'rectilinear' : 'diagonal';
  
  // Eve measures the intercepted state
  const basisAngle = eveBasisChoice === 'rectilinear' ? 0 : Math.PI / 2;
  const measurement = measureInBasis(transmittedState, basisAngle);
  
  const eveResult = measurement.outcome;
  
  // Eve prepares a new state based on her measurement
  // She sends what she thinks Alice sent
  let stateToSend: DensityMatrix;
  
  if (protocol === 'BB84') {
    // In BB84, Eve sends the state corresponding to her measurement
    if (eveBasisChoice === 'rectilinear') {
      stateToSend = eveResult === 0 ? zeroState() : oneState();
    } else {
      stateToSend = eveResult === 0 ? plusState() : minusState();
    }
  } else {
    // In B92, Eve tries to guess which non-orthogonal state was sent
    // She sends |0⟩ if she measured 0 in Z basis, |+⟩ if she measured + in X basis
    if (eveBasisChoice === 'rectilinear') {
      stateToSend = eveResult === 0 ? zeroState() : oneState();
    } else {
      stateToSend = eveResult === 0 ? plusState() : minusState();
    }
  }
  
  // Calculate disturbance introduced
  // If Eve's basis matches Alice's, no error is introduced
  // If bases don't match, Eve introduces 50% error rate
  const basesMatch = eveBasisChoice === aliceBasis;
  const disturbanceIntroduced = basesMatch ? 0 : 0.5;
  
  // Eve's knowledge about Alice's bit
  // If bases match, Eve knows the bit perfectly
  // If bases don't match, Eve has no information
  const eveKnowledgeBit = basesMatch ? eveResult : (Math.random() > 0.5 ? 0 : 1);
  
  // Calculate mutual information I(A:E)
  // For intercept-resend: I(A:E) = 0.5 bits per intercepted qubit (on average)
  const mutualInformation = basesMatch ? 1 : 0;
  
  return {
    eveKnowledge: [eveKnowledgeBit],
    disturbanceIntroduced: disturbanceIntroduced,
    mutualInformation: mutualInformation,
    stateAfterAttack: stateToSend
  };
}

/**
 * Beam Splitting Attack
 * 
 * Eve uses a beam splitter to tap off a portion of the signal.
 * This is particularly relevant for weak coherent pulses (attenuated lasers)
 * where multi-photon pulses can occur.
 * 
 * For single photons, this becomes a probabilistic attack.
 */
export function beamSplittingAttack(
  transmittedState: DensityMatrix,
  aliceBit: number,
  tapRatio: number = 0.1 // Fraction of signal Eve taps (0-1)
): EveAttackResult {
  // For single photons, Eve either gets the whole photon or nothing
  // Probability of getting the photon = tapRatio
  
  const eveGotPhoton = Math.random() < tapRatio;
  
  if (!eveGotPhoton) {
    // Eve gets nothing, Bob receives the original state
    return {
      eveKnowledge: [-1], // -1 means no measurement
      disturbanceIntroduced: 0,
      mutualInformation: 0,
      stateAfterAttack: transmittedState
    };
  }
  
  // Eve got the photon - she measures it
  // She doesn't know the basis, so she chooses randomly
  const eveBasisChoice = Math.random() > 0.5 ? 'rectilinear' : 'diagonal';
  const basisAngle = eveBasisChoice === 'rectilinear' ? 0 : Math.PI / 2;
  
  const measurement = measureInBasis(transmittedState, basisAngle);
  const eveResult = measurement.outcome;
  
  // Bob gets nothing (photon was tapped)
  // This introduces loss, not errors directly
  
  // Eve's mutual information depends on basis match
  // On average, I(A:E) ≈ 0.5 for random basis choice
  const mutualInformation = 0.5;
  
  return {
    eveKnowledge: [eveResult],
    disturbanceIntroduced: 0, // Loss, not error
    mutualInformation: mutualInformation,
    stateAfterAttack: null // Bob gets nothing
  };
}

/**
 * Optimal Cloning Attack (Universal Quantum Cloning Machine)
 * 
 * Eve uses a quantum cloning machine to create approximate copies.
 * The optimal 1→2 universal cloner has fidelity F = 5/6 ≈ 0.833
 * 
 * This is the most powerful individual attack on BB84.
 * It introduces a QBER of 1/6 ≈ 16.67%
 */
export function optimalCloningAttack(
  transmittedState: DensityMatrix,
  aliceBit: number
): EveAttackResult {
  // Optimal cloning fidelity
  const cloningFidelity = 5 / 6;
  
  // Eve creates two approximate copies: one for Bob, one for herself
  // The cloning introduces disturbance
  
  // Model the cloning as a depolarizing channel
  // With probability (1 - F), the state is randomized
  const depolarizationProb = 1 - cloningFidelity;
  
  const bobState = depolarizingChannel(transmittedState, depolarizationProb);
  
  // Eve keeps the other copy and measures it
  // Her copy has the same fidelity
  const eveState = depolarizingChannel(transmittedState, depolarizationProb);
  
  // Eve measures her copy
  const basisAngle = 0; // Computational basis
  const measurement = measureInBasis(eveState, basisAngle);
  const eveResult = measurement.outcome;
  
  // Calculate mutual information
  // For optimal cloning: I(A:E) = 1 - H₂(1/6) ≈ 0.311 bits
  // where H₂ is binary entropy
  const errorProb = 1 / 6;
  const mutualInformation = 1 - binaryEntropy(errorProb);
  
  // Disturbance introduced = 1/6
  const disturbanceIntroduced = errorProb;
  
  return {
    eveKnowledge: [eveResult],
    disturbanceIntroduced: disturbanceIntroduced,
    mutualInformation: mutualInformation,
    stateAfterAttack: bobState
  };
}

/**
 * Entanglement Cloning Attack (for E91)
 * 
 * Eve tries to clone the entangled state shared between Alice and Bob.
 * She introduces an ancilla qubit and performs a joint operation.
 * 
 * This attack is detected through CHSH inequality violation reduction.
 */
export function entanglementCloningAttack(
  entangledState: number[][], // 4x4 density matrix
  couplingStrength: number = 0.3 // How strongly Eve couples to the system
): EveAttackResult {
  // Eve's attack on entangled states reduces the entanglement
  // This is modeled as a partial depolarizing channel on the bipartite state
  
  // The attack reduces the CHSH S-value
  // Ideal: S = 2√2 ≈ 2.828
  // With attack: S decreases
  
  // Model as Werner state mixing
  // ρ' = (1-p)·ρ_entangled + p·I/4
  // where p is related to coupling strength
  
  const mixingParameter = couplingStrength;
  
  // For now, return simplified results
  // Full implementation requires 4x4 density matrix operations
  
  const disturbanceIntroduced = couplingStrength * 0.25; // Approximate
  const mutualInformation = couplingStrength * 0.5;
  
  return {
    eveKnowledge: [], // Eve doesn't measure immediately
    disturbanceIntroduced: disturbanceIntroduced,
    mutualInformation: mutualInformation,
    stateAfterAttack: null // Would need 4x4 matrix support
  };
}

/**
 * Photon Number Splitting (PNS) Attack
 * 
 * Specifically targets weak coherent pulse implementations.
 * Eve splits off one photon from multi-photon pulses and stores it.
 * After basis reconciliation, she measures to learn the key.
 * 
 * This is why decoy states are essential in practical QKD.
 */
export function photonNumberSplittingAttack(
  photonNumber: number, // Actual number of photons in pulse
  aliceBit: number,
  aliceBasis: string
): EveAttackResult {
  if (photonNumber < 2) {
    // Can't split single photons
    return {
      eveKnowledge: [],
      disturbanceIntroduced: 0,
      mutualInformation: 0,
      stateAfterAttack: null
    };
  }
  
  // Eve takes one photon and lets the rest pass to Bob
  // She stores it in a quantum memory
  
  // After basis announcement, Eve measures in the correct basis
  // This gives her perfect information without introducing errors
  
  // For this simulation, we assume Eve successfully stores and measures
  const eveKnowledge = [aliceBit]; // Perfect knowledge after basis announcement
  
  return {
    eveKnowledge: eveKnowledge,
    disturbanceIntroduced: 0, // No disturbance!
    mutualInformation: 1, // Perfect information
    stateAfterAttack: null // Bob gets remaining photons
  };
}

/**
 * Collective Attack (General Framework)
 * 
 * Eve applies the same operation to each qubit but can perform
 * joint measurements on all her ancillas at the end.
 * 
 * This is more powerful than individual attacks but harder to analyze.
 */
export function collectiveAttack(
  transmittedStates: DensityMatrix[],
  aliceBits: number[],
  attackStrength: number = 0.2
): EveAttackResult {
  // Eve couples each qubit to an ancilla
  // She stores all ancillas and performs joint measurement later
  
  // For simulation purposes, we model this as:
  // - Partial information extraction from each qubit
  // - Disturbance proportional to information gained
  
  const eveKnowledge: number[] = [];
  let totalDisturbance = 0;
  
  for (let i = 0; i < transmittedStates.length; i++) {
    // Eve extracts partial information
    const informationGain = attackStrength;
    
    // With probability = informationGain, Eve learns the bit
    const learnedBit = Math.random() < informationGain 
      ? aliceBits[i] 
      : (Math.random() > 0.5 ? 0 : 1);
    
    eveKnowledge.push(learnedBit);
    totalDisturbance += attackStrength * 0.5;
  }
  
  const avgDisturbance = totalDisturbance / transmittedStates.length;
  const mutualInformation = attackStrength;
  
  return {
    eveKnowledge: eveKnowledge,
    disturbanceIntroduced: avgDisturbance,
    mutualInformation: mutualInformation,
    stateAfterAttack: null
  };
}

/**
 * Calculate Eve's mutual information with Alice
 * I(A:E) = H(A) - H(A|E)
 * For binary symmetric channel: I(A:E) = 1 - H₂(Q)
 */
export function calculateMutualInformation(qber: number): number {
  return 1 - binaryEntropy(qber);
}

/**
 * Binary entropy function
 * H₂(p) = -p·log₂(p) - (1-p)·log₂(1-p)
 */
export function binaryEntropy(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

/**
 * Calculate secret key rate with eavesdropping
 * R = I(A:B) - I(A:E) (Devetak-Winter bound)
 */
export function calculateSecretKeyRate(
  qber: number,
  eveMutualInformation: number,
  reconciliationEfficiency: number = 0.9
): number {
  // Alice-Bob mutual information
  const aliceBobMutualInfo = 1 - binaryEntropy(qber);
  
  // Secret key rate (Devetak-Winter bound)
  const secretKeyRate = reconciliationEfficiency * aliceBobMutualInfo - eveMutualInformation;
  
  return Math.max(0, secretKeyRate);
}

/**
 * Apply complete eavesdropping attack based on configuration
 */
export function applyEveAttack(
  config: EveAttackConfig,
  transmittedState: DensityMatrix,
  aliceBit: number,
  aliceBasis: 'rectilinear' | 'diagonal',
  protocol: 'BB84' | 'B92' = 'BB84'
): EveAttackResult {
  // Check if Eve attacks this qubit
  if (Math.random() > config.interceptionProbability) {
    return {
      eveKnowledge: [],
      disturbanceIntroduced: 0,
      mutualInformation: 0,
      stateAfterAttack: transmittedState
    };
  }
  
  // Apply the specified attack
  switch (config.attackType) {
    case 'intercept-resend':
      return interceptResendAttack(transmittedState, aliceBit, aliceBasis, protocol);
    
    case 'beam-splitting':
      return beamSplittingAttack(transmittedState, aliceBit, 0.1);
    
    case 'optimal-cloning':
      return optimalCloningAttack(transmittedState, aliceBit);
    
    case 'entanglement-cloning':
      return entanglementCloningAttack([[new Complex(0,0), new Complex(0,0)], [new Complex(0,0), new Complex(0,0)]], config.attackStrength);
    
    default:
      return interceptResendAttack(transmittedState, aliceBit, aliceBasis, protocol);
  }
}
