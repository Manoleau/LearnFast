import Groq from 'groq-sdk'
import pdfParse from 'pdf-parse'
import Store from 'electron-store'

const store = new Store()

export interface Question {
  id: string
  question: string
  options: string[]       // 4 options MCQ
  correct: number         // index of correct option (0-3)
  explanation: string
}

export interface Quiz {
  title: string
  questions: Question[]
}

function getClient(): Groq {
  const apiKey = store.get('apiKey', '') as string
  if (!apiKey) throw new Error('API_KEY_MISSING')
  return new Groq({ apiKey })
}

const SYSTEM_PROMPT = `Tu es un assistant pédagogique expert. À partir d'un contenu de cours, tu génères un quiz QCM en JSON.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans commentaires, au format:
{
  "title": "Titre du cours",
  "questions": [
    {
      "id": "q1",
      "question": "La question ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Explication courte de la bonne réponse"
    }
  ]
}`

export async function generateQuiz(
  fileBuffer: Buffer,
  ext: string,
  questionCount: number
): Promise<Quiz> {
  const client = getClient()
  const imageExts = ['png', 'jpg', 'jpeg', 'webp']

  if (imageExts.includes(ext)) {
    // Vision mode
    const mediaType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
    const base64 = fileBuffer.toString('base64')

    const response = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mediaType};base64,${base64}` }
            },
            {
              type: 'text',
              text: `Génère exactement ${questionCount} questions QCM à partir de ce cours. Réponds uniquement en JSON valide.`
            }
          ]
        }
      ]
    })

    return parseQuiz(response.choices[0].message.content ?? '')
  } else {
    // PDF text extraction
    const data = await pdfParse(fileBuffer)
    const text = data.text.slice(0, 15000) // limit tokens

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Voici le contenu du cours:\n\n${text}\n\nGénère exactement ${questionCount} questions QCM. Réponds uniquement en JSON valide.`
        }
      ]
    })

    return parseQuiz(response.choices[0].message.content ?? '')
  }
}

function parseQuiz(raw: string): Quiz {
  const jsonStr = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(jsonStr) as Quiz
}
