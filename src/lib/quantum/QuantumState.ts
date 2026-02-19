/**
 * Quantum State Representation using Density Matrices
 * 
 * This module provides the foundation for simulating mixed quantum states,
 * enabling proper modeling of decoherence, noise, and partial trace operations.
 * 
 * @module QuantumState
 */

import { Complex } from './Complex';

/**
 * 2x2 Density Matrix representation for single qubit states
 * Uses complex numbers for full quantum state representation
 */
export interface DensityMatrix {
  rho00: Complex; // |0⟩⟨0| component
  rho01: Complex; // |0⟩⟨1| component
  rho10: Complex; // |1⟩⟨0| component
  rho11: Complex; // |1⟩⟨1| component
}

/**
 * 4x4 Density Matrix for bipartite (two-qubit) systems
 * Required for E91 entanglement simulation
 */
export interface BipartiteDensityMatrix {
  rho: Complex[][]; // 4x4 complex matrix
}

/**
 * Quantum state with metadata
 */
export interface QuantumState {
  densityMatrix: DensityMatrix;
  purity: number; // Tr(ρ²) - 1 for pure states, <1 for mixed
  blochVector: { x: number; y: number; z: number };
}

/**
 * Pauli matrices for quantum operations
 */
export const PAULI = {
  I: [[new Complex(1, 0), new Complex(0, 0)], [new Complex(0, 0), new Complex(1, 0)]],
  X: [[new Complex(0, 0), new Complex(1, 0)], [new Complex(1, 0), new Complex(0, 0)]],
  Y: [[new Complex(0, 0), new Complex(0, -1)], [new Complex(0, 1), new Complex(0, 0)]],
  Z: [[new Complex(1, 0), new Complex(0, 0)], [new Complex(0, 0), new Complex(-1, 0)]],
};

/**
 * Create a pure state density matrix from state vector
 * ρ = |ψ⟩⟨ψ|
 */
export function pureStateDensityMatrix(alpha: Complex, beta: Complex): DensityMatrix {
  // |ψ⟩ = α|0⟩ + β|1⟩
  // ρ = |ψ⟩⟨ψ| = [αα*  αβ*; βα*  ββ*]
  const alphaConj = alpha.conjugate();
  const betaConj = beta.conjugate();
  
  return {
    rho00: alpha.mul(alphaConj),
    rho01: alpha.mul(betaConj),
    rho10: beta.mul(alphaConj),
    rho11: beta.mul(betaConj),
  };
}

/**
 * Create computational basis states
 */
export function zeroState(): DensityMatrix {
  return pureStateDensityMatrix(new Complex(1, 0), new Complex(0, 0));
}

export function oneState(): DensityMatrix {
  return pureStateDensityMatrix(new Complex(0, 0), new Complex(1, 0));
}

/**
 * Create diagonal basis states (for B92)
 * |+⟩ = (|0⟩ + |1⟩)/√2
 * |-⟩ = (|0⟩ - |1⟩)/√2
 */
export function plusState(): DensityMatrix {
  const invSqrt2 = 1 / Math.sqrt(2);
  return pureStateDensityMatrix(
    new Complex(invSqrt2, 0),
    new Complex(invSqrt2, 0)
  );
}

export function minusState(): DensityMatrix {
  const invSqrt2 = 1 / Math.sqrt(2);
  return pureStateDensityMatrix(
    new Complex(invSqrt2, 0),
    new Complex(-invSqrt2, 0)
  );
}

/**
 * Create circular polarization states
 * |R⟩ = (|0⟩ + i|1⟩)/√2 (right circular)
 * |L⟩ = (|0⟩ - i|1⟩)/√2 (left circular)
 */
export function rightCircularState(): DensityMatrix {
  const invSqrt2 = 1 / Math.sqrt(2);
  return pureStateDensityMatrix(
    new Complex(invSqrt2, 0),
    new Complex(0, invSqrt2)
  );
}

export function leftCircularState(): DensityMatrix {
  const invSqrt2 = 1 / Math.sqrt(2);
  return pureStateDensityMatrix(
    new Complex(invSqrt2, 0),
    new Complex(0, -invSqrt2)
  );
}

/**
 * Create maximally mixed state
 * ρ = I/2 (completely random)
 */
