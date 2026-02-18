import { useCallback, useState, useEffect } from 'react'
import { useClipboardPage } from '../hooks/useClipboardPage'
import { useToast } from '../components/Toast'
import { IconTrash, IconCopy, IconSave, IconLoad } from '../components/Icons'

type Props = { pageId: string }

export function ClipboardPage({ pageId }: Props) {
  const toast = useToast()
  const {
    content,
    setContent,
    saveStatus,
    hasChangesSinceSave,
    error,
    otherEditing,
    remotePending,
    applyRemote,
    forceSave,
  } = useClipboardPage(pageId)

  const [clearConfirm, setClearConfirm] = useState(false)
  const [copyFlash, setCopyFlash] = useState(false)
  const [saveFlash, setSaveFlash] = useState(false)

  useEffect(() => {
    if (!clearConfirm) return
    const t = setTimeout(() => setClearConfirm(false), 3000)
    return () => clearTimeout(t)
  }, [clearConfirm])

  const handleClear = useCallback(() => {
    if (!clearConfirm) {
      setClearConfirm(true)
      return
    }
    setContent('')
    setClearConfirm(false)
  }, [clearConfirm, setContent])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopyFlash(true)
      toast('Copied to clipboard', 'success')
      setTimeout(() => setCopyFlash(false), 600)
    } catch {
      toast('Failed to copy', 'error')
    }
  }, [content, toast])

  const handleSave = useCallback(() => {
    forceSave()
  }, [forceSave])

  useEffect(() => {
    if (saveStatus === 'saved') {
      setSaveFlash(true)
      const t = setTimeout(() => setSaveFlash(false), 600)
      return () => clearTimeout(t)
    }
  }, [saveStatus])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        handleCopy()
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleCopy, handleSave])

  return (
    <div className={`clipboard-page clipboard-page--${pageId}`}>
      <div className="clipboard-page-inner">
      <div className="toolbar">
        <div className="toolbar-left">
          <button
            type="button"
            className={`btn btn-danger btn-toolbar ${clearConfirm ? 'confirm' : ''}`}
            onClick={handleClear}
            title={clearConfirm ? 'Click again to confirm' : 'Clear all'}
          >
            <IconTrash />
            <span>{clearConfirm ? 'Confirm clear?' : 'Clear'}</span>
          </button>
          <button
            type="button"
            className={`btn btn-toolbar ${copyFlash ? 'btn-flash-success' : ''}`}
            onClick={handleCopy}
            title="Copy to clipboard (Ctrl+A)"
          >
            <IconCopy />
            <span>Copy <kbd>Ctrl+A</kbd></span>
          </button>
          <button
            type="button"
            className={`btn btn-primary btn-toolbar ${saveFlash ? 'btn-flash-success' : ''}`}
            onClick={handleSave}
            title="Save now (Ctrl+S)"
          >
            <IconSave />
            <span>Save <kbd>Ctrl+S</kbd></span>
          </button>
          {otherEditing && (
            <span className="indicator other-editing">Someone is editing…</span>
          )}
        </div>
        <div className="toolbar-right">
          {remotePending && (
            <div className="remote-banner">
              <span>Remote changes available</span>
              <button type="button" className="btn btn-sm" onClick={applyRemote}>
                <IconLoad />
                <span>Load</span>
              </button>
            </div>
          )}
          <span className={`status status-${saveStatus}`}>
            {saveStatus === 'saving' && 'Saving…'}
            {saveStatus === 'saved' && 'Saved'}
            {saveStatus === 'idle' && hasChangesSinceSave && 'Unsaved changes'}
            {saveStatus === 'error' && 'Error'}
          </span>
        </div>
      </div>
      {error && <div className="error-banner">{error}</div>}
      <textarea
        className="content-area"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type here…"
        spellCheck={false}
      />
      </div>
    </div>
  )
}
