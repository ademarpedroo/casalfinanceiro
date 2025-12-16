import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deduplicateCategories() {
  console.log('Buscando categorias...')

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' }
  })

  console.log(`Total de categorias: ${categories.length}`)

  // Agrupa por nome + tipo + userId
  const grouped: Record<string, typeof categories> = {}
  for (const cat of categories) {
    const key = `${cat.userId}-${cat.name.toLowerCase()}-${cat.type}`
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(cat)
  }

  let totalRemoved = 0

  // Para cada grupo com duplicatas
  for (const key in grouped) {
    const group = grouped[key]
    if (group.length <= 1) continue

    const [keep, ...duplicates] = group
    const duplicateIds = duplicates.map(d => d.id)

    console.log(`\nDuplicatas encontradas: "${keep.name}" (${keep.type})`)
    console.log(`  - Mantendo: ${keep.id}`)
    console.log(`  - Removendo: ${duplicateIds.length} duplicata(s)`)

    // Atualiza referencias em Income
    const incomesUpdated = await prisma.income.updateMany({
      where: { categoryId: { in: duplicateIds } },
      data: { categoryId: keep.id }
    })
    if (incomesUpdated.count > 0) {
      console.log(`  - ${incomesUpdated.count} receita(s) migrada(s)`)
    }

    // Atualiza referencias em Expense
    const expensesUpdated = await prisma.expense.updateMany({
      where: { categoryId: { in: duplicateIds } },
      data: { categoryId: keep.id }
    })
    if (expensesUpdated.count > 0) {
      console.log(`  - ${expensesUpdated.count} despesa(s) migrada(s)`)
    }

    // Deleta budgets duplicados
    const budgetsDeleted = await prisma.budget.deleteMany({
      where: { categoryId: { in: duplicateIds } }
    })
    if (budgetsDeleted.count > 0) {
      console.log(`  - ${budgetsDeleted.count} orcamento(s) removido(s)`)
    }

    // Deleta categorias duplicadas
    await prisma.category.deleteMany({
      where: { id: { in: duplicateIds } }
    })

    totalRemoved += duplicateIds.length
  }

  console.log(`\n✓ Concluido! ${totalRemoved} categoria(s) duplicada(s) removida(s).`)

  const remaining = await prisma.category.count()
  console.log(`Total de categorias agora: ${remaining}`)
}

deduplicateCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
