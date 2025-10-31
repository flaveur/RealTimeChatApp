import Friends from "../../components/Friends";
import Sidebar from "../../components/Sidebar";

export default function FriendList() {
  return (
    <section className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <main className="mx-auto flex max-w-[1400px] gap-0 p-4">
        <Sidebar /> 
        <section className="flex flex-1 bg-white dark:bg-gray-900 p-6 rounded-xl">
          <div className="w-full">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Venneliste</h1>
            <Friends />
          </div>
        </section>
      </main>
    </section>
  );
}
