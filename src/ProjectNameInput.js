import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

const ProjectNameInput = ({ onProjectCreated }) => {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("name", "==", projectName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setError('同じ名前の物があります。異なる名前を使用してください');
    } else {
      await setDoc(doc(db, "projects", projectName), { name: projectName });
      
      // onProjectCreatedが関数として存在する場合のみ呼び出す
      if (typeof onProjectCreated === 'function') {
        onProjectCreated(projectName);
      } else {
        // プロジェクト作成後は、メンバー入力画面に移動
        window.location.href = `/warikan/member-input/${projectName}`;
      }
    }
  };

  return (
    <div>
      <h1>Input your project name</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
        />
        <button type="submit">Make</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ProjectNameInput;