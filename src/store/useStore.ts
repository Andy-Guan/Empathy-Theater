import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'npc' | 'reversed-user' | 'system'
  content: string
  npcId?: string  // 关联的NPC ID
  timestamp: number
  isStreaming?: boolean
}

export interface UserPersona {
  averageLength: number
  commonPhrases: string[]
  tone: 'formal' | 'casual' | 'nervous'
  fillerWords: string[]
}

export interface NPC {
  id: string       // 唯一标识
  name: string     // 名字，如"小张"
  title: string    // 身份，如"学生会会长"
  avatar: string   // emoji字符
  // 画像相关字段
  portraitUrl: string | null        // 半身画像URL
  portraitTaskId: string | null     // 画像生成任务ID
  portraitStatus: 'idle' | 'generating' | 'completed' | 'failed'
}

// 根据角色关键词返回对应emoji头像
export function getAvatarByRole(role: string): string {
  const roleMap: Record<string, string> = {
    '老板': '👔',
    '领导': '👔',
    '经理': '📋',
    '同事': '👩‍💼',
    '女同事': '👩‍💼',
    '男同事': '👨‍💼',
    '客户': '🤝',
    '面试官': '📝',
    '医生': '👨‍⚕️',
    '老师': '👨‍🏫',
    '教授': '🎓',
    '朋友': '😊',
    '家人': '👨‍👩‍👧',
    '父母': '👴',
    '父亲': '👨',
    '母亲': '👩',
    '恋人': '💕',
    '约会对象': '💝',
    '陌生人': '🙂',
    '服务员': '🍽️',
    '销售': '💼',
    '房东': '🏠',
    '邻居': '🏡',
  }
  
  for (const [key, emoji] of Object.entries(roleMap)) {
    if (role.includes(key)) {
      return emoji
    }
  }
  return '👤' // 默认头像
}

interface AppState {
  // Scene
  sceneDescription: string
  roleDetails: string
  backgroundImage: string | null
  imageTaskId: string | null
  imageStatus: 'idle' | 'generating' | 'completed' | 'failed'
  
  // NPCs
  npcs: NPC[]
  currentSpeakerId: string | null  // 当前发言的NPC ID
  controlledNpcId: string | null  // 用户控制的NPC ID
  
  // Chat
  messages: Message[]
  isTyping: boolean
  
  // Mode
  mode: 'normal' | 'reversed'
  userPersona: UserPersona | null
  
  // UI
  isLoading: boolean
  error: string | null
  errorCode: number | null  // 错误状态码
  canRetry: boolean  // 是否可以重试
  showFeedback: boolean
  feedback: string | null
  
  // Actions
  setScene: (description: string, roleDetails: string) => void
  setBackgroundImage: (url: string | null) => void
  setImageTaskId: (taskId: string | null) => void
  setImageStatus: (status: 'idle' | 'generating' | 'completed' | 'failed') => void
  setNpcs: (npcs: NPC[]) => void
  addNpc: (npc: NPC) => void
  updateNpcPortrait: (npcId: string, url: string) => void
  setNpcPortraitStatus: (npcId: string, status: 'idle' | 'generating' | 'completed' | 'failed') => void
  setNpcPortraitTaskId: (npcId: string, taskId: string) => void
  setCurrentSpeaker: (npcId: string | null) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateMessage: (id: string, content: string) => void
  finalizeMessage: (id: string) => void
  setTyping: (isTyping: boolean) => void
  toggleMode: () => void
  setMode: (mode: 'normal' | 'reversed') => void
  analyzeUserStyle: () => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null, errorCode?: number) => void
  setRetryState: (canRetry: boolean) => void
  setFeedback: (feedback: string | null) => void
  setShowFeedback: (show: boolean) => void
  setControlledNpc: (npcId: string | null) => void
  toggleControlledNpc: (npcId: string) => void
  reset: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const initialState = {
  sceneDescription: '',
  roleDetails: '',
  backgroundImage: null,
  imageTaskId: null,
  imageStatus: 'idle' as const,
  npcs: [] as NPC[],
  currentSpeakerId: null as string | null,
  controlledNpcId: null as string | null,
  messages: [],
  isTyping: false,
  mode: 'normal' as const,
  userPersona: null,
  isLoading: false,
  error: null,
  errorCode: null as number | null,
  canRetry: true,
  showFeedback: false,
  feedback: null,
}

