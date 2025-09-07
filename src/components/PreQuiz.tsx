import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Brain, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "What does BB84 stand for?",
    options: [
      "Bennett-Brassard 1984 protocol",
      "Binary Bit 84-channel protocol", 
      "Quantum Bit 84-state protocol",
      "Bell-Bennett 1984 protocol"
    ],
    correct: 0,
    explanation: "BB84 is named after Charles Bennett and Gilles Brassard who proposed it in 1984."
  },
  {
    id: 2,
    question: "In quantum cryptography, what is Alice's role?",
    options: [
      "The receiver who measures photons",
      "The sender who prepares and transmits photons",
      "The eavesdropper trying to intercept messages",
      "The quantum channel medium"
    ],
    correct: 1,
    explanation: "Alice is conventionally the sender who prepares quantum states (photons) and transmits them to Bob."
  },
  {
    id: 3,
    question: "What is Bob's primary function in the BB84 protocol?",
    options: [
      "To generate random quantum states",
      "To encrypt the final messages",
      "To receive and measure photons using random bases",
      "To detect eavesdropping attempts"
    ],
    correct: 2,
    explanation: "Bob receives the photons from Alice and measures them using randomly chosen measurement bases."
  },
  {
    id: 4,
    question: "How many polarization bases are used in the standard BB84 protocol?",
    options: ["1", "2", "3", "4"],
    correct: 1,
    explanation: "BB84 uses 2 bases: rectilinear (+ basis) and diagonal (× basis), each containing 2 polarization states."
  },
  {
    id: 5,
    question: "What happens when Alice and Bob use different bases for the same photon?",
    options: [
      "The measurement is always correct",
      "The measurement result is random (50% probability of each outcome)",
      "The photon is destroyed",
      "An error is immediately detected"
    ],
    correct: 1,
    explanation: "When different bases are used, Bob's measurement becomes random with 50% probability for each outcome, making the bit unusable for the final key."
  }
];

export const PreQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      setQuizCompleted(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizCompleted(false);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return answer === questions[index].correct ? score + 1 : score;
    }, 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-400";
    if (score >= 3) return "text-yellow-400";
    return "text-red-400";
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;

    return (
      <div className="space-y-6">
        <Card className="border-quantum-purple/30">
          <CardHeader>
            <CardTitle className="text-quantum-purple flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Pre-Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}/{questions.length}
              </div>
              <div className="text-xl text-muted-foreground">
                {percentage.toFixed(0)}% Score
              </div>
              <Progress value={percentage} className="mt-4" />
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correct;

                return (
                  <Card key={question.id} className={`border ${isCorrect ? 'border-green-400/30 bg-green-400/5' : 'border-red-400/30 bg-red-400/5'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold mb-2">{question.question}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Your answer: {question.options[userAnswer]}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-400 mb-2">
                              Correct answer: {question.options[question.correct]}
                            </p>
                          )}
                          <p className="text-sm text-quantum-glow">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={resetQuiz}
                variant="outline"
                className="border-quantum-blue/50 hover:bg-quantum-blue/10"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <Card className="border-quantum-blue/30">
        <CardHeader>
          <CardTitle className="text-quantum-blue flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Pre-Quiz: Test Your Knowledge
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-secondary/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-quantum-glow">
                {currentQ.question}
              </h3>
              
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                    className={`w-full text-left justify-start p-4 h-auto ${
                      selectedAnswers[currentQuestion] === index
                        ? "bg-quantum-blue hover:bg-quantum-blue/80"
                        : "border-quantum-purple/30 hover:bg-quantum-purple/10"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestion] === index 
                          ? "border-white bg-white" 
                          : "border-current"
                      }`}>
                        {selectedAnswers[currentQuestion] === index && (
                          <div className="w-3 h-3 bg-quantum-blue rounded-full"></div>
                        )}
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-quantum-purple/50 hover:bg-quantum-purple/10"
            >
              Previous
            </Button>
            
            <Button
              onClick={nextQuestion}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="bg-quantum-blue hover:bg-quantum-blue/80"
            >
              {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};