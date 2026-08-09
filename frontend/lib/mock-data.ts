export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  result?: {
    food_items: any[]
    total_min: number
    total_max: number
    total_protein_g: number
    total_fat_g: number
    total_carbs_g: number
    activities: Array<{ type: string; duration_minutes: number }>
    health_note: string
    disclaimer: string
    status: 'success' | 'needs_clarification' | 'error'
  }
}

export interface Chat {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages: Message[]
}

export const mockChats: Chat[] = [
  {
    id: '1',
    title: 'Breakfast calories',
    lastMessage: 'Your breakfast totals 450 calories',
    timestamp: new Date('2026-04-15T09:30:00'),
    messages: [
      {
        id: '1a',
        role: 'user',
        content: 'I had 2 eggs, toast with butter, and orange juice for breakfast',
        timestamp: new Date('2026-04-15T09:25:00'),
      },
      {
        id: '1b',
        role: 'assistant',
        content: "Great choice for breakfast! Here's the breakdown:\n\n• 2 eggs (scrambled): ~180 calories\n• Toast with butter: ~150 calories\n• Orange juice (8 oz): ~120 calories\n\n**Total: 450 calories**\n\nThis is a well-balanced breakfast with good protein from the eggs. The protein will help keep you full until lunch!",
        timestamp: new Date('2026-04-15T09:26:00'),
      },
    ],
  },
  {
    id: '2',
    title: 'Lunch meal tracking',
    lastMessage: 'That salad was about 380 calories',
    timestamp: new Date('2026-04-14T13:15:00'),
    messages: [
      {
        id: '2a',
        role: 'user',
        content: 'Just had a chicken Caesar salad with croutons',
        timestamp: new Date('2026-04-14T13:10:00'),
      },
      {
        id: '2b',
        role: 'assistant',
        content: "A chicken Caesar salad is a solid lunch option! Here's the estimate:\n\n• Grilled chicken (4 oz): ~180 calories\n• Romaine lettuce (2 cups): ~16 calories\n• Caesar dressing (2 tbsp): ~150 calories\n• Croutons (1/4 cup): ~35 calories\n\n**Total: ~380 calories**\n\nTip: Ask for dressing on the side to control portions!",
        timestamp: new Date('2026-04-14T13:12:00'),
      },
    ],
  },
  {
    id: '3',
    title: 'Daily calorie summary',
    lastMessage: 'Your total intake today was 1,850 calories',
    timestamp: new Date('2026-04-13T20:00:00'),
    messages: [
      {
        id: '3a',
        role: 'user',
        content: 'Can you give me a summary of everything I ate today?',
        timestamp: new Date('2026-04-13T19:55:00'),
      },
      {
        id: '3b',
        role: 'assistant',
        content: "Here's your daily summary:\n\n**Breakfast** - 450 cal\n• Oatmeal with berries\n• Coffee with milk\n\n**Lunch** - 620 cal\n• Grilled chicken sandwich\n• Side salad\n• Iced tea\n\n**Dinner** - 780 cal\n• Salmon with vegetables\n• Brown rice\n• Glass of wine\n\n**Total: 1,850 calories**\n\nYou're right on track with your 2,000 calorie goal! Great job today.",
        timestamp: new Date('2026-04-13T19:57:00'),
      },
    ],
  },
  {
    id: '4',
    title: 'Snack suggestions',
    lastMessage: 'Here are some healthy snack options under 200 calories',
    timestamp: new Date('2026-04-12T15:30:00'),
    messages: [
      {
        id: '4a',
        role: 'user',
        content: 'I need some healthy snack ideas that are low calorie',
        timestamp: new Date('2026-04-12T15:25:00'),
      },
      {
        id: '4b',
        role: 'assistant',
        content: "Here are some great low-calorie snack options:\n\n**Under 100 calories:**\n• Apple slices (52 cal)\n• Greek yogurt, plain (59 cal)\n• Baby carrots with hummus (90 cal)\n• Cucumber with lemon (16 cal)\n\n**Under 200 calories:**\n• Almonds (23 nuts) - 164 cal\n• String cheese + grapes - 150 cal\n• Rice cake with almond butter - 130 cal\n• Edamame (1/2 cup) - 95 cal\n\nAll of these are packed with nutrients and will keep you satisfied!",
        timestamp: new Date('2026-04-12T15:27:00'),
      },
    ],
  },
]

// Use a factory so every call gets a fresh Date — avoids stale module-level timestamp
export function makeInitialMessages(): Message[] {
  return [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI calorie tracking assistant. Tell me what you've eaten and I'll help you track your calories, provide nutritional insights, and keep you on track with your health goals.\n\nFor example, you can say:\n• \"I had a chicken sandwich for lunch\"\n• \"What's the calorie count of an avocado?\"\n• \"Give me my daily summary\"",
      timestamp: new Date(),
    },
  ]
}

// Keep the export for any code that still uses it, but point it at a stable past time
export const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: "Hi! I'm your AI calorie tracking assistant. Tell me what you've eaten and I'll help you track your calories, provide nutritional insights, and keep you on track with your health goals.\n\nFor example, you can say:\n• \"I had a chicken sandwich for lunch\"\n• \"What's the calorie count of an avocado?\"\n• \"Give me my daily summary\"",
    timestamp: new Date('2026-08-09T00:00:00.000Z'),
  },
]
