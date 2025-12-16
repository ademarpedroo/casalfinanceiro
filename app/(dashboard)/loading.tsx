export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Logo ou icone */}
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-bold">CF</span>
        </div>
        {/* Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        {/* Texto */}
        <div className="text-center">
          <p className="text-gray-700 font-medium">Carregando</p>
          <p className="text-gray-400 text-sm">Preparando seu dashboard...</p>
        </div>
      </div>
    </div>
  )
}
