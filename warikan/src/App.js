import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home'; // ホームページ用のコンポーネント
import NewGame from './NewGame'; // 新しいゲーム用のコンポーネント
import LoadGame from './LoadGame'; // ゲームをロードするコンポーネント

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new-game" element={<NewGame />} />
      <Route path="/load-game" element={<LoadGame />} />
    </Routes>
  );
};

export default App;