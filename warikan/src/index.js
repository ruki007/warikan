import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectNameInput from './ProjectNameInput';
import MemberInput from './MemberInput';
import ExpenseForm from './ExpenseForm';
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig';
import './index.css';

const Home = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Warika</h1>
      <div>
        <a href="/new-game">
          <button>New game</button>
        </a>
      </div>
      <div>
        <a href="/load-game">
          <button>Load game</button>
        </a>
      </div>
    </div>
  );
};

const App = () => {
  const [projectName, setProjectName] = useState('');
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmingMembers, setConfirmingMembers] = useState(false);
  const [membersConfirmed, setMembersConfirmed] = useState(false);

  const handleProjectCreated = (name) => {
    setProjectName(name);
  };

  const handleMembersCreated = (members) => {
    setMembers(members);
    setConfirmingMembers(true);
  };

  const handleConfirmMembers = () => {
    setConfirmingMembers(false);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMembersConfirmed(true);
    }, 3000);
  };

  const handleContinueProject = async () => {
    setLoading(true);
    try {
      const projectRef = doc(db, "projects", projectName);
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        setProjectName(projectData.name);
        setMembers(projectData.members);
        setExpenses(projectData.expenses || []);
        setMembersConfirmed(true);
      } else {
        alert('プロジェクトが見つかりません');
      }
    } catch (error) {
      alert('エラーが発生しました: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/new-game"
          element={
            !projectName ? (
              <ProjectNameInput onProjectCreated={handleProjectCreated} />
            ) : !membersConfirmed ? (
              confirmingMembers ? (
                <div>
                  <h1>このメンバーでよろしいですかな?</h1>
                  <ul>
                    {members.map((member, index) => (
                      <li key={index}>{member}</li>
                    ))}
                  </ul>
                  <button onClick={handleConfirmMembers}>Yes</button>
                </div>
              ) : (
                <MemberInput projectName={projectName} onMembersCreated={handleMembersCreated} />
              )
            ) : loading ? (
              <div>
                <h1>Now loading...</h1>
                <div className="progress-bar">
                  <div className="progress"></div>
                </div>
              </div>
            ) : (
              <div>
                <h1>Team Name: {projectName}</h1>
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
            )
          }
        />
        <Route
          path="/load-game"
          element={
            loading ? (
              <div>
                <h1>Now loading...</h1>
                <div className="progress-bar">
                  <div className="progress"></div>
                </div>
              </div>
            ) : membersConfirmed ? (
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
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h1>Write Your Project</h1>
                <input
                  type="text"
                  value={projectName || ''}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
                <div>
                  <button onClick={handleContinueProject}>Go</button>
                </div>
              </div>
            )
          }
        />
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