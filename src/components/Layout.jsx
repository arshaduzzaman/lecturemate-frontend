 import React from 'react';  
import { Moon, Sun } from 'lucide-react'; // Adjust this import to your icon path  

const Layout = ({ children, darkMode, toggleDarkMode }) => {  
  return (  
    <div className={darkMode ? "bg-gray-900 min-h-screen" : "bg-white min-h-screen"}>  
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
      <main className="p-6 max-w-screen-xl mx-auto">  
        {children}  
      </main>  
    </div>  
  );  
};  

export default Layout;  