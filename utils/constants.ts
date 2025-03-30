// Demo data for when Supabase is not configured
import type { Todo } from "./types"

// Sample demo todos
const demoTodos: Todo[] = [
  {
    id: "1",
    task: "Learn about Supabase",
    is_complete: false,
    created_at: new Date().toISOString(),
    attachment_path: null,
    attachment_name: null,
  },
  {
    id: "2",
    task: "Build a todo app",
    is_complete: true,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    attachment_path: null,
    attachment_name: null,
  },
  {
    id: "3",
    task: "Deploy to production",
    is_complete: false,
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    attachment_path: null,
    attachment_name: null,
  },
]

export const DEMO_DATA = {
  auth: {
    signInWithPassword: async () => ({
      data: { user: { email: "demo@example.com", id: "demo-user-id" } },
      error: null,
    }),
    signUp: async () => ({ data: { user: { email: "demo@example.com", id: "demo-user-id" } }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: { email: "demo@example.com", id: "demo-user-id" } } }),
  },
  from: (table: string) => {
    // Mock database operations
    let mockData = [...demoTodos]

    return {
      select: () => ({
        order: (column: string, { ascending }: { ascending: boolean }) => {
          // Sort the data based on the column and order
          const sortedData = [...mockData].sort((a: any, b: any) => {
            if (ascending) {
              return a[column] > b[column] ? 1 : -1
            } else {
              return a[column] < b[column] ? 1 : -1
            }
          })

          return Promise.resolve({ data: sortedData, error: null })
        },
      }),
      insert: (items: any[]) => {
        const newItems = items.map((item, index) => ({
          id: `demo-${Date.now()}-${index}`,
          task: item.task,
          is_complete: false,
          created_at: new Date().toISOString(),
          user_id: "demo-user-id",
          attachment_path: item.attachment_path || null,
          attachment_name: item.attachment_name || null,
        }))

        mockData = [...newItems, ...mockData]

        return {
          select: () => Promise.resolve({ data: newItems, error: null }),
        }
      },
      update: (updates: any) => ({
        eq: (column: string, value: string) => {
          const index = mockData.findIndex((item) => item[column] === value)
          if (index !== -1) {
            mockData[index] = { ...mockData[index], ...updates }
          }
          return Promise.resolve({ data: null, error: null })
        },
      }),
      delete: () => ({
        eq: (column: string, value: string) => {
          mockData = mockData.filter((item) => item[column] !== value)
          return Promise.resolve({ data: null, error: null })
        },
      }),
    }
  },
  storage: {
    from: (bucketName: string) => ({
      upload: (path: string, file: File) => Promise.resolve({ data: { path }, error: null }),
      getPublicUrl: (path: string) =>
        Promise.resolve({
          data: { publicUrl: `https://demo-storage.supabase.co/${path}` },
          error: null,
        }),
      remove: (paths: string[]) => Promise.resolve({ data: {}, error: null }),
    }),
  },
}

