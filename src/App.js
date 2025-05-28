import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ProjectNameInput from './ProjectNameInput';
import MemberInput from './MemberInput';
import ExpenseForm from './ExpenseForm';
import { db } from './firebaseConfig';
import { doc, getDoc } from "firebase/firestore";

// メインアプリコンポーネント
const AppContent = () => {
  const [projectName, setProjectName] = useState('');
  const [members, setMembers] = useState([]);
  const navigate = useNavigate();

  const handleProjectCreated = (name) => {
    setProjectName(name);
    navigate(`/project/${name}/members`);
  };

  const handleMembersCreated = (memberList) => {
    setMembers(memberList);
    navigate(`/project/${projectName}/expenses`);
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

  return (
    <div>
      <button onClick={handleBackToProject}>← プロジェクト名に戻る</button>
      <MemberInput 
        projectName={projectName}
        onMembersCreated={onMembersCreated}
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
        const projectRef = doc(db, "projects", projectName);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          const data = projectDoc.data();
          setMembers(data.members || []);
        } else {
          setError('プロジェクトが見つかりません');
        }
      } catch (error) {
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

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <button onClick={handleBackToMembers}>← メンバー設定に戻る</button>
      <ExpenseForm 
        projectName={projectName}
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
        setError('データの取得中にエラーが発生しました: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedProject();
  }, [documentId]);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!projectData) return <div>プロジェクトが見つかりません</div>;

  return (
    <div>
      <h1>共有プロジェクト: {projectData.name}</h1>
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