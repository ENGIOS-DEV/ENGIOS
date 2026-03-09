 // ─────────────────────────────────────────────────────────────────
// ENGIOS — AIDA AI Provider
// Connects to local Ollama instance
// ─────────────────────────────────────────────────────────────────

const OLLAMA_URL = 'http://localhost:11434/api/chat'
const MODEL      = 'phi3mini'

export interface Message {
  role:    'user' | 'assistant' | 'system'
  content: string
}

export async function sendMessage(
  messages: Message[],
  onChunk:  (chunk: string) => void
): Promise<void> {
  const response = await fetch(OLLAMA_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      model:    MODEL,
      messages,
      stream:   true,
    }),
  })

  if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`)
  if (!response.body) throw new Error('No response body')

  const reader  = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const lines = decoder.decode(value).split('\n').filter(Boolean)
    for (const line of lines) {
      try {
        const json = JSON.parse(line)
        if (json.message?.content) onChunk(json.message.content)
      } catch { /* skip malformed chunks */ }
    }
  }
}
