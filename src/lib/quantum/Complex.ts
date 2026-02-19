/**
 * Complex Number Implementation for Quantum Simulations
 * 
 * Essential for representing quantum amplitudes and unitary operations
 */

export class Complex {
  public real: number;
  public imag: number;

  constructor(real: number, imag: number) {
    this.real = real;
    this.imag = imag;
  }

  /**
   * Add two complex numbers
   */
  add(other: Complex): Complex {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }

  /**
   * Subtract two complex numbers
   */
  subtract(other: Complex): Complex {
    return new Complex(this.real - other.real, this.imag - other.imag);
  }

  /**
   * Multiply two complex numbers
   * (a + bi)(c + di) = (ac - bd) + (ad + bc)i
   */
  mul(other: Complex): Complex {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }

  /**
   * Multiply by scalar
   */
  mulScalar(scalar: number): Complex {
    return new Complex(this.real * scalar, this.imag * scalar);
  }

  /**
   * Divide by another complex number
   */
  div(other: Complex): Complex {
    const denom = other.real * other.real + other.imag * other.imag;
    return new Complex(
      (this.real * other.real + this.imag * other.imag) / denom,
      (this.imag * other.real - this.real * other.imag) / denom
    );
  }

  /**
   * Complex conjugate
   */
  conjugate(): Complex {
    return new Complex(this.real, -this.imag);
  }

  /**
   * Magnitude (absolute value)
   * |z| = √(a² + b²)
   */
  magnitude(): number {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  /**
   * Squared magnitude (faster, no sqrt)
   */
  magnitudeSquared(): number {
    return this.real * this.real + this.imag * this.imag;
  }

  /**
   * Phase (argument)
   * arg(z) = atan2(b, a)
   */
  phase(): number {
    return Math.atan2(this.imag, this.real);
  }

  /**
   * Exponential: e^z = e^a(cos(b) + i·sin(b))
   */
  static exp(z: Complex): Complex {
    const expReal = Math.exp(z.real);
    return new Complex(
      expReal * Math.cos(z.imag),
      expReal * Math.sin(z.imag)
    );
  }

  /**
   * Create complex number from polar form
   * z = r·e^(iθ)
   */
  static fromPolar(magnitude: number, phase: number): Complex {
    return new Complex(magnitude * Math.cos(phase), magnitude * Math.sin(phase));
  }

  /**
   * Check if two complex numbers are equal (within tolerance)
   */
  equals(other: Complex, tolerance: number = 1e-10): boolean {
    return Math.abs(this.real - other.real) < tolerance &&
           Math.abs(this.imag - other.imag) < tolerance;
  }

  /**
   * String representation
   */
  toString(): string {
    const sign = this.imag >= 0 ? '+' : '-';
    return `${this.real.toFixed(4)} ${sign} ${Math.abs(this.imag).toFixed(4)}i`;
  }

  /**
   * Zero complex number
   */
  static zero(): Complex {
    return new Complex(0, 0);
  }

  /**
   * One complex number (1 + 0i)
   */
  static one(): Complex {
    return new Complex(1, 0);
  }

  /**
   * Imaginary unit i
   */
  static i(): Complex {
    return new Complex(0, 1);
  }
}
