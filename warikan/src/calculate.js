import { db } from './firebaseConfig';
import { doc, getDoc } from "firebase/firestore";

const calculateBalances = async (projectName) => {
  const projectRef = doc(db, "projects", projectName);
  const projectDoc = await getDoc(projectRef);

  if (!projectDoc.exists()) {
    throw new Error('プロジェクトが見つかりません');
  }

  const projectData = projectDoc.data();
  const members = projectData.members;
  const expenses = projectData.expenses || [];

  const balances = {};

  // Initialize balances
  members.forEach(member => {
    balances[member] = 0;
  });

  // Calculate balances
  expenses.forEach(expense => {
    const { payer, amount, payees } = expense;
    const splitAmount = amount / payees.length;

    balances[payer] += amount;
    payees.forEach(payee => {
      balances[payee] -= splitAmount;
    });
  });

  // Round balances to the nearest integer
  for (const member in balances) {
    balances[member] = Math.round(balances[member]);
  }

  return balances;
};

const calculateTransfers = (balances) => {
  const creditors = [];
  const debtors = [];

  // Separate creditors and debtors
  for (const [member, balance] of Object.entries(balances)) {
    if (balance > 0) {
      creditors.push({ member, balance });
    } else if (balance < 0) {
      debtors.push({ member, balance: -balance });
    }
  }

  const transfers = [];

  // Calculate transfers
  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];

    const transferAmount = Math.min(creditor.balance, debtor.balance);

    transfers.push({
      from: debtor.member,
      to: creditor.member,
      amount: transferAmount
    });

    creditor.balance -= transferAmount;
    debtor.balance -= transferAmount;

    if (creditor.balance === 0) {
      creditors.shift();
    }

    if (debtor.balance === 0) {
      debtors.shift();
    }
  }

  return transfers;
};

export { calculateBalances, calculateTransfers };