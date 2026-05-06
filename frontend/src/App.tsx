import { useState } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = useState<{ username: string; room: string } | null>(null);

  if (!user) {
    return <Login onJoin={(username, room) => setUser({ username, room })} />;
  }

  return <Chat username={user.username} room={user.room} onLeave={() => setUser(null)} />;
}

export default App;