export const useStore = create<AppState>((set, get) => ({
  ...initialState,
  
  setScene: (description, roleDetails) => set({
    sceneDescription: description,
    roleDetails: roleDetails,
  }),
  
  setBackgroundImage: (url) => set({ backgroundImage: url }),
  
  setImageTaskId: (taskId) => set({ imageTaskId: taskId }),
  
  setImageStatus: (status) => set({ imageStatus: status }),
  
  setNpcs: (npcs) => set({ npcs }),
  
  addNpc: (npc) => set((state) => ({ npcs: [...state.npcs, npc] })),
  
  updateNpcPortrait: (npcId, url) => set((state) => ({
    npcs: state.npcs.map((npc) =>
      npc.id === npcId 
        ? { ...npc, portraitUrl: url, portraitStatus: 'completed' as const }
        : npc
    ),
  })),
  
  setNpcPortraitStatus: (npcId, status) => set((state) => ({
    npcs: state.npcs.map((npc) =>
      npc.id === npcId ? { ...npc, portraitStatus: status } : npc
    ),
  })),
  
  setNpcPortraitTaskId: (npcId, taskId) => set((state) => ({
    npcs: state.npcs.map((npc) =>
      npc.id === npcId 
        ? { ...npc, portraitTaskId: taskId, portraitStatus: 'generating' as const }
        : npc
    ),
  })),
  
  setCurrentSpeaker: (npcId) => set({ currentSpeakerId: npcId }),
  
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: generateId(),
        timestamp: Date.now(),
      },
    ],
  })),
  
  updateMessage: (id, content) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === id ? { ...msg, content: msg.content + content } : msg
    ),
  })),
  
  finalizeMessage: (id) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === id ? { ...msg, isStreaming: false } : msg
    ),
  })),
  
  setTyping: (isTyping) => set({ isTyping }),
  
  toggleMode: () => {
    const state = get()
    if (state.mode === 'normal') {
      // 切换到反转模式：AI模仿用户说一句后自动恢复
      // 不清空 controlledNpcId，用户继续控制自己的角色
      state.analyzeUserStyle()
      set({ 
        mode: 'reversed',
        // controlledNpcId 保持不变，用户仍控制之前选定的角色
      })
    } else {
      // 切换回正常模式
      set({ 
        mode: 'normal',
      })
    }
  },
  
  setMode: (mode) => set({ mode }),
  
  analyzeUserStyle: () => {
    const { messages } = get()
    const userMessages = messages.filter((m) => m.role === 'user')
    
    if (userMessages.length < 3) {
      set({
        userPersona: {
          averageLength: 20,
          commonPhrases: ['嗯', '那个', '可能'],
          tone: 'nervous',
          fillerWords: ['嗯', '啊', '那个'],
        },
      })
      return
    }
    
    // Calculate average length
    const totalLength = userMessages.reduce((sum, m) => sum + m.content.length, 0)
    const averageLength = Math.round(totalLength / userMessages.length)
    
    // Find common phrases and filler words
    const allText = userMessages.map((m) => m.content).join(' ')
    const fillerPatterns = ['嗯', '啊', '那个', '就是', '可能', '好像', '应该', '随便', '都行', '不知道']
    const fillerWords = fillerPatterns.filter((p) => allText.includes(p))
    
    // Determine tone
    let tone: 'formal' | 'casual' | 'nervous' = 'casual'
    if (allText.includes('您') || allText.includes('请问')) {
      tone = 'formal'
    } else if (fillerWords.length > 3 || allText.includes('...')) {
      tone = 'nervous'
    }
    
    // Extract common phrases (simple implementation)
    const commonPhrases: string[] = []
    if (allText.includes('我觉得')) commonPhrases.push('我觉得')
    if (allText.includes('可能')) commonPhrases.push('可能')
    if (allText.includes('不太')) commonPhrases.push('不太')
    if (allText.includes('其实')) commonPhrases.push('其实')
    if (allText.includes('但是')) commonPhrases.push('但是')
    if (fillerWords.length > 0) commonPhrases.push(...fillerWords.slice(0, 3))
    
    set({
      userPersona: {
        averageLength,
        commonPhrases: commonPhrases.length > 0 ? commonPhrases : ['嗯', '好的'],
        tone,
        fillerWords: fillerWords.length > 0 ? fillerWords : ['嗯'],
      },
    })
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error, errorCode?: number) => set({ 
    error, 
    errorCode,
    // 429 错误时可以重试，其他错误不建议立即重试
    canRetry: errorCode === 429 
  }),
  
  setRetryState: (canRetry) => set({ canRetry }),
  
  setFeedback: (feedback) => set({ feedback }),
  
  setShowFeedback: (show) => set({ showFeedback: show }),
  
  setControlledNpc: (npcId: string | null) => set({ controlledNpcId: npcId }),
  
  toggleControlledNpc: (npcId: string) => set((state) => ({
    controlledNpcId: state.controlledNpcId === npcId ? null : npcId
  })),
  
  reset: () => set(initialState),
}))
