// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar       from './components/Sidebar';
import Dashboard     from './pages/Dashboard';
import AddRisk       from './pages/AddRisk';
import ViewRisks     from './pages/ViewRisks';
import ChartsHeatmap from './pages/ChartsHeatmap';
import ReviewExport  from './pages/ReviewExport';
import RiskDetail    from './pages/RiskDetail';

function App() {
  return (
    <div className="flex h-screen bg-white">
      <Router>
        <Sidebar />
        <div className="flex-grow p-6 overflow-auto">
          <Routes>
            <Route path="/"               element={<Dashboard />} />
            <Route path="/add-risk"       element={<AddRisk />} />
            <Route path="/view-risks"     element={<ViewRisks />} />
            <Route path="/review-export"  element={<ReviewExport />} />
            <Route path="/risks/:id"      element={<RiskDetail />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;