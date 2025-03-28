import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
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
        <Link to="/new-game">
          <button>New game</button>
        </Link>
      </div>
      <div>
        <Link to="/load-game">
          <button>Load game</button>
        </Link>
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
        const docId = querySnapshot.docs[0].id; // 一致するドキュメントのIDを取得
        navigate(`/load-game/${docId}`); // ドキュメントIDをリンクに追加して遷移
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

const LoadGameWithId = () => {
  const { documentId } = useParams(); // URL パラメータから documentId を取得
  const [projectName, setProjectName] = useState('');
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectRef = doc(db, "projects", documentId);
        const projectDoc = await getDoc(projectRef);
        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          setProjectName(projectData.name);
          setMembers(projectData.members);
          setExpenses(projectData.expenses || []);
        } else {
          alert('プロジェクトが見つかりません');
        }
      } catch (error) {
        alert('エラーが発生しました: ' + error.message);
      }
      setLoading(false);
    };

    fetchProject();
  }, [documentId]);

  if (loading) {
    return (
      <div>
        <h1>Now loading...</h1>
        <div className="progress-bar">
          <div className="progress"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Team name: {projectName}</h1>
      <ExpenseForm projectName={projectName} members={members} />
      <h2>Record</h2>
      <ul>
        {expenses.map((expense, index) => (
          <li key={index}>
            {expense.payer} pays {expense.amount} yen to {expense.payees.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/warikan">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-game" element={<ProjectNameInput />} />
        <Route path="/load-game" element={<LoadGame />} />
        <Route path="/load-game/?project=documentId" element={<LoadGameWithId />} />
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