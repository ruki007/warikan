import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const MemberInput = ({ projectName, onMembersCreated }) => {
  const [members, setMembers] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMember = () => {
    setMembers([...members, '']);
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
      const projectRef = doc(db, "projects", projectName);
      const projectDoc = await getDoc(projectRef);

      if (projectDoc.exists()) {
        await updateDoc(projectRef, {
          members: members
        });
      } else {
        await setDoc(projectRef, {
          name: projectName,
          members: members
        });
      }

      onMembersCreated(members);
    } catch (error) {
      setError('エラーが発生しました: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div>
          <h1>Now loading...</h1>
          <div className="progress-bar">
            <div className="progress"></div>
          </div>
        </div>
      ) : (
        <div>
          <h1>Input your members</h1>
          <form onSubmit={handleSubmit}>
            {members.map((member, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  required
                />
              </div>
            ))}
            <button type="button" onClick={handleAddMember}>+</button>
            <button type="submit">Make</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default MemberInput;