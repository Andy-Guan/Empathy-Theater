const API_KEY = 'ms-2a53f589-7f32-4df7-a086-cc381ef883bb'
const BASE_URL = 'https://api-inference.modelscope.cn'

// 错误类型分类
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isRetryable: boolean = true
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 2,
  baseDelay: 300, // 基础延迟 300ms
  maxDelay: 2000, // 最大延迟 2秒
  backoffMultiplier: 1.5, // 指数退避倍率
  jitter: 0.2, // 随机抖动范围 (20%)
}

// 计算重试延迟时间（指数退避 + 随机抖动）
function calculateDelay(attempt: number): number {
  const baseDelay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelay
  )
  const jitter = baseDelay * RETRY_CONFIG.jitter
  const randomFactor = Math.random() * 2 - 1 // -1 到 1
  return Math.max(500, baseDelay + jitter * randomFactor)
}

// 判断错误是否可重试
function isRetryableStatus(status: number): boolean {
  return [429, 500, 502, 503, 504].includes(status)
}

// 带重试机制的 API 调用
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超时

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return response.json()
      }

      const errorText = await response.text().catch(() => '')
      
      if (isRetryableStatus(response.status) && attempt < retries) {
        const delay = calculateDelay(attempt)
        console.warn(`API error ${response.status}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        lastError = new ApiError(
          errorText || `API error: ${response.status}`,
          response.status,
          true
        )
        continue
      }

      throw new ApiError(
        errorText || `API error: ${response.status}`,
        response.status,
        false
      )
    } catch (error) {
      if (error instanceof ApiError && error.isRetryable && attempt < retries) {
        const delay = calculateDelay(attempt)
        console.warn(`API error, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        lastError = error
        continue
      }
      throw error
    }
  }

  throw lastError
}

// 带重试的流式响应读取
async function* streamWithRetry<T>(
  generator: () => AsyncGenerator<T>
): AsyncGenerator<T> {
  let retries = RETRY_CONFIG.maxRetries

  while (retries >= 0) {
    try {
      yield* generator()
      return
    } catch (error) {
      if (retries === 0) throw error
      
      const delay = calculateDelay(RETRY_CONFIG.maxRetries - retries)
      console.warn(`Stream error, retrying in ${Math.round(delay)}ms (${retries} retries left)`)
      await new Promise(resolve => setTimeout(resolve, delay))
      retries--
    }
  }
}

// 流式聊天（带重试机制）
export async function* streamChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): AsyncGenerator<string> {
  const createStream = async function* (): AsyncGenerator<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

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
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new ApiError(
        errorText || `API error: ${response.status}`,
        response.status,
        isRetryableStatus(response.status)
      )
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
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
    } finally {
      reader.releaseLock()
    }
  }

  yield* streamWithRetry(createStream)
}

// 图片生成（带重试机制）
export async function generateImage(prompt: string): Promise<string> {
  const data = await fetchWithRetry<{ task_id: string }>(
    `${BASE_URL}/v1/images/generations`,
    {
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
    }
  )
  return data.task_id
}

// 检查图片状态
export async function checkImageStatus(taskId: string): Promise<{
  status: 'pending' | 'completed' | 'failed'
  imageUrl?: string
}> {
  const data = await fetchWithRetry<{
    task_status: string
    output_images?: string[]
  }>(`${BASE_URL}/v1/tasks/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'X-ModelScope-Task-Type': 'image_generation',
    },
  })

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

// 同步聊天（带重试机制）
export async function chat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const data = await fetchWithRetry<{
    choices?: Array<{ message?: { content: string } }>
  }>(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'ZhipuAI/GLM-4.7-Flash',
      messages,
      stream: false,
      temperature: 0.7,
    }),
  })
  return data.choices?.[0]?.message?.content || ''
}

// 请求队列管理（防止并发过多导致限流）
class RequestQueue {
  private queue: Array<() => Promise<void>> = []
  private processing = 0
  private readonly maxConcurrent = 3 // 最大并发数
  private readonly minInterval = 200 // 最小请求间隔(ms)

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing >= this.maxConcurrent) return
    if (this.queue.length === 0) return

    this.processing++
    const fn = this.queue.shift()!
    
    await new Promise(resolve => setTimeout(resolve, this.minInterval))
    
    await fn()
    this.processing--
    this.processQueue()
  }
}

// 导出请求队列实例
export const requestQueue = new RequestQueue()
