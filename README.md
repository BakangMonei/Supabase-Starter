## Follow all these

Create the necessary database tables for your Todo application. Let's set up the todos table with proper Row Level Security (RLS) policies:
```
-- Create the todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task TEXT NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select only their own todos
CREATE POLICY "Users can view their own todos" 
  ON todos FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own todos
CREATE POLICY "Users can insert their own todos" 
  ON todos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own todos
CREATE POLICY "Users can update their own todos" 
  ON todos FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own todos
CREATE POLICY "Users can delete their own todos" 
  ON todos FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
```

Then add file storage functionality to your Todo application, allowing users to attach files to their todos. Let's implement this using Supabase Storage:
```
-- Create a storage bucket for todo attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('todo_attachments', 'todo_attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
CREATE POLICY "Users can view their own attachments"
ON storage.objects FOR SELECT
USING (auth.uid() = owner);

CREATE POLICY "Users can upload their own attachments"
ON storage.objects FOR INSERT
WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can update their own attachments"
ON storage.objects FOR UPDATE
USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (auth.uid() = owner);

-- Update the todos table to include attachment information
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS attachment_path TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;
```

Great! Now users can:

1. Attach files to their todos
2. View and download attached files
3. Delete todos with their attachments


The implementation uses Supabase Storage to securely store and retrieve files, with proper Row Level Security policies to ensure users can only access their own files.

### How it works:

1. The FileUploader component allows users to drag and drop or select files
2. Files are uploaded to the "todo_attachments" bucket in Supabase Storage
3. File paths and names are stored in the todos table
4. The AttachmentViewer component displays and provides download links for attachments
