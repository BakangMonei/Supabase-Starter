export interface Todo {
  id: string
  task: string
  is_complete: boolean
  created_at: string
  attachment_path?: string | null
  attachment_name?: string | null
  isPending?: boolean
}

