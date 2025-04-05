// Home.jsx

import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import axios from "axios";
import { Moon, Sun } from "lucide-react";
import Flashcards from "../components/Flashcards";

const Home = () => {
  const [processingStatus, setProcessingStatus] = useState();
  const [content, setContent] = useState("");
  const [quizContent, setQuizContent] = useState([]);
  const [pdfContent, setPdfContent] = useState();
  const [input, setInput] = useState("");
  const [videoUrl, setVideoUrl] = useState();
  const [chat, setChat] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [flashcardsData, setFlashcardsData] = useState([]);
  const [referencesData, setReferencesData] = useState([]); // NEW state for references

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle PDF/PPT file upload & parse with /extract-text
  const handleFileUpload = async (event) => {
    const url = import.meta.env.VITE_URL;
    const file = event.target.files[0];
    if (!file) return;

    setProcessingStatus("processing");
    try {
      const formData = new FormData();
      formData.append("pdfFile", file);

      const response = await axios.post(`${url}/extract-text`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 1) Store quiz data
      setQuizContent(
        (response.data.quiz || []).map((quiz) => ({
          ...quiz,
          answered: false,
          selectedOption: null,
        }))
      );

      // 2) Store flashcards
      setFlashcardsData(response.data.flashcards || []);

      // 3) Store references
      setReferencesData(response.data.references || []);

      // 4) PDF text & lecture content
      setPdfContent(response.data.pdfContent);
      setContent(response.data.text);

      // 5) Generate the video from the text
      try {
        const audioResponse = await axios.post(
          `${url}/generate-audio`,
          { text: response.data.text },
          { headers: { "Content-Type": "application/json" } }
        );
        setVideoUrl(audioResponse.data.videoUrl);
      } catch (audioErr) {
        console.error("Error generating audio/video:", audioErr);
        alert("Audio/Video generation failed. Quiz, flashcards, references still loaded.");
      }

      setProcessingStatus("processed");
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      setProcessingStatus("processed");
    }
  };

  // For quiz: handle answer selection
  const handleAnswer = (index, selectedOption) => {
    setQuizContent((prev) =>
      prev.map((quiz, idx) =>
        idx === index
          ? { ...quiz, answered: true, selectedOption }
          : quiz
      )
    );
  };

  // Q&A chat integration
  const getGptResponse = async (latestChat) => {
    if (pdfContent) {
      const url = import.meta.env.VITE_URL;
      const response = await axios.post(
        `${url}/get-response`,
        { chat: latestChat },
        { headers: { "Content-Type": "application/json" } }
      );
      setChat((prevChat) => [
        ...prevChat,
        { role: "assistant", content: response.data.gptResponse },
      ]);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setChat((prevChat) => [...prevChat, newMessage]);
    getGptResponse([...chat, newMessage]);
    setInput("");
  };

  // Initialize chat with system prompt once pdfContent is set
  useEffect(() => {
    setChat([
      {
        role: "system",
        content: `You are a helpful assistant. You have knowledge about the following content... When the user asks you about anything, try to answer it from the following lecture content and also use your own knowledge if required.\n\nContent: ${pdfContent}`,
      },
      {
        role: "assistant",
        content: "Please ask me any questions regarding your lecture!",
      },
    ]);
  }, [pdfContent]);

  return (
    <div
      className={
        darkMode
          ? "bg-gray-900 text-white min-h-screen"
          : "bg-gray-100 text-black min-h-screen"
      }
    >
      {/* Navbar */}
      <nav className={darkMode ? "bg-blue-950 p-4" : "bg-blue-900 p-4"}>
        <div className="mx-auto flex justify-between items-center">
          <div className="text-white text-2xl font-extrabold">LectureMate</div>
          <div className="flex items-center">
            <button onClick={toggleDarkMode} className="text-white p-2 mr-4">
              {darkMode ? <Sun /> : <Moon />}
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main container */}
      <div className="p-6  max-w-screen-xl mx-auto">
        <h1 className="text-4xl font-bold text-center mt-12 leading-tight">
          Lecture Video Generator
        </h1>
        <p className="text-center mt-4 mb-12">
          Upload a PDF or PPT file to generate a video explanation of your lecture{" "}
          <span className={darkMode ? "text-gray-700" : "text-gray-400"}>
            (Make sure your lecture is detailed enough)
          </span>
        </p>

        {/* File Upload */}
        <div className="flex items-center justify-center w-full my-12">
          {!processingStatus && (
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-blue-900 ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-600"
                  : "bg-gray-50 hover:bg-blue-50"
              } rounded-lg cursor-pointer transition duration-200`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-4 text-blue-600"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PPT or PDF</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept=".pdf, .ppt, .pptx"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>

        {/* Loader */}
        {processingStatus === "processing" && <Loader text="Generating Video..." />}

        {/* Lecture Explanation */}
        {content && (
          <div
            className={`mt-12 mb-4 p-6 rounded-lg border border-gray-300 ${
              darkMode ? "bg-gray-800 text-white" : "bg-white"
            }`}
          >
            <h2 className="text-2xl font-semibold border-b-2 border-blue-600 pb-2">
              Speech Overview
            </h2>
            <p className="mt-2">{content}</p>
          </div>
        )}

        {/* Video */}
        {videoUrl && (
          <div
            className={
              darkMode ? "bg-gray-800 text-white mt-12 mb-4" : "bg-white mt-12 mb-4"
            }
          >
            <h2 className="text-2xl font-semibold border-b-2 border-blue-600 pb-2">
              Lecture Video
            </h2>
            <video
              className="w-full h-auto mt-2 rounded-lg shadow-lg border border-gray-300"
              controls
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Q&A Chat */}
        {pdfContent && (
          <div
            className={`mt-20 mb-4 rounded-lg ${
              darkMode ? "bg-black text-white" : "bg-white"
            }`}
          >
            <h2 className="text-4xl font-bold text-center bg-gradient-to-r  from-blue-500 to-purple-800 to-blue-900 text-white p-4 rounded-lg shadow-lg mb-6">
              Ask any questions
            </h2>
            <div
              className={`w-full h-80 overflow-auto rounded-lg pb-2 mt-2 p-4 ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div className="flex flex-col">
                {chat.map((c, index) =>
                  c.role !== "system" && (
                    <div
                      key={index}
                      className={`flex py-3 ${
                        c.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <p
                        className={`m-2 p-3 rounded-lg ${
                          c.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {c.content}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="flex mt-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="Ask any questions"
                className={`w-full placeholder:text-gray-600 p-3 rounded-l-md ${
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-200"
                }`}
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white font-semibold p-3 rounded-r-md hover:bg-blue-600 transition duration-200"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Quiz Section */}
        {quizContent && quizContent.length > 0 && (
          <div
            className={`mt-20 mb-5 rounded-lg ${
              darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-800 to-blue-900 text-white p-4 rounded-lg shadow-lg mb-6">
              Quiz
            </h2>
            <div
              className={`mt-4 p-4 rounded-2xl ${
                darkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              {quizContent.map((quiz, index) => (
                <div key={index} className="mt-4 mb-9">
                  <p className="font-medium text-xl ">{quiz.question}</p>
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
        )}

     {/* Flashcards Section */}  
{pdfContent && flashcardsData && flashcardsData.length > 0 && (  
  <div  
    className={`mt-20 mb-10 rounded-lg shadow-xl  ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} transition duration-300 ease-in-out`}  
  >  
    <h2 className="text-4xl font-bold text-center  bg-gradient-to-r from-blue-500 to-purple-800 to-blue-900 text-white p-4 rounded-lg shadow-lg mb-6">  
      Flashcards  
    </h2>  
    <div className="flex flex-wrap justify-center mt-4 space-x-4 space-y-4"> {/* Flex wrap for responsive cards */}  
      <Flashcards flashcardsData={flashcardsData} darkMode={darkMode} />  
    </div>  
  </div>  
)}  
       {/* References Section */}  
{pdfContent && referencesData && referencesData.length > 0 && (  
  <div  
    className={`mt-20 mb-10 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-lg transition duration-300 ease-in-out`}  
  >  
    <h2 className="text-4xl font-bold text-center bg-gradient-to-r  from-blue-500 to-purple-800 to-blue-900 text-white p-4 rounded-lg shadow-lg mb-6">  
      Further Knowledge  
    </h2>  
    <div className="mt-4 space-y-5 p-4"> {/* Space between items */}  
      {referencesData.map((refItem, idx) => (  
        <div key={idx} className="flex flex-col border rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">  
          <a  
            href={refItem.url}  
            target="_blank"  
            rel="noopener noreferrer"  
            className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'} hover:underline`}  
          >  
            {refItem.url}  
          </a>  
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>  
            {refItem.description}  
          </p>  
        </div>  
      ))}  
    </div>  
  </div>  
)}  
      </div>
    </div>
  );
};

export default Home;

































































































// import { useEffect, useState } from "react";  
// import Loader from "../components/Loader";  
// import axios from "axios";  
// import { Moon, Sun } from "lucide-react"; // Import Lucide React icons for dark/light mode  

// const Home = () => {  
//   const [processingStatus, setProcessingStatus] = useState();  
//   const [content, setContent] = useState("");  
//   const [quizContent, setQuizContent] = useState([]);  
//   const [pdfContent, setPdfContent] = useState();  
//   const [input, setInput] = useState();  
//   const [videoUrl, setVideoUrl] = useState();  
//   const [chat, setChat] = useState([]);  
//   const [darkMode, setDarkMode] = useState(false); // State for dark mode  

//   const handleFileUpload = async (event) => {  
//     const url = import.meta.env.VITE_URL;  
//     const file = event.target.files[0];  
//     if (file) {  
//       const formData = new FormData();  
//       formData.append("pdfFile", file);  

//       try {  
//         setProcessingStatus("processing");  
//         const response = await axios.post(`${url}/extract-text`, formData, {  
//           headers: { "Content-Type": "multipart/form-data" },  
//         });  
//         setQuizContent(  
//           response.data.quiz.map((quiz) => ({ ...quiz, answered: false, selectedOption: null }))  
//         );  
//         setPdfContent(response.data.pdfContent);  
//         setContent(response.data.text);  
//         const response2 = await axios.post(  
//           `${url}/generate-audio`,  
//           { text: response.data.text },  
//           {  
//             headers: { "Content-Type": "application/json" },  
//           }  
//         );  
//         setVideoUrl(response2.data.videoUrl);  
//         setProcessingStatus("processed");  
//       } catch (error) {  
//         console.error("Error extracting text from PDF:", error);  
//         setProcessingStatus("processed");  
//       }  
//     }  
//   };  

//   const handleAnswer = (index, selectedOption) => {  
//     setQuizContent((prevQuizContent) =>  
//       prevQuizContent.map((quiz, idx) =>  
//         idx === index ? {  
//           ...quiz,  
//           answered: true,  
//           selectedOption,  
//         } : quiz  
//       )  
//     );  
//   };  

//   const getGptResponse = async (latestChat) => {  
//     if (pdfContent) {  
//       const url = import.meta.env.VITE_URL;  
//       const response = await axios.post(  
//         `${url}/get-response`,  
//         { chat: latestChat },  
//         {  
//           headers: { "Content-Type": "application/json" },  
//         }  
//       );  
//       setChat((prevChat) => {  
//         return [  
//           ...prevChat,  
//           { role: "assistant", content: response.data.gptResponse },  
//         ];  
//       });  
//     }  
//   };  

//   const handleSendMessage = () => {  
//     if (!input?.trim()) return;  

//     const newMessage = { role: "user", content: input };  
//     setChat((prevChat) => [...prevChat, newMessage]);  
//     getGptResponse([...chat, newMessage]);  
//     setInput("");  
//   };  

//   useEffect(() => {  
//     setChat([  
//       {  
//         role: "system",  
//         content: `You are a helpful assistant. You have knowledge about the following content... When the user asks you about anything, try to answer it from the following lecture content and also use your own knowledge if required.\n\nContent: ${pdfContent}`,  
//       },  
//       {  
//         role: "assistant",  
//         content: "Please ask me any questions regarding your lecture!",  
//       },  
//     ]);  
//   }, [pdfContent]);  

//   // Toggle dark mode  
//   const toggleDarkMode = () => {  
//     setDarkMode(!darkMode);  
//   };  

//   return (  
//     <div className={darkMode ? "bg-gray-900 text-white min-h-screen" : "bg-gray-100 text-black min-h-screen"}>  
//       <nav className={`${darkMode ? "bg-blue-950" : "bg-blue-900"} p-4`}>  
//         <div className="mx-auto flex justify-between items-center">  
//           <div className="text-white text-2xl font-extrabold">LectureMate</div>  
//           <div className="flex items-center">  
//             <button onClick={toggleDarkMode} className="text-white p-2 mr-4">  
//               {darkMode ? <Sun /> : <Moon />}  
//             </button>  
//             <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200">  
//               Log Out  
//             </button>  
//           </div>  
//         </div>  
//       </nav>  
//       <div className="p-6 max-w-6xl mx-auto">  

//         <h1 className="text-4xl font-bold text-center mt-12 leading-tight">  
//           Lecture Video Generator  
//         </h1>  
//         <p className="text-center mt-4 mb-12">  
//           Upload a PDF or PPT file to generate a video explanation of your lecture
//           <p className={`${darkMode ? "text-gray-700" : "text-gray-400"}`}>(Make sure your lecture is detailed enough)</p>  

//         </p>  

//         <div className="flex items-center justify-center w-full my-12">  
//           {!processingStatus && (  
//             <label  
//               htmlFor="dropzone-file"  
//               className={`flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-blue-900 ${darkMode ? "bg-gray-800 hover:bg-gray-600" :" bg-gray-50 hover:bg-blue-50"  }rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 transition duration-200`}  
//             >  
//               <div className="flex flex-col items-center justify-center pt-5 pb-6">  
//                 <svg  
//                   className="w-10 h-10 mb-4 text-blue-600"  
//                   aria-hidden="true"  
//                   xmlns="http://www.w3.org/2000/svg"  
//                   fill="none"  
//                   viewBox="0 0 20 16"  
//                 >  
//                   <path  
//                     stroke="currentColor"  
//                     strokeLinecap="round"  
//                     strokeLinejoin="round"  
//                     strokeWidth="2"  
//                     d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"  
//                   />  
//                 </svg>  
//                 <p className="mb-2 text-sm text-gray-600">  
//                   <span className="font-semibold">Click to upload</span> or drag  
//                   and drop  
//                 </p>  
//                 <p className="text-xs text-gray-500">PPT or PDF</p>  
//               </div>  
//               <input  
//                 id="dropzone-file"  
//                 type="file"  
//                 accept=".pdf, .ppt, .pptx"  
//                 className="hidden"  
//                 onChange={handleFileUpload}  
//               />  
//             </label>  
//           )}  
//         </div>  

//         {processingStatus === "processing" && (  
//           <Loader text="Generating Video..." />  
//         )}  

//         {content && (  
//           <div className={`mt-12 mb-4 p-6 rounded-lg border border-gray-300 ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}>  
//             <h2 className="text-2xl font-semibold border-b-2 border-blue-600 pb-2">  
//               Speech Overview  
//             </h2>  
//             <p className="mt-2">{content}</p>  
//           </div>  
//         )}  

//         {videoUrl && (  
//           <div className={`mt-12 mb-4 ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}>  
//             <h2 className="text-2xl font-semibold border-b-2 border-blue-600 pb-2">  
//               Lecture Video  
//             </h2>  
//             <video className="w-full h-auto mt-2 rounded-lg shadow-lg border border-gray-300" controls>  
//               <source src={videoUrl} type="video/mp4" />  
//               Your browser does not support the video tag.  
//             </video>  
//           </div>  
//         )}  

//         {pdfContent && (  
//           <div className={`mt-20 mb-4 rounded-lg ${darkMode ? "bg-black text-white" : "bg-white"}`}>  
//             <h2 className="text-3xl font-semibold text-center bg-blue-900 text-white p-4 rounded-lg shadow-lg">  
//               Ask any questions   
//             </h2>  
//             <div className={`w-full h-80 overflow-auto rounded-lg pb-2 mt-2 p-4 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>  
//               <div className="flex flex-col">  
//                 {chat.map((c, index) =>  
//                   c.role !== "system" && (  
//                     <div key={index} className={`flex py-3 ${c.role === "user" ? "justify-end" : "justify-start"}`}>  
//                       <p  
//                         className={`m-2 p-3 rounded-lg ${c.role === "user" ? "bg-blue-600 text-white" : "text-white bg-gray-500"}`}  
//                       >  
//                         {c.content}  
//                       </p>  
//                     </div>  
//                   )  
//                 )}  
//               </div>  
//             </div>  
//             <div className="flex mt-4">  
//               <input  
//                 type="text"  
//                 value={input || ""}  
//                 onChange={(e) => setInput(e.target.value)}  
//                 onKeyDown={(e) => {  
//                   if (e.key === "Enter") {  
//                     handleSendMessage();  
//                   }  
//                 }}  
//                 placeholder="Ask any questions"  
//                 className={`w-full placeholder:text-gray-600 p-3 rounded-l-md ${darkMode ? "bg-gray-700 text-white" : "bg-gray-200"}`}  
//               />  
//               <button  
//                 onClick={handleSendMessage}  
//                 className="bg-blue-500 text-white font-semibold p-3 rounded-r-md hover:bg-blue-600 transition duration-200"  
//               >  
//                 Send  
//               </button>  
//             </div>  
//           </div>  
//         )}  

// {quizContent.length > 0 && (  
//   <div className={`mt-20 mb-5 rounded-lg ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>  
//     <h2 className="text-3xl font-semibold text-center bg-blue-900 text-white p-4 rounded-lg shadow-lg">  
//       Quiz  
//     </h2>  
//     <div className={`mt-4 p-4 rounded-2xl ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>  
//       {quizContent.map((quiz, index) => (  
//         <div key={index} className="mt-4 mb-9">  
//           <p className="font-medium text-xl ">{quiz.question}</p>  
//           {["option_a", "option_b", "option_c", "option_d"].map((optionKey) => (  
//             <div key={optionKey} className="mt-2">  
//               <button  
//                 onClick={() => handleAnswer(index, optionKey)}  
//                 className={`w-full text-left p-3 rounded-lg ${  
//                   quiz.answered  
//                     ? quiz.correct_answer === optionKey  
//                       ? "bg-green-600 text-white"  
//                       : (quiz.selectedOption === optionKey ? "bg-red-600 text-white" : darkMode ? "bg-gray-600 text-white" : "bg-gray-200")  
//                     : darkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white hover:bg-gray-100"  
//                 } transition duration-200`}  
//               >  
//                 {quiz[optionKey]}  
//               </button>  
//             </div>  
//           ))}  
//         </div>  
//       ))}  
//     </div>  
//   </div>  
// )}
//       </div>  
//     </div>  
//   );  
// };  

// export default Home;



























// import { useEffect, useState } from "react";  
// import Loader from "../components/Loader";  
// import axios from "axios";  

// const Home = () => {  
//   const [processingStatus, setProcessingStatus] = useState();  
//   const [content, setContent] = useState("");  
//   const [quizContent, setQuizContent] = useState([]);  
//   const [pdfContent, setPdfContent] = useState();  
//   const [input, setInput] = useState();  
//   const [videoUrl, setVideoUrl] = useState();  
//   const [chat, setChat] = useState([]);  

//   const handleFileUpload = async (event) => {  
//     const url = import.meta.env.VITE_URL;  
//     const file = event.target.files[0];  
//     if (file) {  
//       const formData = new FormData();  
//       formData.append("pdfFile", file);  

//       try {  
//         setProcessingStatus("processing");  
//         const response = await axios.post(`${url}/extract-text`, formData, {  
//           headers: { "Content-Type": "multipart/form-data" },  
//         });  
//         setQuizContent(  
//           response.data.quiz.map((quiz) => ({ ...quiz, answered: false, selectedOption: null }))  
//         );  
//         setPdfContent(response.data.pdfContent);  
//         setContent(response.data.text);  
//         const response2 = await axios.post(  
//           `${url}/generate-audio`,  
//           { text: response.data.text },  
//           {  
//             headers: { "Content-Type": "application/json" },  
//           }  
//         );  
//         setVideoUrl(response2.data.videoUrl);  
//         setProcessingStatus("processed");  
//       } catch (error) {  
//         console.error("Error extracting text from PDF:", error);  
//         setProcessingStatus("processed");  
//       }  
//     }  
//   };  

//   const handleAnswer = (index, selectedOption) => {  
//     setQuizContent((prevQuizContent) =>  
//       prevQuizContent.map((quiz, idx) =>  
//         idx === index ? {  
//           ...quiz,  
//           answered: true,  
//           selectedOption,  
//         } : quiz  
//       )  
//     );  
//   };  

//   const getGptResponse = async (latestChat) => {  
//     if (pdfContent) {  
//       const url = import.meta.env.VITE_URL;  
//       const response = await axios.post(  
//         `${url}/get-response`,  
//         { chat: latestChat },  
//         {  
//           headers: { "Content-Type": "application/json" },  
//         }  
//       );  
//       setChat((prevChat) => {  
//         return [  
//           ...prevChat,  
//           { role: "assistant", content: response.data.gptResponse },  
//         ];  
//       });  
//     }  
//   };  

//   const handleSendMessage = () => {  
//     if (!input?.trim()) return;  

//     const newMessage = { role: "user", content: input };  
//     setChat((prevChat) => [...prevChat, newMessage]);  
//     getGptResponse([...chat, newMessage]);  
//     setInput("");  
//   };  

//   useEffect(() => {  
//     setChat([  
//       {  
//         role: "system",  
//         content: `You are a helpful assistant. You have knowledge about the following content... When the user asks you about anything, try to answer it from the following lecture content and also use your own knowledge if required.\n\nContent: ${pdfContent}`,  
//       },  
//       {  
//         role: "assistant",  
//         content: "Please ask me any questions regarding your lecture!",  
//       },  
//     ]);  
//   }, [pdfContent]);  

//   return (  
//     <div className="bg-gray-100 min-h-screen">  
//       <nav className="bg-blue-900 p-4">  
//         <div className="mx-auto  flex justify-between items-center">  
//           <div className="text-white text-2xl font-bold">LECTUREMATE</div>  
//           <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200">  
//             Log Out  
//           </button>  
//         </div>  
//       </nav>  
//       <div className="p-6 max-w-6xl mx-auto">  

//         <h1 className="text-4xl font-bold text-center mt-12 text-blue-900 leading-tight">  
//           Lecture Video Generator  
//         </h1>  
//         <p className="text-center text-gray-600 mt-4 mb-12">  
//           Upload a PDF or PPT file to generate a video explanation of your lecture.  
//         </p>  

//         <div className="flex items-center justify-center w-full my-12">  
//           {!processingStatus && (  
//             <label  
//               htmlFor="dropzone-file"  
//               className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-blue-600 rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 transition duration-200"  
//             >  
//               <div className="flex flex-col items-center justify-center pt-5 pb-6">  
//                 <svg  
//                   className="w-10 h-10 mb-4 text-blue-600"  
//                   aria-hidden="true"  
//                   xmlns="http://www.w3.org/2000/svg"  
//                   fill="none"  
//                   viewBox="0 0 20 16"  
//                 >  
//                   <path  
//                     stroke="currentColor"  
//                     strokeLinecap="round"  
//                     strokeLinejoin="round"  
//                     strokeWidth="2"  
//                     d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"  
//                   />  
//                 </svg>  
//                 <p className="mb-2 text-sm text-gray-600">  
//                   <span className="font-semibold">Click to upload</span> or drag  
//                   and drop  
//                 </p>  
//                 <p className="text-xs text-gray-500">PPT or PDF</p>  
//               </div>  
//               <input  
//                 id="dropzone-file"  
//                 type="file"  
//                 accept=".pdf, .ppt, .pptx"  
//                 className="hidden"  
//                 onChange={handleFileUpload}  
//               />  
//             </label>  
//           )}  
//         </div>  

//         {processingStatus === "processing" && (  
//           <Loader text="Generating Video..." />  
//         )}  

//         {content && (  
//           <div className="mt-12 mb-4 p-6 bg-white shadow-lg rounded-lg border border-gray-300">  
//             <h2 className="text-2xl font-semibold text-blue-900 border-b-2 border-blue-600 pb-2">  
//               Speech Overview  
//             </h2>  
//             <p className="mt-2 text-gray-700">{content}</p>  
//           </div>  
//         )}  

//         {videoUrl && (  
//           <div className="mt-12 mb-4">  
//             <h2 className="text-2xl font-semibold text-blue-900 border-b-2 border-blue-600 pb-2">  
//               Lecture Video  
//             </h2>  
//             <video className="w-full h-auto mt-2 rounded-lg shadow-lg border border-gray-300" controls>  
//               <source src={videoUrl} type="video/mp4" />  
//               Your browser does not support the video tag.  
//             </video>  
//           </div>  
//         )}  

//         {pdfContent && (  
//           <div className="mt-20 mb-4">  
//             <h2 className="text-3xl font-semibold text-white text-center bg-blue-900 p-4 rounded-lg shadow-lg">  
//               Q&A Scetion 
//             </h2>  
//             <div className="bg-gray-200 w-full h-80 overflow-auto rounded-lg pb-2 mt-2 p-4 shadow-md">  
//               <div className="flex flex-col">  
//                 {chat.map((c, index) =>  
//                   c.role !== "system" && (  
//                     <div key={index} className={`flex py-3 ${c.role === "user" ? "justify-end" : "justify-start"}`}>  
//                       <p  
//                         className={`m-2 p-3 rounded-lg ${c.role === "user" ? "bg-blue-600 text-white" : "bg-gray-300 border-gray-400"}`}  
//                       >  
//                         {c.content}  
//                       </p>  
//                     </div>  
//                   )  
//                 )}  
//               </div>  
//             </div>  
//             <div className="flex mt-4">  
//               <input  
//                 type="text"  
//                 value={input || ""}  
//                 onChange={(e) => setInput(e.target.value)}  
//                 onKeyDown={(e) => {  
//                   if (e.key === "Enter") {  
//                     handleSendMessage();  
//                   }  
//                 }}  
//                 placeholder="Ask any questions"  
//                 className="w-full bg-gray-200 placeholder:text-gray-600 p-3 rounded-l-md"  
//               />  
//               <button  
//                 onClick={handleSendMessage}  
//                 className="bg-blue-500 text-white font-semibold p-3 rounded-r-md hover:bg-blue-600 transition duration-200"  
//               >  
//                 Send  
//               </button>  
//             </div>  
//           </div>  
//         )}  

//         {quizContent.length > 0 && (  
//           <div className="mt-20 mb-5">  
//             <h2 className="text-3xl font-semibold text-white text-center bg-blue-900 p-4 rounded-lg shadow-lg">  
//               Quiz Section  
//             </h2>  
//             <div className="mt-4 bg-white p-4 rounded-lg shadow-md border border-gray-300">  
//               {quizContent.map((quiz, index) => (  
//                 <div key={index} className="mt-4">  
//                   <p className="font-medium text-black text-lg">{quiz.question}</p>  
//                   {["option_a", "option_b", "option_c", "option_d"].map((optionKey) => (  
//                     <div key={optionKey} className="mt-2">  
//                       <button  
//                         onClick={() => handleAnswer(index, optionKey)}  
//                         className={`w-full text-left p-3 rounded-lg ${  
//                           quiz.answered  
//                             ? quiz.correct_answer === optionKey  
//                               ? "bg-green-600 text-white"  
//                               : (quiz.selectedOption === optionKey ? "bg-red-600 text-white" : "bg-gray-200")  
//                             : "bg-gray-100 hover:bg-gray-200"  
//                         } transition duration-200`}  
//                       >  
//                         {quiz[optionKey]}  
//                       </button>  
//                     </div>  
//                   ))}  
//                 </div>  
//               ))}  
//             </div>  
//           </div>  
//         )}  
//       </div>  
//     </div>  
//   );  
// };  

// export default Home;









// import { useEffect, useState } from "react";
// import Loader from "../components/Loader";
// import axios from "axios";

// const Home = () => {
//   const [processingStatus, setProcessingStatus] = useState();
//   const [content, setContent] = useState("");
//   const [quizContent, setQuizContent] = useState([]);
//   const [pdfContent, setPdfContent] = useState();
//   const [input, setInput] = useState();
//   const [videoUrl, setVideoUrl] = useState();
//   const [chat, setChat] = useState([]);

//   const handleFileUpload = async (event) => {
//     const url = import.meta.env.VITE_URL;
//     console.log(url);
//     const file = event.target.files[0];
//     if (file) {
//       const formData = new FormData();
//       formData.append("pdfFile", file);

//       try {
//         setProcessingStatus("processing");
//         const response = await axios.post(`${url}/extract-text`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         console.log(response.data.quiz);
//         setQuizContent(
//           response.data.quiz.map((quiz) => ({ ...quiz, answered: false }))
//         );
//         setPdfContent(response.data.pdfContent);
//         setContent(response.data.text);
//         const response2 = await axios.post(
//           `${url}/generate-audio`,
//           { text: response.data.text },
//           {
//             headers: { "Content-Type": "application/json" },
//           }
//         );
//         console.log(response2.data);
//         setVideoUrl(response2.data.videoUrl);

//         setProcessingStatus("processed");
//       } catch (error) {
//         console.error("Error extracting text from PDF:", error);
//         setProcessingStatus("processed");
//       }
//     }
//   };

//   const handleAnswer = (index) => {
//     setQuizContent((prevQuizContent) =>
//       prevQuizContent.map((quiz, idx) =>
//         idx === index ? { ...quiz, answered: true } : quiz
//       )
//     );
//   };

//   const getGptResponse = async (latestChat) => {
//     if (pdfContent) {
//       const url = import.meta.env.VITE_URL;
//       const response = await axios.post(
//         `${url}/get-response`,
//         { chat: latestChat },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       setChat((prevChat) => {
//         return [
//           ...prevChat,
//           { role: "assistant", content: response.data.gptResponse },
//         ];
//       });
//     }
//   };

//   const handleSendMessage = () => {
//     // Optionally prevent sending empty messages
//     if (!input?.trim()) return;

//     const newMessage = { role: "user", content: input };
//     // Update chat state
//     setChat((prevChat) => [...prevChat, newMessage]);
//     // Call getGptResponse with the updated chat
//     getGptResponse([...chat, newMessage]);
//     // Clear the input box
//     setInput("");
//   };

//   useEffect(() => {
//     setChat([
//       {
//         role: "system",
//         content: `You are a helpful assistant. You have knowledge about the following content... When the user asks you about anything, try to answer it frmo the following lecture content and also use your own knowledge if required.\n\n Content: ${pdfContent}`,
//       },
//       {
//         role: "assistant",
//         content: "Please ask me any questions regarding your lecture!",
//       },
//     ]);
//   }, [pdfContent]);

//   return (
//     <div className="p-4 max-w-[60rem] m-auto">
//       <div className="flex flex-row justify-between">
//         <div className="text-red-400 py-1 font-bold">Home</div>
//         <div className="bg-red-400 p-1 text-white rounded-lg">Log Out</div>
//       </div>
//       <br />
//       <p className="tracking-tight">
//         Upload a pdf/ppt file to get a video explanation of your lecture.
//       </p>
//       <p className="text-gray-400 tracking-tight">
//         (Make sure your the lecture is detailed enough)
//       </p>
//       <br />

//       {!processingStatus && (
//         <div className="flex items-center justify-center w-full">
//           <label
//             htmlFor="dropzone-file"
//             className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
//           >
//             <div className="flex flex-col items-center justify-center pt-5 pb-6">
//               <svg
//                 className="w-8 h-8 mb-4 text-gray-500"
//                 aria-hidden="true"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 20 16"
//               >
//                 <path
//                   stroke="currentColor"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
//                 />
//               </svg>
//               <p className="mb-2 text-sm text-gray-500">
//                 <span className="font-semibold">Click to upload</span> or drag
//                 and drop
//               </p>
//               <p className="text-xs text-gray-500">PPT or PDF</p>
//             </div>
//             <input
//               id="dropzone-file"
//               type="file"
//               accept=".pdf, .ppt, .pptx"
//               className="hidden"
//               onChange={handleFileUpload}
//             />
//           </label>
//         </div>
//       )}

//       <br></br>
//       {pdfContent && <h1 className="text-lg font-bold">Speech</h1>}
//       <br></br>
//       {content && <p>{content}</p>}
//       <br />
//       {processingStatus === "processing" && (
//         <Loader text="Generating Video..." />
//       )}

//       {videoUrl && (
//         <video width="100%" height="auto" controls>
//           <source src={videoUrl} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       )}
//       <br></br>
//       {pdfContent && (
//         <>
//           <div className="bg-gray-200 w-full h-80 overflow-auto rounded-lg pb-10">
//             <div className="flex flex-col">
//               {chat.map(
//                 (c, index) =>
//                   c.role !== "system" && (
//                     <div key={index} className="flex py-2">
//                       <p
//                         className={`m-4 mb-2 p-2 rounded-lg bg-gray-300 ${
//                           c.role === "user"
//                             ? "ml-auto max-w-[30rem]"
//                             : "mr-auto max-w-[30rem]"
//                         }`}
//                       >
//                         {c.content}
//                       </p>
//                     </div>
//                   )
//               )}
//             </div>
//           </div>

//           <br></br>
//           {/* Chat input and send button */}
//           <div className="flex justify-between">
//             <input
//               type="text"
//               value={input || ""} // making sure the input is controlled
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   handleSendMessage();
//                 }
//               }}
//               placeholder="Ask any questions"
//               className="inline w-full bg-gray-200 placeholder:text-gray-600 p-3 rounded"
//             />
//             <button
//               onClick={handleSendMessage}
//               className="p-4 bg-gray-300 text-gray-900 ml-2"
//             >
//               Send
//             </button>
//           </div>
//         </>
//       )}
//       <br />
//       {quizContent && quizContent.length > 0 && (
//         <h1 className="text-lg font-bold">Quiz</h1>
//       )}
//       <br />
//       {quizContent.map((quiz, index) => {
//         return (
//           <div key={index}>
//             <p className="font-bold">{quiz.question}</p>
//             {["option_a", "option_b", "option_c", "option_d"].map(
//               (optionKey) => (
//                 <div
//                   key={optionKey}
//                   className={`block ${
//                     quiz.answered && quiz.correct_answer === optionKey
//                       ? `font-bold text-green-600`
//                       : quiz.answered && quiz.correct_answer != optionKey
//                       ? `font-bold text-red-600`
//                       : `text-black`
//                   }`}
//                 >
//                   <input type="checkbox" onChange={() => handleAnswer(index)} />
//                   <p className="inline ml-2">{quiz[optionKey]}</p>
//                 </div>
//               )
//             )}
//             <br />
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Home;
