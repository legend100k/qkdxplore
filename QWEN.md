# QKD_Xplore - Project Context

## Project Overview

**QKD_Xplore** is an interactive educational web application for learning and experimenting with **Quantum Key Distribution (QKD)** protocols. The application focuses on three major QKD protocols:

- **BB84** - The first quantum cryptography protocol (Bennett & Brassard, 1984)
- **E91** - Entanglement-based protocol using Bell states (Ekert, 1991)
- **B92** - Simplified two-state protocol (Bennett, 1992)

The application provides interactive simulations, step-by-step visualizations, experimental analysis tools, and comprehensive educational resources about quantum cryptography principles.

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18.3** | UI framework |
| **TypeScript 5.8** | Type-safe development |
| **Vite 5.4** | Build tool and dev server |
| **shadcn/ui** | UI component library |
| **Tailwind CSS 3.4** | Styling framework |
| **React Router 6.3** | Client-side routing |
| **TanStack Query 5.83** | Data fetching and state management |
| **Recharts 2.15** | Data visualization |
| **Sonner 1.7** | Toast notifications |
| **Lucide React 0.462** | Icon library |
| **Google Charts** | Simulation metrics visualization |

### Backend (Python/Flask)
| Technology | Purpose |
|------------|---------|
| **Flask 2.3.3** | REST API server |
| **Flask-CORS 4.0** | Cross-origin support |
| **Qiskit 0.45+** | IBM Quantum SDK |
| **Qiskit-IBM-Runtime 0.15+** | IBM Quantum cloud access |
| **Qiskit-Aer 0.13+** | Quantum circuit simulation |
| **NumPy 1.21+** | Numerical computing |
| **Matplotlib 3.5+** | Scientific visualization |

## Project Structure

```
qkdxplore/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── SimulationSection.tsx # Main simulation component (consolidated)
│   │   ├── E91SimulationSection.tsx # All protocols (BB84, E91, B92)
│   │   ├── B92SimulationSection.tsx # B92 protocol (legacy)
│   │   ├── ExperimentsSection.tsx # Experimental analysis
│   │   ├── ReportsSection.tsx    # Report generation
│   │   ├── EnhancedTheorySection.tsx # Educational content
│   │   ├── PreQuiz.tsx / PostQuiz.tsx # Assessment components
│   │   ├── ProtocolSteps.tsx     # Protocol breakdown
│   │   ├── QiskitIntegration.tsx # IBM Quantum integration
│   │   ├── PythonCodeEditor.tsx  # In-browser Python execution
│   │   ├── QuantumHardware.tsx   # Hardware info
│   │   ├── Certificate.tsx       # Completion certificates
│   │   └── Navigation.tsx        # App navigation
│   ├── pages/
│   │   ├── Index.tsx             # Main page
│   │   ├── AuthPage.tsx          # Authentication
│   │   └── NotFound.tsx          # 404 page
│   ├── lib/
│   │   ├── utils.ts              # Utility functions (cn helper)
│   │   └── opticalNoise.ts       # Physics-based optical noise model
│   ├── hooks/                    # Custom React hooks
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── backend/                      # Flask REST API
│   ├── app.py                    # Main Flask application
│   ├── e91_protocol.py           # E91 protocol implementation
│   └── requirements.txt          # Python dependencies
├── qiskit/                       # IBM Quantum integration
│   ├── main.py                   # BB84 Qiskit implementation
│   ├── e91_protocol.py           # E91 Qiskit implementation
│   └── README.md                 # Qiskit documentation
├── docs/                         # Documentation
│   ├── guides/                   # Setup and learning guides
│   ├── examples/                 # Code examples
│   └── summaries/                # Technical summaries
├── scripts/                      # Utility scripts
├── public/                       # Static assets
└── package.json                  # Node.js dependencies
```

## Building and Running

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint codebase
npm run lint
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server (port 5000)
python app.py
```

### IBM Quantum Integration

The application includes integration with IBM Quantum backends:
- API token is configured in `qiskit/main.py`
- Uses `ibm_kyiv` backend for real quantum execution
- Simulation mode available for faster testing without hardware

## API Endpoints

### Backend (Flask - Port 5000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bb84` | POST | Run BB84 on real quantum hardware |
| `/api/bb84/simulate` | POST | Run BB84 simulation with optical noise |
| `/api/e91` | POST | Run E91 on real quantum hardware |
| `/api/e91/simulate` | POST | Run E91 simulation |
| `/api/execute-python` | POST | Execute Python code (Qiskit) |
| `/api/health` | GET | Health check |

