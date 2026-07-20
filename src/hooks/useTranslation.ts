import { useAuthStore } from '../store/authStore';

const translations = {
  es: {
    // Layout & Navigation
    dashboard: "Dashboard",
    transactions: "Transacciones",
    goals: "Metas",
    simulator: "Simulador",
    aiAdvisor: "Asesor IA",
    profile: "Perfil",
    settings: "Configuración",
    signOut: "Cerrar sesión",
    premiumPartner: "Socio Premium",
    loading: "Cargando...",
    debts: "Deudas",
    
    // Dashboard
    hello: "Hola",
    financialHealth: "Salud Financiera",
    excellent: "Excelente",
    good: "Bueno",
    regular: "Regular",
    risky: "Riesgoso",
    critical: "Crítico",
    netWorth: "Patrimonio Neto",
    income: "Ingresos",
    expenses: "Gastos",
    savings: "Ahorros",
    moneyFlow: "Flujo de Dinero",
    expensesByCategory: "Gastos por Categoría",
    noExpensesRecorded: "No hay gastos registrados",
    jan: "Ene",
    feb: "Feb",
    mar: "Mar",
    apr: "Abr",
    may: "May",
    jun: "Jun",
    
    // Transactions
    newTransaction: "Nueva Transacción",
    addTransactionTitle: "Registrar Movimiento",
    type: "Tipo",
    incomeOpt: "Ingreso",
    expenseOpt: "Gasto",
    savingsOpt: "Ahorro",
    debtPaymentOpt: "Pago de Deuda",
    amount: "Monto",
    category: "Categoría",
    date: "Fecha",
    description: "Descripción",
    categoryPlaceholder: "Ej. Comida, Salario",
    descriptionPlaceholder: "Opcional",
    cancel: "Cancelar",
    save: "Guardar",
    actions: "Acciones",
    noTransactionsRecorded: "No hay transacciones registradas.",
    
    // Goals
    financialGoals: "Metas Financieras",
    newGoal: "Nueva Meta",
    goalName: "Nombre de la Meta",
    deadline: "Fecha Límite",
    targetAmount: "Monto Objetivo",
    currentSavings: "Ahorro Actual",
    goalPlaceholder: "Ej. Comprar Auto",
    saveGoalBtn: "Guardar Meta",
    progress: "Progreso",
    current: "Actual",
    target: "Objetivo",
    noGoalsRecorded: "No tienes metas definidas. ¡Crea una para empezar a ahorrar!",
    
    // Simulator
    financialSimulator: "Simulador Financiero",
    timeHorizon: "Horizonte de Tiempo (Años)",
    yearsText: "años",
    financialScenario: "Escenario Financiero",
    maintainHabits: "Mantener hábitos actuales",
    reduceExpenses: "Reducir gastos innecesarios (-20%)",
    increaseSavings: "Incrementar ahorro (+10%)",
    payDebts: "Pagar deudas aceleradamente",
    baseData: "Datos Base Utilizados:",
    projectionTitle: "Proyección de Patrimonio a {years} años",
    accumulatedSavings: "Ahorros Acumulados",
    
    // AI Chat
    aiWelcome: "Hola, soy tu Asesor Financiero FinSim IA. Analizo tu situación financiera para darte recomendaciones personalizadas. ¿En qué te puedo ayudar hoy?",
    aiError: "Lo siento, ha ocurrido un error de conexión con la inteligencia artificial. Por favor, intenta de nuevo más tarde.",
    aiInputPlaceholder: "Pregúntale a FinSim sobre tus finanzas...",
    online: "En línea",
    geminiAdvisor: "Gemini IA Advisor",
    
    // Profile
    name: "Nombre",
    autoSaveNotice: "Las actualizaciones se guardan automáticamente.",
    
    // Settings
    preferences: "Preferencias",
    baseCurrency: "Moneda Base",
    language: "Idioma",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro (Próximamente)",
    spanish: "Español",
    english: "Inglés"
  },
  en: {
    // Layout & Navigation
    dashboard: "Dashboard",
    transactions: "Transactions",
    goals: "Goals",
    simulator: "Simulator",
    aiAdvisor: "AI Advisor",
    profile: "Profile",
    settings: "Settings",
    signOut: "Sign Out",
    premiumPartner: "Premium Partner",
    loading: "Loading...",
    debts: "Debts",
    
    // Dashboard
    hello: "Hello",
    financialHealth: "Financial Health",
    excellent: "Excellent",
    good: "Good",
    regular: "Regular",
    risky: "Risky",
    critical: "Critical",
    netWorth: "Net Worth",
    income: "Income",
    expenses: "Expenses",
    savings: "Savings",
    moneyFlow: "Money Flow",
    expensesByCategory: "Expenses by Category",
    noExpensesRecorded: "No expenses recorded",
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Jun",
    
    // Transactions
    newTransaction: "New Transaction",
    addTransactionTitle: "Record Transaction",
    type: "Type",
    incomeOpt: "Income",
    expenseOpt: "Expense",
    savingsOpt: "Savings",
    debtPaymentOpt: "Debt Payment",
    amount: "Amount",
    category: "Category",
    date: "Date",
    description: "Description",
    categoryPlaceholder: "e.g. Food, Salary",
    descriptionPlaceholder: "Optional",
    cancel: "Cancel",
    save: "Save",
    actions: "Actions",
    noTransactionsRecorded: "No transactions recorded.",
    
    // Goals
    financialGoals: "Financial Goals",
    newGoal: "New Goal",
    goalName: "Goal Name",
    deadline: "Deadline",
    targetAmount: "Target Amount",
    currentSavings: "Current Savings",
    goalPlaceholder: "e.g. Buy Car",
    saveGoalBtn: "Save Goal",
    progress: "Progress",
    current: "Current",
    target: "Target",
    noGoalsRecorded: "No goals defined. Create one to start saving!",
    
    // Simulator
    financialSimulator: "Financial Simulator",
    timeHorizon: "Time Horizon (Years)",
    yearsText: "years",
    financialScenario: "Financial Scenario",
    maintainHabits: "Maintain current habits",
    reduceExpenses: "Reduce unnecessary expenses (-20%)",
    increaseSavings: "Increase savings (+10%)",
    payDebts: "Pay off debts faster",
    baseData: "Base Data Used:",
    projectionTitle: "Wealth Projection over {years} years",
    accumulatedSavings: "Accumulated Savings",
    
    // AI Chat
    aiWelcome: "Hello, I am your FinSim AI Financial Advisor. I analyze your financial situation to give you personalized recommendations. How can I help you today?",
    aiError: "Sorry, a connection error occurred with the AI. Please try again later.",
    aiInputPlaceholder: "Ask FinSim about your finances...",
    online: "Online",
    geminiAdvisor: "Gemini AI Advisor",
    
    // Profile
    name: "Name",
    autoSaveNotice: "Updates are saved automatically.",
    
    // Settings
    preferences: "Preferences",
    baseCurrency: "Base Currency",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark (Coming Soon)",
    spanish: "Spanish",
    english: "English"
  }
};

export type TranslationKey = keyof typeof translations.es;

export function useTranslation() {
  const { user } = useAuthStore();
  const lang = (user?.language === 'en' ? 'en' : 'es') as 'en' | 'es';
  
  const t = (key: TranslationKey, variables?: Record<string, string | number>) => {
    let text = translations[lang][key] || translations.es[key] || String(key);
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };
  
  return { t, lang };
}
