import { NextRequest, NextResponse } from 'next/server'

const API_KEY = 'ms-2a53f589-7f32-4df7-a086-cc381ef883bb'
const BASE_URL = 'https://api-inference.modelscope.cn'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      )
    }

    console.log('[check-image] Checking task:', taskId)

    const response = await fetch(`${BASE_URL}/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-ModelScope-Task-Type': 'image_generation',
      },
    })

    const responseText = await response.text()
    console.log('[check-image] Response status:', response.status)
    console.log('[check-image] Response body:', responseText)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Check status error: ${response.status}`, details: responseText },
        { status: response.status }
      )
    }

    const data = JSON.parse(responseText)
    console.log('[check-image] Task status:', data.task_status)

    if (data.task_status === 'SUCCEED') {
      console.log('[check-image] Image URL:', data.output_images?.[0])
      return NextResponse.json({
        status: 'completed',
        imageUrl: data.output_images?.[0],
      })
    } else if (data.task_status === 'FAILED') {
      console.log('[check-image] Task failed:', data)
      return NextResponse.json({ status: 'failed', details: data })
    }

    // Still processing
    return NextResponse.json({ status: 'pending', taskStatus: data.task_status })
  } catch (error) {
    console.error('[check-image] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
