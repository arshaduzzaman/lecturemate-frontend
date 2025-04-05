


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import axios from "axios";
import Flashcards from "../components/Flashcards";
import "swiper/css"; // Import Swiper CSS correctly
import { Navigation, Pagination } from "swiper"; // Correct module imports for Swiper

const Home = ({darkMode}) => {
  const navigate = useNavigate(); // Navigation hook for routing

  const [processingStatus, setProcessingStatus] = useState();
  const [content, setContent] = useState(""); // For storing the lecture summary
  const [quizContent, setQuizContent] = useState([]);
  const [pdfContent, setPdfContent] = useState();
  const [input, setInput] = useState("");
  const [videoUrl, setVideoUrl] = useState();
  const [chat, setChat] = useState([
    {
      role: "assistant",
      content: "Please ask me any questions regarding your lecture!",
    },
  ]);

  const [flashcardsData, setFlashcardsData] = useState([]);
  const [referencesData, setReferencesData] = useState([]);


  // Handle file upload and parse with /extract-text
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
      const quizData = (response.data.quiz || []).map((quiz) => ({
        ...quiz,
        answered: false,
        selectedOption: null,
      }));
      setQuizContent(quizData);
      localStorage.setItem("quizContent", JSON.stringify(quizData));

      // 2) Store flashcards
      const flashcards = response.data.flashcards || [];
      setFlashcardsData(flashcards);
      localStorage.setItem("flashcardsData", JSON.stringify(flashcards));

      // 3) Store references
      const references = response.data.references || [];
      setReferencesData(references);
      localStorage.setItem("referencesData", JSON.stringify(references));

      // 4) PDF text & lecture content
      setPdfContent(response.data.pdfContent);
      setContent(response.data.text);
      localStorage.setItem("pdfContent", response.data.pdfContent);
      localStorage.setItem("lectureContent", response.data.text);

      // 5) Generate the video from the text
      try {
        const audioResponse = await axios.post(
          `${url}/generate-audio`,
          { text: response.data.text },
          { headers: { "Content-Type": "application/json" } }
        );
        setVideoUrl(audioResponse.data.videoUrl);
        localStorage.setItem("videoUrl", audioResponse.data.videoUrl);
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

  // Load data from localStorage when component mounts
  useEffect(() => {
    const savedQuizContent = JSON.parse(localStorage.getItem("quizContent"));
    if (savedQuizContent) {
      setQuizContent(savedQuizContent);
    }

    const savedFlashcardsData = JSON.parse(localStorage.getItem("flashcardsData"));
    if (savedFlashcardsData) {
      setFlashcardsData(savedFlashcardsData);
    }

    const savedReferencesData = JSON.parse(localStorage.getItem("referencesData"));
    if (savedReferencesData) {
      setReferencesData(savedReferencesData);
    }

    const savedPdfContent = localStorage.getItem("pdfContent");
    if (savedPdfContent) {
      setPdfContent(savedPdfContent);
    }

    const savedContent = localStorage.getItem("lectureContent");
    if (savedContent) {
      setContent(savedContent);
    }

    const savedVideoUrl = localStorage.getItem("videoUrl");
    if (savedVideoUrl) {
      setVideoUrl(savedVideoUrl);
    }

    // Initialize chat data from localStorage or a default prompt
    const savedChat = JSON.parse(localStorage.getItem("chat"));
    if (savedChat) {
      setChat(savedChat);
    }
  }, []);

  // Handle card navigation
  const handleCardClick = (section) => {
    switch (section) {
      case "chatbot":
        navigate("/chatbot");
        break;
      case "quiz":
        navigate("/quiz");
        break;
      case "flashcards":
        navigate("/flashcards");
        break;
      case "furtherKnowledge":
        navigate("/further-knowledge");
        break;
      default:
        break;
    }
  };

  return (
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen" : "bg-gray-100 text-black min-h-screen"}>
      {/* Navbar */}
  
      <div className="p-6 max-w-screen-xl mx-auto">
        {/* Lecture Summary Section */}
        <h1 className="text-4xl font-bold text-center mt-12 leading-tight">Lecture Video Generator</h1>
        <p className="text-center mt-4 mb-12">
          Upload a PDF or PPT file to generate a video explanation of your lecture{" "}
          <span className={darkMode ? "text-gray-700" : "text-gray-400"}>(Make sure your lecture is detailed enough)</span>
        </p>

        {/* File Upload */}
        <div className="flex items-center justify-center w-full my-12">
          {!processingStatus && (
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-blue-900 ${
                darkMode ? "bg-gray-800 hover:bg-gray-600" : "bg-gray-50 hover:bg-blue-50"
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

        {/* Lecture Explanation with Zoom Effect */}
        {content && (
          <div
            className={`mt-12 mb-4 p-6 rounded-lg border border-gray-300 ${darkMode ? "bg-gray-800 text-white" : "bg-white"} hover:scale-105 transition-all duration-300`}
          >
            <h2 className="text-2xl font-semibold border-b-2 border-blue-600 pb-2">
              Speech Overview
            </h2>
            <p className="mt-2">{content}</p>
          </div>
        )}

        {/* Video with Zoom Effect */}
        {videoUrl && (
          <div
            className={darkMode ? "bg-gray-800 text-white mt-12 mb-4" : "bg-white mt-12 mb-4"}
          >
            <h2 className="text-2xl font-semibold border-b-2 border-blue-600 pb-2">
              Lecture Video
            </h2>
            <video
              className="w-full h-auto mt-2 rounded-lg shadow-lg border border-gray-300 hover:scale-105 transition-all duration-300"
              controls
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Card-based Navigation for Chatbot, Quiz, Flashcards, Further Knowledge */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 border-4 p-5 border-solid border-blue-700 rounded-2xl shadow-lg transition-all duration-300 bg-white">  
  {/* Chatbot Card */}  
  <div  
    onClick={() => handleCardClick("chatbot")}  
    className="cursor-pointer border rounded-xl p-6 shadow-lg transition-all duration-300 h-64 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-700 text-white group hover:shadow-xl"  
  >  
    <i className="fas fa-comments text-6xl mt-12 transition-transform duration-200 transform group-hover:scale-75 group-hover:-translate-y-4 group-hover:mt-2"></i>  
    <h2 className="text-3xl font-bold text-center mt-6 transition-transform duration-200 transform group-hover:scale-80 group-hover:-translate-y-4 group-hover:mt-2">Chatbot</h2>  
    <p className="text-center mt-2 transition-transform duration-200 transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:mt-2">Ask questions and get answers for to your lecture</p>  
  </div>  

  {/* Quiz Card */}  
  <div  
    onClick={() => handleCardClick("quiz")}  
    className="cursor-pointer border rounded-xl p-6 shadow-lg transition-all duration-200 h-64 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 text-white group hover:shadow-xl"  
  >  
    <i className="fas fa-question-circle text-6xl mt-12 transition-transform duration-200 transform group-hover:scale-75 group-hover:-translate-y-4 group-hover:mt-2"></i>  
    <h2 className="text-3xl font-bold text-center mt-6 transition-transform duration-200 transform group-hover:scale-80 group-hover:-translate-y-4 group-hover:mt-2">Quiz</h2>  
    <p className="text-center mt-2 transition-transform duration-300 transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:mt-2">Test your knowledge with interactive quiz questions.</p>  
  </div>  

  {/* Flashcards Card */}  
  <div  
    onClick={() => handleCardClick("flashcards")}  
    className="cursor-pointer border rounded-xl p-6 shadow-lg transition-all duration-300 h-64 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-500 text-white group hover:shadow-xl "  
  >  
    <i className="fas fa-file-alt text-6xl mt-12 transition-transform duration-200 transform group-hover:scale-75 group-hover:-translate-y-4 group-hover:mt-2"></i>  
    <h2 className="text-3xl font-bold text-center mt-6 transition-transform duration-200 transform group-hover:scale-80 group-hover:-translate-y-4 group-hover:mt-2" >Flashcards</h2>  
    <p className="text-center mt-2 transition-transform duration-200 transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:mt-2">Review important concepts using flashcards.</p>  
  </div>  

  {/* Further Knowledge Card */}  
  <div  
    onClick={() => handleCardClick("furtherKnowledge")}  
    className="cursor-pointer border rounded-xl p-6 shadow-lg transition-all duration-300 h-64 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-700 text-white group hover:shadow-xl "  
  >  
    <i className="fas fa-book-open text-6xl mt-12 transition-transform duration-300 transform group-hover:scale-75 group-hover:-translate-y-4 group-hover:mt-2"></i>  
    <h2 className="text-3xl font-bold text-center mt-6 transition-transform duration-300 transform group-hover:scale-80 group-hover:-translate-y-4 group-hover:mt-2">Further Knowledge</h2>  
    <p className="text-center mt-2 transition-transform duration-300 transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:mt-2">Explore additional resources and references.</p>  
  </div>  
</div>  
      </div>
    </div>
  );
};

export default Home;
