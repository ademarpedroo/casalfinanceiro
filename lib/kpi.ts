interface Income {
  amount: number
}

interface Expense {
  amount: number
}

interface Budget {
  limit: number
  spent: number
}

export function calculateKPIs(
  incomes: Income[],
  expenses: Expense[],
  budgets: Array<Budget & { percentage: number }>
) {
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const balance = totalIncome - totalExpenses

  // Calculate average budget usage
  const budgetUsage =
    budgets.length > 0
      ? budgets.reduce((sum, budget) => sum + budget.percentage, 0) / budgets.length
      : 0

  return {
    totalIncome,
    totalExpenses,
    balance,
    budgetUsage,
  }
}
