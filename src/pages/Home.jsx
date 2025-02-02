import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import axios from "axios";

const Home = () => {
  const [processingStatus, setProcessingStatus] = useState();
  const [content, setContent] = useState("");
  const [quizContent, setQuizContent] = useState([]);
  const [pdfContent, setPdfContent] = useState();
  const [input, setInput] = useState();
  const [videoUrl, setVideoUrl] = useState(
    "https://resource2.heygen.ai/video/964b6acd95294f80ad70d1c298456de7/1280x720.mp4"
  );
  const [chat, setChat] = useState([]);

  const handleFileUpload = async (event) => {
    const url = import.meta.env.VITE_URL;
    console.log(url);
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("pdfFile", file);

      try {
        setProcessingStatus("processing");
        const response = await axios.post(`${url}/extract-text`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(response.data.quiz);
        setQuizContent(
          response.data.quiz.map((quiz) => ({ ...quiz, answered: false }))
        );
        setPdfContent(response.data.pdfContent);
        setContent(response.data.text);
        const response2 = await axios.post(
          `${url}/generate-audio`,
          { text: response.data.text },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(response2.data);
        setVideoUrl(response2.data.videoUrl);

        setProcessingStatus("processed");
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
        setProcessingStatus("processed");
      }
    }
  };

  const handleAnswer = (index) => {
    setQuizContent((prevQuizContent) =>
      prevQuizContent.map((quiz, idx) =>
        idx === index ? { ...quiz, answered: true } : quiz
      )
    );
  };

  const getGptResponse = async (latestChat) => {
    if (pdfContent) {
      const url = import.meta.env.VITE_URL;
      const response = await axios.post(
        `${url}/get-response`,
        { chat: latestChat },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setChat((prevChat) => {
        return [
          ...prevChat,
          { role: "assistant", content: response.data.gptResponse },
        ];
      });
    }
  };

  useEffect(() => {
    setChat([
      {
        role: "system",
        content: `You are a helpful assistant. You have knowledge about the following content... When the user asks you about anything, try to answer it frmo the following lecture content and also use your own knowledge if required.\n\n Content: ${pdfContent}`,
      },
      {
        role: "assistant",
        content: "Please ask me any questions regarding your lecture!",
      },
    ]);
  }, [pdfContent]);

  return (
    <div className="p-4 max-w-[60rem] m-auto">
      <div className="flex flex-row justify-between">
        <div className="text-red-400 py-1 font-bold">Home</div>
        <div className="bg-red-400 p-1 text-white rounded-lg">Log Out</div>
      </div>
      <br />
      <p className="tracking-tight">
        Upload a pdf/ppt file to get a video explanation of your lecture.
      </p>
      <p className="text-gray-400 tracking-tight">
        (Make sure your the lecture is detailed enough)
      </p>
      <br />

      {!processingStatus && (
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
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
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
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
        </div>
      )}

      <br></br>
      {/* {pdfContent && <h1 className="text-lg font-bold">Speech</h1>}
      <br></br>
      {content && <p>{content}</p>} */}
      <br />
      {/* {processingStatus === "processing" && (
        <Loader text="Generating Video..." />
      )} */}

      {videoUrl && (
        <video width="100%" height="auto" controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      <br></br>
      {pdfContent && (
        <>
          <div className="bg-red-200 w-full h-80 overflow-auto rounded-lg pb-10">
            {chat.map((c) => {
              if (c.role != "system") {
                return (
                  <div className="w-full h-14 relative block py-2">
                    <p
                      className={`absolute m-4 p-2 rounded-lg bg-red-300 inline-block ${
                        c.role == "user" ? `right-0` : ``
                      }`}
                    >
                      {c.content}
                    </p>
                  </div>
                );
              }
            })}
          </div>
          <br></br>
          <div className="flex justify-between">
            <input
              onChange={(e) => {
                setInput(e.target.value);
              }}
              placeholder="Ask any questions"
              className="inline w-full bg-red-200 placeholder:text-gray-600 p-3 rounded"
            ></input>
            <button
              onClick={() => {
                setChat((prevChat) => {
                  return [...prevChat, { role: "user", content: input }];
                });
                getGptResponse([...chat, { role: "user", content: input }]);
              }}
              className="p-4 bg-red-300 text-red-900 ml-2"
            >
              Send
            </button>
          </div>
        </>
      )}
      <br />
      {quizContent && quizContent.length > 0 && (
        <h1 className="text-lg font-bold">Quiz</h1>
      )}
      <br />
      {quizContent.map((quiz, index) => {
        return (
          <div key={index}>
            <p className="font-bold">{quiz.question}</p>
            {["option_a", "option_b", "option_c", "option_d"].map(
              (optionKey) => (
                <div
                  key={optionKey}
                  className={`block ${
                    quiz.answered && quiz.correct_answer === optionKey
                      ? `font-bold text-green-600`
                      : quiz.answered && quiz.correct_answer != optionKey
                      ? `font-bold text-red-600`
                      : `text-black`
                  }`}
                >
                  <input type="checkbox" onChange={() => handleAnswer(index)} />
                  {console.log(optionKey)}
                  {console.log(quiz.correct_answer)}
                  <p className="inline ml-2">{quiz[optionKey]}</p>
                </div>
              )
            )}
            <br />
          </div>
        );
      })}
    </div>
  );
};

export default Home;
