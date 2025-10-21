import Sidebar from "../../components/Sidebar";
import Friends from "../../components/Friends"; 

export default function FriendListPage() {
  return (
    <section className="min-h-screen bg-gray-100">
      <main className="mx-auto flex max-w-[1400px] gap-0 p-4">
        <Sidebar />
        
        <section className="flex flex-1 bg-white p-6">
          <div className="w-full">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Venneliste</h1>
            <Friends /> 
            
          </div>
        </section>
      </main>
    </section>
  );
}
