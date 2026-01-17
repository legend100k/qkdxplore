import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Shield, AlertTriangle, TrendingUp, Calculator } from "lucide-react";

export const AnalysisSection = () => {
  const [keyLength, setKeyLength] = useState(100);
  const [errorRate, setErrorRate] = useState(5);
  const [evePresence, setEvePresence] = useState(false);

  const calculateMetrics = () => {
    const rawKeyBits = Math.floor(keyLength * 0.5); // ~50% efficiency in basis matching
    const errorBits = Math.floor(rawKeyBits * (errorRate / 100));
    const finalKeyBits = Math.max(0, rawKeyBits - errorBits - Math.floor(rawKeyBits * 0.1)); // Privacy amplification
    const efficiency = (finalKeyBits / keyLength) * 100;
    const securityLevel = errorRate < 11 ? "High" : errorRate < 15 ? "Medium" : "Low";
    
    return {
      rawKeyBits,
      errorBits,
      finalKeyBits,
      efficiency,
      securityLevel
    };
  };

  const metrics = calculateMetrics();

  const securityData = [
    { name: "Transmitted Bits", value: keyLength, color: "#8B5CF6" },
    { name: "Basis Matched", value: metrics.rawKeyBits, color: "#06B6D4" },
    { name: "Error Bits", value: metrics.errorBits, color: "#EF4444" },
    { name: "Final Key", value: metrics.finalKeyBits, color: "#10B981" }
  ];

  const efficiencyData = [
    { basis: "Rectilinear", alice: 50, bob: 48, efficiency: 96 },
    { basis: "Diagonal", alice: 50, bob: 52, efficiency: 94 },
    { basis: "Overall", alice: 100, bob: metrics.rawKeyBits, efficiency: metrics.efficiency }
  ];

  const COLORS = ["#8B5CF6", "#06B6D4", "#EF4444", "#10B981"];

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            BB84 Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="keyLength">Initial Bit Sequence Length</Label>
              <Input
                id="keyLength"
                type="number"
                value={keyLength}
                onChange={(e) => setKeyLength(parseInt(e.target.value) || 100)}
                className="border-quantum-blue/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="errorRate">Quantum Bit Error Rate (%)</Label>
              <Input
                id="errorRate"
                type="number"
                step="0.1"
                value={errorRate}
                onChange={(e) => setErrorRate(parseFloat(e.target.value) || 5)}
                className="border-quantum-purple/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Security Assessment</Label>
              <div className={`p-3 rounded-lg border text-center font-semibold ${
                metrics.securityLevel === 'High' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : metrics.securityLevel === 'Medium'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {metrics.securityLevel} Security
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-quantum-purple/30">
          <CardHeader>
            <CardTitle className="text-quantum-purple flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Key Generation Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-quantum-blue">{keyLength}</div>
                  <div className="text-sm text-muted-foreground">Transmitted Bits</div>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.finalKeyBits}</div>
                  <div className="text-sm text-muted-foreground">Final Key Bits</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Efficiency</span>
                  <span>{metrics.efficiency.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.efficiency} className="h-3" />
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="basis" 
                    stroke="hsl(var(--foreground))" 
                    label={{ 
                      value: "Basis Type", 
                      position: "insideBottom", 
                      offset: -5 
                    }}
                  />
                  <YAxis 
                    stroke="hsl(var(--foreground))" 
                    label={{ 
                      value: "Efficiency (%)", 
                      angle: -90, 
                      position: "insideLeft" 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }} 
                  />
                  <Bar dataKey="efficiency" fill="hsl(var(--quantum-blue))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      <Card className="border-none shadow-soft">
        <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Bit Distribution Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={securityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {securityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {securityData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-mono">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Security Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-quantum-blue">Error Rate Thresholds</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>QBER &lt; 11%:</span>
                  <span className="text-green-400">Secure</span>
                </div>
                <div className="flex justify-between">
                  <span>11% ≤ QBER &lt; 15%:</span>
                  <span className="text-yellow-400">Caution</span>
                </div>
                <div className="flex justify-between">
                  <span>QBER ≥ 15%:</span>
                  <span className="text-red-400">Abort Protocol</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-quantum-purple">Current Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Your QBER:</span>
                  <span className={`font-bold ${
                    errorRate < 11 ? 'text-green-400' : 
                    errorRate < 15 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {errorRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Security Level:</span>
                  <span className={`font-bold ${
                    metrics.securityLevel === 'High' ? 'text-green-400' :
                    metrics.securityLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {metrics.securityLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {errorRate >= 15 && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-destructive font-semibold">⚠️ High Error Rate Detected</p>
              <p className="text-sm text-destructive/80 mt-1">
                The quantum bit error rate is above the security threshold. 
                This may indicate eavesdropping or channel noise. Consider aborting the protocol.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};