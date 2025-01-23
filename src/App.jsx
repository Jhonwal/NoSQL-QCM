import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Clock, Check, X, Brain, Database, DatabaseZap } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const App = () => {
  const [quizType, setQuizType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const quizOptions = [
    {
      id: 'ml',
      title: 'Machine Learning 1',
      description: 'Test your knowledge in Machine Learning concepts and applications 1',
      icon: Brain,
      file: 'ml_qcm.json',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 'ml2',
      title: 'Machine Learning 2',
      description: 'Test your advanced knowledge in Machine Learning concepts and applications',
      icon: Brain,
      file: 'ml2_qcm.json',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 'nosql',
      title: 'NoSQL Databases 1',
      description: 'Challenge yourself with NoSQL database concepts and best practices 1',
      icon: Database,
      file: 'nosql_qcm.json',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'nosql2',
      title: 'NoSQL Databases 2',
      description: 'Challenge yourself with advanced NoSQL database concepts and use cases',
      icon: Database,
      file: 'nosql2_qcm.json',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'bigdata1',
      title: 'Big Data 1',
      description: 'Explore the fundamentals of Big Data concepts and tools',
      icon: DatabaseZap,
      file: 'bigdata1_qcm.json',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'bigdata2',
      title: 'Big Data 2',
      description: 'Deep dive into advanced Big Data techniques and applications',
      icon: DatabaseZap,
      file: 'bigdata2_qcm.json',
      gradient: 'from-red-500 to-orange-500'
    },
  ];
  

  const shuffleQuestions = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    if (!quizType) return;

    setLoading(true);
    fetch(`/${quizType.file}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des questions");
        }
        return response.json();
      })
      .then((data) => {
        const shuffledQuestions = shuffleQuestions(data);
        setQuestions(shuffledQuestions);
        setUserAnswers(new Array(shuffledQuestions.length).fill(''));
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [quizType]);

  useEffect(() => {
    if (loading || showResults || !quizType) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            return 60;
          } else {
            setShowResults(true);
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, loading, showResults, questions.length, quizType]);

  useEffect(() => {
    setTimeLeft(60);
  }, [currentQuestion]);

  const handleAnswer = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(60);
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

  const resetQuiz = () => {
    setQuizType(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    setTimeLeft(60);
  };

  if (!quizType) {
    return (
      <div className="flex items-center justify-center w-screen min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Choose Your Quiz
            </h1>
            <p className="text-gray-600 text-lg">
              Select a topic to start the challenge
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {quizOptions.map((option) => (
              <Card 
                key={option.id}
                className="overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                onClick={() => setQuizType(option)}
              >
                <div className={`bg-gradient-to-r ${option.gradient} p-6 text-white`}>
                  <div className="flex items-center gap-4">
                    <option.icon className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">{option.title}</h2>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600">{option.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Chargement du quiz {quizType.title}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Card className="w-full max-w-2xl mx-auto bg-yellow-50">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-yellow-600 mb-2">Maintenance en cours</h2>
            <p className="text-yellow-700">Cette partie du quiz est actuellement en maintenance. Veuillez réessayer plus tard.</p>
            <Button 
              onClick={resetQuiz}
              className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Retour à la sélection
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
          <CardHeader className={`text-center bg-gradient-to-r ${quizType.gradient} text-white rounded-t-lg p-6`}>
            <div className="flex items-center justify-center gap-4">
              <quizType.icon className="w-8 h-8" />
              <h2 className="text-3xl font-bold">{quizType.title} - Résultats</h2>
            </div>
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
    
              <div className="flex gap-4">
                <Button
                  onClick={resetQuiz}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Changer de Quiz
                </Button>
                <Button 
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setUserAnswers(new Array(questions.length).fill(''));
                    setTimeLeft(30);
                  }}
                  className={`flex-1 bg-gradient-to-r ${quizType.gradient} text-white`}
                >
                  Recommencer
                </Button>
              </div>

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
                            <span className="font-semibold text-white">Question {index + 1}</span>
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen p-4 relative">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className={`bg-gradient-to-r ${quizType.gradient} text-white rounded-t-lg`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <quizType.icon className="w-6 h-6" />
              <h2 className="text-2xl font-bold">{quizType.title}</h2>
            </div>
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
                  className={`w-full text-left justify-start text-wrap rounded-lg transition-all ${
                    userAnswers[currentQuestion] === choice 
                      ? `bg-gradient-to-r ${quizType.gradient} text-white transform scale-102`
                      : 'hover:border-blue-500 hover:text-blue-500'
                  }`}
                  onClick={() => handleAnswer(choice)}
                >
                  {choice}
                </Button>
              ))}
            </div>
  
            <div className="flex justify-between mt-8">
              <Button
                onClick={resetQuiz}
                variant="outline"
                className="px-6 py-2 rounded-full"
              >
                Changer de Quiz
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!userAnswers[currentQuestion]}
                className={`px-6 py-2 rounded-full bg-gradient-to-r ${quizType.gradient} text-white`}
              >
                {currentQuestion === questions.length - 1 ? 'Voir les Résultats' : 'Question Suivante'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  
      {/* Watermark */}
      <div className="absolute bottom-4 left-1/2 transform-translate-x-1/2 text-gray-400 opacity-20 text-xl font-semibold flex">
        <img src="/logo.png" alt="" className="w-12"/>
        Waguer
      </div>
    </div>
  );
};

export default App;