export function maximallyMixedState(): DensityMatrix {
  return {
    rho00: new Complex(0.5, 0),
    rho01: new Complex(0, 0),
    rho10: new Complex(0, 0),
    rho11: new Complex(0.5, 0),
  };
}

/**
 * Create Bell states (maximally entangled two-qubit states)
 * For E91 protocol
 */
export function bellState(name: 'phi_plus' | 'phi_minus' | 'psi_plus' | 'psi_minus'): BipartiteDensityMatrix {
  const invSqrt2 = 1 / Math.sqrt(2);
  
  // Coefficients for |00⟩, |01⟩, |10⟩, |11⟩
  let coeffs: Complex[];
  
  switch (name) {
    case 'phi_plus': // |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
      coeffs = [
        new Complex(invSqrt2, 0),
        new Complex(0, 0),
        new Complex(0, 0),
        new Complex(invSqrt2, 0)
      ];
      break;
    case 'phi_minus': // |Φ⁻⟩ = (|00⟩ - |11⟩)/√2
      coeffs = [
        new Complex(invSqrt2, 0),
        new Complex(0, 0),
        new Complex(0, 0),
        new Complex(-invSqrt2, 0)
      ];
      break;
    case 'psi_plus': // |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2
      coeffs = [
        new Complex(0, 0),
        new Complex(invSqrt2, 0),
        new Complex(invSqrt2, 0),
        new Complex(0, 0)
      ];
      break;
    case 'psi_minus': // |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2
      coeffs = [
        new Complex(0, 0),
        new Complex(invSqrt2, 0),
        new Complex(-invSqrt2, 0),
        new Complex(0, 0)
      ];
      break;
  }
  
  // Construct 4x4 density matrix ρ = |ψ⟩⟨ψ|
  const rho: Complex[][] = [];
  for (let i = 0; i < 4; i++) {
    rho[i] = [];
    for (let j = 0; j < 4; j++) {
      rho[i][j] = coeffs[i].mul(coeffs[j].conjugate());
    }
  }
  
  return { rho };
}

/**
 * Calculate purity: Tr(ρ²)
 * Returns 1 for pure states, <1 for mixed states
 */
export function calculatePurity(rho: DensityMatrix): number {
  const rhoSquared = multiplyDensityMatrices(rho, rho);
  const trace = rhoSquared.rho00.add(rhoSquared.rho11);
  return trace.magnitude();
}

/**
 * Multiply two density matrices
 */
export function multiplyDensityMatrices(a: DensityMatrix, b: DensityMatrix): DensityMatrix {
  return {
    rho00: a.rho00.mul(b.rho00).add(a.rho01.mul(b.rho10)),
    rho01: a.rho00.mul(b.rho01).add(a.rho01.mul(b.rho11)),
    rho10: a.rho10.mul(b.rho00).add(a.rho11.mul(b.rho10)),
    rho11: a.rho10.mul(b.rho01).add(a.rho11.mul(b.rho11)),
  };
}

/**
 * Add two density matrices (for mixing states)
 */
export function addDensityMatrices(a: DensityMatrix, b: DensityMatrix, weightA: number, weightB: number): DensityMatrix {
  return {
    rho00: a.rho00.mulScalar(weightA).add(b.rho00.mulScalar(weightB)),
    rho01: a.rho01.mulScalar(weightA).add(b.rho01.mulScalar(weightB)),
    rho10: a.rho10.mulScalar(weightA).add(b.rho10.mulScalar(weightB)),
    rho11: a.rho11.mulScalar(weightA).add(b.rho11.mulScalar(weightB)),
  };
}

/**
 * Calculate Bloch vector representation
 * For any qubit state: ρ = (I + r⃗·σ⃗)/2
 * where r⃗ = (x, y, z) and σ⃗ are Pauli matrices
 */
export function calculateBlochVector(rho: DensityMatrix): { x: number; y: number; z: number } {
  // x = Tr(ρX) = ρ₀₁ + ρ₁₀
  const x = rho.rho01.add(rho.rho10).real;
  
  // y = Tr(ρY) = -i(ρ₀₁ - ρ₁₀) = Im(ρ₀₁) - Im(ρ₁₀)
  const y = rho.rho01.imag - rho.rho10.imag;
  
  // z = Tr(ρZ) = ρ₀₀ - ρ₁₁
  const z = rho.rho00.real - rho.rho11.real;
  
  return { x, y, z };
}

