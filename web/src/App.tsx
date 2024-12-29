import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WalletPage from './pages/WalletPage';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Routes>
    </Router>
  );
};

export default App;
