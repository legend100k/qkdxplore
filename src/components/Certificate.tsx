import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Award } from "lucide-react";
import { toast } from "sonner";

interface CertificateProps {
  postQuizScore?: number;
}

export const Certificate = ({ postQuizScore = 0 }: CertificateProps) => {
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("Quantum Key Distribution - BB84 Protocol");
  const [instructorName, setInstructorName] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleGenerateCertificate = () => {
    if (!studentName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!instructorName.trim()) {
      toast.error("Please enter instructor name");
      return;
    }
    if (postQuizScore < 40) {
      toast.error("Certificate is only available for post-quiz scores above 40%");
      return;
    }
    setShowCertificate(true);
  };

  const handleDownloadCertificate = () => {
    toast.success("Certificate downloaded successfully!");
    // In a real implementation, this would trigger a PDF download
  };

  // If post-quiz score is less than 40%, show a message instead of the certificate
  if (postQuizScore < 40 && postQuizScore > 0) {
    return (
      <div className="space-y-6">
        <Card className="border-quantum-purple/30 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-quantum-purple flex items-center gap-2">
              <Award className="w-6 h-6" />
              Certificate Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Certificates are only available for post-quiz scores above 40%. Your current score is {postQuizScore}%.
            </p>
            <p className="text-muted-foreground">
              Please review the material and retake the post-quiz to qualify for a certificate.
            </p>
            <Button 
              className="bg-quantum-blue hover:bg-quantum-blue/90"
              onClick={() => window.location.hash = "#post-quiz"}
            >
              Retake Post-Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If post-quiz score is 0 or not set, show the input form
  if (!showCertificate) {
    return (
      <div className="space-y-6">
        <Card className="border-quantum-glow/30 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-quantum-glow flex items-center gap-2">
              <Award className="w-6 h-6" />
              Certificate Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              {postQuizScore > 0 
                ? "Congratulations on completing the course! Please fill in the details below to generate your certificate." 
                : "Please complete the post-quiz with a score above 40% to generate a certificate."}
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Full Name</Label>
                <Input 
                  id="studentName" 
                  value={studentName} 
                  onChange={(e) => setStudentName(e.target.value)} 
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input 
                  id="courseName" 
                  value={courseName} 
                  onChange={(e) => setCourseName(e.target.value)} 
                  placeholder="Course name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructorName">Instructor Name</Label>
                <Input 
                  id="instructorName" 
                  value={instructorName} 
                  onChange={(e) => setInstructorName(e.target.value)} 
                  placeholder="Enter instructor name"
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                className="bg-quantum-blue hover:bg-quantum-blue/90"
                onClick={handleGenerateCertificate}
                disabled={postQuizScore < 40}
              >
                Generate Certificate
              </Button>
            </div>
            
            {postQuizScore < 40 && postQuizScore > 0 && (
              <p className="text-sm text-destructive text-center">
                Certificate is only available for post-quiz scores above 40%. Your current score is {postQuizScore}%.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the certificate
  return (
    <div className="space-y-6">
      <Card className="border-quantum-glow/30 max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="border-b border-quantum-glow/30 pb-6">
              <div className="flex justify-center mb-4">
                <Award className="w-16 h-16 text-quantum-glow" />
              </div>
              <h1 className="text-4xl font-bold text-quantum-glow mb-2">Certificate of Completion</h1>
              <p className="text-muted-foreground">This certificate is proudly presented to</p>
            </div>
            
            <div className="py-8">
              <h2 className="text-3xl font-bold mb-4">{studentName}</h2>
              <p className="text-lg text-muted-foreground mb-2">
                For successfully completing the
              </p>
              <p className="text-xl font-semibold text-quantum-blue mb-4">
                {courseName}
              </p>
              <p className="text-lg text-muted-foreground">
                with a post-quiz score of {postQuizScore}%
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
              <div>
                <p className="font-semibold">Instructor</p>
                <p className="text-muted-foreground">{instructorName}</p>
              </div>
              <div>
                <p className="font-semibold">Date</p>
                <p className="text-muted-foreground">{currentDate}</p>
              </div>
              <div>
                <p className="font-semibold">Institution</p>
                <p className="text-muted-foreground">Vivekanand Education Society's Institute of Technology</p>
              </div>
            </div>
            
            <div className="pt-6">
              <Button className="bg-quantum-blue hover:bg-quantum-blue/90" onClick={handleDownloadCertificate}>
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};