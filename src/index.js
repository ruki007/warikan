import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import ProjectNameInput from './ProjectNameInput';
import MemberInput from './MemberInput';
import ExpenseForm from './ExpenseForm';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig';
import './index.css';

const Home = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Warika</h1>
      <div>
        <button onClick={() => window.location.href = "/new-game"}>New game</button>
        <button onClick={() => window.location.href = "/load-game"}>Load game</button>
      </div>
    </div>
  );
};

const LoadGame = () => {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    setError('');
    try {
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("name", "==", projectName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        navigate(`/load-game/${projectName}`); // プロジェクト名をリンクに追加して遷移
      } else {
        setError('プロジェクトが見つかりません');
      }
    } catch (error) {
      setError('エラーが発生しました: ' + error.message);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Load Game</h1>
      <div>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="プロジェクト名を入力"
        />
        <button onClick={handleSearch}>検索</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

const LoadGameWithProjectName = () => {
  const { projectName } = useParams(); // URL パラメータから projectName を取得
  return <ExpenseForm projectName={projectName} />;
};

const App = () => {
  return (
    <Router basename="/warikan">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-game" element={<ProjectNameInput />} />
        <Route path="/load-game" element={<LoadGame />} />
        <Route path="/load-game/:projectName" element={<LoadGameWithProjectName />} />
      </Routes>
    </Router>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);