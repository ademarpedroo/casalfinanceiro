'use client'

import { markExpenseAsPaid } from '@/app/actions/expenses'

export default function MarkPaidButton({ id }: { id: string }) {
  return (
    <button 
      onClick={() => markExpenseAsPaid(id)} 
      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 ml-2"
    >
      Marcar Pago
    </button>
  )
}
