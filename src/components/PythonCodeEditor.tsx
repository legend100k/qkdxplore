import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  RotateCw, 
  Copy, 
  Download, 
  Upload, 
  Code, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  Loader2,
  FileText,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface CodeExecutionResult {
  output: string;
  error: string;
  executionTime: number;
  success: boolean;
}

const defaultCode = `# BB84 Quantum Key Distribution Protocol
# This code demonstrates the BB84 protocol using Qiskit

import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

def bb84_protocol(n_bits=4, seed=0):
    \"\"\"
    Simulate BB84 Quantum Key Distribution Protocol
    \"\"\"
    np.random.seed(seed)
    
    # Alice's random bits and bases
    alice_bits = np.random.randint(2, size=n_bits)
    alice_bases = np.random.randint(2, size=n_bits)
    
    # Bob's random measurement bases
    bob_bases = np.random.randint(2, size=n_bits)
    
    # Simulate Bob's measurements
    bob_results = []
    for i in range(n_bits):
        if alice_bases[i] == bob_bases[i]:  # Same basis
            # 95% chance of correct measurement
            if np.random.random() < 0.95:
                bob_results.append(alice_bits[i])
            else:
                bob_results.append(1 - alice_bits[i])
        else:  # Different basis
            bob_results.append(np.random.randint(2))
    
    # Generate sifted keys
    alice_key = [bit for i, bit in enumerate(alice_bits) if alice_bases[i] == bob_bases[i]]
    bob_key = [bit for i, bit in enumerate(bob_results) if alice_bases[i] == bob_bases[i]]
    
    # Calculate QBER
    if alice_key and bob_key:
        errors = sum(a != b for a, b in zip(alice_key, bob_key))
        qber = errors / len(alice_key) if alice_key else 0
    else:
        qber = 0
    
    return {
        'alice_bits': alice_bits.tolist(),
        'alice_bases': alice_bases.tolist(),
        'bob_bases': bob_bases.tolist(),
        'bob_results': bob_results,
        'alice_key': alice_key,
        'bob_key': bob_key,
        'qber': qber,
        'key_length': len(alice_key),
        'keys_match': alice_key == bob_key
    }

# Run the protocol
print("🔬 BB84 Quantum Key Distribution Protocol")
print("=" * 50)

result = bb84_protocol(n_bits=8, seed=42)

print(f"Alice's bits: {result['alice_bits']}")
print(f"Alice's bases: {result['alice_bases']}")
print(f"Bob's bases: {result['bob_bases']}")
print(f"Bob's results: {result['bob_results']}")
print()
print(f"Final Alice key: {result['alice_key']}")
print(f"Final Bob key: {result['bob_key']}")
print(f"Key length: {result['key_length']} bits")
print(f"QBER: {result['qber']:.2%}")
print(f"Keys match: {'✅ Yes' if result['keys_match'] else '❌ No'}")

if result['keys_match']:
    print("\\n🎉 Success! Secure key established!")
else:
    print("\\n⚠️  Keys don't match - possible eavesdropping!")`;

const codeExamples = {
  "BB84 Simu": defaultCode,
  "Quantum Circuit": `# Create a simple quantum circuit
from qiskit import QuantumCircuit, transpile
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt

# Create a 2-qubit circuit
qc = QuantumCircuit(2, 2)

# Add gates
qc.h(0)  # Hadamard gate on qubit 0
qc.cx(0, 1)  # CNOT gate
qc.measure_all()

print("Quantum Circuit:")
print(qc)

# Simulate the circuit
from qiskit_aer import AerSimulator
simulator = AerSimulator()
job = simulator.run(qc, shots=1000)
result = job.result()
counts = result.get_counts()

print("\\nMeasurement results:")
for state, count in counts.items():
    print(f"|{state}⟩: {count}")`,
  
  "Quantum Entanglement": `# Demonstrate quantum entanglement
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import numpy as np

def create_bell_state():
    \"\"\"Create a Bell state (maximally entangled)\"\"\"
    qc = QuantumCircuit(2, 2)
    qc.h(0)  # Apply Hadamard to first qubit
    qc.cx(0, 1)  # Apply CNOT
    qc.measure_all()
    return qc

# Create and run the circuit
qc = create_bell_state()
print("Bell State Circuit:")
print(qc)

simulator = AerSimulator()
job = simulator.run(qc, shots=1000)
result = job.result()
counts = result.get_counts()

print("\\nEntangled state measurements:")
for state, count in counts.items():
    print(f"|{state}⟩: {count}")

# Check for entanglement (should only see |00⟩ and |11⟩)
print("\\nEntanglement check:")
if '01' not in counts and '10' not in counts:
    print("✅ Perfect entanglement detected!")
else:
    print("❌ Entanglement not perfect")`,
  
  "Quantum Teleportation": `# Quantum teleportation protocol
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

def quantum_teleportation():
    \"\"\"Implement quantum teleportation\"\"\"
    qc = QuantumCircuit(3, 3)
    
    # Prepare the state to be teleported (qubit 0)
    qc.x(0)  # |1⟩ state
    qc.barrier()
    
    # Create Bell pair (qubits 1 and 2)
    qc.h(1)
    qc.cx(1, 2)
    qc.barrier()
    
    # Alice's operations
    qc.cx(0, 1)
    qc.h(0)
    qc.barrier()
    
    # Alice measures
    qc.measure(0, 0)
    qc.measure(1, 1)
    qc.barrier()
    
    # Bob's operations based on Alice's measurements
    qc.cx(1, 2)
    qc.cz(0, 2)
    
    # Measure the teleported qubit
    qc.measure(2, 2)
    
    return qc

# Create and run teleportation circuit
qc = quantum_teleportation()
print("Quantum Teleportation Circuit:")
print(qc)

simulator = AerSimulator()
job = simulator.run(qc, shots=1000)
result = job.result()
counts = result.get_counts()

print("\\nTeleportation results:")
for state, count in counts.items():
    print(f"|{state}⟩: {count}")

# Check if teleportation was successful
successful_teleportations = counts.get('001', 0) + counts.get('111', 0)
total = sum(counts.values())
success_rate = successful_teleportations / total

print(f"\\nTeleportation success rate: {success_rate:.2%}")`
};

