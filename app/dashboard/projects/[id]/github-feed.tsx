import { Github } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import GithubFeedClient from './github-feed-client'

export default async function GithubActivityFeed({ 
  owner, 
  repo, 
  token 
}: { 
  owner: string, 
  repo: string, 
  token?: string 
}) {
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    ...(token && { 'Authorization': `Bearer ${token}` }) 
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/events?per_page=40`, {
    headers,
    next: { revalidate: 60 }
  })

  if (!res.ok) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500">
        <Github size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm font-bold">Brak dostępu do repozytorium</p>
        <p className="text-xs">Upewnij się, że repozytorium {owner}/{repo} jest publiczne lub dodaj token autoryzacji w ustawieniach projektu.</p>
      </div>
    )
  }

  const rawEvents = await res.json()
  const validTypes = ['PushEvent', 'IssuesEvent', 'PullRequestEvent']
  const events = rawEvents.filter((e: any) => validTypes.includes(e.type))

  const supabase = await createClient()
  
  const githubUsernames = Array.from(new Set(events.map((e: any) => e.actor.display_login)))
  
  const { data: mappedUsers } = await supabase
    .from('github_users')
    .select('*')
    .in('github_username', githubUsernames)
    
  const userMap = mappedUsers?.reduce((acc: any, user: any) => {
    acc[user.github_username] = user
    return acc
  }, {}) || {}

  return (
    <div className="bg-white shadow-sm p-6 overflow-hidden flex flex-col h-full">
      <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2 shrink-0">
        <Github className="text-slate-800" size={28} /> Ostatnia aktywność
      </h2>
      <GithubFeedClient events={events} userMap={userMap} />
    </div>
  )
}