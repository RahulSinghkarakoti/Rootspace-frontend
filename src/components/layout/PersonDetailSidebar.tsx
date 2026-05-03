import { useState } from 'react'
import {
  X, ChevronDown, ChevronRight, BookOpen, Image, Info,
  Calendar, User, FileText, GraduationCap, Film, MapPin
} from 'lucide-react'
import { useTreeStore } from '@/store/treeStore'
import { Button } from '../ui/button'

interface EducationItem {
  id: number
  institution: string
  degree: string
  field: string
  from: string
  to: string | null
  description?: string
}

interface MediaItem {
  id: number
  type: 'photo' | 'video' | 'document'
  title: string
  date: string
  url?: string
  thumbnail?: string
  description?: string
}

interface PersonDetail {
  id: string
  fullName: string
  gender: 'male' | 'female'
  birthDate: string | null
  deathDate: string | null
  notes?: string
  birthPlace?: string
  education: EducationItem[]
  media: MediaItem[]
}

interface Props {
  person: PersonDetail | null
  onClose: () => void
}

function Section({
  title,
  icon,
  count,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ReactNode
  count?: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/4 hover:bg-white/8 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-muted-foreground">{icon}</span>
          {title}
          {count !== undefined && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-muted-foreground font-normal">
              {count}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && <div className="px-4 pb-4 pt-3 space-y-3">{children}</div>}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-medium">{label}</span>
      <span className="text-[13px] text-foreground">{value}</span>
    </div>
  )
}

const MEDIA_ICON: Record<string, React.ReactNode> = {
  photo: <Image className="w-3.5 h-3.5" />,
  video: <Film className="w-3.5 h-3.5" />,
  document: <FileText className="w-3.5 h-3.5" />,
}

const MEDIA_COLOR: Record<string, string> = {
  photo: 'bg-teal-500/15 text-teal-300 border-teal-500/20',
  video: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  document: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
}

export function PersonDetailSidebar({ person, onClose }: Props) {
  const isFemale = person?.gender === 'female'
  const { deleteNode } = useTreeStore()
  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div
      className={`
        fixed top-[56px] right-0 bottom-0 z-30
        flex flex-col
        bg-card/95 backdrop-blur-xl
        border-l border-white/10
        shadow-2xl
        transition-all duration-300 ease-in-out
        ${person ? 'w-[340px] translate-x-0' : 'w-[340px] translate-x-full'}
      `}
    >
      {/* Header */}
      <div
        className={`
          flex-shrink-0 p-5 border-b border-white/8
          ${isFemale
            ? 'bg-gradient-to-br from-rose-500/10 to-transparent'
            : 'bg-gradient-to-br from-sky-500/10 to-transparent'
          }
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar placeholder — ready for profile image */}
            <div
              className={`
                relative flex items-center justify-center
                w-16 h-16 rounded-2xl border-2 text-lg font-bold
                overflow-hidden flex-shrink-0
                ${isFemale
                  ? 'border-rose-400/50 bg-rose-500/15 text-rose-300'
                  : 'border-sky-400/50 bg-sky-500/15 text-sky-300'
                }
              `}
            >
              {person?.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">{person?.fullName}</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{person?.gender}</p>
              {person?.birthDate && (
                <p className="text-[11px] text-muted-foreground">
                  b. {new Date(person.birthDate).getFullYear()}
                  {person.deathDate && ` – d. ${new Date(person.deathDate).getFullYear()}`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
        {/* Meta Info */}
        <Section title="Personal Info" icon={<Info className="w-3.5 h-3.5" />}>
          <div className="space-y-3">
            <InfoRow label="Full Name" value={person?.fullName} />
            <InfoRow label="Birth Date" value={formatDate(person?.birthDate ?? null)} />
            <InfoRow label="Death Date" value={formatDate(person?.deathDate ?? null)} />
            {person?.birthPlace && <InfoRow label="Birth Place" value={person.birthPlace} />}
            {person?.notes && (
              <div className="p-3 rounded-lg bg-white/4 border border-white/8 text-[12px] text-muted-foreground leading-relaxed italic">
                "{person.notes}"
              </div>
            )}
          </div>
        </Section>

        {/* Education */}
        <Section
          title="Education"
          icon={<GraduationCap className="w-3.5 h-3.5" />}
          count={person?.education.length}
        >
          {person?.education.length === 0 ? (
            <p className="text-[12px] text-muted-foreground/60 italic">No education records.</p>
          ) : (
            <div className="space-y-3">
              {person?.education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-3 rounded-xl bg-violet-500/8 border border-violet-500/15 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-semibold text-foreground leading-tight">{edu.institution}</p>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {edu.from}–{edu.to ?? 'Present'}
                    </span>
                  </div>
                  <p className="text-[11px] text-violet-300 font-medium">{edu.degree}</p>
                  <p className="text-[11px] text-muted-foreground">{edu.field}</p>
                  {edu.description && (
                    <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Media */}
        <Section
          title="Media"
          icon={<Image className="w-3.5 h-3.5" />}
          count={person?.media.length}
          defaultOpen={false}
        >
          {person?.media.length === 0 ? (
            <p className="text-[12px] text-muted-foreground/60 italic">No media items.</p>
          ) : (
            <div className="space-y-2">
              {person?.media.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/4 border border-white/8 hover:bg-white/6 transition-colors cursor-pointer"
                >
                  {/* Thumbnail placeholder */}
                  <div
                    className={`
                      flex-shrink-0 flex items-center justify-center
                      w-10 h-10 rounded-lg border text-xs
                      ${MEDIA_COLOR[item.type]}
                    `}
                  >
                    {MEDIA_ICON[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.date}</p>
                    {item.description && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border font-medium ${MEDIA_COLOR[item.type]}`}
                  >
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

      </div>
              <Button variant="destructive" size="sm" className="mx-5 my-2 mt-4 w-auto" onClick={() => person && deleteNode(person.id)}>
        Delete Person
      </Button>
    </div>
  )
}