import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { doc, getDoc, updateDoc } from "firebase/firestore";

const MemberInput = ({ projectName, onMembersCreated }) => {
  const [members, setMembers] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMember = () => {
    setMembers([...members, '']);
  };

  const handleRemoveMember = (index) => {
    if (members.length > 1) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
    }
  };

  const handleMemberChange = (index, value) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);

    try {
      // 空のメンバーを除外し、重複を排除
      const filteredMembers = [...new Set(members.filter(member => member.trim() !== ''))];
      
      if (filteredMembers.length === 0) {
        setError('少なくとも1人のメンバーを入力してください');
        setLoading(false);
        return;
      }

      const projectRef = doc(db, "projects", projectName);
      const projectDoc = await getDoc(projectRef);

      if (projectDoc.exists()) {
        await updateDoc(projectRef, {
          members: filteredMembers
        });
      } else {
        setError('プロジェクトが見つかりません');
        setLoading(false);
        return;
      }

      // 成功時にローディングを停止してからコールバック実行
      setLoading(false);
      onMembersCreated(filteredMembers);
    } catch (error) {
      setError('エラーが発生しました: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div>
          <h1>メンバーを設定中...</h1>
          <div className="progress-bar">
            <div className="progress"></div>
          </div>
        </div>
      ) : (
        <div>
          <h1>Input your members</h1>
          <p>プロジェクト: {projectName}</p>
          <form onSubmit={handleSubmit}>
            {members.map((member, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  placeholder={`メンバー ${index + 1}`}
                  required
                />
                {members.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveMember(index)}
                    style={{ marginLeft: '5px' }}
                  >
                    削除
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddMember}>+ メンバーを追加</button>
            <button type="submit">Make</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default MemberInput;