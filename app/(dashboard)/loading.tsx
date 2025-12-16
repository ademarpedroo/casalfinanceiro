import { AppSidebar } from '@/app/components/AppSidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import Navbar from '@/app/components/Navbar'
import Footer from '@/app/components/Footer'

export default function Loading() {
  return (
    <>
      <AppSidebar user={{ name: '', email: '', image: '' }} />
      <SidebarInset className="flex flex-col min-h-screen bg-gray-50">
        <Navbar user={{ name: '', email: '', image: '' }} />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              {/* Spinner */}
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-500 text-sm">Carregando...</p>
            </div>
          </div>
        </main>
        <Footer />
      </SidebarInset>
    </>
  )
}
