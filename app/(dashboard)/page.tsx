import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getCards, getUpcomingInstallments, getTransactions } from '@/app/actions/cards'
import { getExpenses } from '@/app/actions/expenses'
import { getIncomes } from '@/app/actions/income'
import { getCategories, seedDefaultCategories } from '@/app/actions/categories'
import { getBudgetWithSpent, getCategoriesWithoutBudget } from '@/app/actions/budget'
import { calculateKPIs } from '@/lib/kpi'
import DashboardContent from '@/app/components/DashboardContent'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import { AppSidebar } from '@/app/components/AppSidebar'
import { SidebarInset } from '@/components/ui/sidebar'

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

  // Calculate KPIs
  const kpis = calculateKPIs(incomes, expenses, budgets)

  return (
    <>
      <AppSidebar user={session.user} />
      <SidebarInset className="flex flex-col min-h-screen bg-gray-50">
        <Navbar user={session.user} />
        <main className="flex-1 p-6">
          <DashboardContent
            kpis={kpis}
            incomes={incomes}
            expenses={expenses}
            cards={cards}
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            availableCategories={availableCategories}
            upcomingInstallments={upcomingInstallments}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        </main>
        <Footer />
      </SidebarInset>
    </>
  )
}