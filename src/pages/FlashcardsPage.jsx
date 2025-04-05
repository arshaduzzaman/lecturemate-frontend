import { useState, useEffect } from "react";
import Flashcards from "../components/Flashcards";

const FlashcardsPage = ({darkMode}) => {
  const [flashcardsData, setFlashcardsData] = useState([]);

  useEffect(() => {
    const savedFlashcards = JSON.parse(localStorage.getItem("flashcardsData"));
    if (savedFlashcards) {
      setFlashcardsData(savedFlashcards);
    }
  }, []);

  return (
    <div className={`mt-10  rounded-lg shadow-xl  ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} transition duration-300 ease-in-out`} >
      <h1 className="text-4xl font-bold text-center  bg-gradient-to-r from-yellow-400 to-yellow-500  text-white p-4 rounded-lg shadow-lg mb-6">
        Flashcards</h1>
      <Flashcards flashcardsData={flashcardsData} darkMode={false} />
    </div>
  );
};

export default FlashcardsPage;

