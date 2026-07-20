import { create } from 'zustand';
import { Transaction, Goal, Debt } from '../types';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface FinanceState {
  transactions: Transaction[];
  goals: Goal[];
  debts: Debt[];
  loading: boolean;
  subscribe: (uid: string) => () => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: [],
  goals: [],
  debts: [],
  loading: true,
  subscribe: (uid: string) => {
    set({ loading: true });
    
    const txQuery = query(collection(db, 'transactions'), where('uid', '==', uid));
    const goalsQuery = query(collection(db, 'goals'), where('uid', '==', uid));
    const debtsQuery = query(collection(db, 'debts'), where('uid', '==', uid));

    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      set({ transactions });
    });

    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      set({ goals });
    });

    const unsubDebts = onSnapshot(debtsQuery, (snapshot) => {
      const debts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
      set({ debts, loading: false });
    });

    return () => {
      unsubTx();
      unsubGoals();
      unsubDebts();
    };
  },
  addTransaction: async (tx) => {
    // 1. Add the transaction to Firestore
    await addDoc(collection(db, 'transactions'), tx);

    // 2. If associated with a goal, update goal progress
    if (tx.associatedGoalId) {
      const currentGoal = useFinanceStore.getState().goals.find(g => g.id === tx.associatedGoalId);
      if (currentGoal) {
        const goalDocRef = doc(db, 'goals', tx.associatedGoalId);
        await updateDoc(goalDocRef, {
          currentAmount: currentGoal.currentAmount + tx.amount
        });
      }
    }

    // 3. If associated with a debt, update debt progress
    if (tx.associatedDebtId) {
      const currentDebt = useFinanceStore.getState().debts.find(d => d.id === tx.associatedDebtId);
      if (currentDebt) {
        const debtDocRef = doc(db, 'debts', tx.associatedDebtId);
        await updateDoc(debtDocRef, {
          remainingAmount: Math.max(0, currentDebt.remainingAmount - tx.amount),
          monthsPaid: (currentDebt.monthsPaid || 0) + 1
        });
      }
    }
  },
  deleteTransaction: async (id) => {
    // 1. Get transaction info first to reverse associations
    const tx = useFinanceStore.getState().transactions.find(t => t.id === id);
    if (tx) {
      if (tx.associatedGoalId) {
        const currentGoal = useFinanceStore.getState().goals.find(g => g.id === tx.associatedGoalId);
        if (currentGoal) {
          const goalDocRef = doc(db, 'goals', tx.associatedGoalId);
          await updateDoc(goalDocRef, {
            currentAmount: Math.max(0, currentGoal.currentAmount - tx.amount)
          });
        }
      }
      if (tx.associatedDebtId) {
        const currentDebt = useFinanceStore.getState().debts.find(d => d.id === tx.associatedDebtId);
        if (currentDebt) {
          const debtDocRef = doc(db, 'debts', tx.associatedDebtId);
          await updateDoc(debtDocRef, {
            remainingAmount: Math.min(currentDebt.totalAmount, currentDebt.remainingAmount + tx.amount),
            monthsPaid: Math.max(0, (currentDebt.monthsPaid || 0) - 1)
          });
        }
      }
    }
    // 2. Delete transaction from Firestore
    await deleteDoc(doc(db, 'transactions', id));
  },
  updateTransaction: async (id, tx) => {
    await updateDoc(doc(db, 'transactions', id), tx);
  },
  addGoal: async (goal) => {
    await addDoc(collection(db, 'goals'), goal);
  },
  deleteGoal: async (id) => {
    await deleteDoc(doc(db, 'goals', id));
  },
  addDebt: async (debt) => {
    await addDoc(collection(db, 'debts'), debt);
  },
  deleteDebt: async (id) => {
    await deleteDoc(doc(db, 'debts', id));
  }
}));
