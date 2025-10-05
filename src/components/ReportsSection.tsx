import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye, Trash2, Plus, BarChart3, File } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import html2canvas from "html2canvas";
import ChartJsImage from "chartjs-to-image";
import { 
  noiseAnalysisReportText, 
  eavesdroppingDetectionReportText, 
  qubitScalingReportText, 
  realWorldComparisonReportText 
} from "./experiments/reports/index";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel } from "docx";

interface ExperimentResult {
  id: string;
  name: string;
  parameters: any;
  data: any[];
  analysis: string;
  completed: boolean;
  timestamp: string;
}

interface Report {
  id: string;
  title: string;
  experimentId: string;
  experimentName: string;
  aim: string;
  procedure: string;
  theory: string;
  conclusion: string;
  timestamp: string;
  data: any[];
}

export const ReportsSection = ({ availableExperiments = [] }: { availableExperiments?: ExperimentResult[] }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string>("");
  const [currentReport, setCurrentReport] = useState<Partial<Report> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const startNewReport = () => {
    if (!selectedExperiment) {
      toast.error("Please select an experiment first");
      return;
    }

    const experiment = availableExperiments.find(e => e.id === selectedExperiment);
    if (!experiment) return;

    // Auto-fill aim, theory, and procedure based on experiment type
    const aim = getAimText(experiment.id);
    
    const theory = getDefaultTheory(experiment.id);
    
    const procedure = `This experiment was performed using the QKD_Xplore web-based quantum key distribution simulator. The experiment "${experiment.name}" was conducted with the following parameters:\n\n` +
      Object.entries(experiment.parameters || {}).map(([key, value]) => 
        `- ${key}: ${JSON.stringify(value)}`
      ).join('\n') + 
      `\n\nThe simulation was run multiple times with varying parameters to collect statistical data. The results were automatically recorded and analyzed by the system to generate the data visualization and statistical findings presented in this report.`;

    setCurrentReport({
      id: Date.now().toString(),
      title: `Report: ${experiment.name}`,
      experimentId: experiment.id,
      experimentName: experiment.name,
      aim: aim,
      procedure: procedure,
      theory: theory,
      conclusion: "",
      timestamp: new Date().toISOString(),
      data: experiment.data
    });
    setIsCreating(true);
  };

  const saveReport = () => {
    if (!currentReport || !currentReport.aim || !currentReport.conclusion) {
      toast.error("Please fill in at least the aim and conclusion");
      return;
    }

    const report: Report = {
      ...currentReport,
      id: currentReport.id || Date.now().toString(),
      title: currentReport.title || `Report: ${currentReport.experimentName}`,
      experimentId: currentReport.experimentId || "",
      experimentName: currentReport.experimentName || "",
      aim: currentReport.aim,
      procedure: currentReport.procedure || getDefaultProcedure(currentReport.experimentId || ""),
      theory: currentReport.theory || getDefaultTheory(currentReport.experimentId || ""),
      conclusion: currentReport.conclusion,
      timestamp: currentReport.timestamp || new Date().toISOString(),
      data: currentReport.data || []
    };

    setReports(prev => [...prev, report]);
    setCurrentReport(null);
    setIsCreating(false);
    toast.success("Report saved successfully!");
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    toast.success("Report deleted");
  };

  const generateReportHTML = (report: Report) => {
    // Generate chart data as base64 image
    const chartData = encodeURIComponent(`
      <div id="chart-container" style="width: 600px; height: 400px;">
        <canvas id="chart-canvas"></canvas>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const ctx = document.getElementById('chart-canvas').getContext('2d');
          const chartData = ${JSON.stringify(report.data)};
          
          // Determine chart type based on experiment
          let xAxisKey, series1, series2;
          if ('${report.experimentId}' === 'noise-analysis') {
            xAxisKey = 'noise';
            series1 = 'errorRate';
            series2 = 'keyRate';
          } else if ('${report.experimentId}' === 'eavesdropping-detection') {
            xAxisKey = 'eavesdropping';
            series1 = 'errorRate';
            series2 = 'keyRate';
          } else if ('${report.experimentId}' === 'qubit-scaling') {
            xAxisKey = 'qubits';
            series1 = 'errorRate';
            series2 = 'keyRate';
          } else {
            xAxisKey = Object.keys(chartData[0])[0];
            series1 = Object.keys(chartData[0])[1];
            series2 = Object.keys(chartData[0])[2];
          }
          
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: chartData.map(d => d[xAxisKey]),
              datasets: [{
                label: series1,
                data: chartData.map(d => d[series1]),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: false,
                tension: 0.1
              }, {
                label: series2,
                data: chartData.map(d => d[series2]),
                borderColor: '#fbbf24',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                fill: false,
                tension: 0.1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: xAxisKey
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Percentage'
                  }
                }
              }
            }
          });
        });
      </script>
    `);

    return `
<!DOCTYPE html>
<html>
<head>
    <title>${report.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; }
        h2 { color: #7c3aed; margin-top: 30px; }
        .section { margin: 20px 0; }
        .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .data-table th { background-color: #f2f2f2; }
        .conclusion { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #2563eb; }
        .chart-container { width: 100%; height: 400px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>${report.title}</h1>
    <p><strong>Date:</strong> ${new Date(report.timestamp).toLocaleDateString()}</p>
    <p><strong>Experiment:</strong> ${report.experimentName}</p>
    
    <div class="section">
        <h2>Aim</h2>
        <p>${report.aim}</p>
    </div>
    
    <div class="section">
        <h2>Theory</h2>
        <p>${report.theory}</p>
    </div>
    
    <div class="section">
        <h2>Procedure</h2>
        <p>${report.procedure}</p>
    </div>
    
    <div class="section">
        <h2>Results and Data Visualization</h2>
        <div class="chart-container">
          <iframe 
            src="data:text/html,${chartData}" 
            style="width: 100%; height: 100%; border: none;"
            title="Experiment Chart">
          </iframe>
        </div>
    </div>
    
    <div class="section">
        <h2>Numerical Results</h2>
        <table class="data-table">
            <thead>
                <tr>
                    ${Object.keys(report.data[0] || {}).map(key => `<th>${key}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${report.data.map(row => 
                    `<tr>${Object.values(row).map(value => `<td>${typeof value === 'number' ? value.toFixed(2) : value}</td>`).join('')}</tr>`
                ).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>Conclusion</h2>
        <div class="conclusion">
            <p>${report.conclusion}</p>
        </div>
    </div>
</body>
</html>`;
  };

  

  const downloadReport = async (report: Report, format: 'html' | 'pdf' | 'docx' = 'html') => {
    // NOTE: 'pdf' format now downloads an image file (png) instead of a PDF due to jsPDF removal
    if (format === 'pdf') {
      try {
        // Create a temporary container for the report content
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = generateReportHTML(report);
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '210mm'; // A4 width
        tempContainer.style.height = '297mm'; // A4 height
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.padding = '20px';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.zIndex = '-1';
        
        document.body.appendChild(tempContainer);
        
        // Wait for any potential content to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use html2canvas to capture the HTML content as an image
        const canvas = await html2canvas(tempContainer, {
          scale: 2, // Higher resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        
        // Remove the temporary container
        document.body.removeChild(tempContainer);
        
        // Convert canvas to image data
        const imgData = canvas.toDataURL('image/png');
        
        // Create a link to download the image as PNG
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Report image downloaded!");
      } catch (error) {
        console.error("Error generating report image:", error);
        toast.error("Error generating report image. Please try again or use HTML format.");
      }
    } else if (format === 'docx') {
      try {
        // Create a DOCX document
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: report.title,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: `Date: ${new Date(report.timestamp).toLocaleDateString()}`,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: `Experiment: ${report.experimentName}`,
                spacing: { after: 200 },
              }),
              
              // Aim section
              new Paragraph({
                text: "Aim",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: report.aim,
                spacing: { after: 200 },
              }),
              
              // Theory section
              new Paragraph({
                text: "Theory",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: report.experimentId === 'with-eavesdropper' || report.experimentId === 'eavesdropping-detection' 
                  ? report.theory.replace(/percentage of evesdropper/gi, "number of eavesdropper").replace(/eavesdropping percentage/gi, "number of eavesdropper").replace(/% eavesdropper/gi, "number of eavesdropper")
                  : report.theory,
                spacing: { after: 200 },
              }),
              
              // Procedure section
              new Paragraph({
                text: "Procedure",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: report.experimentId === 'with-eavesdropper' || report.experimentId === 'eavesdropping-detection' 
                  ? report.procedure.replace(/percentage of evesdropper/gi, "number of eavesdropper").replace(/eavesdropping percentage/gi, "number of eavesdropper").replace(/% eavesdropper/gi, "number of eavesdropper")
                  : report.procedure,
                spacing: { after: 200 },
              }),
        
              // Results section
              new Paragraph({
                text: "Results and Data Visualization",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: "Charts and visualizations are not automatically included in the DOCX format. To include plots in your report:",
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ bold: true, text: "• " }),
                  new TextRun("Run the experiment in the web application"),
                  new TextRun({ break: 1 }),
                  new TextRun({ bold: true, text: "• " }),
                  new TextRun("Take screenshots of the generated plots"),
                  new TextRun({ break: 1 }),
                  new TextRun({ bold: true, text: "• " }),
                  new TextRun("Manually insert the screenshots into this DOCX file after download"),
                ],
                spacing: { after: 200 },
              }),
              
              // Numerical Results section with data
              new Paragraph({
                text: "Numerical Results",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 100 },
              }),
              // Create a table for the data if it exists
              ...(report.data && report.data.length > 0 ? [
                new Table({
                  rows: [
                    // Header row - only if there are keys
                    ...(report.data[0] && Object.keys(report.data[0]).length > 0 ? [
                      new TableRow({
                        children: Object.keys(report.data[0]).map(key => 
                          new TableCell({
                            children: [new Paragraph(key)],
                            width: { size: 2000, type: WidthType.DXA },
                          })
                        ),
                      })
                    ] : []),
                    // Data rows
                    ...report.data.map(row => 
                      new TableRow({
                        children: Object.keys(row).map(key => 
                          new TableCell({
                            children: [new Paragraph(typeof row[key] === 'number' ? row[key].toFixed(2) : String(row[key]))],
                            width: { size: 2000, type: WidthType.DXA },
                          })
                        ),
                      })
                    ),
                  ],
                }),
                new Paragraph({ spacing: { after: 200 } }),
              ] : [new Paragraph("No numerical results available.")]),
        
              // Conclusion section
              new Paragraph({
                text: "Conclusion",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: report.conclusion,
                spacing: { after: 200 },
              }),
            ],
          }],
        });

        // Generate DOCX file and trigger download
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("DOCX Report downloaded!");
      } catch (error) {
        console.error("Error generating DOCX report:", error);
        toast.error("Error generating DOCX report. Please try again.");
      }
    } else {
      const htmlContent = generateReportHTML(report);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("HTML Report downloaded!");
    }
  };

  const getAimText = (experimentId: string) => {
    switch (experimentId) {
      case "noise-analysis":
        return "To analyze and document the results of the \"Effect of Channel Noise on QKD Performance\" experiment conducted using the QKD_Xplore quantum key distribution simulator.";
      case "eavesdropping-detection":
        return "To analyze and document the results of the \"Eavesdropping Detection in QKD Systems\" experiment conducted using the QKD_Xplore quantum key distribution simulator.";
      case "qubit-scaling":
        return "To analyze and document the results of the \"Effect of Qubit Scaling on QKD Performance\" experiment conducted using the QKD_Xplore quantum key distribution simulator.";
      case "real-world-comparison":
        return "To analyze and document the results of the \"Real-World Conditions Comparison in QKD Systems\" experiment conducted using the QKD_Xplore quantum key distribution simulator.";

        default:
        return "To analyze and document the results of the experiment conducted using the QKD_Xplore quantum key distribution simulator.";
    }
  };

  const getDefaultProcedure = (experimentId: string) => {
    switch (experimentId) {
      case "noise-analysis":
        return noiseAnalysisReportText.procedure;
      case "eavesdropping-detection":
        // Replace percentage references with number of eavesdropper where appropriate
        return eavesdroppingDetectionReportText.procedure.replace(/percentage of evesdropper/gi, "number of eavesdropper").replace(/eavesdropping percentage/gi, "number of eavesdropper").replace(/% eavesdropper/gi, "number of eavesdropper");
      case "qubit-scaling":
        return qubitScalingReportText.procedure;
      case "real-world-comparison":
        return realWorldComparisonReportText.procedure;
      default:
        return "Detailed experimental procedure to be documented.";
    }
  };

  const getDefaultTheory = (experimentId: string) => {
    switch (experimentId) {
      case "noise-analysis":
        return noiseAnalysisReportText.theory;
      case "eavesdropping-detection":
        // Replace percentage references with number of eavesdropper where appropriate
        return eavesdroppingDetectionReportText.theory.replace(/percentage of evesdropper/gi, "number of eavesdropper").replace(/eavesdropping percentage/gi, "number of eavesdropper").replace(/% eavesdropper/gi, "number of eavesdropper");
      case "qubit-scaling":
        return qubitScalingReportText.theory;
      case "real-world-comparison":
        return realWorldComparisonReportText.theory;
      default:
        return "Theoretical background explaining the quantum mechanical principles underlying this experiment.";
    }
  };

  const getXAxisLabel = (experimentId: string) => {
    switch (experimentId) {
      case "noise-analysis":
        return "Noise Level (%)";
      case "eavesdropping-detection":
        return "Eavesdropping Rate (%)";
      case "qubit-scaling":
        return "Number of Qubits";
      default:
        return "X-Axis";
    }
  };

  const getYAxisLabel = (experimentId: string, series: string) => {
    if (series === "keyRate") {
      return "Key Rate (%)";
    } else if (series === "keyLength") {
      return "Key Length";
    } else {
      return "Y-Axis";
    }
  };

  const renderExperimentChart = (data: any[], experimentId: string) => {
    // Determine chart configuration based on experiment type
    let xAxisKey, series1, series2;
    if (experimentId === "noise-analysis") {
      xAxisKey = "noise";
      series1 = "errorRate";
      series2 = "keyRate";
    } else if (experimentId === "eavesdropping-detection") {
      xAxisKey = "eavesdropping";
      series1 = "errorRate";
      series2 = "keyRate";
    } else if (experimentId === "qubit-scaling") {
      xAxisKey = "qubits";
      series1 = "errorRate";
      series2 = "keyRate";
    } else {
      // Default case
      xAxisKey = Object.keys(data[0] || {})[0];
      series1 = Object.keys(data[0] || {})[1];
      series2 = Object.keys(data[0] || {})[2];
    }

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis 
              dataKey={xAxisKey}
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              label={{ 
                value: getXAxisLabel(experimentId), 
                position: "insideBottom", 
                offset: -5 
              }}
            />
            <YAxis 
              yAxisId="left" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              label={{ 
                value: "Error Rate (%)", 
                angle: -90, 
                position: "insideLeft" 
              }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="hsl(var(--quantum-glow))" 
              fontSize={12}
              label={{ 
                value: getYAxisLabel(experimentId, series2), 
                angle: 90, 
                position: "insideRight" 
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }} 
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey={series1} 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name={series1 === "errorRate" ? "Error Rate (%)" : series1 === "keyRate" ? "Key Rate (%)" : series1}
              activeDot={{ r: 8 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey={series2} 
              stroke="hsl(var(--quantum-glow))" 
              strokeWidth={2}
              name={series2 === "keyRate" ? "Key Rate (%)" : series2 === "keyLength" ? "Key Length" : series2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (viewingReport) {
    return (
      <div className="space-y-6">
        <Card className="border-quantum-blue/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-quantum-blue flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Report Viewer
              </CardTitle>
              <Button
                onClick={() => setViewingReport(null)}
                variant="outline"
                className="border-quantum-purple/50 hover:bg-quantum-purple/10"
              >
                Back to Reports
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={reportRef} className="space-y-6 p-6 bg-background border rounded-lg">
              <div className="text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-quantum-blue">{viewingReport.title}</h1>
                <p className="text-muted-foreground">Date: {new Date(viewingReport.timestamp).toLocaleDateString()}</p>
                <p className="text-muted-foreground">Experiment: {viewingReport.experimentName}</p>
              </div>

              <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-quantum-purple mb-2">Aim</h2>
                    <p className="text-foreground/90">{viewingReport.aim}</p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-quantum-purple mb-2">Theory</h2>
                    <p className="text-foreground/90 whitespace-pre-line">{viewingReport.theory}</p>
                  </div>

                <div>
                  <h2 className="text-xl font-semibold text-quantum-purple mb-2">Procedure</h2>
                  <p className="text-foreground/90 whitespace-pre-line">{viewingReport.procedure}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-quantum-purple mb-2 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Results and Data Visualization
                  </h2>
                  <Card className="bg-secondary/20">
                    <CardContent className="p-4">
                      {renderExperimentChart(viewingReport.data, viewingReport.experimentId)}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-quantum-purple mb-2">Numerical Results</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-quantum-blue/30">
                      <thead>
                        <tr className="bg-secondary/50">
                          {Object.keys(viewingReport.data[0] || {}).map(key => (
                            <th key={key} className="border border-quantum-blue/30 p-2 text-left">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {viewingReport.data.map((row, index) => (
                          <tr key={index} className="border-b border-quantum-blue/20">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="border border-quantum-blue/30 p-2">
                                {typeof value === 'number' ? (value as number).toFixed(2) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-quantum-purple mb-2">Conclusion</h2>
                  <div className="p-4 bg-quantum-glow/10 border border-quantum-glow/30 rounded">
                    <p className="text-foreground/90 whitespace-pre-line">{viewingReport.conclusion}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6 gap-2 flex-wrap">
              <Button
                onClick={() => downloadReport(viewingReport, 'html')}
                className="bg-quantum-blue hover:bg-quantum-blue/80"
              >
                <Download className="w-4 h-4 mr-2" />
                Download HTML Report
              </Button>
              <Button
                onClick={() => downloadReport(viewingReport, 'docx')}
                className="bg-quantum-purple hover:bg-quantum-purple/80"
              >
                <File className="w-4 h-4 mr-2" />
                Download DOCX Report
              </Button>
              {/*<Button
                onClick={() => downloadReport(viewingReport, 'pdf')}
                className="bg-quantum-purple hover:bg-quantum-purple/80"
              >
                <File className="w-4 h-4 mr-2" />
                Download Image Report
              </Button>*/}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCreating && currentReport) {
    return (
      <div className="space-y-6">
        <Card className="border-quantum-glow/30">
          <CardHeader>
            <CardTitle className="text-quantum-glow flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Create Experiment Report
            </CardTitle>
            <p className="text-muted-foreground">Document your experimental findings and analysis</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Title</label>
                  <input
                    type="text"
                    value={currentReport.title || ""}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 bg-background border border-quantum-blue/30 rounded focus:border-quantum-blue focus:outline-none"
                    placeholder="Enter report title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Aim *</label>
                  <Textarea
                    value={currentReport.aim || ""}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, aim: e.target.value }))}
                    placeholder="State the objective and purpose of this experiment..."
                    className="min-h-[100px] border-quantum-blue/30 focus:border-quantum-blue"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Theory</label>
                  <Textarea
                    value={currentReport.theory || ""}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, theory: e.target.value }))}
                    placeholder="Explain the theoretical background and principles..."
                    className="min-h-[120px] border-quantum-purple/30 focus:border-quantum-purple"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Procedure</label>
                  <Textarea
                    value={currentReport.procedure || ""}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, procedure: e.target.value }))}
                    placeholder="Describe the experimental methodology and steps..."
                    className="min-h-[120px] border-quantum-glow/30 focus:border-quantum-glow"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Conclusion *</label>
                  <Textarea
                    value={currentReport.conclusion || ""}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, conclusion: e.target.value }))}
                    placeholder="Summarize your findings, analysis, and conclusions..."
                    className="min-h-[120px] border-quantum-purple/30 focus:border-quantum-purple"
                  />
                </div>
              </div>
            </div>

            {currentReport.data && currentReport.data.length > 0 && (
              <Card className="bg-secondary/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Experimental Data Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderExperimentChart(currentReport.data, currentReport.experimentId || "")}
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    This chart will be included in your final report
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4 justify-center">
              <Button
                onClick={saveReport}
                className="bg-quantum-blue hover:bg-quantum-blue/80"
              >
                <FileText className="w-4 h-4 mr-2" />
                Save Report
              </Button>
              <Button
                onClick={() => {
                  setIsCreating(false);
                  setCurrentReport(null);
                }}
                variant="outline"
                className="border-quantum-purple/50 hover:bg-quantum-purple/10"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-quantum-purple/30">
        <CardHeader>
          <CardTitle className="text-quantum-purple flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Experiment Reports
          </CardTitle>
          <p className="text-muted-foreground">
            Generate comprehensive reports from your experimental data with analysis and conclusions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-secondary/30">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Select Experiment</label>
                  <Select value={selectedExperiment} onValueChange={setSelectedExperiment}>
                    <SelectTrigger className="border-quantum-blue/30">
                      <SelectValue placeholder="Choose an experiment to create a report" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExperiments.map(exp => (
                        <SelectItem key={exp.id} value={exp.id}>
                          {exp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-6"> {/* Add padding to align with the select box */}
                  <Button
                    onClick={startNewReport}
                    disabled={!selectedExperiment}
                    className="bg-quantum-blue hover:bg-quantum-blue/80 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {reports.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-quantum-glow">Saved Reports</h3>
              <div className="grid gap-4">
                {reports.map(report => (
                  <Card key={report.id} className="border-quantum-blue/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-quantum-blue">{report.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {report.experimentName} • Created: {new Date(report.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setViewingReport(report)}
                            variant="outline"
                            size="sm"
                            className="border-quantum-blue/50 hover:bg-quantum-blue/10"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={() => downloadReport(report, 'html')}
                            variant="outline"
                            size="sm"
                            className="border-quantum-glow/50 hover:bg-quantum-glow/10 mr-1"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            HTML
                          </Button>
                          <Button
                            onClick={() => downloadReport(report, 'docx')}
                            variant="outline"
                            size="sm"
                            className="border-quantum-purple/50 hover:bg-quantum-purple/10"
                          >
                            <File className="w-4 h-4 mr-1" />
                            DOCX
                          </Button>
                          {/*<Button
                            onClick={() => downloadReport(report, 'pdf')}
                            variant="outline"
                            size="sm"
                            className="border-quantum-purple/50 hover:bg-quantum-purple/10"
                          >
                            <File className="w-4 h-4 mr-1" />
                            Image
                          </Button>*/}
                          <Button
                            onClick={() => deleteReport(report.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 hover:bg-red-500/10 text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {reports.length === 0 && (
            <Card className="bg-muted/20 border-dashed border-2 border-muted-foreground/20">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Select an experiment above and create your first comprehensive report
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};