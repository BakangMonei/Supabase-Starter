"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Loader2, LogOut } from "lucide-react"
import TodoList from "@/components/todo-list"
import { DemoBanner } from "@/components/demo-banner"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { Todo } from "@/utils/types"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [todos, setTodos] = useState<Todo[]>([])
  const router = useRouter()

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        fetchTodos()
      } else {
        router.push("/login")
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  // Fetch todos from Supabase
  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setTodos(data || [])
    } catch (error) {
      console.error("Error fetching todos:", error)
    }
  }

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // This will prevent a flash of content before redirecting
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <DemoBanner />

      <main className="container max-w-3xl mx-auto py-8 px-4 flex flex-col">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <span>{user.email}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 rounded-full"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-grow">
          <TodoList initialTodos={todos} />
        </div>
      </main>

      <footer className="py-6 text-center mt-auto">
        <Link
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Powered by</span>
          <Image src="/supabase.svg" alt="Supabase Logo" width={20} height={20} className="inline-block" />
          <span className="font-medium">Supabase</span>
        </Link>
      </footer>
    </div>
  )
}

