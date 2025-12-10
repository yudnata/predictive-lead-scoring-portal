const sessions = new Map();

const createSession = () => {
  const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessions.set(sessionId, {
    status: 'pending',
    saved: 0,
    total: 0,
    error: null,
    createdAt: Date.now(),
    clients: [],
  });
  return sessionId;
};

const getSession = (sessionId) => {
  return sessions.get(sessionId) || null;
};

const updateSession = (sessionId, update) => {
  const session = sessions.get(sessionId);
  if (!session) return;

  Object.assign(session, update);

  session.clients.forEach((res) => {
    try {
      res.write(
        `data: ${JSON.stringify({
          status: session.status,
          saved: session.saved,
          total: session.total,
          error: session.error,
        })}\n\n`
      );
    } catch (err) {}
  });

  if (session.status === 'complete' || session.status === 'error') {
    setTimeout(() => {
      sessions.delete(sessionId);
    }, 5 * 60 * 1000);
  }
};

const addClient = (sessionId, res) => {
  const session = sessions.get(sessionId);
  if (!session) return false;

  session.clients.push(res);
  return true;
};

const removeClient = (sessionId, res) => {
  const session = sessions.get(sessionId);
  if (!session) return;

  session.clients = session.clients.filter((client) => client !== res);
};

module.exports = {
  createSession,
  getSession,
  updateSession,
  addClient,
  removeClient,
};
