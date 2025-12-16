import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>Feito com</span>
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
          <span>por</span>
          <span className="font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CasalFinanceiro
          </span>
          <span>© 2025</span>
        </div>
      </div>
    </footer>
  )
}
