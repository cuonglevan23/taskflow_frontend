# Note Components

Bộ component Note sử dụng thư viện BlockNote để tạo rich text editor.

## Components

### 1. Note
Component chính với đầy đủ chức năng (header, editor, save/cancel)

```tsx
import { Note } from "@/components/Note";

function App() {
  const handleSave = (content: string) => {
    console.log("Saved content:", content);
  };

  return (
    <Note
      title="My Note"
      initialContent=""
      onSave={handleSave}
      editable={true}
      showActions={true}
    />
  );
}
```

### 2. NoteEditor
Component editor đơn giản chỉ có phần soạn thảo

```tsx
import { NoteEditor } from "@/components/Note";

function App() {
  const handleChange = (content: string) => {
    console.log("Content changed:", content);
  };

  return (
    <NoteEditor
      initialContent=""
      onContentChange={handleChange}
      editable={true}
    />
  );
}
```

### 3. NoteViewer
Component chỉ đọc để hiển thị note

```tsx
import { NoteViewer } from "@/components/Note";

function App() {
  const content = `[{"type":"paragraph","content":[{"type":"text","text":"Hello world!"}]}]`;
  
  return (
    <NoteViewer
      content={content}
      title="View Note"
    />
  );
}
```

## Props

### Note Props
- `title?: string` - Tiêu đề của note
- `initialContent?: string` - Nội dung ban đầu (JSON string)
- `onSave?: (content: string) => void` - Callback khi save
- `onCancel?: () => void` - Callback khi cancel
- `editable?: boolean` - Có thể chỉnh sửa hay không (default: true)
- `showActions?: boolean` - Hiển thị nút Save/Cancel (default: true)
- `className?: string` - CSS class bổ sung

### NoteEditor Props
- `initialContent?: string` - Nội dung ban đầu (JSON string)
- `onContentChange?: (content: string) => void` - Callback khi thay đổi nội dung
- `editable?: boolean` - Có thể chỉnh sửa hay không (default: true)
- `className?: string` - CSS class bổ sung

### NoteViewer Props
- `content: string` - Nội dung cần hiển thị (JSON string)
- `title?: string` - Tiêu đề
- `className?: string` - CSS class bổ sung

## Data Format

Nội dung được lưu dưới dạng JSON string theo format của BlockNote:

```json
[
  {
    "type": "paragraph",
    "content": [
      {
        "type": "text",
        "text": "Hello world!"
      }
    ]
  }
]
```

## Features

- Rich text editing với BlockNote
- Support markdown shortcuts
- Drag & drop blocks
- Customizable styling
- Save/Cancel functionality
- Read-only mode
- TypeScript support
