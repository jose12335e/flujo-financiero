import { AI_SERVER_PORT, app } from './app.js'

app.listen(AI_SERVER_PORT, () => {
  console.log(`AI backend listening on http://127.0.0.1:${AI_SERVER_PORT}`)
})
