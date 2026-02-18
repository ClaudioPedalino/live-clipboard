import { createContext, useCallback, useContext, useState, useRef } from 'react'

type Toast = {
  id: number
  message: string
  type: 'success' | 'error'
}

const ToastContext = createContext<((msg: string, type?: 'success' | 'error') => void) | null>(null)

export function useToast() {
  const toast = useContext(ToastContext)
  if (!toast) throw new Error('useToast must be used within ToastProvider')
  return toast
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
