const API_KEY = 'ms-2a53f589-7f32-4df7-a086-cc381ef883bb'
const BASE_URL = 'https://api-inference.modelscope.cn'

export async function* streamChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): AsyncGenerator<string> {
  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'ZhipuAI/GLM-4.7-Flash',
      messages,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        
        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            yield content
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'X-ModelScope-Async-Mode': 'true',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen-Image-2512',
      prompt,
    }),
  })

  if (!response.ok) {
    throw new Error(`Image generation error: ${response.status}`)
  }

  const data = await response.json()
  return data.task_id
}

export async function checkImageStatus(taskId: string): Promise<{
  status: 'pending' | 'completed' | 'failed'
  imageUrl?: string
}> {
  const response = await fetch(`${BASE_URL}/v1/tasks/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'X-ModelScope-Task-Type': 'image_generation',
    },
  })

  if (!response.ok) {
    throw new Error(`Check status error: ${response.status}`)
  }

  const data = await response.json()

  if (data.task_status === 'SUCCEED') {
    return {
      status: 'completed',
      imageUrl: data.output_images?.[0],
    }
  } else if (data.task_status === 'FAILED') {
    return { status: 'failed' }
  }

  return { status: 'pending' }
}

export async function chat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'ZhipuAI/GLM-4.7-Flash',
      messages,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}
