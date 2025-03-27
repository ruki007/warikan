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
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);

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
      await fetchExpenses();
      await fetchTransfers();
    } catch (error) {
      setError('エラーが発生しました: ' + error.message);
    }
  };

  const resetInput = () => {
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
        setExpenses(projectData.expenses || []);
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

  const deleteExpense = async (expense) => {
    setError('');

    try {
      const projectRef = doc(db, "projects", projectName);
      const updatedExpenses = expenses.filter((exp) => exp !== expense);
      await updateDoc(projectRef, { expenses: updatedExpenses });
      setExpenses(updatedExpenses);
      alert('支払い記録が削除されました');
      await fetchTransfers();
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
      await fetchTransfers();
    } catch (error) {
      setError('支払い記録の更新中にエラーが発生しました: ' + error.message);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchTransfers();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>支出記録</h1>
      <form onSubmit={editingExpense ? updateExpense : handleSubmit}>
        <div>
          <label>支払者:</label>
          <select value={payer} onChange={(e) => setPayer(e.target.value)} required>
            <option value="">支払者を選択</option>
            {members.map((member, index) => (
              <option key={index} value={member}>{member}</option>
            ))}
          </select>
        </div>
        <div>
          <label>金額 (円):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="金額を入力"
            required
          />
        </div>
        <div>
          <label>受取人:</label>
          {payees.map((payee, index) => (
            <div key={index}>
              <select value={payee} onChange={(e) => handlePayeeChange(index, e.target.value)} required>
                <option value="">受取人を選択</option>
                {members.map((member, idx) => (
                  <option key={idx} value={member}>{member}</option>
                ))}
                <option value="全員">全員</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={handleAddPayee}>受取人を追加</button>
        </div>
        <button type="button" onClick={resetInput}>リセット</button>
        <button type="submit">{editingExpense ? '更新' : '保存'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2>記録一覧</h2>
      <ul>
        {expenses.map((expense, index) => (
          <li key={index}>
            {expense.payer} が {expense.amount} 円を {expense.payees.join(', ')} に支払いました
            <button onClick={() => handleEditExpense(expense)}>編集</button>
            <button onClick={() => deleteExpense(expense)}>削除</button>
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