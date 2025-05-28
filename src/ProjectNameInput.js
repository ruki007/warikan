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

      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("name", "==", projectName.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError('同じ名前のプロジェクトが既に存在します。異なる名前を使用してください');
        setLoading(false);
        return;
      }

      // プロジェクトの初期データを作成
      await setDoc(doc(db, "projects", projectName.trim()), { 
        name: projectName.trim(),
        members: [],
        expenses: [],
        createdAt: new Date()
      });
      
      setLoading(false);
      
      // onProjectCreatedが関数として存在する場合のみ呼び出す
      if (typeof onProjectCreated === 'function') {
        onProjectCreated(projectName.trim());
      }
    } catch (error) {
      setError('エラーが発生しました: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div>
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
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="プロジェクト名を入力"
              required
            />
            <button type="submit">Make</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default ProjectNameInput;