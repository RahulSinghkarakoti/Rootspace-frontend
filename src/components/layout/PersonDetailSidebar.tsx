import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X, ChevronDown, ChevronRight, BookOpen, Image, Info,
  Calendar, File, FileText, GraduationCap, Film, MapPin, Camera,
  Plus,
  Trash2,
  Pencil
} from 'lucide-react'
import { useTreeStore } from '@/store/treeStore'
import { Button } from '../ui/button'
import { useMutation } from '@tanstack/react-query'
import AvatarUploadDialog from '../dialogs/AvatarUploadDialog/AvatarUploadDialog'
import DeletePersonDialog from '@/components/dialogs/DeletePersonDialog/DeletePersonDialog'
import EducationMediaDialog from '@/components/dialogs/EducationMediaDialog/EducationMediaDialog'
import EducationForm from '@/components/education/EducationForm'
import { educationApi } from '@/api/educationApi'
import { EducationItem, PersonDetail } from '@/types/familyTree'
import { useToast } from '@/components/ui/toast'
import { getErrorMessage } from '@/lib/errors'



interface Props {
  fullLength?: boolean
  person: PersonDetail | null
  onClose: () => void
  canUploadAvatar?: boolean
  canManageEducation?: boolean
  canDelete?: boolean
  sharedToken?: string
  onDeletePerson?: (personId: string) => Promise<void>
}

