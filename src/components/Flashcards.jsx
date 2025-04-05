// Flashcards.jsx  

import { Bold } from "lucide-react";
import React from "react";  
import { FlashcardArray } from "react-quizlet-flashcard";  

const Flashcards = ({ flashcardsData, darkMode }) => {  
  if (!flashcardsData || flashcardsData.length === 0) {  
    return <p>No flashcards available yet.</p>;  
  }  

  // Map your flashcards data to the new format expected by FlashcardArray  
  const cards = flashcardsData.map((flashcard, index) => ({  
    id: index,  
    frontHTML: <div>{flashcard.question}</div>,  
    backHTML: <div>{flashcard.answer}</div>,  
  }));  

  // Define styles based on dark mode  
  const frontCardStyle = {  
    backgroundColor: darkMode ? '#2D3748' : '#FFFFFF', // Dark mode vs light mode background  
    color: darkMode ? '#FFFFFF' : '#000000',         // Text color  
    padding: '16px',  
    borderRadius: '8px',  
    textAlign: 'center',       // Center text horizontally  
    fontSize: '24px',          // Larger font size  
    textWidth: '100%',         // Full width textß
  
  };  

  const backCardStyle = {  
    backgroundColor: darkMode ? '#4A5568' : '#F7FAFC', // Dark mode vs light mode background  
    color: darkMode ? '#FFFFFF' : '#000000',          // Text color  
    padding: '16px',  
    borderRadius: '8px',  
    textAlign: 'center',       // Center text horizontally  
    fontSize: '24px',          // Larger font size  
   
  };  

  return (  
    <div className="w-full flex flex-col items-center h-full">     
      <FlashcardArray   
        cards={cards}   
        controls={true} // Enable navigation controls  
        frontCardStyle={frontCardStyle} // Style for front of card  
        backCardStyle={backCardStyle}    // Style for back of card  
        frontContentStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }} // Center front content  
        backContentStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center',  }} // Center back content 
      />  
    </div>  
  );  
};  

export default Flashcards;  

// // Flashcards.jsx

// import React, { useState } from "react";

// const Flashcard = ({ flashcard, darkMode }) => {
//   const [flipped, setFlipped] = useState(false);

//   // No fixed height, so text can expand. 
//   // We manually apply dark/light classes with a conditional.
//   const cardBase = `
//     w-72
//     border
//     rounded-lg
//     p-4
//     shadow-md
//     cursor-pointer
//     transform hover:scale-105
//     transition duration-200
//     flex items-center
//     justify-center
//     whitespace-normal
//     break-words
//     text-center
//   `;

//   const cardStyles = darkMode
//     ? "bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
//     : "bg-white text-black border-gray-300 hover:bg-gray-100";

//   return (
//     <div
//       className={`${cardBase} ${cardStyles}`}
//       onClick={() => setFlipped(!flipped)}
//     >
//       <div className="text-base font-bold">
//         {flipped ? flashcard.answer : flashcard.question}
//       </div>
//     </div>
//   );
// };

// const Flashcards = ({ flashcardsData, darkMode }) => {
//   const [slideIndex, setSlideIndex] = useState(0);
//   const cardsPerSlide = 3;

//   if (!flashcardsData || flashcardsData.length === 0) {
//     return <p>No flashcards available yet.</p>;
//   }

//   const totalSlides = Math.ceil(flashcardsData.length / cardsPerSlide);
//   const startIndex = slideIndex * cardsPerSlide;
//   const currentCards = flashcardsData.slice(startIndex, startIndex + cardsPerSlide);

//   // Use quiz-like dark/light button styling:
//   const buttonBase = "px-4 py-2 rounded transition duration-200";
//   const buttonStyles = darkMode
//     ? "bg-gray-800 text-white hover:bg-gray-700"
//     : "bg-gray-300 text-black hover:bg-gray-400";

//   const handlePrev = () => {
//     setSlideIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
//   };

//   const handleNext = () => {
//     setSlideIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
//   };

//   return (
//     <div className="w-full flex flex-col items-center">
//       {/* Carousel Row */}
//       <div className="flex overflow-hidden justify-center items-start space-x-4 mb-4">
//         {currentCards.map((flashcard, index) => (
//           <Flashcard key={index} flashcard={flashcard} darkMode={darkMode} />
//         ))}
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex gap-4">
//         <button onClick={handlePrev} className={`${buttonBase} ${buttonStyles}`}>
//           Prev
//         </button>
//         <button onClick={handleNext} className={`${buttonBase} ${buttonStyles}`}>
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Flashcards;


