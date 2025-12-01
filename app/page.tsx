import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getCards, getUpcomingInstallments, getTransactions } from '@/app/actions/cards'
import { getExpenses } from '@/app/actions/expenses'
import { getIncomes } from '@/app/actions/income'
import { getCategories, seedDefaultCategories } from '@/app/actions/categories'
import { getBudgetWithSpent, getCategoriesWithoutBudget } from '@/app/actions/budget'
import AddCardForm from '@/app/components/AddCardForm'
import AddTransactionForm from '@/app/components/AddTransactionForm'
import AddExpenseForm from '@/app/components/AddExpenseForm'
import AddIncomeForm from '@/app/components/AddIncomeForm'
import InstallmentList from '@/app/components/InstallmentList'
import CategoryManager from '@/app/components/CategoryManager'
import BudgetManager from '@/app/components/BudgetManager'
import IncomeList from '@/app/components/IncomeList'
import ExpenseList from '@/app/components/ExpenseList'
import CardList from '@/app/components/CardList'
import TransactionList from '@/app/components/TransactionList'
import LogoutButton from '@/app/components/LogoutButton'

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Seed default categories for this user if they don't have any
  await seedDefaultCategories(session.user.id)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const cards = await getCards()
  const upcomingInstallments = await getUpcomingInstallments()
  const transactions = await getTransactions()
  const expenses: any[] = await getExpenses()
  const incomes: any[] = await getIncomes()
  const categories = await getCategories()
  const budgets = await getBudgetWithSpent(currentMonth, currentYear)
  const availableCategories = await getCategoriesWithoutBudget(currentMonth, currentYear)

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">CasalFinanceiro</h1>
                <p className="text-slate-600">Gestão inteligente para dois.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm text-gray-600">Olá,</p>
                    <p className="font-semibold text-gray-900">{session.user.name || session.user.email}</p>
                </div>
                <LogoutButton />
            </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
            {/* Forms Column */}
            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Cadastros</h2>
                    <div className="space-y-6">
                        <AddIncomeForm categories={categories} />
                        <AddExpenseForm categories={categories} />
                        <AddCardForm />
                        <AddTransactionForm cards={cards} />
                    </div>
                </section>

                {/* Category Manager */}
                <section>
                    <CategoryManager categories={categories} />
                </section>
            </div>

            {/* Dashboard / Status Column */}
            <div className="md:col-span-2 space-y-6">
                {/* Budget Manager */}
                <BudgetManager
                  budgets={budgets}
                  availableCategories={availableCategories}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                />

                {/* Incomes List */}
                <section className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Receitas</h2>
                    <IncomeList incomes={incomes} />
                </section>

                {/* Cards List */}
                <section className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Cartões de Crédito</h2>
                    <CardList cards={cards} />
                </section>

                {/* Transactions List */}
                <section className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Todas as Transações</h2>
                    <TransactionList transactions={transactions} />
                </section>

                {/* Upcoming Installments */}
                <section className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Próximas Parcelas (10)</h2>
                    <InstallmentList installments={upcomingInstallments} />
                </section>

                {/* Expenses List */}
                <section className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Contas a Pagar (Boletos/Fixas)</h2>
                    <ExpenseList expenses={expenses} />
                </section>
            </div>
        </div>
      </div>
    </main>
  )
}