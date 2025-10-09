import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Award, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface PostQuizProps {
  onQuizComplete?: (score: number) => void;
}

const questions: Question[] = [
  {
    id: 1,
    question: "After running BB84 simulations, what is the main advantage of quantum key distribution over classical methods?",
    options: [
      "It's faster than classical methods",
      "It can detect eavesdropping due to quantum mechanics principles",
      "It requires less computational power",
      "It works over longer distances"
    ],
    correct: 1,
    explanation: "The fundamental advantage is that any eavesdropping attempt disturbs the quantum states, making detection possible through the no-cloning theorem and measurement collapse."
  },
  {
    id: 2,
    question: "In your simulation experiments, what happens to the error rate when Eve (eavesdropper) is present?",
    options: [
      "Error rate decreases",
      "Error rate remains the same",
      "Error rate increases significantly",
      "Error rate becomes zero"
    ],
    correct: 2,
    explanation: "Eve's measurements disturb the quantum states, introducing errors that Alice and Bob can detect during their basis comparison and error checking phases."
  },
  {
    id: 3,
    question: "Based on your experiments, what is the theoretical maximum key rate when all bases match perfectly?",
    options: [
      "25% of transmitted bits",
      "50% of transmitted bits", 
      "75% of transmitted bits",
      "100% of transmitted bits"
    ],
    correct: 1,
    explanation: "In ideal conditions, Alice and Bob randomly choose bases, so on average 50% of their bases will match, making those bits usable for the final key."
  },
  {
    id: 4,
    question: "From your noise analysis, how does channel noise affect the BB84 protocol?",
    options: [
      "Noise has no effect on quantum states",
      "Noise only affects classical communication",
      "Noise introduces errors similar to eavesdropping but can be distinguished",
      "Noise completely breaks the protocol"
    ],
    correct: 2,
    explanation: "Channel noise introduces random errors, but unlike eavesdropping, noise patterns can be characterized and its effects can be mitigated through error correction and privacy amplification."
  },
  {
    id: 5,
    question: "In practical implementations, what is a key limitation you observed in your experiments?",
    options: [
      "Quantum states can be perfectly cloned",
      "Photon loss and detector inefficiencies reduce key rates",
      "Classical computers can easily break quantum encryption",
      "Quantum channels can transmit infinite information"
    ],
    correct: 1,
    explanation: "Real-world implementations face challenges like photon loss in transmission, detector dark counts, and finite detector efficiency, all of which reduce the practical key generation rate."
  },
  {
    id: 6,
    question: "Based on your simulation data, what is the relationship between the number of qubits and key security?",
    options: [
      "More qubits always mean less security",
      "The number of qubits doesn't affect security",
      "More qubits provide better statistical analysis for detecting eavesdropping",
      "Security decreases exponentially with qubit number"
    ],
    correct: 2,
    explanation: "Larger numbers of qubits provide better statistical samples for detecting anomalies and eavesdropping attempts, improving the confidence in security analysis."
  }
];

export const PostQuiz = ({ onQuizComplete }: PostQuizProps) => {
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
      const score = calculateScore();
      const percentage = (score / questions.length) * 100;
      onQuizComplete?.(percentage);
      toast.success(`Post-quiz completed! Great job exploring quantum cryptography! Your score: ${score}/${questions.length}`);
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
    if (score >= 5) return "text-green-400";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 5) return "Excellent! You've mastered quantum cryptography concepts!";
    if (score >= 4) return "Great job! You have a solid understanding of QKD.";
    if (score >= 3) return "Good work! Review the concepts and try the experiments again.";
    return "Keep practicing! Quantum cryptography takes time to master.";
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;

    return (
      <div className="space-y-6">
        <Card className="border-quantum-purple/30">
          <CardHeader>
            <CardTitle className="text-quantum-purple flex items-center gap-2">
              <Award className="w-6 h-6" />
              Post-Quiz Results
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
              <p className="mt-4 text-quantum-glow font-medium">
                {getPerformanceMessage(score)}
              </p>
            </div>

            <Card className="bg-quantum-glow/10 border-quantum-glow/30">
              <CardContent className="p-4">
                <h3 className="font-bold text-quantum-glow mb-2">Congratulations!</h3>
                <p className="text-sm">
                  You've completed the QKD_Xplore journey! You've learned about quantum mechanics,
                  BB84 protocol, conducted experiments, and analyzed quantum cryptography security.
                  This knowledge forms the foundation of future quantum internet technologies.
                </p>
              </CardContent>
            </Card>

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
            <Award className="w-6 h-6" />
            Post-Quiz: Validate Your Learning
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
                          ? "border-primary-foreground bg-primary-foreground" 
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