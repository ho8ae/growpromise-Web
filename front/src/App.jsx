import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// 컴포넌트 임포트
import Hero from './components/Hero';


function App() {
 
  return (
    <Router>
      <div className="font-sans text-gray-800 overflow-x-hidden">
        <Hero />
      </div>
    </Router>
  );
}

export default App;