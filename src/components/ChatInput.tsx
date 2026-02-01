'use client'

import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = '输入你的回复...',
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault()
      onSend(value)
    }
  }

  return (
    <div className="relative z-10 p-4 bg-pixel-dark/90 pixel-border">
      <div className="flex gap-3">
        <input
          type="text"
          className="pixel-input flex-1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          className="pixel-btn text-[10px] py-2 px-4"
          onClick={() => value.trim() && onSend(value)}
          disabled={disabled || !value.trim()}
        >
          发送
        </button>
      </div>
    </div>
  )
}
