'use client'

import { useState } from 'react'
import { GitCommit, GitPullRequest, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

export default function GithubFeedClient({ events, userMap }: { events: any[], userMap: any }) {
  const [page, setPage] = useState(0)
  const itemsPerPage = 5

  if (events.length === 0) {
    return <p className="text-sm text-slate-500">Brak niedawnej aktywności w tym repozytorium.</p>
  }

  // Obliczamy ile mamy stron
  const totalPages = Math.ceil(events.length / itemsPerPage)
  
  // Wycinamy tylko 5 elementów dla aktualnej strony
  const currentEvents = events.slice(page * itemsPerPage, (page + 1) * itemsPerPage)

  return (
    <div>
      <div className="space-y-1 min-h-70"> {/* min-h zapobiega skakaniu wysokości komponentu */}
        {currentEvents.map((event) => (
          <EventItem key={event.id} event={event} userMap={userMap} />
        ))}
      </div>

      {/* Nawigacja strzałkami (Paginacja) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Strona {page + 1} z {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}

// Przeniesiony EventItem (dokładnie ten sam kod co wcześniej)
function EventItem({ event, userMap }: { event: any, userMap: any }) {
  const githubUsername = event.actor.display_login
  const appUser = userMap[githubUsername]

  const actorName = appUser?.full_name || githubUsername
  const avatarUrl = appUser?.app_avatar || event.actor.avatar_url
  
  const timeAgo = new Date(event.created_at).toLocaleString('pl-PL', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  })

  let icon = <GitCommit size={16} className="text-slate-400" />
  let actionText = 'wykonał akcję'
  let details = ''

  if (event.type === 'PushEvent') {
    const commitCount = event.payload.commits?.length || 0
    const branch = event.payload.ref.replace('refs/heads/', '')
    icon = <GitCommit size={16} className="text-blue-500" />
    actionText = `wypchnął commit do gałęzi ${branch}` 
    details = event.payload.commits?.[0]?.message || ''
  } 
  else if (event.type === 'IssuesEvent') {
    icon = <AlertCircle size={16} className={event.payload.action === 'opened' ? 'text-emerald-500' : 'text-red-500'} />
    actionText = `${event.payload.action === 'opened' ? 'otworzył nowe' : 'zamknął'} zgłoszenie #${event.payload.issue.number}`
    details = event.payload.issue.title
  } 
  else if (event.type === 'PullRequestEvent') {
    icon = <GitPullRequest size={16} className="text-purple-500" />
    const isMerged = event.payload.pull_request.merged
    const action = isMerged ? 'zatwierdził (merged)' : event.payload.action === 'opened' ? 'otworzył' : 'zamknął'
    actionText = `${action} Pull Request #${event.payload.pull_request.number}`
    details = event.payload.pull_request.title
  }

  return (
    <div className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
      <img src={avatarUrl} alt={actorName} className="w-8 h-8 rounded-full shadow-sm border border-slate-200 object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 leading-snug">
          <span className="font-bold">{actorName}</span> {actionText}
        </p>
        {details && (
          <p className="text-xs text-slate-500 mt-1.5 truncate font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 inline-block max-w-full">
            {details}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {icon}
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-slate-500 transition-colors">
          {timeAgo}
        </span>
      </div>
    </div>
  )
}