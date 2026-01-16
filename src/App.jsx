import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScreenplayGenerator from './ScreenplayGenerator';
import ScreenplayPlayer from './ScreenplayPlayer';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <AppHeader />
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ScreenplayGenerator />} />
              <Route path="/player" element={<ScreenplayPlayer />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
