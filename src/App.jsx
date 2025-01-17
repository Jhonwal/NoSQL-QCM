import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Clock, Check, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Shuffle function
  const shuffleQuestions = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  };

  useEffect(() => {
    fetch("/filtered_questions2.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des questions");
        }
        return response.json();
      })
      .then((data) => {
        // Shuffle the questions array before setting state
        const shuffledQuestions = shuffleQuestions(data);
        setQuestions(shuffledQuestions);
        setUserAnswers(new Array(shuffledQuestions.length).fill(''));
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            return 30;
          } else {
            setShowResults(true);
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, loading, showResults, questions.length]);

  useEffect(() => {
    setTimeLeft(30);
  }, [currentQuestion]);

  const handleAnswer = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index].charAt(0) === question.reponse) {
        score++;
      }
    });
    return score;
  };

  const getProgress = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const formatTime = (seconds) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const getFullAnswer = (question, letter) => {
    return question.choix.find(choice => choice.startsWith(letter)) || letter;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Chargement du quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Card className="w-full max-w-2xl mx-auto bg-red-50">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erreur</h2>
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;
    const allAnswers = questions.map((question, index) => ({
      question: question.question,
      userAnswer: userAnswers[index],
      correctAnswerLetter: question.reponse,
      correctAnswer: getFullAnswer(question, question.reponse),
      isCorrect: userAnswers[index].charAt(0) === question.reponse
    }));

    return (
      <div className="flex items-center justify-center w-[98vw] min-h-screen overflow-y-hidden bg-gray-50">
        <Card className="w-full max-w-3xl shadow-xl transform hover:scale-102 transition-transform my-8">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg p-6">
            <h2 className="text-3xl font-bold">Résultats du Quiz</h2>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-center bg-white rounded-lg p-6 shadow-md">
                <p className="text-xl mb-3 text-gray-600">Score Final:</p>
                <p className="text-6xl font-bold text-blue-600 mb-2">{score} / {questions.length}</p>
                <p className="text-2xl text-gray-500">({percentage.toFixed(1)}%)</p>
              </div>
              
              <Progress 
                value={percentage} 
                className="w-full h-6 rounded-full bg-gray-200"
              />
    
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-700 px-2">Révision des réponses:</h3>
                <Accordion collapsible className="w-full space-y-2">
                  {allAnswers.map((item, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className={`border rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden
                        ${item.isCorrect ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white' : 'bg-gradient-to-r from-red-400 to-yellow-500 text-white'}`}
                    >
                      <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-transparent hover:text-white transition-all ease-in-out">
                        <div className="flex items-center gap-4 w-full bg-none">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                            ${item.isCorrect ? 'bg-white text-green-600' : 'bg-white text-red-600'}`}>
                            {item.isCorrect ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-semibold text-[#00FFFF]">Question {index + 1}</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-t px-6 py-3 bg-white/90">
                        <div className="space-y-4">
                          <p className="text-gray-800 font-medium text-lg mb-4">{item.question}</p>
                          <div className="space-y-3">
                            <div className={`p-3 rounded-lg ${item.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                              <p className={`text-sm font-semibold mb-1 
                                ${item.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                Votre réponse:
                              </p>
                              <p className="text-gray-700">{item.userAnswer}</p>
                            </div>
                            {!item.isCorrect && (
                              <div className="p-3 rounded-lg bg-green-50">
                                <p className="text-sm font-semibold mb-1 text-green-600">
                                  Bonne réponse:
                                </p>
                                <p className="text-gray-700">{item.correctAnswer}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
              
              <div className="mt-8 text-center">
                <Button 
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setUserAnswers(new Array(questions.length).fill(''));
                    setTimeLeft(30);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                    text-white px-8 py-3 rounded-full transform hover:scale-105 transition-all shadow-md"
                >
                  Recommencer le Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
    
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen p-4 relative">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Question {currentQuestion + 1}/{questions.length}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
              <div className="w-32">
                <Progress 
                  value={getProgress()} 
                  className="h-3 rounded-full bg-white/30" 
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <p className="text-xl font-medium text-gray-800 mb-6">
              {questions[currentQuestion]?.question}
            </p>
            
            <div className="space-y-3">
              {questions[currentQuestion]?.choix.map((choice, index) => (
                <Button
                  key={index}
                  variant={userAnswers[currentQuestion] === choice ? "default" : "outline"}
                  className={`w-full text-left justify-start  text-wrap rounded-lg transition-all ${
                    userAnswers[currentQuestion] === choice 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 p-[auto] text-white transform scale-102'
                      : 'hover:border-blue-500 hover:text-blue-500'
                  }`}
                  onClick={() => handleAnswer(choice)}
                >
                  {choice}
                </Button>
              ))}
            </div>
  
            <div className="flex justify-end mt-8">
              <Button
                onClick={nextQuestion}
                disabled={!userAnswers[currentQuestion]}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                {currentQuestion === questions.length - 1 ? 'Voir les Résultats' : 'Question Suivante'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  
      {/* Watermark */}
      <div className="absolute bottom-4 left-1/2 transform-translate-x-1/2 text-gray-400 opacity-20 text-xl font-semibold flex">
        <img src="/logo.png" alt="" className='w-12'/>
        Waguer
      </div>
    </div>
  );
  
  
};

export default App;