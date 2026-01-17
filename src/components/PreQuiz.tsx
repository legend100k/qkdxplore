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
    question: "What is the smallest unit of digital information in a computer?",
    options: [
      "Byte",
      "Bit",
      "Qubit",
      "File"
    ],
    correct: 1,
    explanation: "A bit (binary digit) is the smallest unit of digital information, representing either 0 or 1."
  },
  {
    id: 2,
    question: "What is the main purpose of cryptography?",
    options: [
      "To make communication faster",
      "To keep information secure",
      "To store data in small space",
      "To improve computer speed"
    ],
    correct: 1,
    explanation: "Cryptography's primary purpose is to secure information by transforming it into a form that unauthorized parties cannot easily understand."
  },
  {
    id: 3,
    question: "Which of these is an example of classical encryption?",
    options: [
      
      "AES",
      "Quantum Key Distribution",
      "Blockchain"
    ],
    correct: 0,
    explanation: "AES (Advanced Encryption Standard) is a widely used classical encryption algorithm that uses mathematical operations to secure data."
  },
  {
    id: 4,
    question: "What is a 'key' in cryptography?",
    options: [
      "A password that locks and unlocks information",
      "A file used to increase speed",
      "A type of software",
      "A physical USB stick"
    ],
    correct: 0,
    explanation: "In cryptography, a key is like a password - it's the secret information used to encrypt and decrypt data."
  },
  {
    id: 5,
    question: "Why is randomness important in generating secure keys?",
    options: [
      "To avoid predictable patterns",
      "To make encryption faster",
      "To reduce memory usage",
      "To simplify algorithms"
    ],
    correct: 0,
    explanation: "Random keys are crucial because predictable patterns make it easier for attackers to guess or crack the encryption."
  },
  {
    id: 6,
    question: "What is one main challenge of classical cryptography today?",
    options: [
      "It is too slow on the internet",
      "It can be broken by powerful computers",
      "It cannot be used on mobile phones",
      "It needs photons to work"
    ],
    correct: 1,
    explanation: "As computers become more powerful, they can potentially break classical encryption methods by trying many possible keys quickly."
  },
  {
    id: 7,
    question: "What is a qubit?",
    options: [
      "A basic unit of classical information",
      "A binary digit that is only 0 or 1",
      "A quantum unit that can be in a mix of 0 and 1",
      "A type of encryption key"
    ],
    correct: 2,
    explanation: "A qubit (quantum bit) can exist in a superposition of both 0 and 1 states simultaneously, unlike classical bits that are definitively either 0 or 1."
  },
  {
    id: 8,
    question: "What does 'superposition' mean in quantum mechanics?",
    options: [
      "A particle is always fixed in one state",
      "A particle can be in multiple states at once",
      "A particle is destroyed when measured",
      "A particle cannot interact with others"
    ],
    correct: 1,
    explanation: "Superposition allows quantum particles to exist in multiple states simultaneously until they are measured or observed."
  },
  {
    id: 9,
    question: "What does 'entanglement' mean?",
    options: [
      "Two qubits instantly affect each other's states",
      "Two qubits exist independently",
      "Two particles collide and merge",
      "Two particles have the same speed"
    ],
    correct: 0,
    explanation: "Quantum entanglement creates a connection between particles where measuring one instantly affects the state of the other, regardless of distance."
  },
  {
    id: 10,
    question: "Why do we need secure communication methods today?",
    options: [
      "To reduce internet bills",
      "To watch movies faster",
      "To protect privacy and prevent hacking",
      "To improve Wi-Fi range"
    ],
    correct: 2,
    explanation: "Secure communication is essential to protect personal information, financial data, and sensitive communications from unauthorized access and cyberattacks."
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
        <Card className="border-none shadow-soft bg-white dark:bg-slate-950">
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <Brain className="w-6 h-6" />
              </div>
              Pre-Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            <div className={`text-center p-8 rounded-2xl ${percentage >= 70 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className={`text-5xl font-bold mb-2 ${percentage >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {score}/{questions.length}
              </div>
              <div className="text-xl font-medium text-gray-600 dark:text-gray-300">
                {percentage.toFixed(0)}% Score
              </div>
              <Progress value={percentage} className={`mt-6 h-3 ${percentage >= 70 ? 'bg-green-200 dark:bg-green-900' : 'bg-red-200 dark:bg-red-900'}`} indicatorClassName={percentage >= 70 ? 'bg-green-600' : 'bg-red-600'} />
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correct;

                return (
                  <Card key={question.id} className={`border shadow-none ${isCorrect ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10' : 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{question.question}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Your answer: <span className="font-medium">{question.options[userAnswer]}</span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-600 dark:text-green-400 mb-2 font-medium">
                              Correct answer: {question.options[question.correct]}
                            </p>
                          )}
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={resetQuiz}
                variant="outline"
                className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800 font-medium h-10 px-6"
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
      <Card className="border-none shadow-soft bg-white dark:bg-slate-950">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-6">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Brain className="w-5 h-5" />
            </span>
            Pre-Quiz: Test Your Knowledge
          </CardTitle>
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100 leading-snug">
              {currentQ.question}
            </h3>
            
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                  className={`w-full text-left justify-start p-4 h-auto transition-all ${
                    selectedAnswers[currentQuestion] === index
                      ? "bg-blue-600 hover:bg-blue-700 border-transparent shadow-md shadow-blue-600/10"
                      : "bg-white dark:bg-slate-950 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedAnswers[currentQuestion] === index 
                        ? "border-white bg-white/20" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {selectedAnswers[currentQuestion] === index && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="flex-1 whitespace-normal text-sm leading-relaxed">{option}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400"
            >
              Previous
            </Button>
            
            <Button
              onClick={nextQuestion}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};