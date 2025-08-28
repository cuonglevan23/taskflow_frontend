"use client";

import { Block } from "@blocknote/core";
import NoteEditor from "./NoteEditor";

interface NoteViewerProps {
  content: Block[] | string;
  title?: string;
  className?: string;
}

export default function NoteViewer({
  content,
  title,
  className = "",
}: NoteViewerProps) {
  return (
    <div className={`note-viewer bg-gray-50 rounded-lg border ${className}`}>
      {title && (
        <div className="note-viewer-header p-3 border-b border-gray-200 bg-white rounded-t-lg">
          <h4 className="text-md font-medium text-gray-700">{title}</h4>
        </div>
      )}
      <div className="note-viewer-content p-3">
        <NoteEditor
          initialContent={content}
          editable={false}
          className="bg-transparent"
        />
      </div>
    </div>
  );
}
