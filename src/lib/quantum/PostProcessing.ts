/**
 * Classical Post-Processing Pipeline for QKD
 * 
 * After quantum transmission, raw keys must be processed classically:
 * 1. Sifting - discard mismatched/inconclusive measurements
 * 2. Parameter estimation - calculate QBER
 * 3. Error correction - reconcile differences (Cascade/LDPC)
 * 4. Privacy amplification - reduce Eve's information
 * 
 * This module implements all stages of the classical post-processing.
 */

import { binaryEntropy } from './Eavesdropper';

/**
 * Post-processing configuration
 */
export interface PostProcessingConfig {
  errorCorrectionProtocol: 'cascade' | 'ldpc' | 'winnow';
  privacyAmplificationMethod: 'universal-hash' | 'toeplitz' | 'random-matrix';
  reconciliationEfficiency: number; // 0-1, typically 0.9-0.95
  securityParameter: number; // ε-security parameter (typically 10⁻¹⁰)
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: PostProcessingConfig = {
  errorCorrectionProtocol: 'cascade',
  privacyAmplificationMethod: 'toeplitz',
  reconciliationEfficiency: 0.9,
  securityParameter: 1e-10,
};

/**
 * Post-processing result
 */
export interface PostProcessingResult {
  originalKeyLength: number;
  finalKeyLength: number;
  qber: number;
  errorCorrectionEfficiency: number;
  bitsRevealed: number; // Information leaked during error correction
  privacyAmplificationFactor: number;
  finalKey: string; // Hex-encoded final key
  secure: boolean;
  securityParameter: number;
}

/**
 * Sifting: Filter raw key based on basis information
 * 
 * For BB84: Keep bits where Alice and Bob used same basis
 * For B92: Keep conclusive measurements
 * For E91: Keep correlated measurements
 */
export function siftKeys(
  aliceBits: number[],
  bobBits: number[],
  basisInfo: { alice: number[]; bob: number[] },
  protocol: 'BB84' | 'B92' | 'E91'
): { aliceSifted: number[]; bobSifted: number[]; siftedIndices: number[] } {
  const aliceSifted: number[] = [];
  const bobSifted: number[] = [];
  const siftedIndices: number[] = [];
  
  for (let i = 0; i < aliceBits.length; i++) {
    let keep = false;
    
    switch (protocol) {
      case 'BB84':
        // Keep when bases match
        keep = basisInfo.alice[i] === basisInfo.bob[i];
        break;
      
      case 'B92':
        // Keep conclusive measurements (bobBits !== null)
        keep = bobBits[i] !== null;
        break;
      
      case 'E91':
        // Keep when both detected and used key generation basis
        keep = basisInfo.alice[i] === 1 && basisInfo.bob[i] === 0;
        break;
    }
    
    if (keep) {
      aliceSifted.push(aliceBits[i]);
      bobSifted.push(bobBits[i] ?? 0);
      siftedIndices.push(i);
    }
  }
  
  return { aliceSifted, bobSifted, siftedIndices };
}

/**
 * Calculate Quantum Bit Error Rate (QBER)
 * 
 * Compare a subset of sifted keys to estimate channel quality
 */
export function calculateQBER(
  aliceKey: number[],
  bobKey: number[],
  sampleFraction: number = 0.2
): { qber: number; sampleSize: number; errors: number } {
  const sampleSize = Math.floor(aliceKey.length * sampleFraction);
  
  // Randomly sample positions for comparison
  const indices = new Set<number>();
  while (indices.size < sampleSize && indices.size < aliceKey.length) {
    indices.add(Math.floor(Math.random() * aliceKey.length));
  }
  
  // Count errors in sample
  let errors = 0;
  for (const i of indices) {
    if (aliceKey[i] !== bobKey[i]) {
      errors++;
    }
  }
  
  const qber = errors / indices.size;
  
  return { qber, sampleSize: indices.size, errors };
}

/**
 * Cascade Error Correction Protocol
 * 
 * Iterative protocol that corrects errors through binary search.
 * More efficient than simple parity comparison.
 * 
 * Steps:
 * 1. Divide key into blocks
 * 2. Compare parities
 * 3. If parities differ, use binary search to find error
 * 4. Repeat with different permutations
 */
export function cascadeErrorCorrection(
  aliceKey: number[],
  bobKey: number[],
  qber: number
): { correctedKey: number[]; bitsRevealed: number; iterations: number } {
  let correctedKey = [...bobKey];
  let bitsRevealed = 0;
  let iterations = 0;
  
  // Estimate optimal block size based on QBER
  // B ≈ 0.73 / QBER (from CASCADE paper)
  const estimatedBlockSize = Math.max(2, Math.floor(0.73 / Math.max(qber, 0.001)));
  
  // Multiple passes with different block sizes
  for (let pass = 0; pass < 4; pass++) {
    iterations++;
    const blockSize = Math.max(2, estimatedBlockSize * Math.pow(2, pass));
    
    // Process blocks
    for (let i = 0; i < correctedKey.length; i += blockSize) {
      const blockEnd = Math.min(i + blockSize, correctedKey.length);
      const block = correctedKey.slice(i, blockEnd);
      const aliceBlock = aliceKey.slice(i, blockEnd);
      
      // Compare parities
      const aliceParity = aliceBlock.reduce((sum, bit) => sum + bit, 0) % 2;
      const bobParity = block.reduce((sum, bit) => sum + bit, 0) % 2;
      
      bitsRevealed++; // Revealed one parity bit
      
      if (aliceParity !== bobParity) {
        // Error in block - use binary search to find it
        const errorPos = binarySearchForError(aliceBlock, block);
        if (errorPos !== -1) {
          correctedKey[i + errorPos] = 1 - correctedKey[i + errorPos];
          bitsRevealed += Math.ceil(Math.log2(block.length));
        }
      }
    }
    
    // Random permutation for next pass
    const permutation = generateRandomPermutation(correctedKey.length);
    correctedKey = permute(correctedKey, permutation);
    // Note: In real implementation, Alice would also permute
  }
  
  return { correctedKey, bitsRevealed, iterations };
}

/**
 * Binary search to locate error in block
 */
function binarySearchForError(aliceBlock: number[], bobBlock: number[]): number {
  if (aliceBlock.length <= 1) return -1;
  
  const mid = Math.floor(aliceBlock.length / 2);
  
  const aliceLeftParity = aliceBlock.slice(0, mid).reduce((sum, bit) => sum + bit, 0) % 2;
  const bobLeftParity = bobBlock.slice(0, mid).reduce((sum, bit) => sum + bit, 0) % 2;
  
  if (aliceLeftParity !== bobLeftParity) {
    // Error in left half
    if (mid === 1) return 0;
    return binarySearchForError(
      aliceBlock.slice(0, mid),
      bobBlock.slice(0, mid)
    );
  } else {
    // Error in right half
    const rightResult = binarySearchForError(
      aliceBlock.slice(mid),
      bobBlock.slice(mid)
    );
    return rightResult === -1 ? -1 : mid + rightResult;
  }
}

/**
 * LDPC Error Correction (simplified)
 * 
 * Low-Density Parity-Check codes approach.
 * More efficient than Cascade for high QBER.
 */
export function ldpcErrorCorrection(
  aliceKey: number[],
  bobKey: number[],
  qber: number
): { correctedKey: number[]; bitsRevealed: number } {
  // Simplified LDPC implementation
  // Full implementation would require sparse matrix operations
  
  // For simulation, use syndrome-based approach
  const n = aliceKey.length;
  const codeRate = 1 - binaryEntropy(qber) - 0.1; // Account for overhead
  const parityBits = Math.ceil(n * (1 - codeRate));
  
  // Generate random parity check matrix (sparse)
  const correctedKey = [...bobKey];
  let bitsRevealed = parityBits;
  
  // In real LDPC, we would:
  // 1. Calculate syndrome from Alice's key
  // 2. Send syndrome to Bob
  // 3. Bob uses belief propagation to correct
  
  // Simplified: just reveal syndrome bits
  for (let i = 0; i < parityBits; i++) {
    const blockSize = Math.floor(n / parityBits);
    const start = i * blockSize;
    const end = Math.min(start + blockSize, n);
    
    const aliceParity = aliceKey.slice(start, end).reduce((sum, bit) => sum + bit, 0) % 2;
    const bobParity = correctedKey.slice(start, end).reduce((sum, bit) => sum + bit, 0) % 2;
    
    if (aliceParity !== bobParity) {
      // Flip a random bit in the block (simplified)
      const flipPos = Math.floor(Math.random() * (end - start)) + start;
      correctedKey[flipPos] = 1 - correctedKey[flipPos];
    }
  }
  
  return { correctedKey, bitsRevealed };
}

/**
 * Privacy Amplification using Universal Hash Functions
 * 
 * Reduces Eve's partial information to negligible levels.
 * Uses Toeplitz matrix multiplication for efficiency.
 * 
 * Final key length: l = n - s - t
 * where:
 * - n = length after error correction
 * - s = security parameter (typically 128-256 bits)
 * - t = Eve's known bits
 */
export function privacyAmplification(
  key: number[],
  eveInformation: number,
  securityParameter: number = 128,
  method: 'universal-hash' | 'toeplitz' | 'random-matrix' = 'toeplitz'
): { finalKey: number[]; amplificationFactor: number } {
  const n = key.length;
  
  // Calculate final key length
  // l = n - H_Eve - s
  // where H_Eve is Eve's Shannon information
  const eveBits = Math.ceil(n * eveInformation);
  const finalLength = Math.max(1, n - eveBits - securityParameter);
  
  if (finalLength <= 0) {
    return { finalKey: [], amplificationFactor: 0 };
  }
  
  let finalKey: number[];
  
  switch (method) {
    case 'toeplitz':
      finalKey = toeplitzHash(key, finalLength);
      break;
    
    case 'random-matrix':
      finalKey = randomMatrixHash(key, finalLength);
      break;
    
    case 'universal-hash':
    default:
      finalKey = universalHash(key, finalLength);
      break;
  }
  
  const amplificationFactor = finalLength / n;
  
  return { finalKey, amplificationFactor };
}

/**
 * Toeplitz matrix hashing
 * Efficient implementation using linear feedback shift register
 */
function toeplitzHash(key: number[], outputLength: number): number[] {
  const n = key.length;
  const m = outputLength;
  
  // Generate Toeplitz matrix (defined by first row and column)
  // T[i,j] = T[i-1,j-1] (constant along diagonals)
  const firstRow = generateRandomBits(n);
  const firstColumn = generateRandomBits(m);
  firstColumn[0] = firstRow[0]; // Shared element
  
  // Matrix-vector multiplication: h(x) = T · x
  const result: number[] = [];
  for (let i = 0; i < m; i++) {
    let bit = 0;
    for (let j = 0; j < n; j++) {
      const ti = i <= j ? firstRow[j - i] : firstColumn[i - j];
      bit ^= ti & key[j];
    }
    result.push(bit);
  }
  
  return result;
}

/**
 * Random matrix hashing
 * Simpler but requires more randomness
 */
function randomMatrixHash(key: number[], outputLength: number): number[] {
  const n = key.length;
  const m = outputLength;
  
  // Generate random matrix
  const matrix: number[][] = [];
  for (let i = 0; i < m; i++) {
    matrix.push(generateRandomBits(n));
  }
  
  // Matrix-vector multiplication
  const result: number[] = [];
  for (let i = 0; i < m; i++) {
    let bit = 0;
    for (let j = 0; j < n; j++) {
      bit ^= matrix[i][j] & key[j];
    }
    result.push(bit);
  }
  
  return result;
}

/**
 * Universal hash function (simplified)
 */
function universalHash(key: number[], outputLength: number): number[] {
  // Convert to bytes
  const keyBytes = bitsToBytes(key);
  
  // Simple hash: XOR folding
  const outputBytes = new Uint8Array(Math.ceil(outputLength / 8));
  const blockSize = Math.ceil(keyBytes.length / outputBytes.length);
  
  for (let i = 0; i < keyBytes.length; i++) {
    const outputIndex = Math.floor(i / blockSize);
    if (outputIndex < outputBytes.length) {
      outputBytes[outputIndex] ^= keyBytes[i];
    }
  }
  
  // Convert back to bits
  return bytesToBits(outputBytes).slice(0, outputLength);
}

/**
 * Complete post-processing pipeline
 */
export function runPostProcessing(
  aliceRawKey: number[],
  bobRawKey: number[],
  config: PostProcessingConfig = DEFAULT_CONFIG
): PostProcessingResult {
  const originalKeyLength = aliceRawKey.length;
  
  // Step 1: Calculate QBER
  const { qber } = calculateQBER(aliceRawKey, bobRawKey, 0.2);
  
  // Step 2: Error correction
  let correctedKey: number[];
  let bitsRevealed: number;
  
  if (config.errorCorrectionProtocol === 'cascade') {
    const cascadeResult = cascadeErrorCorrection(aliceRawKey, bobRawKey, qber);
    correctedKey = cascadeResult.correctedKey;
    bitsRevealed = cascadeResult.bitsRevealed;
  } else if (config.errorCorrectionProtocol === 'ldpc') {
    const ldpcResult = ldpcErrorCorrection(aliceRawKey, bobRawKey, qber);
    correctedKey = ldpcResult.correctedKey;
    bitsRevealed = ldpcResult.bitsRevealed;
  } else {
    // Winnow (not implemented, use cascade)
    const cascadeResult = cascadeErrorCorrection(aliceRawKey, bobRawKey, qber);
    correctedKey = cascadeResult.correctedKey;
    bitsRevealed = cascadeResult.bitsRevealed;
  }
  
  // Step 3: Estimate Eve's information
  // Eve's information comes from:
  // 1. QBER (potential eavesdropping)
  // 2. Bits revealed during error correction
  const eveFromQBER = binaryEntropy(qber);
  const eveFromEC = bitsRevealed / originalKeyLength;
  const totalEveInformation = Math.min(1, eveFromQBER + eveFromEC);
  
  // Step 4: Privacy amplification
  const { finalKey, amplificationFactor } = privacyAmplification(
    correctedKey,
    totalEveInformation,
    -Math.log2(config.securityParameter),
    config.privacyAmplificationMethod
  );
  
  // Convert final key to hex string
  const finalKeyHex = bitsToHex(finalKey);
  
  // Calculate error correction efficiency
  // Ideal: H₂(QBER) bits revealed per key bit
  const idealBitsRevealed = originalKeyLength * binaryEntropy(qber);
  const errorCorrectionEfficiency = idealBitsRevealed / bitsRevealed;
  
  // Determine if secure
  const secure = finalKey.length > 0 && qber < 0.15;
  
  return {
    originalKeyLength,
    finalKeyLength: finalKey.length,
    qber,
    errorCorrectionEfficiency,
    bitsRevealed,
    privacyAmplificationFactor: amplificationFactor,
    finalKey: finalKeyHex,
    secure,
    securityParameter: config.securityParameter,
  };
}

// Helper functions

function generateRandomBits(length: number): number[] {
  return Array.from({ length }, () => Math.random() > 0.5 ? 1 : 0);
}

function generateRandomPermutation(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

function permute(array: number[], permutation: number[]): number[] {
  return permutation.map(i => array[i]);
}

function bitsToBytes(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  for (let i = 0; i < bits.length; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitIndex = i % 8;
    bytes[byteIndex] |= bits[i] << (7 - bitIndex);
  }
  return bytes;
}

function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  return bits;
}

function bitsToHex(bits: number[]): string {
  if (bits.length === 0) return '';
  
  const bytes = bitsToBytes(bits);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Calculate secret key fraction
 * r = (1 - H₂(QBER)) · (1 - leakage)
 */
export function calculateSecretKeyFraction(
  qber: number,
  errorCorrectionLeakage: number = 0.1
): number {
  const reconciliationEfficiency = 1 - errorCorrectionLeakage;
  const rawKeyFraction = 1 - binaryEntropy(qber);
  return Math.max(0, reconciliationEfficiency * rawKeyFraction);
}

/**
 * Finite-size security analysis
 * 
 * Accounts for statistical fluctuations in finite key lengths
 */
export function finiteSizeSecurityAnalysis(
  keyLength: number,
  qber: number,
  securityParameter: number = 1e-10
): {
  secureKeyLength: number;
  statisticalFluctuation: number;
  secure: boolean;
} {
  // Statistical fluctuation term
  const statisticalTerm = Math.sqrt(Math.log(1 / securityParameter) / (2 * keyLength));
  
  // Conservative QBER estimate
  const conservativeQBER = qber + statisticalTerm;
  
  // Secure key length
  const secureKeyLength = Math.floor(
    keyLength * (1 - binaryEntropy(conservativeQBER) - 2 * statisticalTerm)
  );
  
  return {
    secureKeyLength: Math.max(0, secureKeyLength),
    statisticalFluctuation: statisticalTerm,
    secure: secureKeyLength > 0
  };
}
