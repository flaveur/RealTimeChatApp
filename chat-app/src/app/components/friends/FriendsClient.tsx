"use client";

import React from 'react';

export default function FriendsClient() {
  const [friends, setFriends] = React.useState<any[]>([]);

  React.useEffect(() => {
    // placeholder: for api-kall /api/friends
    setFriends([{ id: 1, username: 'alice' }, { id: 2, username: 'bob' }]);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Friends</h1>
      <div className="grid gap-3">
        {friends.map((f) => (
          <div key={f.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{f.username}</div>
              <div className="muted text-sm">Online</div>
            </div>
            <div>
              <button className="px-3 py-1 rounded bg-accent text-black">Message</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
