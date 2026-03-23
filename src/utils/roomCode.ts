import { gameExists } from '../firebase/game'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const CODE_LENGTH = 6
const MAX_ATTEMPTS = 10

function generateCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export async function generateRoomCode(): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = generateCode()
    if (!(await gameExists(code))) {
      return code
    }
    console.log(`RoomCode: collision on ${code}, retrying`)
  }
  throw new Error('Could not generate a unique room code after 10 attempts')
}
