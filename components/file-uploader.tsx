"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X } from "lucide-react"

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  attachmentName?: string | null
}

export default function FileUploader({ onFileSelect, selectedFile, attachmentName }: FileUploaderProps) {
  const [isHovering, setIsHovering] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(true)
  }

  const handleDragLeave = () => {
    setIsHovering(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHovering(false)

    const file = e.dataTransfer.files?.[0] || null
    onFileSelect(file)
  }

  const clearFile = () => {
    onFileSelect(null)
  }

  return (
    <div className="w-full">
      {!selectedFile && !attachmentName ? (
        <div
          className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
            isHovering ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Paperclip className="mx-auto h-6 w-6 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drag & drop a file or click to browse</p>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="flex items-center justify-between bg-secondary p-2 rounded-md">
          <div className="flex items-center space-x-2 overflow-hidden">
            <Paperclip className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">{selectedFile?.name || attachmentName || "Attached file"}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

