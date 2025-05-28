import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

const ProjectNameInput = ({ onProjectCreated }) => {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!projectName.trim()) {
        setError('プロジェクト名を入力してください');
        setLoading(false);
        return;
      }

      const trimmedProjectName = projectName.trim();
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("name", "==", trimmedProjectName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('同じ名前のプロジェクトが既に存在します。異なる名前を使用してください');
        setLoading(false);
        return;
      }

      // プロジェクトの初期データを作成
      await setDoc(doc(db, "projects", trimmedProjectName), { 
        name: trimmedProjectName,
        members: [],
        expenses: [],
        createdAt: new Date()
      });
      
      setLoading(false);
      
      // コールバック関数を呼び出してプロジェクト作成完了を通知
      if (typeof onProjectCreated === 'function') {
        onProjectCreated(trimmedProjectName);
      }
    } catch (error) {
      console.error('プロジェクト作成エラー:', error);
      setError('エラーが発生しました: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {loading ? (
        <div>
          <h1>プロジェクトを作成中...</h1>
          <div className="progress-bar">
            <div className="progress"></div>
          </div>
        </div>
      ) : (
        <div>
          <h1>Input your project name</h1>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="プロジェクト名を入力"
                required
                style={{
                  padding: '10px',
                  fontSize: '16px',
                  width: '300px',
                  marginRight: '10px'
                }}
              />
              <button 
                type="submit"
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
                Make
              </button>
            </div>
          </form>
          {error && (
            <p style={{ 
              color: 'red', 
              backgroundColor: '#ffebee', 
              padding: '10px', 
              borderRadius: '4px',
              margin: '10px 0'
            }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectNameInput;