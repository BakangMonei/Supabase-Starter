"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash, Loader2, Plus, Paperclip } from "lucide-react"
import type { Todo } from "@/utils/types"
import FileUploader from "./file-uploader"
import AttachmentViewer from "./attachment-viewer"
import { uploadFile, deleteFile } from "@/utils/storage"

export default function TodoList({ initialTodos = [] }: { initialTodos?: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTask, setNewTask] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingTodos, setPendingTodos] = useState<Record<string, "add" | "delete" | "toggle">>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showAttachment, setShowAttachment] = useState(false)

  // Get user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id || null)
    }
    getUserId()
  }, [])

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

  // Add a new todo with optimistic update
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    setIsSubmitting(true)

    // Create a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    let attachmentPath = null
    let attachmentName = null

    // Add optimistic todo to the list
    const optimisticTodo: Todo = {
      id: tempId,
      task: newTask.trim(),
      is_complete: false,
      created_at: new Date().toISOString(),
      attachment_path: null,
      attachment_name: selectedFile?.name || null,
    }

    setTodos([optimisticTodo, ...todos])
    setNewTask("")
    setPendingTodos((prev) => ({ ...prev, [tempId]: "add" }))

    try {
      // Upload file if selected
      if (selectedFile && userId) {
        attachmentPath = await uploadFile(selectedFile, userId)
        attachmentName = selectedFile.name
      }

      const { data, error } = await supabase
        .from("todos")
        .insert([
          {
            task: newTask.trim(),
            user_id: userId,
            attachment_path: attachmentPath,
            attachment_name: attachmentName,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      // Replace the optimistic todo with the real one from the server
      if (data && data.length > 0) {
        setTodos((currentTodos) => currentTodos.map((todo) => (todo.id === tempId ? data[0] : todo)))
      } else {
        // If no data returned, fetch all todos again
        fetchTodos()
      }
    } catch (error) {
      console.error("Error adding todo:", error)

      // Remove the optimistic todo on error
      setTodos(todos.filter((todo) => todo.id !== tempId))
    } finally {
      setIsSubmitting(false)
      setSelectedFile(null)
      setPendingTodos((prev) => {
        const updated = { ...prev }
        delete updated[tempId]
        return updated
      })
    }
  }

  // Toggle todo completion status with optimistic update
  const toggleTodo = async (id: string, currentStatus: boolean) => {
    // Optimistically update the UI
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, is_complete: !currentStatus } : todo)))
    setPendingTodos((prev) => ({ ...prev, [id]: "toggle" }))

    try {
      const { error } = await supabase.from("todos").update({ is_complete: !currentStatus }).eq("id", id)

      if (error) {
        throw error
      }

      // UI is already updated optimistically
    } catch (error) {
      console.error("Error updating todo:", error)

      // Revert the optimistic update on error
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, is_complete: currentStatus } : todo)))
    } finally {
      setPendingTodos((prev) => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    }
  }

  // Delete a todo with optimistic update
  const deleteTodo = async (id: string, attachmentPath: string | null | undefined) => {
    // Store the todo before removing it (for recovery if needed)
    const todoToDelete = todos.find((todo) => todo.id === id)

    // Optimistically remove from UI
    setTodos(todos.filter((todo) => todo.id !== id))
    setPendingTodos((prev) => ({ ...prev, [id]: "delete" }))

    try {
      // Delete the attachment if it exists
      if (attachmentPath) {
        await deleteFile(attachmentPath)
      }

      const { error } = await supabase.from("todos").delete().eq("id", id)

      if (error) {
        throw error
      }

      // UI is already updated optimistically
    } catch (error) {
      console.error("Error deleting todo:", error)

      // Restore the todo on error
      if (todoToDelete) {
        setTodos([...todos, todoToDelete])
      }
    } finally {
      setPendingTodos((prev) => {
        const updated = { ...prev }
        delete updated[id]
        return updated
      })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto h-full">
      <form onSubmit={addTodo} className="space-y-4 mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setShowAttachment(!showAttachment)}
            aria-label="Add attachment"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" disabled={!newTask.trim() || isSubmitting} aria-label="Add todo">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {showAttachment && <FileUploader onFileSelect={setSelectedFile} selectedFile={selectedFile} />}
      </form>

      <ul className="space-y-2 min-h-[200px]">
        {todos.length === 0 ? (
          <li className="text-center text-muted-foreground py-4">No todos yet. Add one above!</li>
        ) : (
          todos.map((todo) => {
            const isPending = pendingTodos[todo.id]
            return (
              <li
                key={todo.id}
                className={`flex flex-col py-3 px-1 border-b border-border last:border-0 ${
                  isPending === "add" ? "animate-pulse bg-muted/20" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.is_complete}
                      onCheckedChange={() => toggleTodo(todo.id, todo.is_complete)}
                      disabled={!!isPending}
                    />
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className={`text-sm ${todo.is_complete ? "line-through text-muted-foreground" : ""}`}
                    >
                      {todo.task}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id, todo.attachment_path)}
                    disabled={!!isPending}
                    aria-label="Delete todo"
                    className="h-8 w-8"
                  >
                    {isPending === "delete" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {todo.attachment_path && todo.attachment_name && (
                  <div className="ml-8 mt-2">
                    <AttachmentViewer filePath={todo.attachment_path} fileName={todo.attachment_name} />
                  </div>
                )}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

