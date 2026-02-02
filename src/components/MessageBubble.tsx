'use client'

import { Message, useStore } from '@/store/useStore'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content, isStreaming, npcId } = message
  const npcs = useStore((state) => state.npcs)
  
  // 解析[角色名]格式，提取角色名和内容
  let parsedNpcName: string | null = null
  let displayContent = content
  
  if (role === 'npc' && content) {
    const match = content.match(/^\[([^\]]+)\]\s*(.*)$/s)
    if (match) {
      parsedNpcName = match[1]
      displayContent = match[2]
    }
  }
  
  // 根据解析到的角色名查找NPC
  const npc = parsedNpcName 
    ? npcs.find(n => n.name === parsedNpcName) 
    : (npcId ? npcs.find(n => n.id === npcId) : npcs[0])

  // System messages
  if (role === 'system') {
    return (
      <div className="text-center py-3">
        <span className="text-sm text-pixel-gold bg-pixel-dark/80 px-4 py-2 rounded">
          {content}
        </span>
      </div>
    )
  }

  // Determine bubble style
  const isUser = role === 'user'
  const isReversedUser = role === 'reversed-user'
  const isNPC = role === 'npc'

  let bubbleClass = 'pixel-bubble '
  if (isUser) {
    bubbleClass += 'pixel-bubble-user'
  } else if (isReversedUser) {
    bubbleClass += 'pixel-bubble-reversed'
  } else {
    bubbleClass += 'pixel-bubble-npc'
  }

  // 获取显示名称和头像
  const npcDisplayName = parsedNpcName 
    ? (npc ? `${npc.name}（${npc.title}）` : parsedNpcName)
    : (npc ? `${npc.name}（${npc.title}）` : 'NPC')
  const displayName = isReversedUser 
    ? '👁️ AI模拟的你' 
    : isUser 
      ? '你' 
      : npcDisplayName
  
  const avatar = isReversedUser
    ? '👁️'
    : isUser
      ? '🙂'
      : npc?.avatar || '👤'

  return (
    <div className={`flex ${isUser || isReversedUser ? 'justify-end' : 'justify-start'}`}>
      {/* NPC头像 - 左侧 */}
      {isNPC && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-12 h-12 rounded pixel-border bg-pixel-dark/60 flex items-center justify-center text-2xl">
            {avatar}
          </div>
        </div>
      )}
      
      <div className="flex flex-col max-w-[70%]">
        {/* Role label */}
        <span className={`text-sm mb-1 ${
          isUser || isReversedUser ? 'text-right' : 'text-left'
        } ${
          isReversedUser ? 'text-pixel-purple' : isUser ? 'text-pixel-cyan' : 'text-pixel-coral'
        }`}>
          {isNPC ? displayName : (isReversedUser ? '👁️ AI模拟的你' : '你')}
        </span>
        
        {/* Bubble */}
        <div className={bubbleClass}>
          {displayContent || (isStreaming && '...')}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
          )}
        </div>
      </div>
      
      {/* 用户头像 - 右侧 */}
      {(isUser || isReversedUser) && (
        <div className="flex-shrink-0 ml-3">
          <div className={`w-12 h-12 rounded pixel-border flex items-center justify-center text-2xl ${
            isReversedUser ? 'bg-pixel-purple/30' : 'bg-pixel-blue/30'
          }`}>
            {avatar}
          </div>
        </div>
      )}
    </div>
  )
}
