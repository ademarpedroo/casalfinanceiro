import SignupForm from '@/app/components/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
            <p className="text-gray-600 mt-2">Comece a gerenciar suas finanças</p>
          </div>

          <SignupForm />
        </div>

        <p className="text-center text-white mt-6">
          Já tem uma conta?{' '}
          <a href="/login" className="font-semibold underline hover:text-gray-200">
            Faça login
          </a>
        </p>
      </div>
    </div>
  )
}
