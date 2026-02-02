import { NextRequest } from 'next/server'

const API_KEY = 'ms-2a53f589-7f32-4df7-a086-cc381ef883bb'
const BASE_URL = 'https://api-inference.modelscope.cn'

async function callWithRetry(messages: unknown[], retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
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
        // 增加请求间隔，减少频率限制
        temperature: 0.7,
      }),
    })

// 计算延迟时间
function calculateDelay(attempt: number): number {
  const baseDelay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelay
  )
  const jitter = baseDelay * 0.3
  const randomFactor = Math.random() * 2 - 1
  return Math.max(1000, baseDelay + jitter * randomFactor)
}

    // 如果 rate limited (429)，等待更长时间
    if (response.status === 429 && i < retries - 1) {
      const waitTime = (i + 1) * 5000 // 5s, 10s, 15s
      console.log(`Rate limited, waiting ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      continue
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

      return
    } catch (error) {
      if (retries > 0) {
        const delay = calculateDelay(RETRY_CONFIG.maxRetries - retries)
        console.log(`API error, retrying in ${Math.round(delay)}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
        retries--
        continue
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    const encoder = new TextEncoder()
    let buffer = ''

    // 创建自定义 TransformStream 来处理流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of callWithRetryStream(messages)) {
            buffer += chunk
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          const errorMsg = error instanceof Error ? error.message : '未知错误'
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    let errorMessage = '服务器内部错误，请重试'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('429')) {
        errorMessage = 'API 请求过于频繁，请稍后重试'
        statusCode = 429
      } else if (error.message.includes('500')) {
        errorMessage = '服务暂时不可用，请稍后重试'
        statusCode = 500
      } else if (error.message.includes('abort')) {
        errorMessage = '请求超时，请检查网络连接'
        statusCode = 408
      }
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: statusCode, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}
