import { initClient, initClientNavigation } from "rwsdk/client";
import React from "react";
import { createRoot } from "react-dom/client";

initClient();

// Use rwsdk client navigation to re-run mounts after internal navigation
initClientNavigation({
	onNavigate: async () => {
		// re-run mounts after navigation
		await mountSidebar();
		await mountFriends();
	},
});

// Mount the global Sidebar into the placeholder created by Document
async function mountSidebar() {
	try {
		const el = document.getElementById('sidebar-root');
		if (!el) return;
		// Only mount Sidebar when a user is logged in (stored in localStorage)
		const raw = localStorage.getItem('user');
		if (!raw) {
			// if there is an existing mounted sidebar, unmount it
			const existing = (el as any).__reactRootInstance || (el as any).__reactRoot;
			if (existing && typeof existing.unmount === 'function') existing.unmount();
			return;
		}
		const { default: Sidebar } = await import('./app/components/Sidebar');
		const root = createRoot(el);
		root.render(React.createElement(Sidebar));
	} catch (err) {
		// ignore mount errors in dev
		console.warn('Sidebar mount failed', err);
	}
}

// Mount Friends client into placeholder if present
async function mountFriends() {
	try {
		const el = document.getElementById('friends-root');
		if (!el) return;
		const { default: FriendsClient } = await import('./app/components/friends/FriendsClient');
		const root = createRoot(el);
		root.render(React.createElement(FriendsClient));
	} catch (err) {
		console.warn('Friends mount failed', err);
	}
}

// initial mounts
mountSidebar();
mountFriends();
