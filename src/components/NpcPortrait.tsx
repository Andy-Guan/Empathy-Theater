'use client'

import { NPC } from '@/store/useStore'

interface NpcPortraitProps {
  npc: NPC | null
  isVisible: boolean
}

export default function NpcPortrait({ npc, isVisible }: NpcPortraitProps) {
  if (!npc || !isVisible) return null

  const hasPortrait = npc.portraitUrl && npc.portraitStatus === 'completed'
  const isGenerating = npc.portraitStatus === 'generating'

  return (
    <div 
      className={`npc-portrait ${isVisible ? 'npc-portrait-visible' : 'npc-portrait-hidden'}`}
    >
      {hasPortrait ? (
        // 显示生成的画像
        <img 
          src={npc.portraitUrl!}
          alt={`${npc.name}的画像`}
          className="npc-portrait-image"
        />
      ) : (
        // 显示emoji占位符
        <div className="npc-portrait-placeholder">
          <span className="npc-portrait-emoji">{npc.avatar}</span>
          {isGenerating && (
            <div className="npc-portrait-loading">
              <span className="text-xs text-pixel-cyan animate-pulse">
                画像生成中...
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* NPC名字标签 */}
      <div className="npc-portrait-name">
        {npc.name}
      </div>
    </div>
  )
}
