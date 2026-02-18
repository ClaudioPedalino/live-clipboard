import { useEffect, useRef, useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ClipboardPage } from '../lib/supabase'

const AUTOSAVE_INTERVAL_MS = 5000
const LOCAL_ACTIVITY_GRACE_MS = 2000
const TYPING_THROTTLE_MS = 500
const OTHER_EDITING_WINDOW_MS = 3000

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useClipboardPage(pageId: string) {
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [otherEditing, setOtherEditing] = useState(false)
  const [remotePending, setRemotePending] = useState(false)
  const [remoteContent, setRemoteContent] = useState<string | null>(null)

  const lastLocalEditRef = useRef<number>(0)
  const hasChangesSinceSaveRef = useRef(false)
  const contentRef = useRef(content)
  contentRef.current = content
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const lastTypingSentRef = useRef<number>(0)
  const clientIdRef = useRef<string>(crypto.randomUUID())

  const applyRemote = useCallback(() => {
    if (remoteContent !== null) {
      setContent(remoteContent)
      setRemoteContent(null)
      setRemotePending(false)
      hasChangesSinceSaveRef.current = false
      setHasChangesSinceSave(false)
    }
  }, [remoteContent])

  const save = useCallback(async () => {
    if (!pageId) return
    setSaveStatus('saving')
    setError(null)
    const { error: err } = await supabase
      .from('clipboard_pages')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', pageId)
    if (err) {
      setSaveStatus('error')
      setError(err.message)
    } else {
      setSaveStatus('saved')
      hasChangesSinceSaveRef.current = false
      setHasChangesSinceSave(false)
      setTimeout(() => setSaveStatus('idle'), 1500)
    }
  }, [pageId, content])

  const [hasChangesSinceSave, setHasChangesSinceSave] = useState(false)

  const handleLocalChange = useCallback(
    (newContent: string) => {
      setContent(newContent)
      lastLocalEditRef.current = Date.now()
      hasChangesSinceSaveRef.current = true
      setHasChangesSinceSave(true)

      const now = Date.now()
      if (now - lastTypingSentRef.current >= TYPING_THROTTLE_MS) {
        lastTypingSentRef.current = now
        typingChannelRef.current?.send({
          type: 'broadcast',
          event: 'typing',
          payload: { clientId: clientIdRef.current },
        })
      }
    },
    []
  )

  useEffect(() => {
    if (!pageId) return

    const load = async () => {
      const { data, error: err } = await supabase
        .from('clipboard_pages')
        .select('*')
        .eq('id', pageId)
        .single()
      if (err) {
        setError(err.message)
        return
      }
      const row = data as ClipboardPage
      setContent(row.content ?? '')
    }

    load()

    const channel = supabase
      .channel(`clipboard:${pageId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clipboard_pages', filter: `id=eq.${pageId}` },
        (payload) => {
          const newContent = (payload.new as ClipboardPage).content ?? ''
          const now = Date.now()
          const recentlyActive = now - lastLocalEditRef.current < LOCAL_ACTIVITY_GRACE_MS
          if (recentlyActive) {
            setRemoteContent(newContent)
            setRemotePending(true)
          } else {
            setContent(newContent)
          }
        }
      )
      .subscribe()

    const typingChannel = supabase
      .channel(`typing:${pageId}`)
      .on('broadcast', { event: 'typing' }, (p) => {
        if ((p.payload as { clientId?: string })?.clientId === clientIdRef.current) return
        setOtherEditing(true)
        setTimeout(() => setOtherEditing(false), OTHER_EDITING_WINDOW_MS)
      })
      .subscribe()
    typingChannelRef.current = typingChannel

    return () => {
      channel.unsubscribe()
      typingChannel.unsubscribe()
      typingChannelRef.current = null
    }
  }, [pageId])

  useEffect(() => {
    if (!hasChangesSinceSaveRef.current) return
    autosaveTimerRef.current = setInterval(() => {
      if (hasChangesSinceSaveRef.current) save()
    }, AUTOSAVE_INTERVAL_MS)
    return () => {
      if (autosaveTimerRef.current) clearInterval(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }
  }, [save])

  /* Guardar al cambiar de página (unmount) */
  useEffect(() => {
    return () => {
      if (hasChangesSinceSaveRef.current && pageId) {
        supabase
          .from('clipboard_pages')
          .update({
            content: contentRef.current,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pageId)
          .then(() => {})
      }
    }
  }, [pageId])

  const forceSave = useCallback(() => {
    save()
  }, [save])

  return {
    content,
    setContent: handleLocalChange,
    saveStatus,
    hasChangesSinceSave,
    error,
    otherEditing,
    remotePending,
    applyRemote,
    forceSave,
  }
}