function Section({
  title,
  icon,
  count,
  subtitle,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ReactNode
  count?: number
  subtitle?: string
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
          <div className="flex flex-col">
            <span>{title}</span>
            {subtitle && <span className="text-[10px] text-muted-foreground font-normal">{subtitle}</span>}
          </div>
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

export function PersonDetailSidebar({
  fullLength = false,
  person,
  onClose,
  canUploadAvatar = true,
  canManageEducation = true,
  canDelete = true,
  sharedToken,
  onDeletePerson,
}: Props) {
  const { t } = useTranslation()
  const toast = useToast()
  const isFemale = person?.gender === 'female'
  const { deleteNode, upsertPerson } = useTreeStore()
  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const mutation = useMutation({
    mutationFn: async (personId: string) => {
      if (onDeletePerson) {
        await onDeletePerson(personId)
        return
      }
      await deleteNode(personId)
    },
    onSuccess: () => {
      toast.success('Person deleted', 'The person was removed from the tree.')
      onClose()
    },
    onError: (error) => {
      toast.error(
        'Unable to delete person',
        getErrorMessage(error, 'An unexpected error occurred while deleting the person.'),
      )
    },
  });

  const onDelete = (personId: string) => {
    mutation.mutate(personId);
  };

  const handleEducationCreate = (education: EducationItem) => {
    if (!person) return
    upsertPerson({
      ...person,
      education: [education, ...(person.education ?? [])],
    })
  }

  const handleEducationUpdate = (education: EducationItem) => {
    if (!person) return
    upsertPerson({
      ...person,
      education: person.education.map((item) =>
        item.id === education.id ? education : item,
      ),
    })
  }

  const handleEducationDelete = async (educationId: number) => {
    if (!person) return
    const confirmed = window.confirm(
      t('education.deleteConfirm') || 'Delete this education record?'
    )
    if (!confirmed) return

    try {
      await educationApi.deleteEducation(String(educationId))
      upsertPerson({
        ...person,
        education: person.education.filter((item) => item.id !== educationId),
      })
      toast.success('Education deleted', 'The education record was removed.')
    } catch (error) {
      console.error(error)
      toast.error(
        'Unable to delete education',
        getErrorMessage(error, 'An unexpected error occurred while deleting the education record.'),
      )
    }
  }

  const educationMediaUrls = person?.education
    ?.map((item) => item.degreeUrl)
    .filter((url): url is string => Boolean(url)) ?? []

  const personMediaUrls = person?.media
    ?.map((item) => item.url)
    .filter((url): url is string => Boolean(url)) ?? []

  const mediaUrls = [...educationMediaUrls, ...personMediaUrls]

  return (
    <div
      className={`
        fixed   right-0 bottom-0 z-30
        flex flex-col
        bg-card/95 backdrop-blur-xl
        border-l border-white/10
        shadow-2xl
        transition-all duration-300 ease-in-out
        ${person ? 'w-[340px] translate-x-0' : 'w-[340px] translate-x-full'}
        ${fullLength ? 'h-full' : 'h-auto top-[56px]'}
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
            <div className="relative flex-shrink-0">
              <div
                className={`
                    relative flex items-center justify-center
                    w-16 h-16 rounded-2xl border-2 overflow-hidden
                    flex-shrink-0
                    ${isFemale
                    ? 'border-rose-400/50 bg-rose-500/15 text-rose-300'
                    : 'border-sky-400/50 bg-sky-500/15 text-sky-300'
                  }
              `}
              >
                {person?.avatarUrl ? (
                  <img src={person.avatarUrl} alt={person.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold">
                    {(person?.fullName ?? '')
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              {person && canUploadAvatar && (
                <AvatarUploadDialog personId={person.id} sharedToken={sharedToken}>
                  <button className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Camera className="w-3 h-3 text-muted-foreground" />
                  </button>
                </AvatarUploadDialog>
              )}
            </div>
            <div className="flex-1 min-w-0">
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
        <Section title={t('personDetail.personalInfo') || 'Personal Info'} icon={<Info className="w-3.5 h-3.5" />}>
          <div className="space-y-3">
            <InfoRow label={t('personDetail.fullName') || 'Full Name'} value={person?.fullName} />
            <InfoRow label={t('personDetail.birthDate') || 'Birth Date'} value={formatDate(person?.birthDate ?? null)} />
            <InfoRow label={t('personDetail.deathDate') || 'Death Date'} value={formatDate(person?.deathDate ?? null)} />
            {person?.birthPlace && <InfoRow label={t('personDetail.birthPlace') || 'Birth Place'} value={person.birthPlace} />}
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
          count={person?.education?.length}
        // subtitle={person?.education && person.education.length > 0 ? `${person.education[0].degree || person.education[0].title} · ${person.education[0].institution}` : undefined}
        >
          {!person?.education?.length ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-foreground">{t('personDetail.noEducationFound') || 'No education found'}</p>
                {/* <p className="text-[11px] text-muted-foreground/60">{t('personDetail.addFirstEducation') || 'Add your first education record'}</p> */}
              </div>
              {person && canManageEducation && (
                <EducationForm personId={person.id} onSuccess={handleEducationCreate}>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                    <Plus className="w-3 h-3" />
                    {t('education.addEducation') || 'Add Education'}
                  </Button>
                </EducationForm>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-2">
                {person && canManageEducation && (
                  <EducationForm personId={person.id} onSuccess={handleEducationCreate}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </EducationForm>
                )}
              </div>
              <div className="space-y-3">
                {(person?.education ?? []).map((edu) => (
                  <div
                    key={edu.id}
                    className="p-3 rounded-xl bg-violet-500/8 border border-violet-500/15 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-foreground leading-tight">{edu.institution}</p>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatDate(edu.startDate) ?? edu.startDate}
                          {' – '}
                          {edu.endDate ? formatDate(edu.endDate) ?? edu.endDate : t('education.present') || 'Present'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {canManageEducation && (
                          <>
                            <EducationForm
                              personId={person.id}
                              education={edu}
                              onSuccess={handleEducationUpdate}
                              triggerVariant="ghost"
                              triggerSize="icon"

                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full "
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                            </EducationForm>
                            <EducationMediaDialog urls={educationMediaUrls}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full "
                              ><File   className="w-3 h-3" />
                              </Button>
                            </EducationMediaDialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full text-destructive"
                              onClick={() => handleEducationDelete(edu.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{edu.level}</p>
                    {edu.description && (
                      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>


      </div>
      {canDelete && (
        <DeletePersonDialog
          personName={person?.fullName || ''}
          isDeleting={mutation.isPending}
          onConfirm={() => {
            if (person) {
              return mutation.mutateAsync(person.id)
            }
          }}
        >
          <Button variant="destructive" size="sm" className="mx-5 my-2 mt-4 w-auto">
            {t('personDetail.deletePerson') || 'Delete Person'}
          </Button>
        </DeletePersonDialog>
      )}
    </div>
  )
}
