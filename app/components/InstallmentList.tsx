import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function InstallmentList({ installments }: { installments: any[] }) {
  if (installments.length === 0) return <div className="text-gray-500">Nenhuma fatura próxima.</div>

  return (
    <div className="space-y-3">
      {installments.map((inst) => (
        <div key={inst.id} className="flex justify-between items-center p-3 border rounded bg-gray-50">
          <div>
            <p className="font-medium">{inst.transaction.description} ({inst.number}/{inst.transaction.installmentsCount})</p>
            <p className="text-xs text-gray-500">{inst.transaction.card.name}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-red-600">R$ {inst.amount.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Vence: {format(inst.dueDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
