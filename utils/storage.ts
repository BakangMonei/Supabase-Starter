import { supabase } from "./supabase"

const BUCKET_NAME = "todo_attachments"

export async function uploadFile(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file)

    if (error) {
      console.error("Error uploading file:", error)
      return null
    }

    return filePath
  } catch (error) {
    console.error("Error in uploadFile:", error)
    return null
  }
}

export async function getFileUrl(filePath: string): Promise<string | null> {
  try {
    const { data } = await supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

    return data?.publicUrl || null
  } catch (error) {
    console.error("Error getting file URL:", error)
    return null
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      console.error("Error deleting file:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteFile:", error)
    return false
  }
}

