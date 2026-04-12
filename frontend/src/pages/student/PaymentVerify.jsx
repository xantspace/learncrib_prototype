import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { paymentsAPI } from '@/services/api'
import Button from '@/components/ui/Button'

export default function PaymentVerify() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const reference  = params.get('reference') || params.get('trxref')

  const [status, setStatus]     = useState('verifying') // verifying | success | failed
  const [sessionId, setSession] = useState(null)
  const [detail, setDetail]     = useState('')

  useEffect(() => {
    if (!reference) { setStatus('failed'); setDetail('No payment reference found.'); return }

    paymentsAPI.verify(reference)
      .then(r => {
        const data = r.data
        if (data.status === 'success' || data.payment_status === 'SUCCESS') {
          setSession(data.session_id)
          setStatus('success')
        } else {
          setDetail(data.message || 'Payment was not completed.')
          setStatus('failed')
        }
      })
      .catch(() => {
        setDetail('Could not verify payment. Please check your sessions page.')
        setStatus('failed')
      })
  }, [reference])

  if (status === 'verifying') return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 px-8"
      style={{ background: 'linear-gradient(160deg, hsl(175,60%,96%) 0%, white 60%, hsl(220,40%,97%) 100%)' }}>
      <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
        <Loader size={36} className="text-primary animate-spin" />
      </div>
      <div className="text-center">
        <h2 className="font-outfit font-bold text-xl text-secondary">Verifying Payment</h2>
        <p className="font-inter text-sm text-secondary/55 mt-1">Please wait, do not close this page…</p>
      </div>
    </div>
  )

  if (status === 'success') return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: 'linear-gradient(160deg, hsl(175,60%,96%) 0%, white 60%, hsl(220,40%,97%) 100%)' }}>
      <div className="w-28 h-28 rounded-full bg-primary-light flex items-center justify-center mb-6 shadow-glow animate-slide-up">
        <CheckCircle size={56} className="text-primary" strokeWidth={1.5} />
      </div>
      <h1 className="font-outfit font-bold text-3xl text-secondary mb-2 animate-slide-up">Payment Successful!</h1>
      <p className="font-inter text-sm text-secondary/60 max-w-[280px] mb-8 animate-slide-up">
        Your funds are secured in escrow and will be released after your session is confirmed.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs animate-slide-up">
        {sessionId && (
          <Button size="full" onClick={() => navigate(`/student/booking-confirmation/${sessionId}`)}>
            View Booking Details
          </Button>
        )}
        <Button variant="ghost" size="full" onClick={() => navigate('/student/sessions')}>
          My Sessions
        </Button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-8 text-center bg-white">
      <div className="w-28 h-28 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <XCircle size={56} className="text-red-400" strokeWidth={1.5} />
      </div>
      <h1 className="font-outfit font-bold text-2xl text-secondary mb-2">Payment Failed</h1>
      <p className="font-inter text-sm text-secondary/60 max-w-[280px] mb-8">{detail}</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button size="full" onClick={() => navigate(-2)}>
          Try Again
        </Button>
        <Button variant="ghost" size="full" onClick={() => navigate('/student/sessions')}>
          View Sessions
        </Button>
      </div>
    </div>
  )
}
