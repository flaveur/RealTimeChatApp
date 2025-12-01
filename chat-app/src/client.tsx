import { initClient, initClientNavigation } from "rwsdk/client";
import React from "react";
import { createRoot } from "react-dom/client";

initClient();

// Use rwsdk client navigation to re-run mounts after internal navigation
// Note: Sidebar should be included by pages that need it (not mounted globally here).
initClientNavigation({
  onNavigate: async () => {
	// only mount Friends client where applicable
	await mountFriends();
  },
});

// Mount Friends client into placeholder if present... Copilot 
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
mountFriends();
