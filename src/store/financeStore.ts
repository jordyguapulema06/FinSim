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
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
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
    await addDoc(collection(db, 'transactions'), tx);
  },
  deleteTransaction: async (id) => {
    await deleteDoc(doc(db, 'transactions', id));
  },
  updateTransaction: async (id, tx) => {
    await updateDoc(doc(db, 'transactions', id), tx);
  },
  addGoal: async (goal) => {
    await addDoc(collection(db, 'goals'), goal);
  },
  addDebt: async (debt) => {
    await addDoc(collection(db, 'debts'), debt);
  }
}));
