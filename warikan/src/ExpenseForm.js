import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { calculateBalances, calculateTransfers } from './calculate';

const ExpenseForm = ({ projectName, members }) => {
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState('');
  const [payees, setPayees] = useState([]);
  const [error, setError] = useState('');
  const [transfers, setTransfers] = useState([]);
  const [expenses, setExpenses] = useState([]); // 支払い記録を保存するステート
  const [editingExpense, setEditingExpense] = useState(null); // 編集中の支払い記録

  const handlePayeeChange = (index, value) => {
    const newPayees = [...payees];
    newPayees[index] = value;
    setPayees(newPayees);
  };

  const handleAddPayee = () => {
    setPayees([...payees, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const projectRef = doc(db, "projects", projectName);
      const finalPayees = payees.includes('全員') ? members : payees;
      await updateDoc(projectRef, {
        expenses: arrayUnion({
          payer: payer,
          amount: parseFloat(amount),
          payees: finalPayees
        })
      });
      alert('支出が記録されました');
      await fetchExpenses(); // 新しい支払い記録を取得
      await fetchTransfers(); // 支払い指示を再計算
    } catch (error) {
      setError('エラーが発生しました: ' + error.message);
    }
  };
const resetinput = () => {  
  setPayer('');
  setAmount('');
  setPayees([]);
};



  const fetchExpenses = async () => {
    try {
      const projectRef = doc(db, "projects", projectName);
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        setExpenses(projectData.expenses || []); // Firestoreから支払い記録を取得
      } else {
        setError('プロジェクトが見つかりません');
      }
    } catch (error) {
      setError('支払い記録の取得中にエラーが発生しました: ' + error.message);
    }
  };

  const fetchTransfers = async () => {
    try {
      const balances = await calculateBalances(projectName);
      const transfers = calculateTransfers(balances);
      setTransfers(transfers);
    } catch (error) {
      setError('計算中にエラーが発生しました: ' + error.message);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setPayer(expense.payer);
    setAmount(expense.amount);
    setPayees(expense.payees);
  };
  const DeleteExpense = async (expense) => {
    setError('');
  
    try {
      const projectRef = doc(db, "projects", projectName);
      const updatedExpenses = expenses.filter((exp) => exp !== expense); // 削除対象を除外
      await updateDoc(projectRef, { expenses: updatedExpenses }); // Firestoreを更新
      setExpenses(updatedExpenses); // ローカルステートを更新
      alert('支払い記録が削除されました');
      await fetchTransfers(); // 支払い指示を再計算
    } catch (error) {
      setError('支払い記録の削除中にエラーが発生しました: ' + error.message);
    }
  };

    


  const updateExpense = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const projectRef = doc(db, "projects", projectName);
      const updatedExpenses = expenses.map((expense) =>
        expense === editingExpense
          ? { payer, amount: parseFloat(amount), payees }
          : expense
      );
      await updateDoc(projectRef, { expenses: updatedExpenses });
      setExpenses(updatedExpenses);
      setEditingExpense(null);
      alert('支払い記録が更新されました');
      await fetchTransfers(); // 支払い指示を再計算
    } catch (error) {
      setError('支払い記録の更新中にエラーが発生しました: ' + error.message);
    }
  };

  useEffect(() => {
    fetchExpenses(); // 初期化時に支払い記録を取得
    fetchTransfers(); // 初期化時に支払い指示を計算
  }, []);

  return (
    <div style = {{ textAlign: 'center' }}>
      <h1>Your Record</h1>
      <form onSubmit={editingExpense ? updateExpense : handleSubmit}>
        <div>
          <label>Payer:</label>
          <select value={payer} onChange={(e) => setPayer(e.target.value)} required>
            <option value="">choose</option>
            {members.map((member, index) => (
              <option key={index} value={member}>{member}</option>
            ))}
          </select>
        </div>
        <div>
          <label>money:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Payee:</label>
          {payees.map((payee, index) => (
            <div key={index}>
              <select value={payee} onChange={(e) => handlePayeeChange(index, e.target.value)} required>
                <option value="">Choose</option>
                {members.map((member, idx) => (
                  <option key={idx} value={member}>{member}</option>
                ))}
                <option value="全員">All</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={handleAddPayee}>+</button>
         
        </div>
        <button type="button" onClick={resetinput}>reset</button>
        <button type="submit">{editingExpense ? '更新' : 'save'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2>Record</h2>
      <ul>
  {expenses.map((expense, index) => (
    <li key={index}>
      {expense.payer} pays {expense.amount} yen to {expense.payees.join(', ')} 
      <button onClick={() => handleEditExpense(expense)}>Edit</button>
      <button onClick={() => DeleteExpense(expense)}>Delete</button>
    </li>
  ))}
</ul>
      <h2>pays instruction</h2>
      <ul>
        {transfers.map((transfer, index) => (
          <li key={index}>
            {transfer.from} pays {transfer.to}  {transfer.amount} Yen
          </li>
        ))}
      </ul>
    </div>
  );  
};




export default ExpenseForm;