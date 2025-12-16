import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getCards, getUpcomingInstallments, getTransactions } from '@/app/actions/cards'
import { getAllExpenses } from '@/app/actions/expenses'
import { getIncomes } from '@/app/actions/income'
import { getCategories, seedDefaultCategories, deduplicateCategories } from '@/app/actions/categories'
import { getBudgetWithSpent, getCategoriesWithoutBudget } from '@/app/actions/budget'
import DashboardContent from '@/app/components/DashboardContent'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'
import { AppSidebar } from '@/app/components/AppSidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Busca dados completos do usuario
  const userFromDb = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true
    }
  })

  if (!userFromDb) {
    // Usuario nao existe mais, redireciona para logout via API
    redirect('/api/auth/signout')
  }

  const user = {
    ...session.user,
    createdAt: userFromDb.createdAt
  }

  // Seed default categories for this user if they don't have any
  await seedDefaultCategories(session.user.id)

  // Remove categorias duplicadas
  await deduplicateCategories(session.user.id)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // Executa todas as queries em paralelo para melhor performance
  const [
    cards,
    upcomingInstallments,
    transactions,
    expenses,
    incomes,
    categories,
    budgets,
    availableCategories
  ] = await Promise.all([
    getCards(),
    getUpcomingInstallments(),
    getTransactions(),
    getAllExpenses(),
    getIncomes(),
    getCategories(),
    getBudgetWithSpent(currentMonth, currentYear),
    getCategoriesWithoutBudget(currentMonth, currentYear)
  ])

  return (
    <>
      <AppSidebar user={session.user} />
      <SidebarInset className="flex flex-col min-h-screen bg-gray-50">
        <Navbar user={session.user} />
        <main className="flex-1 p-6">
          <DashboardContent
            user={user}
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