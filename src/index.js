import 'babel-polyfill'; // 必要なポリフィルを提供
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectNameInput from './ProjectNameInput';
import MemberInput from './MemberInput';
import ExpenseForm from './ExpenseForm';
import './index.css';

const Home = () => (
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

const NewGame = () => (
  <ProjectNameInput onProjectCreated={(name) => console.log(name)} />
);

const LoadGame = () => (
  <div style={{ textAlign: 'center' }}>
    <h1>Write Your Project</h1>
    <input
      type="text"
      placeholder="Enter project name"
      required
    />
    <div>
      <button>Go</button>
    </div>
  </div>
);

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new-game" element={<NewGame />} />
      <Route path="/load-game" element={<LoadGame />} />
      <Route path="/expense-form" element={<ExpenseForm projectName="Sample" members={[]} />} />
    </Routes>
  </Router>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);