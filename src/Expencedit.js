import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { calculateBalances, calculateTransfers } from './calculate';

const ExpenseForm = ({ projectName, members }) => {
  const [payer, setPayer] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [payees, setPayees] = useState([]); // チェックされた受取人を保存
  const [error, setError] = useState('');
  const [transfers, setTransfers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);

  const handlePayeeChange = (member) => {
    if (payees.includes(member)) {
      // 既に選択されている場合は解除
      setPayees(payees.filter((payee) => payee !== member));
    } else {
      // 選択されていない場合は追加
      setPayees([...payees, member]);
    }
  };

  const handleSelectAll = () => {
    if (payees.includes('全員')) {
      // 「全員」が選択されている場合は解除
      setPayees([]);
    } else {
      // 「全員」を選択
      setPayees(['全員']);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setPayer(expense.payer);
    setAmount(expense.amount);
    setPurpose(expense.purpose);
    setPayees(expense.payees);
  };
  
  const handleDeleteExpense = async (expense) => {
    if (!window.confirm('この支出記録を削除しますか？')) {
      return;
    }
  
    setError('');
  
    try {
      const projectRef = doc(db, "projects", projectName);
      const updatedExpenses = expenses.filter((exp) => exp !== expense);
      await updateDoc(projectRef, { expenses: updatedExpenses });
      setExpenses(updatedExpenses);
      alert('支出が削除されました');
      await fetchTransfers();
    } catch (error) {
      setError('支出の削除中にエラーが発生しました: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const projectRef = doc(db, "projects", projectName);
      const finalPayees = payees.includes('全員') ? members : payees;

      if (editingExpense) {
        const updatedExpenses = expenses.map((expense) =>
          expense === editingExpense
            ? { payer, amount: parseFloat(amount), purpose, payees: finalPayees }
            : expense
        );
        await updateDoc(projectRef, { expenses: updatedExpenses });
        setExpenses(updatedExpenses);
        setEditingExpense(null);
        alert('支出が更新されました');
      } else {
        await updateDoc(projectRef, {
          expenses: arrayUnion({
            payer: payer,
            amount: parseFloat(amount),
            purpose: purpose,
            payees: finalPayees
          })
        });
        alert('支出が記録されました');
      }

      resetInput();
      await fetchExpenses();
      await fetchTransfers();
    } catch (error) {
      setError('エラーが発生しました: ' + error.message);
    }
  };

  const resetInput = () => {
    setPayer('');
    setAmount('');
    setPurpose('');
    setPayees([]);
    setEditingExpense(null);
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

  const handleShare = () => {
    const shareLink = `${window.location.origin}/?project=${projectName}`;
    navigator.clipboard.writeText(shareLink)
      .then(() => alert('リンクがコピーされました: ' + shareLink))
      .catch(() => alert('リンクのコピーに失敗しました'));
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
    fetchExpenses();
    fetchTransfers();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>支出記録</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>支払者:</label>
          <button onClick={handleShare}>共有リンクをコピー</button>
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
          <label>用途:</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="例: ホテル代、ドライブ代"
            required
          />
        </div>
        <div>
          <label>受取人:</label>
          <div>
            <label>
              <input
                type="checkbox"
                checked={payees.includes('全員')}
                onChange={handleSelectAll}
              />
              全員
            </label>
          </div>
          {members.map((member, index) => (
            <div key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={payees.includes(member)}
                  onChange={() => handlePayeeChange(member)}
                />
                {member}
              </label>
            </div>
          ))}
        </div>
        <button type="button" onClick={resetInput}>リセット</button>
        <button type="submit">{editingExpense ? '更新' : '保存'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2>記録一覧</h2>
      <ul>
        {expenses.map((expense, index) => (
          <li key={index}>
            {expense.payer} が {expense.amount} 円 ({expense.purpose}) を {expense.payees.join(', ')} に支払いました
            <button onClick={() => handleEditExpense(expense)}>編集</button>
            <button onClick={() => handleDeleteExpense(expense)}>削除</button>
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