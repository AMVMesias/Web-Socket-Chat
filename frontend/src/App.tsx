import { useEffect, useState } from 'react';
import Login from './components/Login';
import Room from './components/Room';

const SESSION_USER_KEY = 'websockets.user';

type SessionUser = { username: string; room: string };

const loadSessionUser = (): SessionUser | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionUser>;

    if (typeof parsed.username !== 'string' || typeof parsed.room !== 'string') {
      return null;
    }

    return { username: parsed.username, room: parsed.room };
  } catch {
    return null;
  }
};

function App() {
  const [user, setUser] = useState<SessionUser | null>(() => loadSessionUser());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user) {
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_USER_KEY);
    }
  }, [user]);

  if (!user) {
    return <Login onJoin={(username, room) => setUser({ username, room })} />;
  }

  return <Room username={user.username} room={user.room} onLeave={() => setUser(null)} />;
}

export default App;
