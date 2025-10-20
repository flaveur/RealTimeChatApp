import Sidebar from "../../components/Sidebar";

export default function NotesPage() {
  return (
    <section className="min-h-screen bg-gray-100">
      <main className="mx-auto flex max-w-[1400px] gap-0 p-4">
        <Sidebar />
        
        <section className="flex flex-1 items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800">Mine notater</h1>
            <p className="mt-2 text-gray-500">Placeholder bare </p>
          </div>
        </section>
      </main>
    </section>
  );
}
