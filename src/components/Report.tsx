import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, Table } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const Report = () => {
  // Sample experiment data - in a real implementation, this would come from the experiment results
  const noiseAnalysisData = [
    { noise: 0, errorRate: 0.5, keyRate: 48.2, keyLength: 145 },
    { noise: 2, errorRate: 2.1, keyRate: 46.8, keyLength: 141 },
    { noise: 4, errorRate: 4.3, keyRate: 44.1, keyLength: 132 },
    { noise: 6, errorRate: 6.2, keyRate: 41.8, keyLength: 125 },
    { noise: 8, errorRate: 8.4, keyRate: 39.2, keyLength: 118 },
    { noise: 10, errorRate: 10.6, keyRate: 36.5, keyLength: 110 },
    { noise: 12, errorRate: 12.8, keyRate: 33.7, keyLength: 101 },
    { noise: 14, errorRate: 15.1, keyRate: 30.4, keyLength: 91 },
    { noise: 16, errorRate: 17.3, keyRate: 27.6, keyLength: 83 },
    { noise: 18, errorRate: 19.7, keyRate: 24.3, keyLength: 73 },
    { noise: 20, errorRate: 22.1, keyRate: 21.5, keyLength: 65 }
  ];

  const eavesdroppingData = [
    { eavesdropping: 0, errorRate: 0.5, detectionProbability: 2.1, keyRate: 48.2 },
    { eavesdropping: 5, errorRate: 1.8, detectionProbability: 7.2, keyRate: 46.5 },
    { eavesdropping: 10, errorRate: 3.6, detectionProbability: 14.5, keyRate: 44.1 },
    { eavesdropping: 15, errorRate: 5.4, detectionProbability: 21.7, keyRate: 41.8 },
    { eavesdropping: 20, errorRate: 7.3, detectionProbability: 29.2, keyRate: 39.2 },
    { eavesdropping: 25, errorRate: 9.1, detectionProbability: 36.4, keyRate: 36.5 },
    { eavesdropping: 30, errorRate: 11.0, detectionProbability: 44.0, keyRate: 33.7 }
  ];

  const qubitScalingData = [
    { qubits: 10, keyLength: 5, errorRate: 2.1, statisticalSecurity: 20 },
    { qubits: 15, keyLength: 7, errorRate: 1.8, statisticalSecurity: 30 },
    { qubits: 20, keyLength: 10, errorRate: 1.5, statisticalSecurity: 40 },
    { qubits: 25, keyLength: 12, errorRate: 1.2, statisticalSecurity: 50 },
    { qubits: 30, keyLength: 15, errorRate: 1.0, statisticalSecurity: 60 },
    { qubits: 35, keyLength: 17, errorRate: 0.8, statisticalSecurity: 70 },
    { qubits: 40, keyLength: 20, errorRate: 0.6, statisticalSecurity: 80 },
    { qubits: 45, keyLength: 22, errorRate: 0.5, statisticalSecurity: 90 },
    { qubits: 50, keyLength: 25, errorRate: 0.4, statisticalSecurity: 100 }
  ];

  const basisMismatchData = [
    { iteration: 1, basisMatchRate: 48.2, theoreticalMatch: 50, deviation: 1.8 },
    { iteration: 2, basisMatchRate: 51.6, theoreticalMatch: 50, deviation: 1.6 },
    { iteration: 3, basisMatchRate: 49.8, theoreticalMatch: 50, deviation: 0.2 },
    { iteration: 4, basisMatchRate: 50.4, theoreticalMatch: 50, deviation: 0.4 },
    { iteration: 5, basisMatchRate: 48.7, theoreticalMatch: 50, deviation: 1.3 },
    { iteration: 6, basisMatchRate: 52.1, theoreticalMatch: 50, deviation: 2.1 },
    { iteration: 7, basisMatchRate: 49.3, theoreticalMatch: 50, deviation: 0.7 },
    { iteration: 8, basisMatchRate: 50.8, theoreticalMatch: 50, deviation: 0.8 },
    { iteration: 9, basisMatchRate: 47.9, theoreticalMatch: 50, deviation: 2.1 },
    { iteration: 10, basisMatchRate: 51.2, theoreticalMatch: 50, deviation: 1.2 }
  ];

  // Sample output table data
  const sampleBitsData = [
    { bit: 1, aliceBit: 1, aliceBasis: "+", bobBasis: "×", bobMeasurement: 0, match: false, kept: false },
    { bit: 2, aliceBit: 0, aliceBasis: "×", bobBasis: "×", bobMeasurement: 0, match: true, kept: true },
    { bit: 3, aliceBit: 1, aliceBasis: "+", bobBasis: "+", bobMeasurement: 1, match: true, kept: true },
    { bit: 4, aliceBit: 0, aliceBasis: "×", bobBasis: "+", bobMeasurement: 1, match: false, kept: false },
    { bit: 5, aliceBit: 1, aliceBasis: "+", bobBasis: "+", bobMeasurement: 1, match: true, kept: true },
    { bit: 6, aliceBit: 0, aliceBasis: "×", bobBasis: "×", bobMeasurement: 0, match: true, kept: true },
    { bit: 7, aliceBit: 1, aliceBasis: "+", bobBasis: "×", bobMeasurement: 0, match: false, kept: false },
    { bit: 8, aliceBit: 0, aliceBasis: "×", bobBasis: "+", bobMeasurement: 1, match: false, kept: false },
    { bit: 9, aliceBit: 1, aliceBasis: "+", bobBasis: "+", bobMeasurement: 1, match: true, kept: true },
    { bit: 10, aliceBit: 0, aliceBasis: "×", bobBasis: "×", bobMeasurement: 0, match: true, kept: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-quantum-glow">Experiment Report</h1>
        <Button className="bg-quantum-blue hover:bg-quantum-blue/90">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
      
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Quantum Key Distribution - BB84 Protocol Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Experiment Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This report documents the analysis of the BB84 quantum key distribution protocol 
                  through various simulated experiments. The BB84 protocol, developed by Charles 
                  Bennett and Gilles Brassard in 1984, is a fundamental quantum cryptography protocol 
                  that enables secure communication by exploiting the principles of quantum mechanics.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Channel noise significantly affects key generation efficiency</li>
                  <li>Eavesdropping detection is possible through increased error rates</li>
                  <li>Qubit scaling improves statistical security of the protocol</li>
                  <li>Basis mismatch rate aligns with theoretical predictions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-secondary/20">
            <CardHeader>
              <CardTitle className="text-sm">Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-semibold text-quantum-purple">Noise Impact Analysis</h3>
                <p className="text-muted-foreground">
                  Our experiments demonstrate that channel noise has a direct linear relationship 
                  with error rates in the BB84 protocol. As noise levels increase from 0% to 20%, 
                  the error rate proportionally increases, reducing the efficiency of key generation.
                </p>
                
                <h3 className="font-semibold text-quantum-purple">Eavesdropping Detection</h3>
                <p className="text-muted-foreground">
                  The fundamental principle of quantum mechanics that measurement disturbs quantum 
                  states enables eavesdropping detection. Our results show that as eavesdropping 
                  probability increases, the error rate in the sifted key also increases, allowing 
                  legitimate parties to detect the presence of an eavesdropper.
                </p>
                
                <h3 className="font-semibold text-quantum-purple">Qubit Scaling Effects</h3>
                <p className="text-muted-foreground">
                  Larger numbers of qubits provide better statistical security. As the number of 
                  qubits increases, the confidence in the security of the generated key also increases, 
                  making it more difficult for an eavesdropper to remain undetected.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Experiment Graphs Section */}
          <Card className="bg-secondary/20">
            <CardHeader>
              <CardTitle className="text-quantum-glow flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Experiment Results and Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Noise Analysis Graph */}
              <div>
                <h3 className="font-semibold mb-4">Channel Noise Impact Analysis</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={noiseAnalysisData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                      <XAxis dataKey="noise" name="Noise Level" unit="%" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="errorRate" 
                        name="Error Rate (%)" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="keyRate" 
                        name="Key Rate (%)" 
                        stroke="hsl(var(--quantum-glow))" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Eavesdropping Detection Graph */}
              <div>
                <h3 className="font-semibold mb-4">Eavesdropping Detection Experiment</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={eavesdroppingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                      <XAxis dataKey="eavesdropping" name="Eavesdropping Probability" unit="%" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="errorRate" 
                        name="Error Rate (%)" 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="detectionProbability" 
                        name="Detection Probability (%)" 
                        stroke="hsl(var(--quantum-purple))" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Qubit Scaling Graph */}
              <div>
                <h3 className="font-semibold mb-4">Qubit Scaling Study</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={qubitScalingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                      <XAxis dataKey="qubits" name="Number of Qubits" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="keyLength" 
                        name="Key Length (bits)" 
                        stroke="hsl(var(--quantum-blue))" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="statisticalSecurity" 
                        name="Statistical Security (%)" 
                        stroke="hsl(var(--quantum-glow))" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Basis Mismatch Graph */}
              <div>
                <h3 className="font-semibold mb-4">Basis Mismatch Rate Analysis</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={basisMismatchData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                      <XAxis dataKey="iteration" name="Iteration" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="basisMatchRate" 
                        name="Actual Match Rate (%)" 
                        stroke="hsl(var(--quantum-blue))" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="theoreticalMatch" 
                        name="Theoretical Match Rate (%)" 
                        stroke="hsl(var(--quantum-purple))" 
                        strokeWidth={2} 
                        strokeDasharray="3 3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Output Tables Section */}
          <Card className="bg-secondary/20">
            <CardHeader>
              <CardTitle className="text-quantum-glow flex items-center gap-2">
                <Table className="w-5 h-5" />
                Sample Simulation Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-quantum-blue/30">
                      <th className="text-left p-2">Bit #</th>
                      <th className="text-left p-2 bg-quantum-blue/10 border-l border-r border-quantum-blue/30">
                        <div className="text-center">
                          <div className="font-bold text-quantum-blue">Alice (Transmitter)</div>
                          <div className="text-xs text-muted-foreground">Sending</div>
                        </div>
                      </th>
                      <th className="text-left p-2 bg-quantum-blue/10 border-r border-quantum-blue/30">Basis</th>
                      <th className="text-left p-2 bg-quantum-purple/10 border-l border-r border-quantum-purple/30">
                        <div className="text-center">
                          <div className="font-bold text-quantum-purple">Bob (Receiver)</div>
                          <div className="text-xs text-muted-foreground">Receiving</div>
                        </div>
                      </th>
                      <th className="text-left p-2 bg-quantum-purple/10 border-r border-quantum-purple/30">Basis</th>
                      <th className="text-left p-2 bg-quantum-purple/10 border-r border-quantum-purple/30">Result</th>
                      <th className="text-left p-2">Match</th>
                      <th className="text-left p-2">In Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleBitsData.map((bit, index) => (
                      <tr 
                        key={index} 
                        className={`border-b ${bit.kept ? 'bg-quantum-glow/10' : ''}`}
                      >
                        <td className="p-2">{bit.bit}</td>
                        <td className="p-2 font-mono text-center bg-quantum-blue/5 border-l border-r border-quantum-blue/20">
                          <span className="inline-block w-6 h-6 bg-quantum-blue/20 rounded-full text-center leading-6 text-quantum-blue font-bold">
                            {bit.aliceBit}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-quantum-blue bg-quantum-blue/5 border-r border-quantum-blue/20 text-center">
                          <span className="text-lg font-bold">{bit.aliceBasis}</span>
                        </td>
                        <td className="p-2 font-mono text-center bg-quantum-purple/5 border-l border-r border-quantum-purple/20">
                          <span className="inline-block w-6 h-6 bg-quantum-purple/20 rounded-full text-center leading-6 text-quantum-purple font-bold">
                            {bit.bobMeasurement}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-quantum-purple bg-quantum-purple/5 border-r border-quantum-purple/20 text-center">
                          <span className="text-lg font-bold">{bit.bobBasis}</span>
                        </td>
                        <td className="p-2 bg-quantum-purple/5 border-r border-quantum-purple/20 text-center">
                          <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-bold ${
                            bit.aliceBit === bit.bobMeasurement 
                              ? 'bg-green-400/20 text-green-400' 
                              : 'bg-red-400/20 text-red-400'
                          }`}>
                            {bit.bobMeasurement}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-bold ${
                            bit.match 
                              ? 'bg-green-400/20 text-green-400' 
                              : 'bg-red-400/20 text-red-400'
                          }`}>
                            {bit.match ? '✓' : '✗'}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          {bit.kept ? (
                            <span className="inline-block w-6 h-6 bg-quantum-glow/20 rounded-full text-center leading-6 text-quantum-glow font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Tejas Naringrekar</li>
                  <li>Shantaram Chari</li>
                  <li>Harsh Mhadgut</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Dr. [Instructor Name]</p>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle className="text-sm">Institution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Vivekanand Education Society's Institute of Technology<br />
                  Department of Electronics and Telecommunication
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};