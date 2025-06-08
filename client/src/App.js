import React, { useState, useEffect } from 'react';
     import PropTypes from 'prop-types';

     const App = () => {
       const [word, setWord] = useState('');
       const [sentence, setSentence] = useState('');
       const [result, setResult] = useState(null);
       const [matches, setMatches] = useState([]);
       const [selectedWord, setSelectedWord] = useState(null);
       const [error, setError] = useState('');
       const [loading, setLoading] = useState(false);

       const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

       // Handle single-word lookup
       const handleWordSubmit = async (e) => {
         e.preventDefault();
         setLoading(true);
         setError('');
         setResult(null);
         setSelectedWord(null);

         try {
           const response = await fetch(`${API_URL}/lookup`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ word })
           });
           const data = await response.json();
           setResult(data);
         } catch (err) {
           setError('Error connecting to the server. Please ensure the Flask server is running.');
         } finally {
           setLoading(false);
         }
       };

       // Handle sentence input and detect matches
       useEffect(() => {
         if (sentence.trim()) {
           setLoading(true);
           setError('');
           setMatches([]);
           setSelectedWord(null);
           setResult(null);

           fetch(`${API_URL}/detect`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ sentence })
           })
             .then(response => response.json())
             .then(data => {
               setMatches(data.matches);
               setLoading(false);
             })
             .catch(err => {
               setError('Error processing sentence. Please ensure the Flask server is running.');
               setLoading(false);
             });
         } else {
           setMatches([]);
           setSelectedWord(null);
           setResult(null);
         }
       }, [sentence]);

       // Handle clicking a hyperlinked word
       const handleWordClick = (matchedWord, data) => {
         setSelectedWord(matchedWord);
         setResult({ found: true, data });
       };

       // Handle clear button click
       const handleClear = () => {
         setSentence('');
         setMatches([]);
         setSelectedWord(null);
         setResult(null);
       };

       // Render sentence with hyperlinked matched words
       const renderSentenceWithLinks = () => {
         if (!sentence.trim()) return null;
         let parts = sentence.split(/(\b\w+\b)/);
         return parts.map((part, index) => {
           const match = matches.find(m => m.word.toLowerCase() === part.toLowerCase());
           if (match) {
             return (
               <a
                 key={index}
                 href="#"
                 className="text-blue-600 underline font-semibold"
                 onClick={(e) => {
                   e.preventDefault();
                   handleWordClick(match.matched_word, match.data);
                 }}
               >
                 {part}
               </a>
             );
           }
           return <span key={index}>{part}</span>;
         });
       };

       return (
         <div className="container mx-auto p-6 max-w-4xl">
           <h1 className="text-3xl font-bold text-blue-800 mb-6">CDSF Word Lookup</h1>

           {/* Single Word Lookup */}
           <div className="bg-white p-6 rounded-lg shadow-md mb-6">
             <h2 className="text-xl font-semibold text-gray-700 mb-4">Single Word Lookup</h2>
             <form onSubmit={handleWordSubmit} className="flex flex-col gap-4">
               <label htmlFor="word-input" className="text-lg font-semibold text-gray-700">
                 Enter a Word
               </label>
               <input
                 id="word-input"
                 type="text"
                 value={word}
                 onChange={(e) => setWord(e.target.value)}
                 placeholder="e.g., salvage, grace"
                 className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <button
                 type="submit"
                 disabled={loading}
                 className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
               >
                 {loading ? 'Searching...' : 'Search'}
               </button>
             </form>
           </div>

           {/* Sentence Input */}
           <div className="bg-white p-6 rounded-lg shadow-md mb-6">
             <h2 className="text-xl font-semibold text-gray-700 mb-4">Sentence Analysis</h2>
             <label htmlFor="sentence-input" className="text-lg font-semibold text-gray-700">
               Enter or Paste a Sentence
             </label>
             <textarea
               id="sentence-input"
               value={sentence}
               onChange={(e) => setSentence(e.target.value)}
               placeholder="e.g., The grace and virtue of the knight inspired hope."
               className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
             />
             <div className="flex gap-4 mt-4">
               <button
                 onClick={handleClear}
                 className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
               >
                 Clear
               </button>
             </div>
             <p className="text-sm text-gray-600 mt-2">
               This application uses Natural Language Processing (NLP) techniques, including a lookup-based model with fuzzy matching, to detect and analyze words.
             </p>
             {sentence.trim() && (
               <div className="mt-4">
                 <p className="text-gray-700 font-semibold">Detected Words:</p>
                 <p className="text-gray-700">{renderSentenceWithLinks()}</p>
               </div>
             )}
           </div>

           {/* Error Message */}
           {error && (
             <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
               {error}
             </div>
           )}

           {/* Selected Word and CDSF Table */}
           {selectedWord && result && result.found && (
             <div className="bg-white p-6 rounded-lg shadow-md mb-6">
               <p className="text-lg font-semibold text-gray-700 mb-4">
                 "{selectedWord}" is selected word
               </p>
               <h2 className="text-2xl font-semibold text-blue-600 mb-4">CDSF Analysis for "{selectedWord}"</h2>
               <table className="w-full border-collapse">
                 <thead>
                   <tr className="bg-blue-100">
                     <th className="border p-2 text-left">CDSF Layer</th>
                     <th className="border p-2 text-left">Details</th>
                   </tr>
                 </thead>
                 <tbody>
                   {Object.entries(result.data).map(([layer, details]) => (
                     <tr key={layer} className="border-b">
                       <td className="border p-2 font-medium">{layer}</td>
                       <td className="border p-2">{details}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}

           {/* Single Word Result */}
           {result && !selectedWord && (
             <div className="bg-white p-6 rounded-lg shadow-md">
               {result.found ? (
                 <div>
                   <h2 className="text-2xl font-semibold text-blue-600 mb-4">CDSF Analysis for "{word}"</h2>
                   <table className="w-full border-collapse">
                     <thead>
                       <tr className="bg-blue-100">
                         <th className="border p-2 text-left">CDSF Layer</th>
                         <th className="border p-2 text-left">Details</th>
                       </tr>
                     </thead>
                     <tbody>
                       {Object.entries(result.data).map(([layer, details]) => (
                         <tr key={layer} className="border-b">
                           <td className="border p-2 font-medium">{layer}</td>
                           <td className="border p-2">{details}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <p className="text-gray-700">{result.message}</p>
               )}
             </div>
           )}
         </div>
       );
     };

     App.propTypes = {
       // Define propTypes if needed (currently unused)
     };

     export default App;