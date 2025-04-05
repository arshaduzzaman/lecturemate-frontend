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

