import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ParentPortal from './pages/ParentPortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ParentPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
