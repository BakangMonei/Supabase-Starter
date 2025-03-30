"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { getFileUrl } from "@/utils/storage"

interface AttachmentViewerProps {
  filePath: string
  fileName: string
}

export default function AttachmentViewer({ filePath, fileName }: AttachmentViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFileUrl = async () => {
      if (filePath) {
        const url = await getFileUrl(filePath)
        setFileUrl(url)
      }
      setLoading(false)
    }

    fetchFileUrl()
  }, [filePath])

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading attachment...</span>
      </div>
    )
  }

  if (!fileUrl) {
    return <div className="text-sm text-muted-foreground">Unable to load attachment</div>
  }

  return (
    <div className="flex items-center justify-between bg-secondary/50 p-2 rounded-md">
      <span className="text-sm truncate max-w-[200px]">{fileName}</span>
      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => window.open(fileUrl, "_blank")}>
        <Download className="h-3 w-3 mr-1" />
        <span className="text-xs">Download</span>
      </Button>
    </div>
  )
}

