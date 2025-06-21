import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// 컴포넌트 임포트
import GrowPromiseLanding from './components/GrowPromiseLanding';


function App() {
 
  return (
    <Router>
      <div className="font-sans text-gray-800 overflow-x-hidden">
        <GrowPromiseLanding />
      </div>
    </Router>
  );
}

export default App;