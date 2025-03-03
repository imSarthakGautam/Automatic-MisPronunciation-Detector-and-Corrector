import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import CheckPronunciations from './pages/CheckPronunciations';
import PracticeOnSamples from './pages/practiceOnSamples';
//import About from './pages/About';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/check-pronunciations" element={<CheckPronunciations />} />
        <Route path="/practice-samples" element={<PracticeOnSamples />} />
        {/*<Route path="/about" element={<About />} /> */}
      </Route>
    </Routes>
  );
}

export default App;

/*
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Add other routes like /about here if needed */ /*}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;


Changes and Reasoning:
Introduced: 
Used react-router-dom to manage navigation (e.g., "Home" and "About" links from the screenshots).
Wrapped the app in a Layout component to handle the sidebar and main content structure, aligning with Image 1’s design.

Why: 
The mockup and screenshots suggest a consistent layout across pages, with a sidebar on the left. Layout.jsx centralizes this, making App.jsx focus solely on routing.

*/