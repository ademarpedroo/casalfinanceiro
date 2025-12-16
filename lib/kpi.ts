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

interface Installment {
  amount: number
  dueDate: Date
  isPaid: boolean
}

interface Transaction {
  installments: Installment[]
}

export function calculateKPIs(
  incomes: Income[],
  expenses: Expense[],
  budgets: Array<Budget & { percentage: number }>,
  transactions: Transaction[] = [],
  currentMonth?: number,
  currentYear?: number
) {
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate card installments for the current month
  let cardExpenses = 0
  if (currentMonth && currentYear) {
    transactions.forEach(transaction => {
      transaction.installments.forEach(installment => {
        const dueDate = new Date(installment.dueDate)
        if (dueDate.getMonth() + 1 === currentMonth && dueDate.getFullYear() === currentYear) {
          cardExpenses += installment.amount
        }
      })
    })
  }

  const totalAllExpenses = totalExpenses + cardExpenses
  const balance = totalIncome - totalAllExpenses

  // Calculate average budget usage
  const budgetUsage =
    budgets.length > 0
      ? budgets.reduce((sum, budget) => sum + budget.percentage, 0) / budgets.length
      : 0

  return {
    totalIncome,
    totalExpenses: totalAllExpenses,
    balance,
    budgetUsage,
  }
}
