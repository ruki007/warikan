import React, { useState } from 'react';
import ProjectNameInput from './ProjectNameInput';
import MemberInput from './MemberInput';
import ExpenseForm from './ExpenseForm';

const App = () => {
  const [currentStep, setCurrentStep] = useState('project'); // 'project', 'members', 'expenses'
  const [projectName, setProjectName] = useState('');
  const [members, setMembers] = useState([]);

  const handleProjectCreated = (name) => {
    setProjectName(name);
    setCurrentStep('members');
  };

  const handleMembersCreated = (memberList) => {
    setMembers(memberList);
    setCurrentStep('expenses');
  };

  const handleBackToMembers = () => {
    setCurrentStep('members');
  };

  const handleBackToProject = () => {
    setCurrentStep('project');
    setProjectName('');
    setMembers([]);
  };

  return (
    <div>
      {currentStep === 'project' && (
        <ProjectNameInput onProjectCreated={handleProjectCreated} />
      )}
      
      {currentStep === 'members' && (
        <div>
          <button onClick={handleBackToProject}>← プロジェクト名に戻る</button>
          <MemberInput 
            projectName={projectName}
            onMembersCreated={handleMembersCreated}
          />
        </div>
      )}
      
      {currentStep === 'expenses' && (
        <div>
          <button onClick={handleBackToMembers}>← メンバー設定に戻る</button>
          <ExpenseForm 
            projectName={projectName}
            members={members}
          />
        </div>
      )}
    </div>
  );
};

export default App;