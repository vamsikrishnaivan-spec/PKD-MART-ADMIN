'use client'

import { useState, useEffect } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function PushSubscribeButton() {
  const [status, setStatus] = useState('idle')
  const [userId, setUserId] = useState<string | null>(null)

  // 🔒 Fetch logged in admin user (adjust based on your auth logic)
  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    if (stored) {
      const parsed = JSON.parse(stored)
      setUserId(parsed?._id || parsed?.id || null)
    }
  }, [])

  if (!userId) {
    return (
      <div className="p-4 text-red-500">
        Error: user not logged in (missing userId)
      </div>
    )
  }

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) return setStatus('no-sw')
    try {
      setStatus('registering')

      const reg = await navigator.serviceWorker.register('/sw.js')

      setStatus('requesting-permission')

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return setStatus('denied')

      setStatus('subscribing')

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // detect browser and device
      const browser =
        /chrome|crios|crmo/i.test(navigator.userAgent)
          ? 'chrome'
          : /firefox|fxios/i.test(navigator.userAgent)
            ? 'firefox'
            : 'other'

      const device = /mobile/i.test(navigator.userAgent)
        ? 'mobile'
        : 'desktop'

      // send subscription to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription: sub,
          browser,
          device,
        }),
      })

      if (!res.ok) throw new Error('subscribe failed')

      setStatus('subscribed')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) return setStatus('no-sw')

      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()

        // remove from DB
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: sub.endpoint,
          }),
        })
      }

      setStatus('unsubscribed')
    } catch (err) {
      console.error(err)
      setStatus('error-unsub')
    }
  }

  return (
    <div className="space-y-4 p-4">

      {/* SUBSCRIBE BUTTON */}
      <button
        onClick={subscribe}
        disabled={status === 'loading' || status === 'subscribed'}
        className={`w-full rounded-lg px-4 py-2 font-semibold transition
          ${status === 'subscribed'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
          ${status === 'loading' && 'opacity-70 cursor-not-allowed'}
        `}
      >
        {status === 'subscribed' ? 'Notifications Enabled ✔' : 'Enable Notifications'}
      </button>

      {/* UNSUBSCRIBE BUTTON */}
      <button
        onClick={unsubscribe}
        disabled={status === 'loading' || status === 'unsubscribed'}
        className={`w-full rounded-lg px-4 py-2 font-semibold transition
          ${status === 'unsubscribed'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-yellow-500 text-white hover:bg-yellow-600'
          }
          ${status === 'loading' && 'opacity-70 cursor-not-allowed'}
        `}
      >
        {status === 'unsubscribed' ? 'Notifications Disabled ✖' : 'Disable Notifications'}
      </button>

      {/* STATUS TEXT */}
      <div className="text-gray-700 font-medium">
        Status: <span className="font-semibold">{status}</span>
      </div>
    </div>
  )
}