/**
 * Create a state from Bloch vector
 * ρ = (I + xX + yY + zZ)/2
 */
export function densityMatrixFromBloch(x: number, y: number, z: number): DensityMatrix {
  return {
    rho00: new Complex((1 + z) / 2, 0),
    rho01: new Complex(x / 2, -y / 2),
    rho10: new Complex(x / 2, y / 2),
    rho11: new Complex((1 - z) / 2, 0),
  };
}

/**
 * Partial trace over subsystem B
 * Tr_B(ρ_AB) → ρ_A
 * Essential for analyzing entangled systems
 */
export function partialTraceOverB(rhoAB: BipartiteDensityMatrix): DensityMatrix {
  // ρ_A = Tr_B(ρ_AB)
  // Using computational basis |00⟩, |01⟩, |10⟩, |11⟩
  
  return {
    rho00: rhoAB.rho[0][0].add(rhoAB.rho[1][1]), // ⟨00|ρ|00⟩ + ⟨01|ρ|01⟩
    rho01: rhoAB.rho[0][2].add(rhoAB.rho[1][3]), // ⟨00|ρ|10⟩ + ⟨01|ρ|11⟩
    rho10: rhoAB.rho[2][0].add(rhoAB.rho[3][1]), // ⟨10|ρ|00⟩ + ⟨11|ρ|01⟩
    rho11: rhoAB.rho[2][2].add(rhoAB.rho[3][3]), // ⟨10|ρ|10⟩ + ⟨11|ρ|11⟩
  };
}

/**
 * Partial trace over subsystem A
 * Tr_A(ρ_AB) → ρ_B
 */
export function partialTraceOverA(rhoAB: BipartiteDensityMatrix): DensityMatrix {
  return {
    rho00: rhoAB.rho[0][0].add(rhoAB.rho[2][2]), // ⟨00|ρ|00⟩ + ⟨10|ρ|10⟩
    rho01: rhoAB.rho[0][1].add(rhoAB.rho[2][3]), // ⟨00|ρ|01⟩ + ⟨10|ρ|11⟩
    rho10: rhoAB.rho[1][0].add(rhoAB.rho[3][2]), // ⟨01|ρ|00⟩ + ⟨11|ρ|10⟩
    rho11: rhoAB.rho[1][1].add(rhoAB.rho[3][3]), // ⟨01|ρ|01⟩ + ⟨11|ρ|11⟩
  };
}

/**
 * Calculate fidelity between two quantum states
 * F(ρ, σ) = [Tr(√(√ρ σ √ρ))]²
 * For pure states: F = |⟨ψ|φ⟩|²
 */
export function calculateFidelity(rho: DensityMatrix, sigma: DensityMatrix): number {
  // Simplified formula for single qubit: F = Tr(ρσ) + 2√(det(ρ)det(σ))
  const trRhoSigma = calculateTraceOfProduct(rho, sigma);
  
  // Determinant of 2x2 density matrix
  const detRho = rho.rho00.mul(rho.rho11).subtract(rho.rho01.mul(rho.rho10));
  const detSigma = sigma.rho00.mul(sigma.rho11).subtract(sigma.rho01.mul(sigma.rho10));
  
  const sqrtDetProduct = Math.sqrt(Math.max(0, detRho.magnitude() * detSigma.magnitude()));
  
  return trRhoSigma + 2 * sqrtDetProduct;
}

/**
 * Calculate Tr(ρσ)
 */
export function calculateTraceOfProduct(rho: DensityMatrix, sigma: DensityMatrix): number {
  const product = multiplyDensityMatrices(rho, sigma);
  return product.rho00.add(product.rho11).magnitude();
}

/**
 * Apply unitary transformation: ρ → UρU†
 */
export function applyUnitary(rho: DensityMatrix, U: Complex[][]): DensityMatrix {
  // Convert density matrix to 2x2 complex array
  const rhoMatrix: Complex[][] = [
    [rho.rho00, rho.rho01],
    [rho.rho10, rho.rho11]
  ];
  
  // Calculate Uρ
  const Urho = multiply2x2Matrices(U, rhoMatrix);
  
  // Calculate UρU†
  const Udagger = conjugateTranspose(U);
  const result = multiply2x2Matrices(Urho, Udagger);
  
  return {
    rho00: result[0][0],
    rho01: result[0][1],
    rho10: result[1][0],
    rho11: result[1][1]
  };
}

