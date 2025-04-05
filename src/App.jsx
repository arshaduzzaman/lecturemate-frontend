import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import { useState } from 'react';  
import Layout from "./components/Layout"; // Ensure this path is correct  
import Home from "./pages/Home";  
import ChatbotPage from "./pages/ChatbotPage";  
import QuizPage from "./pages/QuizPage";  
import FlashcardsPage from "./pages/FlashcardsPage";  
import FurtherKnowledgePage from "./pages/FurtherKnowledgePage";  

function App() {  
  const [darkMode, setDarkMode] = useState(false);  

  const toggleDarkMode = () => {  
    setDarkMode((prev) => !prev);  
  };  

  return (  
    <Router>  
      <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>  
        <Routes>  
          <Route path="/" element={<Home darkMode={darkMode} />} />  
          <Route path="/chatbot" element={<ChatbotPage darkMode={darkMode} />} />  
          <Route path="/quiz" element={<QuizPage darkMode={darkMode} />} />  
          <Route path="/flashcards" element={<FlashcardsPage darkMode={darkMode} />} />  
          <Route path="/further-knowledge" element={<FurtherKnowledgePage darkMode={darkMode} />} />  
        </Routes>  
      </Layout>  
    </Router>  
  );  
}  

export default App;  