### Request/Response Format

```json
// POST /api/bb84
{
  "n_bits": 16,
  "seed": 0
}

// Response
{
  "success": true,
  "data": {
    "alice_bits": [0, 1, 0, 1, ...],
    "alice_bases": [0, 1, 0, 1, ...],
    "bob_bases": [1, 0, 1, 0, ...],
    "bob_results": [1, 0, 1, 0, ...],
    "alice_key": [0, 1],
    "bob_key": [0, 1],
    "qber": 0.0,
    "job_id": "job_12345",
    "key_length": 2,
    "keys_match": true
  }
}
```

## Key Features

### 1. Interactive Simulation
- Real-time visualization of quantum key distribution
- Configurable parameters: qubits/bits count, noise levels, eavesdropping rates
- Step-by-step mode for educational purposes
- Detailed results tables showing all measurement data

### 2. Physics-Based Optical Noise Model
The `opticalNoise.ts` library implements realistic photon transmission effects:
- **Depolarization**: Polarization randomization from scattering
- **Phase Damping**: Coherence loss from environmental interactions
- **Amplitude Damping**: Photon loss from absorption
- **Polarization Mode Dispersion (PMD)**: Differential delay effects
- **Thermal Noise**: Detector dark counts

### 3. Experiments
Pre-built experimental modules:
- Effect of channel noise on QBER
- Distance-dependent photon loss analysis
- Eavesdropping detection demonstration
- Qubit scaling analysis
- Real-world comparison studies

### 4. Reporting
- Experiment report generation (DOCX format)
- Data visualization in reports
- Comprehensive analysis and conclusions

### 5. Educational Content
- Enhanced theory sections with detailed explanations
- Pre and post-learning quizzes
- Protocol step breakdowns
- IBM Quantum integration tutorials

## Development Conventions

### Code Style
- **TypeScript**: Strict typing where possible, relaxed for UI components
- **React**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Absolute paths using `@/` alias for `src/`

### Component Structure
```tsx
import { useState, useEffect } from "react";
import { ComponentUI } from "@/components/ui/component";

interface Props {
  // Props definition
}

export const ComponentName = ({ prop1, prop2 }: Props) => {
  // State declarations
  // Event handlers
  // Effects
  // Render
};
```

### Testing Practices
- Manual testing through interactive simulations
- Experiment-based validation of quantum principles
- Visual verification of simulation results

### Git Workflow
```bash
# Feature branch
git checkout -b feature/feature-name

# Commit with descriptive messages
git commit -m "Add feature description"

# Push and create PR
git push origin feature/feature-name
```

## Architecture Notes

### State Management
- React Query for server state (API calls)
- Local state with `useState` for UI state
- No global state management library (Context API sufficient)

### Routing
- Single-page application with React Router
- Main route: `/` with tab-based navigation
- Catch-all route for 404 handling

### Theming
- Dark/Light mode support via `next-themes`
- Theme preference stored in localStorage
- Tailwind CSS for responsive design

### Performance Considerations
- Google Charts loaded on-demand for simulation metrics
- Component lazy loading where applicable
- Vite for fast HMR in development

## Common Tasks

### Adding a New Protocol
1. Create protocol simulation logic in `E91SimulationSection.tsx`
2. Add protocol type to `Protocol` union type
3. Implement protocol-specific analysis functions
4. Add protocol button to selector
5. Update results table renderer

### Modifying Noise Model
1. Edit `src/lib/opticalNoise.ts`
2. Update noise parameter calculations
3. Test with experiments to verify behavior

### Adding Experiments
1. Create experiment configuration in `ExperimentsSection.tsx`
2. Define data collection parameters
3. Implement analysis and visualization
4. Add to report generation

## Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Backend Connection
- Ensure Flask server is running on port 5000
- Check CORS configuration in `backend/app.py`
- Verify IBM Quantum API token is valid

### TypeScript Errors
- Check `tsconfig.json` for path aliases
- Ensure all imports use correct paths
- Run `npm run lint` to catch issues

## References

- **Nielsen & Chuang**: "Quantum Computation and Quantum Information"
- **Scarani et al.**: "The security of practical quantum key distribution" (2009)
- **Gisin et al.**: "Quantum cryptography" Nature Photonics (2007)
- **IBM Quantum Documentation**: https://qiskit.org/documentation/