/**
 * Multiply two 2x2 complex matrices
 */
function multiply2x2Matrices(a: Complex[][], b: Complex[][]): Complex[][] {
  const result: Complex[][] = [];
  for (let i = 0; i < 2; i++) {
    result[i] = [];
    for (let j = 0; j < 2; j++) {
      let sum = new Complex(0, 0);
      for (let k = 0; k < 2; k++) {
        sum = sum.add(a[i][k].mul(b[k][j]));
      }
      result[i][j] = sum;
    }
  }
  return result;
}

/**
 * Conjugate transpose of a matrix
 */
function conjugateTranspose(matrix: Complex[][]): Complex[][] {
  return [
    [matrix[0][0].conjugate(), matrix[1][0].conjugate()],
    [matrix[0][1].conjugate(), matrix[1][1].conjugate()]
  ];
}

/**
 * Rotation operator for arbitrary angle on Bloch sphere
 * R_n(θ) = exp(-iθ n⃗·σ⃗/2)
 */
export function rotationOperator(angle: number, axis: 'x' | 'y' | 'z'): Complex[][] {
  const halfAngle = angle / 2;
  const cosHalf = new Complex(Math.cos(halfAngle), 0);
  const sinHalf = new Complex(Math.sin(halfAngle), 0);
  
  switch (axis) {
    case 'x':
      return [
        [cosHalf, new Complex(0, -sinHalf.imag)],
        [new Complex(0, -sinHalf.imag), cosHalf]
      ];
    case 'y':
      return [
        [cosHalf, new Complex(-sinHalf.imag, 0)],
        [new Complex(sinHalf.imag, 0), cosHalf]
      ];
    case 'z':
      return [
        [cosHalf, new Complex(0, 0)],
        [new Complex(0, 0), cosHalf.conjugate()]
      ];
  }
}

/**
 * Measurement in arbitrary basis
 * Returns measurement outcome and post-measurement state
 */
export function measureInBasis(
  rho: DensityMatrix,
  basisAngle: number // Angle from Z-axis on Bloch sphere
): { outcome: 0 | 1; probability: number; postMeasurementState: DensityMatrix } {
  // Measurement operators
  // M₀ = |ψ₀⟩⟨ψ₀|, M₁ = |ψ₁⟩⟨ψ₁|
  // where |ψ₀⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩
  //       |ψ₁⟩ = -sin(θ/2)|0⟩ + cos(θ/2)|1⟩
  
  const halfAngle = basisAngle / 2;
  const cosHalf = Math.cos(halfAngle);
  const sinHalf = Math.sin(halfAngle);
  
  // Projector |ψ₀⟩⟨ψ₀|
  const projector0: DensityMatrix = {
    rho00: new Complex(cosHalf * cosHalf, 0),
    rho01: new Complex(cosHalf * sinHalf, 0),
    rho10: new Complex(cosHalf * sinHalf, 0),
    rho11: new Complex(sinHalf * sinHalf, 0),
  };
  
  // Projector |ψ₁⟩⟨ψ₁|
  const projector1: DensityMatrix = {
    rho00: new Complex(sinHalf * sinHalf, 0),
    rho01: new Complex(-cosHalf * sinHalf, 0),
    rho10: new Complex(-cosHalf * sinHalf, 0),
    rho11: new Complex(cosHalf * cosHalf, 0),
  };
  
  // Probabilities: p₀ = Tr(ρM₀), p₁ = Tr(ρM₁)
  const prob0 = calculateTraceOfProduct(rho, projector0);
  const prob1 = calculateTraceOfProduct(rho, projector1);
  
  // Normalize
  const totalProb = prob0 + prob1;
  const normalizedProb0 = prob0 / totalProb;
  
  // Sample outcome
  const outcome = Math.random() < normalizedProb0 ? 0 : 1;
  
  // Post-measurement state: ρ' = MρM† / Tr(MρM†)
  const postMeasurementState = outcome === 0 ? projector0 : projector1;
  
  return {
    outcome,
    probability: outcome === 0 ? normalizedProb0 : 1 - normalizedProb0,
    postMeasurementState
  };
}
