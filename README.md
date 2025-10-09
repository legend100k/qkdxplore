# Quantum BB84 Playground

An interactive web application for learning and experimenting with the BB84 quantum key distribution protocol - the first quantum cryptography protocol that enables secure communication using quantum mechanics principles.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
- [Application Structure](#application-structure)
- [BB84 Protocol Explained](#bb84-protocol-explained)
- [Experiments](#experiments)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Quantum BB84 Playground is an educational tool designed to help users understand quantum cryptography, specifically the BB84 protocol developed by Charles Bennett and Gilles Brassard in 1984. This protocol allows two parties (Alice and Bob) to securely share a secret key that can be used for encrypting and decrypting messages, with security guaranteed by the laws of quantum mechanics.

This application provides:
- Interactive simulations of the BB84 protocol
- Step-by-step visualization of quantum key distribution
- Experimental analysis of protocol behavior under various conditions
- Comprehensive educational resources about quantum cryptography

## Features

### Interactive Simulation
- Real-time visualization of quantum key distribution between Alice and Bob
- Configurable parameters (number of qubits, noise levels, eavesdropping rates)
- **Physics-based optical noise model** simulating realistic photon transmission
  - Depolarization (polarization randomization)
  - Phase damping (coherence loss)
  - Amplitude damping (photon loss)
  - Polarization mode dispersion (PMD)
  - Thermal detector noise
  - Wavelength-dependent fiber attenuation (850nm, 1310nm, 1550nm)
- Step-by-step mode to understand each phase of the protocol
- Detailed results display showing bit values, basis choices, and key generation

### Educational Content
- Comprehensive theory section explaining quantum cryptography principles
- Pre and post quizzes to test understanding
- Enhanced theory sections with detailed explanations
- Protocol steps breakdown with visual aids

### Experiments
- **Effect of Channel Noise**: Analyze how optical noise (depolarization, phase damping) affects QBER
- **Effect of Distance**: Study photon loss and PMD over various fiber lengths
- **Eavesdropping Detection**: Demonstrate security through QBER increase
- **Qubit Scaling**: Examine key rate vs. number of transmitted photons
- **Real-world Comparisons**: Compare ideal vs. practical QKD implementations
- Data visualization with interactive charts
- Automated experiment iterations

### Reporting
- Experiment report generation
- Data visualization in reports
- Downloadable HTML reports
- Comprehensive analysis and conclusions

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React Hooks
- **Data Visualization**: Recharts
- **Notification System**: Sonner
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js) or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quantum-bb84-playground
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

### Development

Start the development server with hot reloading:
```bash
npm run dev
# or
yarn dev
```

Build for production:
```bash
npm run build
# or
yarn build
```

Preview the production build:
```bash
npm run preview
# or
yarn preview
```

## Application Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── SimulationSection.tsx    # Interactive BB84 protocol simulation
│   ├── ExperimentsSection.tsx   # Experimental analysis tools
│   ├── ReportsSection.tsx       # Report generation and management
│   ├── TheorySection.tsx        # Educational content
│   ├── EnhancedTheorySection.tsx # Detailed theory explanations
│   ├── ProtocolSteps.tsx        # BB84 protocol breakdown
│   ├── PreQuiz.tsx              # Pre-learning assessment
│   ├── PostQuiz.tsx             # Post-learning assessment
│   └── Navigation.tsx           # Application navigation
├── lib/
│   └── utils.ts             # Utility functions
├── App.tsx                  # Main application component
├── main.tsx                 # Application entry point
└── vite-env.d.ts            # Type definitions
```

## BB84 Protocol Explained

The BB84 protocol is a quantum key distribution scheme that allows two parties to produce a shared random secret key known only to them, which can then be used to encrypt and decrypt messages. It is based on the principle that measuring a quantum system in general disturbs the system.

### How BB84 Works

1. **Quantum Transmission Phase**:
   - Alice generates a random bit (0 or 1) and a random basis (rectilinear + or diagonal ×)
   - Alice encodes the bit in a photon polarization according to the basis
   - Alice sends the photon to Bob through a quantum channel

2. **Measurement Phase**:
   - Bob receives the photon and randomly chooses a basis to measure it
   - If Bob's basis matches Alice's, he gets the correct bit
   - If Bob's basis doesn't match, he gets a random bit

3. **Basis Comparison Phase**:
   - Alice and Bob publicly compare their basis choices (not the bit values)
   - They keep bits where their bases matched and discard the rest

4. **Security Check Phase**:
   - Alice and Bob publicly compare a subset of their remaining bits
   - If the error rate is too high, they suspect eavesdropping and abort
   - If the error rate is acceptable, they use the remaining bits as their secret key

### Security Principles

- **No-cloning theorem**: An eavesdropper cannot perfectly copy unknown quantum states
- **Measurement disturbance**: Any measurement of a quantum system disturbs it
- **Detection capability**: Eavesdropping introduces detectable errors in the transmission

## Experiments

The application includes several pre-built experiments to analyze the BB84 protocol under different conditions:

### Noise Impact Analysis
- Examines how environmental noise affects protocol performance
- Measures error rates and key generation efficiency with varying noise levels
- Demonstrates the sensitivity of quantum key distribution to channel quality

### Eavesdropping Detection
- Studies how eavesdropping attempts affect error rates
- Quantifies the relationship between interception probability and detectable errors
- Validates the fundamental security principle of quantum cryptography

### Qubit Scaling Analysis
- Explores how key length scales with the number of transmitted qubits
- Analyzes statistical security improvements with larger sample sizes
- Examines practical implementation considerations for key generation

### Real World Comparison
- Compares protocol performance under various realistic conditions
- Shows additive effects of noise and eavesdropping
- Demonstrates practical deployment challenges

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Charles Bennett and Gilles Brassard for developing the BB84 protocol
- The quantum cryptography research community
- All contributors to the open-source libraries used in this project