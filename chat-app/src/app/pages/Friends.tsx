import "@/app/styles.css";
import FriendsClient from "@/app/components/friends/FriendsClient";
import Sidebar from "../components/Sidebar/Sidebar";

export default function Friends() {
  return (
    <>
      <FriendsClient />
      <Sidebar />
    </>
  );
}
