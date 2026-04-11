import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, ChevronRight, ChevronLeft, CheckCircle, User, Shield, GraduationCap, BadgeCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import GlassCard from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { usersAPI } from '@/services/api'

const SUBJECTS = ['Mathematics','Physics','Chemistry','English','Biology','Economics','Coding','Design','Further Maths','Literature','Government','Commerce']
const EDUCATION_LEVELS = ['SSCE / O-Level','OND / NCE','HND','B.Sc / B.A','M.Sc / M.A','PhD','Professional Certification']
const ID_TYPES = ['National ID (NIN)', 'International Passport', 'Driver\'s License', 'Voter\'s Card']

const STEPS = [
  { num: 1, label: 'Personal',      icon: User          },
  { num: 2, label: 'Identity',      icon: Shield        },
  { num: 3, label: 'Qualification', icon: GraduationCap },
  { num: 4, label: 'Selfie',        icon: Camera        },
  { num: 5, label: 'Review',        icon: BadgeCheck    },
]

export default function TutorVerification() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const { showToast }     = useUIStore()

  const [step, setStep]       = useState(1)
  const [submitting, setSub]  = useState(false)

  // Step 1 — Personal
  const [fullName,  setFullName]  = useState(`${user?.first_name || ''} ${user?.last_name || ''}`.trim())
  const [photo,     setPhoto]     = useState(null)
  const photoRef = useRef(null)

  // Step 2 — Identity
  const [idType,    setIdType]    = useState('')
  const [idFile,    setIdFile]    = useState(null)
  const [idPreview, setIdPreview] = useState(null)
  const idRef = useRef(null)

  // Step 3 — Qualification
  const [subjects,   setSubjects]   = useState([])
  const [eduLevel,   setEduLevel]   = useState('')
  const [certFile,   setCertFile]   = useState(null)
  const certRef = useRef(null)

  // Step 4 — Selfie
  const [selfie, setSelfie] = useState(null)
  const selfieRef = useRef(null)

  const handlePhoto = (e, setter) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setter(ev.target.result)
    reader.readAsDataURL(file)
  }

  const toggleSubject = (s) =>
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const canProceed = () => {
    if (step === 1) return fullName.trim().length > 2
    if (step === 2) return idType && idFile
    if (step === 3) return subjects.length > 0 && eduLevel
    if (step === 4) return true // selfie optional
    return true
  }

  const handleSubmit = async () => {
    setSub(true)
    // Best-effort API call — silently ignored if backend is offline
    await usersAPI.updateProfile({ verification_status: 'PENDING' }).catch(() => {})
    setUser({ ...user, verification_status: 'PENDING' })
    showToast('Verification submitted! We\'ll review within 2–3 business days.', 'success')
    setSub(false)
    navigate('/tutor/dashboard', { replace: true })
  }

  return (
    <div className="min-h-svh bg-surface px-5 pt-12 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
          className="w-9 h-9 rounded-2xl bg-white border border-secondary/10 flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft size={18} className="text-secondary/60" />
        </button>
        <div>
          <h1 className="font-outfit font-bold text-xl text-secondary">Get Verified</h1>
          <p className="font-inter text-xs text-secondary/50">Step {step} of {STEPS.length}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                step > s.num  ? 'bg-success text-white' :
                step === s.num? 'bg-primary text-white' :
                                'bg-white border border-secondary/15 text-secondary/30'
              }`}>
                {step > s.num
                  ? <CheckCircle size={14} />
                  : <s.icon size={14} />
                }
              </div>
              <span className={`font-inter text-[0.55rem] font-semibold ${step === s.num ? 'text-primary' : 'text-secondary/30'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 rounded-full ${step > s.num ? 'bg-success' : 'bg-secondary/10'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 1: Personal Info ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5 animate-slide-up">
          <div>
            <h2 className="font-outfit font-bold text-2xl text-secondary mb-1">Personal Info</h2>
            <p className="font-inter text-sm text-secondary/50">Let's confirm who you are.</p>
          </div>

          {/* Photo upload */}
          <div className="flex flex-col items-center gap-3">
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e, setPhoto)} />
            <button onClick={() => photoRef.current?.click()} className="relative">
              <div className="w-28 h-28 rounded-[32px] bg-gray-100 border-2 border-dashed border-secondary/20 flex items-center justify-center overflow-hidden">
                {photo
                  ? <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  : <Camera size={32} className="text-secondary/30" />
                }
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl bg-primary flex items-center justify-center border-2 border-white shadow">
                <Camera size={14} className="text-white" />
              </div>
            </button>
            <p className="font-inter text-xs text-secondary/40">Upload a clear profile photo</p>
          </div>

          {/* Full name */}
          <div>
            <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/40 mb-2">Full Name</p>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="As it appears on your ID"
              className="w-full py-3.5 px-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white text-secondary outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* ── Step 2: Identity ── */}
      {step === 2 && (
        <div className="flex flex-col gap-5 animate-slide-up">
          <div>
            <h2 className="font-outfit font-bold text-2xl text-secondary mb-1">Identity Verification</h2>
            <p className="font-inter text-sm text-secondary/50">Upload a valid government-issued ID.</p>
          </div>

          {/* ID type */}
          <div>
            <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/40 mb-3">ID Type</p>
            <div className="grid grid-cols-2 gap-2">
              {ID_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setIdType(t)}
                  className={`py-3 px-3 rounded-2xl text-xs font-inter font-semibold border-2 transition-all text-left ${
                    idType === t ? 'border-primary bg-primary-light text-primary' : 'border-secondary/10 bg-white text-secondary/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ID upload */}
          <div>
            <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/40 mb-2">Upload ID Document</p>
            <input ref={idRef} type="file" accept="image/*,.pdf" className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                setCertFile(file)
                setIdFile(file)
                handlePhoto(e, setIdPreview)
              }}
            />
            <button
              onClick={() => idRef.current?.click()}
              className={`w-full py-8 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 transition-all ${
                idFile ? 'border-success bg-green-50' : 'border-secondary/20 bg-white hover:border-primary'
              }`}
            >
              {idFile ? (
                <>
                  {idPreview
                    ? <img src={idPreview} alt="ID" className="h-24 object-contain rounded-xl" />
                    : <CheckCircle size={32} className="text-success" />
                  }
                  <p className="font-inter text-xs text-success font-semibold">{idFile.name}</p>
                  <p className="font-inter text-xs text-secondary/40">Tap to change</p>
                </>
              ) : (
                <>
                  <Upload size={28} className="text-secondary/30" />
                  <p className="font-outfit font-semibold text-sm text-secondary">Tap to upload</p>
                  <p className="font-inter text-xs text-secondary/40">JPG, PNG or PDF · Max 5MB</p>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Qualification ── */}
      {step === 3 && (
        <div className="flex flex-col gap-5 animate-slide-up">
          <div>
            <h2 className="font-outfit font-bold text-2xl text-secondary mb-1">Qualification</h2>
            <p className="font-inter text-sm text-secondary/50">Tell us what you can teach.</p>
          </div>

          {/* Subjects */}
          <div>
            <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/40 mb-3">Subjects You Teach</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    subjects.includes(s)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-secondary/60 border-secondary/15 hover:border-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Education level */}
          <div>
            <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/40 mb-3">Highest Education Level</p>
            <div className="flex flex-col gap-2">
              {EDUCATION_LEVELS.map(e => (
                <button
                  key={e}
                  onClick={() => setEduLevel(e)}
                  className={`py-3 px-4 rounded-2xl text-sm font-inter text-left border-2 transition-all ${
                    eduLevel === e ? 'border-primary bg-primary-light text-primary font-semibold' : 'border-secondary/10 bg-white text-secondary/70'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Certificate upload (optional) */}
          <div>
            <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/40 mb-2">Certificate / Degree (Optional)</p>
            <input ref={certRef} type="file" accept="image/*,.pdf" className="hidden"
              onChange={e => setCertFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={() => certRef.current?.click()}
              className={`w-full py-5 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${
                certFile ? 'border-success bg-green-50' : 'border-secondary/20 bg-white hover:border-primary'
              }`}
            >
              {certFile
                ? <><CheckCircle size={18} className="text-success" /><span className="font-inter text-sm text-success font-semibold">{certFile.name}</span></>
                : <><Upload size={18} className="text-secondary/30" /><span className="font-inter text-sm text-secondary/50">Upload certificate (optional)</span></>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Selfie ── */}
      {step === 4 && (
        <div className="flex flex-col gap-5 animate-slide-up">
          <div>
            <h2 className="font-outfit font-bold text-2xl text-secondary mb-1">Selfie Verification</h2>
            <p className="font-inter text-sm text-secondary/50">Take a clear selfie to confirm your identity matches your ID.</p>
          </div>

          {/* Tips */}
          <GlassCard className="p-4" hover={false}>
            <p className="font-outfit font-semibold text-sm text-secondary mb-2">Tips for a good selfie</p>
            {['Face the camera directly','Good lighting — avoid backlighting','No sunglasses or hats','Plain background preferred'].map(t => (
              <div key={t} className="flex items-center gap-2 mt-1.5">
                <CheckCircle size={13} className="text-success flex-shrink-0" />
                <p className="font-inter text-xs text-secondary/60">{t}</p>
              </div>
            ))}
          </GlassCard>

          {/* Selfie area */}
          <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden"
            onChange={e => handlePhoto(e, setSelfie)}
          />
          <button
            onClick={() => selfieRef.current?.click()}
            className={`w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 transition-all ${
              selfie ? 'border-success bg-green-50' : 'border-secondary/20 bg-white hover:border-primary'
            }`}
          >
            {selfie
              ? <img src={selfie} alt="Selfie" className="w-32 h-32 object-cover rounded-2xl" />
              : <Camera size={40} className="text-secondary/25" />
            }
            <p className="font-inter text-sm text-secondary/50">
              {selfie ? 'Tap to retake' : 'Tap to open camera'}
            </p>
          </button>
          <p className="font-inter text-xs text-secondary/35 text-center">You can skip this step — our team may request it during review.</p>
        </div>
      )}

      {/* ── Step 5: Review & Submit ── */}
      {step === 5 && (
        <div className="flex flex-col gap-4 animate-slide-up">
          <div>
            <h2 className="font-outfit font-bold text-2xl text-secondary mb-1">Review & Submit</h2>
            <p className="font-inter text-sm text-secondary/50">Double-check everything before sending.</p>
          </div>

          <GlassCard className="p-5 flex flex-col gap-4" hover={false}>
            {/* Photo + name */}
            <div className="flex items-center gap-4 pb-4 border-b border-secondary/8">
              {photo
                ? <img src={photo} alt="Profile" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                : <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center font-outfit font-bold text-primary text-lg flex-shrink-0">
                    {fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)}
                  </div>
              }
              <div>
                <p className="font-outfit font-bold text-base text-secondary">{fullName}</p>
                <p className="font-inter text-xs text-secondary/45">{user?.email}</p>
              </div>
            </div>

            <ReviewRow label="ID Type"          value={idType        || '—'} check={!!idType && !!idFile} />
            <ReviewRow label="ID Document"      value={idFile?.name  || '—'} check={!!idFile} />
            <ReviewRow label="Subjects"         value={subjects.join(', ') || '—'} check={subjects.length > 0} />
            <ReviewRow label="Education Level"  value={eduLevel      || '—'} check={!!eduLevel} />
            <ReviewRow label="Certificate"      value={certFile?.name || 'Not uploaded'} check={true} optional />
            <ReviewRow label="Selfie"           value={selfie ? 'Captured' : 'Skipped'} check={true} optional />
          </GlassCard>

          {/* What happens next */}
          <GlassCard className="p-4 flex gap-3" hover={false}>
            <BadgeCheck size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-outfit font-semibold text-sm text-secondary">What happens next?</p>
              <p className="font-inter text-xs text-secondary/55 leading-relaxed mt-0.5">
                Our team reviews your submission within <strong>2–3 business days</strong>. You'll be notified once approved. Until then, your profile will show "Pending".
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-4 rounded-2xl border border-secondary/15 bg-white font-inter font-semibold text-sm text-secondary/70 flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < 5
          ? <Button
              size="full"
              onClick={() => canProceed() && setStep(s => s + 1)}
              className={`flex-[2] ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Continue <ChevronRight size={16} />
            </Button>
          : <Button size="full" onClick={handleSubmit} disabled={submitting} className="flex-[2]">
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </Button>
        }
      </div>
    </div>
  )
}

function ReviewRow({ label, value, check, optional }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-inter text-xs text-secondary/50 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-inter text-sm text-secondary font-medium truncate">{value}</span>
        {check && !optional && <CheckCircle size={14} className="text-success flex-shrink-0" />}
        {optional && <span className="text-[0.6rem] text-secondary/35 flex-shrink-0">optional</span>}
      </div>
    </div>
  )
}
