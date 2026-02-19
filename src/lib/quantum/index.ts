/**
 * Quantum Key Distribution Simulation Library
 * 
 * A comprehensive research-level simulation framework for QKD protocols
 * including BB84, B92, and E91 with realistic noise models and eavesdropping attacks.
 * 
 * @module Quantum
 */

// Core quantum state representation
export * from './Complex';
export * from './QuantumState';

// Quantum channels and noise
export * from './QuantumChannel';

// Eavesdropping models
export * from './Eavesdropper';

// QKD Protocols
export * from './B92Protocol';
export * from './E91Protocol';

// Classical post-processing
export * from './PostProcessing';

// Unified simulator
export * from './QKDSimulator';

/**
 * Example usage:
 * 
 * ```typescript
 * import {
 *   runB92Protocol,
 *   runE91Protocol,
 *   runPostProcessing,
 *   DEFAULT_CHANNEL_PARAMS
 * } from '@/lib/quantum';
 * 
 * // Run B92 simulation
 * const b92Result = runB92Protocol({
 *   numBits: 1000,
 *   channelParams: {
 *     ...DEFAULT_CHANNEL_PARAMS,
 *     fiberLength: 25 // km
 *   },
 *   eveConfig: {
 *     attackType: 'intercept-resend',
 *     interceptionProbability: 0.2
 *   }
 * });
 * 
 * // Run E91 simulation
 * const e91Result = runE91Protocol({
 *   numPairs: 1000,
 *   channelParams: DEFAULT_CHANNEL_PARAMS
 * });
 * 
 * // Check CHSH violation
 * console.log(`CHSH S-value: ${e91Result.chshResult.S}`);
 * console.log(`Bell inequality violated: ${e91Result.chshResult.bellViolated}`);
 * 
 * // Post-process keys
 * const postProcessingResult = runPostProcessing(
 *   e91Result.aliceSiftedKey,
 *   e91Result.bobSiftedKey
 * );
 * 
 * console.log(`Final key length: ${postProcessingResult.finalKeyLength}`);
 * console.log(`QBER: ${(postProcessingResult.qber * 100).toFixed(2)}%`);
 * ```
 */

/**
 * Key Physics Concepts Implemented:
 * 
 * 1. Density Matrix Formalism
 *    - Full mixed state representation
 *    - Partial trace for subsystems
 *    - Purity and fidelity calculations
 * 
 * 2. Quantum Channels (Kraus Operators)
 *    - Amplitude damping (photon loss)
 *    - Phase damping (decoherence)
 *    - Depolarizing channel (random errors)
 *    - Bit/phase flip channels
 * 
 * 3. Realistic Fiber Optics
 *    - Beer-Lambert attenuation
 *    - Polarization mode dispersion
 *    - Thermal detector noise
 *    - Dark counts in SPADs
 * 
 * 4. Eavesdropping Attacks
 *    - Intercept-resend
 *    - Beam splitting (PNS)
 *    - Optimal quantum cloning
 *    - Entanglement cloning
 * 
 * 5. Security Analysis
 *    - CHSH inequality testing
 *    - Mutual information bounds
 *    - Devetak-Winter key rate
 *    - Finite-size effects
 * 
 * 6. Post-Processing
 *    - Cascade error correction
 *    - Privacy amplification
 *    - Universal hash functions
 */

/**
 * References:
 * 
 * [1] Nielsen, M.A. & Chuang, I.L. "Quantum Computation and Quantum Information"
 *     Cambridge University Press, 2010.
 * 
 * [2] Scarani, V. et al. "The security of practical quantum key distribution"
 *     Reviews of Modern Physics 81, 1301 (2009).
 * 
 * [3] Gisin, N. et al. "Quantum cryptography"
 *     Nature Photonics 6, 772-780 (2007).
 * 
 * [4] Ekert, A.K. "Quantum cryptography based on Bell's theorem"
 *     Physical Review Letters 67, 661 (1991).
 * 
 * [5] Bennett, C.H. "Quantum cryptography using any two nonorthogonal states"
 *     Physical Review Letters 68, 3121 (1992).
 * 
 * [6] Devetak, I. & Winter, A. "Distillation of secret key and entanglement from quantum states"
 *     Proceedings of the Royal Society A 461, 207-243 (2005).
 */
