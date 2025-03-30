import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import ProfileForm from './pages/ProfileForm';
import MatchResults from './pages/MatchResults';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/results" element={<MatchResults />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;