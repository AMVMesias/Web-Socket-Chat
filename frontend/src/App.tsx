import { useState } from 'react';
import Login from './components/Login';
import Room from './components/Room';

function App() {
  const [user, setUser] = useState<{ username: string; room: string } | null>(null);

  if (!user) {
    return <Login onJoin={(username, room) => setUser({ username, room })} />;
  }

  return <Room username={user.username} room={user.room} onLeave={() => setUser(null)} />;
}

export default App;
