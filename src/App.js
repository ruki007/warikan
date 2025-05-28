import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ProjectNameInput from './ProjectNameInput';
import MemberInput from './MemberInput';
import ExpenseForm from './ExpenseForm';
import { db } from './firebaseConfig';
import { doc, getDoc } from "firebase/firestore";

// メインアプリコンポーネント
const AppContent = () => {
  const navigate = useNavigate();

  const handleProjectCreated = (name) => {
    console.log('プロジェクト作成完了:', name);
    // MemberInputページに遷移
    navigate(`/project/${encodeURIComponent(name)}/members`);
  };

  const handleMembersCreated = (memberList, projectName) => {
    console.log('メンバー作成完了:', memberList);
    // ExpenseFormページに遷移
    navigate(`/project/${encodeURIComponent(projectName)}/expenses`);
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={<ProjectNameInput onProjectCreated={handleProjectCreated} />} 
      />
      <Route 
        path="/project/:projectName/members" 
        element={<MemberInputWrapper onMembersCreated={handleMembersCreated} />} 
      />
      <Route 
        path="/project/:projectName/expenses" 
        element={<ExpenseFormWrapper />} 
      />
      <Route 
        path="/shared/:documentId" 
        element={<SharedProject />} 
      />
    </Routes>
  );
};

// MemberInputのラッパーコンポーネント
const MemberInputWrapper = ({ onMembersCreated }) => {
  const { projectName } = useParams();
  const navigate = useNavigate();

  const handleBackToProject = () => {
    navigate('/');
  };

  const handleMembersCreatedLocal = (memberList) => {
    onMembersCreated(memberList, projectName);
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
        onMembersCreated={handleMembersCreatedLocal}
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

// 共有プロジェクト表示コンポーネント
const SharedProject = () => {
  const { documentId } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedProject = async () => {
      try {
        const projectRef = doc(db, "projects", documentId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          setProjectData(projectDoc.data());
        } else {
          setError('共有プロジェクトが見つかりません');
        }
      } catch (error) {
        console.error('共有プロジェクト取得エラー:', error);
        setError('データの取得中にエラーが発生しました: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedProject();
  }, [documentId]);

  if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>読み込み中...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>{error}</div>;
  if (!projectData) return <div style={{ textAlign: 'center', padding: '20px' }}>プロジェクトが見つかりません</div>;

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>共有プロジェクト: {projectData.name}</h1>
      <ExpenseForm 
        projectName={documentId}
        members={projectData.members || []}
      />
    </div>
  );
};

// メインAppコンポーネント
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;