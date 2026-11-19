import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import About from './pages/About';
import Career from './pages/Career';
import Interests from './pages/Interests';
import Recipes from './pages/Recipes';
import MealPlanner from './pages/MealPlanner';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main className="main-content" style={{ flex: 1, padding: '2rem 0' }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/career" element={<Career />} />
            <Route path="/interests" element={<Interests />} />
            <Route path="/recipes" element={<MealPlanner />} />
            <Route path="/recipes/single" element={<Recipes />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

