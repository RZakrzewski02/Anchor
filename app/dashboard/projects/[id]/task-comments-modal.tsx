'use client'

import { X, MessageSquare } from 'lucide-react'
import TaskComments from './task-comments'

export default function TaskCommentsModal({ 
  taskId, 
  taskTitle, 
  currentUserId, 
  onClose 
}: { 
  taskId: string
  taskTitle: string
  currentUserId: string
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Kliknięcie w tło zamyka modal */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 relative flex flex-col max-h-[80vh]">
        
        {/* NAGŁÓWEK MODALA */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Dyskusja</h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-50" title={taskTitle}>
                {taskTitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* TREŚĆ (LISTA KOMENTARZY) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <TaskComments taskId={taskId} currentUserId={currentUserId} />
        </div>

      </div>
    </div>
  )
}