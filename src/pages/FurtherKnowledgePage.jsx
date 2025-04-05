import { useEffect, useState } from "react";

const FurtherKnowledgePage = ({darkMode}) => {
  const [referencesData, setReferencesData] = useState([]);

  useEffect(() => {
    const savedReferencesData = JSON.parse(localStorage.getItem("referencesData"));
    if (savedReferencesData) {
      setReferencesData(savedReferencesData);
    }
  }, []);

  return (
    <div  className={`mt-20 mb-10 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} shadow-lg transition duration-300 ease-in-out`}>
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r   from-purple-500 to-purple-700 text-white hover:shadow-xl border-4 border-solid border-purple-500 p-4 rounded-lg shadow-lg mb-6">
        Further Knowledge</h1>
      <div className="mt-6 space-y-5 p-4">
        {referencesData.map((refItem, idx) => (
          <div key={idx} className="flex flex-col border rounded-lg p-4 shadow-md hover:shadow-xl">
            <a
              href={refItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-700 hover:underline"
            >
              {refItem.url}
            </a>
            <p className={`text-sm mt-1 ${darkMode ? 'text-white' : 'text-gray-600'}`}>{refItem.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FurtherKnowledgePage;

  