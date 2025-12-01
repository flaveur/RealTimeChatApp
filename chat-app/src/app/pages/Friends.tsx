import "@/app/styles.css";
import Sidebar from "@/app/components/Sidebar";
import FriendsClient from "@/app/components/friends/FriendsClient";

export default function Friends() {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:block w-72 p-4 border-r">
        <Sidebar />
      </aside>

      <main className="flex-1 p-6">
        <FriendsClient />
      </main>
    </div>
  );
}
