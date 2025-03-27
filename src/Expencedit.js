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

  useEffect(() => {
    fetchExpenses(); // 初期化時に支払い記録を取得
    fetchTransfers(); // 初期化時に支払い指示を計算
  }, []);

  return (
    <div>
      <h1>建て替えの記録</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>支払者:</label>
          <select value={payer} onChange={(e) => setPayer(e.target.value)} required>
            <option value="">選択してください</option>
            {members.map((member, index) => (
              <option key={index} value={member}>{member}</option>
            ))}
          </select>
        </div>
        <div>
          <label>金額:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label>受取者:</label>
          {payees.map((payee, index) => (
            <div key={index}>
              <select value={payee} onChange={(e) => handlePayeeChange(index, e.target.value)} required>
                <option value="">選択してください</option>
                {members.map((member, idx) => (
                  <option key={idx} value={member}>{member}</option>
                ))}
                <option value="全員">全員</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={handleAddPayee}>+</button>
        </div>
        <button type="submit">記録</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2>支払い記録</h2>
      <ul>
        {expenses.map((expense, index) => (
          <li key={index}>
            {expense.payer} が {expense.amount} 円を {expense.payees.join(', ')} に支払った
          </li>
        ))}
      </ul>
      <h2>支払い指示</h2>
      <ul>
        {transfers.map((transfer, index) => (
          <li key={index}>
            {transfer.from} は {transfer.to} に {transfer.amount} 円支払う
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseForm;