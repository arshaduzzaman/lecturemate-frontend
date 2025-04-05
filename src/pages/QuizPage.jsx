


import { useState, useEffect } from "react";  

const QuizPage = ({ darkMode }) => {  
  const [quizContent, setQuizContent] = useState([]);  
  const [quizComplete, setQuizComplete] = useState(false);  
  const [score, setScore] = useState(0);  

  // Load quiz data from localStorage  
  useEffect(() => {  
    const savedQuizContent = JSON.parse(localStorage.getItem("quizContent"));  
    if (savedQuizContent) {  
      setQuizContent(savedQuizContent);  
    }  
  }, []);  

  const handleAnswer = (index, selectedOption) => {  
    const updatedQuizContent = [...quizContent];  
    updatedQuizContent[index].answered = true;  
    updatedQuizContent[index].selectedOption = selectedOption;  

    // Update score if the answer is correct  
    if (updatedQuizContent[index].correct_answer === selectedOption) {  
      setScore((prevScore) => prevScore + 1);  
    }  

    setQuizContent(updatedQuizContent);  

    // Check if the quiz is complete  
    if (updatedQuizContent.every((q) => q.answered)) {  
      setQuizComplete(true);  
    }  

    // Save updated quiz data in localStorage  
    localStorage.setItem("quizContent", JSON.stringify(updatedQuizContent));  
  };  

  const handleResetQuiz = async () => {  
    setScore(0);  
    setQuizComplete(false);  

    // Fetch new quiz questions from the backend
    const response = await fetch('http://localhost:3000/api/new-quiz'); // Replace with your actual endpoint
    const newQuizContent = await response.json();

    const resetQuizContent = newQuizContent.map((quiz) => ({  
      ...quiz,  
      answered: false,  
      selectedOption: null,  
    }));  
    setQuizContent(resetQuizContent);  
    localStorage.setItem("quizContent", JSON.stringify(resetQuizContent));  
  };  

  return (  
    <div className={`p-6 max-w-screen-xl mx-auto ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>  
      {/* Quiz Section */}  
      <div className={`mb-5 rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>  
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg mb-6">  
          Quiz  
        </h2>  
        <div className={`mt-4 p-4 rounded-2xl ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>  
          {quizContent.map((quiz, index) => (  
            <div key={index} className="mt-4 mb-9 border border-gray-300 rounded-lg p-4 shadow-md">  
              <p className="font-medium text-xl">  
                {index + 1}. {quiz.question}  
              </p>  
              {["option_a", "option_b", "option_c", "option_d"].map((optionKey) => (  
                <div key={optionKey} className="mt-2">  
                  <button  
                    onClick={() => handleAnswer(index, optionKey)}  
                    className={`w-full text-left p-3 rounded-lg ${  
                      quiz.answered  
                        ? quiz.correct_answer === optionKey  
                          ? "bg-green-600 text-white"  
                          : quiz.selectedOption === optionKey  
                          ? "bg-red-600 text-white"  
                          : darkMode  
                          ? "bg-gray-600 text-white"  
                          : "bg-gray-200"  
                        : darkMode  
                        ? "bg-gray-800 text-white hover:bg-gray-700"  
                        : "bg-white hover:bg-gray-100"  
                    } transition duration-200`}  
                  >  
                    {quiz[optionKey]}  
                  </button>  
                </div>  
              ))}  
            </div>  
          ))}  
        </div>  
      </div>  

           {/* Results Section */}  
           {quizComplete && (  
        <div className={`mb-5 rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-6 shadow-lg`}>  
          <h2 className="text-3xl font-bold text-center mb-4">Quiz Completed!</h2>  
          <p className="text-xl text-center mb-4">  
            Your score: <span className="font-bold text-green-500">{score} / {quizContent.length}</span>  
          </p>  
          <div className="flex justify-center">  
            <button  
              onClick={handleResetQuiz}  
              className={`mt-4 px-6 py-3 rounded-lg text-white ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"} transition duration-200 shadow-md`}  
            >  
              Generate New Quiz  
            </button>  
          </div>  
        </div>  
      )}  
    </div>  
  );  
};  

export default QuizPage;






// import { useState, useEffect } from "react";  

// const QuizPage = ({ darkMode }) => {  
//   const [quizContent, setQuizContent] = useState([]);  
 

//   // Load quiz data from localStorage  
//   useEffect(() => {  
//     const savedQuizContent = JSON.parse(localStorage.getItem("quizContent"));  
//     if (savedQuizContent) {  
//       setQuizContent(savedQuizContent);  
//     }  
//   }, []);  

//   const handleAnswer = (index, selectedOption) => {  
//     const updatedQuizContent = [...quizContent];  
//     updatedQuizContent[index].answered = true;  
//     updatedQuizContent[index].selectedOption = selectedOption;  
//     setQuizContent(updatedQuizContent);  

//     // Save updated quiz data in localStorage  
//     localStorage.setItem("quizContent", JSON.stringify(updatedQuizContent));  
//   };  

//   return (  
//     <div className={`p-6 max-w-screen-xl mx-auto ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>  
//       {/* Quiz Section */}  
//       {quizContent && quizContent.length > 0 && (  
//         <div className={` mb-5 rounded-lg ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>  
//           <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-green-500 to-green-600  text-white p-4 rounded-lg shadow-lg mb-6">  
//             Quiz  
//           </h2>  
//           <div className={`mt-4 p-4 rounded-2xl ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>  
//             {quizContent.map((quiz, index) => (  
//               <div key={index} className="mt-4 mb-9">  
//                 <p className="font-medium text-xl">{quiz.question}</p>  
//                 {["option_a", "option_b", "option_c", "option_d"].map((optionKey) => (  
//                   <div key={optionKey} className="mt-2">  
//                     <button  
//                       onClick={() => handleAnswer(index, optionKey)}  
//                       className={`w-full text-left p-3 rounded-lg ${  
//                         quiz.answered  
//                           ? quiz.correct_answer === optionKey  
//                             ? "bg-green-600 text-white"  
//                             : quiz.selectedOption === optionKey  
//                             ? "bg-red-600 text-white"  
//                             : darkMode  
//                             ? "bg-gray-600 text-white"  
//                             : "bg-white"  
//                           : darkMode  
//                           ? "bg-gray-800 text-white hover:bg-gray-700"  
//                           : "bg-white hover:bg-gray-100"  
//                       } transition duration-200`}  
//                     >  
//                       {quiz[optionKey]}  
//                     </button>  
//                   </div>  
//                 ))}  
//               </div>  
//             ))}  
//           </div>  
//         </div>  
//       )}  
//     </div>  
//   );  
// };  

// export default QuizPage;  