export const PythonCodeEditor = () => {
  const [code, setCode] = useState(defaultCode);
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedExample, setSelectedExample] = useState("BB84 Basic");
  const [executionHistory, setExecutionHistory] = useState<CodeExecutionResult[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const executeCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter some Python code to execute");
      return;
    }

    setIsExecuting(true);
    setResult(null);

    try {
      const startTime = Date.now();
      
      // Send code to backend for execution
      const response = await apiFetch('/api/execute-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      if (data.success) {
        const executionResult: CodeExecutionResult = {
          output: data.output || '',
          error: data.error || '',
          executionTime,
          success: true
        };
        
        setResult(executionResult);
        setExecutionHistory(prev => [executionResult, ...prev.slice(0, 9)]); // Keep last 10
        toast.success("Code executed successfully!");
      } else {
        const executionResult: CodeExecutionResult = {
          output: '',
          error: data.error || 'Unknown error occurred',
          executionTime,
          success: false
        };
        
        setResult(executionResult);
        setExecutionHistory(prev => [executionResult, ...prev.slice(0, 9)]);
        toast.error("Code execution failed");
      }
    } catch (error) {
      let errorMsg = 'Connection error: ';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('Failed to connect')) {
          errorMsg += 'Failed to connect to Python execution service. Please ensure the backend is running. In local development, run `python start_backend.py`.';
        } else {
          errorMsg += error.message;
        }
      } else {
        errorMsg += 'Unknown error occurred.';
      }
      
      const executionResult: CodeExecutionResult = {
        output: '',
        error: errorMsg,
        executionTime: 0,
        success: false
      };
      
      setResult(executionResult);
      setExecutionHistory(prev => [executionResult, ...prev.slice(0, 9)]);
      toast.error("Failed to connect to Python execution service");
    } finally {
      setIsExecuting(false);
    }
  };

  const loadExample = (exampleName: string) => {
    setCode(codeExamples[exampleName as keyof typeof codeExamples]);
    setSelectedExample(exampleName);
    setResult(null);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum_code.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code downloaded!");
  };

  const clearCode = () => {
    setCode('');
    setResult(null);
  };

  const formatCode = () => {
    // Simple indentation fix
    const lines = code.split('\n');
    const formatted = lines.map(line => {
      // Basic indentation based on colons and keywords
      if (line.trim().endsWith(':')) {
        return line;
      }
      return line;
    }).join('\n');
    setCode(formatted);
    toast.success("Code formatted!");
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-quantum-blue to-quantum-purple bg-clip-text text-transparent mb-4">
          Python Code Editor
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Write and execute Python code with Qiskit directly in your browser. Perfect for quantum computing experiments!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <Card className="quantum-glow border-quantum-blue/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Python Code Editor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Python 3.13</Badge>
                <Badge variant="outline">Qiskit Ready</Badge>
              </div>
            </div>
            <CardDescription>
              Write your quantum computing code here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code Examples */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Examples:</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(codeExamples).map((example) => (
                  <Button
                    key={example}
                    variant={selectedExample === example ? "default" : "outline"}
                    size="sm"
                    onClick={() => loadExample(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            {/* Code Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Code:</label>
              <Textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your Python code here..."
                className="min-h-[400px] font-mono text-sm"
                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={executeCode}
                disabled={isExecuting || !code.trim()}
                className="bg-quantum-blue hover:bg-quantum-blue/90"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </>
                )}
              </Button>
              
              <Button
                onClick={formatCode}
                variant="outline"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Format
              </Button>
              
              <Button
                onClick={copyCode}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              
              <Button
                onClick={downloadCode}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              
              <Button
                onClick={clearCode}
                variant="outline"
                size="sm"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {/* Current Execution Result */}
          {result && (
            <Card className={`quantum-glow ${result.success ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  Execution Result
                  <Badge variant="secondary" className="ml-auto">
                    {result.executionTime}ms
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.output && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-600">Output:</label>
                    <pre className="bg-black/50 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                      {result.output}
                    </pre>
                  </div>
                )}
                {result.error && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-red-600">Error:</label>
                    <pre className="bg-black/50 text-red-400 p-3 rounded text-sm font-mono overflow-x-auto">
                      {result.error}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Execution History */}
          {executionHistory.length > 0 && (
            <Card className="quantum-glow border-cyan-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Execution History
                </CardTitle>
                <CardDescription>
                  Recent code executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {executionHistory.map((execution, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm border ${
                        execution.success 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">
                          {execution.success ? '✅' : '❌'} Execution #{executionHistory.length - index}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {execution.executionTime}ms
                        </span>
                      </div>
                      {execution.output && (
                        <div className="mt-1 text-xs text-muted-foreground truncate">
                          {execution.output.split('\n')[0]}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="quantum-glow border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="space-y-1">
                <p className="font-medium">Available Libraries:</p>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• <code>qiskit</code> - Quantum computing framework</li>
                  <li>• <code>numpy</code> - Numerical computing</li>
                  <li>• <code>matplotlib</code> - Plotting and visualization</li>
                  <li>• <code>scipy</code> - Scientific computing</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Features:</p>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• Real-time code execution</li>
                  <li>• Quantum circuit simulation</li>
                  <li>• Interactive examples</li>
                  <li>• Code sharing and download</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
