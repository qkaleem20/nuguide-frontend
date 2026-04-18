// ── API Base URL ──────────────────────────────────────────────────
// Reads from .env.local file (NEXT_PUBLIC_API_URL=http://localhost:8000)
// Falls back to localhost:8000 if the variable isn't set.
// NEXT_PUBLIC_ prefix is required by Next.js for browser-accessible variables.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Health Check ──────────────────────────────────────────────────
// Pings the FastAPI root endpoint to see if the server is running.
// Used by StatusIndicator to show the green/red dot.
// AbortSignal.timeout(3000) means: if no response in 3 seconds, give up.
// Returns true if server is up, false if it's down or slow.

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/`, {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Send a question and get an answer
export async function sendMessage(question, sessionId) {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json(); // { answer, sources, session_id }
}

// Log feedback
export async function submitFeedback(question, answer, rating, sessionId) {
  try {
    await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        answer: answer,
        rating: rating,
        session_id: sessionId,
      }),
    });
  } catch (error) {
    // Feedback failure is non-critical — log but don't crash
    console.error('Feedback submission failed:', error);
  }
}

// Clear session history
export async function clearSession(sessionId) {
  try {
    await fetch(`${API_URL}/session/${sessionId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Session clear failed:', error);
  }
}