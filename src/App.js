
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import ProjectNameInput from './ProjectNameInput';
import MemberInput from './MemberInput';
import ExpenseForm from './ExpenseForm';
import { db } from './firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

// ホームページコンポーネント
const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Warika</h1>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/new-game">
          <button style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '10px'
          }}>
            New game
          </button>
        </Link>
      </div>
      <div>
        <Link to="/load-game">
          <button style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '10px'
          }}>
            Load game
          </button>
        </Link>
      </div>
    </div>
  );
};

// ゲーム読み込みページ
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
        const docId = querySnapshot.docs[0].id;
        navigate(`/load-game/${docId}`);
      } else {
        setError('プロジェクトが見つかりません');
      }
    } catch (error) {
      setError('エラーが発生しました: ' + error.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Load Game</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="プロジェクト名を入力"
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '300px',
            marginRight: '10px'
          }}
        />
        <button 
          onClick={handleSearch}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          検索
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Link to="/">
        <button style={{
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          ← ホームに戻る
        </button>
      </Link>
    </div>
  );
};

// プロジェクト表示コンポーネント
const LoadGameWithId = () => {
  const { documentId } = useParams();
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
          setMembers(projectData.members || []);
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
      <div style={{ textAlign: 'center', padding: '20px' }}>
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
    </div>
  );
};

// 新規プロジェクト作成のラッパー
const NewGameWrapper = () => {
  const navigate = useNavigate();

  const handleProjectCreated = (name) => {
    console.log('プロジェクト作成完了:', name);
    navigate(`/project/${encodeURIComponent(name)}/members`);
  };

  return (
    <div>
      <Link to="/">
        <button style={{
          margin: '10px',
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          ← ホームに戻る
        </button>
      </Link>
      <ProjectNameInput onProjectCreated={handleProjectCreated} />
    </div>
  );
};

// MemberInputのラッパーコンポーネント
const MemberInputWrapper = () => {
  const { projectName } = useParams();
  const navigate = useNavigate();

  const handleMembersCreated = (memberList) => {
    console.log('メンバー作成完了:', memberList);
    navigate(`/project/${encodeURIComponent(projectName)}/expenses`);
  };

  const handleBackToProject = () => {
    navigate('/new-game');
  };

  return (
    <div>
      <button 
        onClick={handleBackToProject}
        style={{
          margin: '10px',
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ← プロジェクト名に戻る
      </button>
      <MemberInput 
        projectName={decodeURIComponent(projectName)}
        onMembersCreated={handleMembersCreated}
      />
    </div>
  );
};

// ExpenseFormのラッパーコンポーネント
const ExpenseFormWrapper = () => {
  const { projectName } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const decodedProjectName = decodeURIComponent(projectName);
        const projectRef = doc(db, "projects", decodedProjectName);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          const data = projectDoc.data();
          setMembers(data.members || []);
        } else {
          setError('プロジェクトが見つかりません');
        }
      } catch (error) {
        console.error('プロジェクトデータ取得エラー:', error);
        setError('データの取得中にエラーが発生しました: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectName) {
      fetchProjectData();
    }
  }, [projectName]);

  const handleBackToMembers = () => {
    navigate(`/project/${projectName}/members`);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>読み込み中...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;

  return (
    <div>
      <button 
        onClick={handleBackToMembers}
        style={{
          margin: '10px',
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ← メンバー設定に戻る
      </button>
      <ExpenseForm 
        projectName={decodeURIComponent(projectName)}
        members={members}
      />
    </div>
  );
};

// メインAppコンポーネント
const App = () => {
  return (
    <Router basename="/warikan">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-game" element={<NewGameWrapper />} />
        <Route path="/project/:projectName/members" element={<MemberInputWrapper />} />
        <Route path="/project/:projectName/expenses" element={<ExpenseFormWrapper />} />
        <Route path="/load-game" element={<LoadGame />} />
        <Route path="/load-game/:documentId" element={<LoadGameWithId />} />
        <Route path="/shared/:documentId" element={<LoadGameWithId />} />
      </Routes>
    </Router>
  );
};

export default App;