import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { uploadApi } from '@/api/uploadApi'
import { educationApi } from '@/api/educationApi'
import type { EducationItem } from '@/types/familyTree'
import { X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { getErrorMessage } from '@/lib/errors'

interface Props {
  personId: string
  education?: EducationItem
  triggerLabel?: string
  triggerVariant?: 'default' | 'outline' | 'ghost'
  triggerSize?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
  onSuccess?: (education: EducationItem) => void
  children?: React.ReactNode
}

type FormValues = {
  title: string
  institution: string
  level?: string
  startDate?: string
  endDate?: string
  description?: string
  degreeUrl?: string
}

export default function EducationForm({
  personId,
  education,
  triggerLabel,
  triggerVariant,
  triggerSize,
  onSuccess,
  children
}: Props) {
  const { t } = useTranslation()
  const toast = useToast()
  const [open, setOpen] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)

  const editMode = Boolean(education?.id) 
  const defaultValues = React.useMemo(
    () => ({
      title: education?.title ?? '',
      institution: education?.institution ?? '',
      level: education?.level ?? '',
      startDate: education?.startDate?.split('T')[0] ?? '',
      endDate: education?.endDate?.split('T')[0] ?? '',
      description: education?.description ?? '',
      degreeUrl: education?.degreeUrl ?? '',
    }),
    [education],
  )

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues,
  })

  React.useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onClose = () => {
    setOpen(false)
    setFile(null)
    reset(defaultValues)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const uploadFileToCloudinary = async (): Promise<string | null> => {
    if (!file) return null
    setUploading(true)
    try {
      const signatureResp = await uploadApi.getAvatarUploadSignature(personId, 'media')
      const sig = signatureResp.data.data
      const form = new FormData()
      form.append('file', file)
      form.append('api_key', sig.apiKey)
      form.append('timestamp', String(sig.timestamp))
      form.append('signature', sig.signature)
      form.append('folder', sig.folder)

      const upResp = await fetch(sig.uploadUrl, { method: 'POST', body: form })
      if (!upResp.ok) throw new Error('Upload failed')
      const body = await upResp.json()
      return body.secure_url || body.url || null
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      let degreeUrl = data.degreeUrl || education?.degreeUrl
      if (file) {
        const url = await uploadFileToCloudinary()
        degreeUrl = url ?? degreeUrl
      }

      const payload = {
        title: data.title,
        institution: data.institution,
        level: data.level || 'OTHER',
        startDate: data.startDate || undefined,
        endDate: data.endDate || null,
        description: data.description,
        degreeUrl,
      }

      const response = editMode
        ? await educationApi.updateEducation(String(education?.id), payload)
        : await educationApi.createEducation(personId, payload)

      if (onSuccess) {
        onSuccess(response.data.data)
      }

      toast.success(
        editMode ? 'Education updated' : 'Education added',
        `${response.data.data.institution} has been saved.`,
      )
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(
        editMode ? 'Unable to update education' : 'Unable to add education',
        getErrorMessage(error, 'Please check the education details and try again.'),
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant={triggerVariant ?? (editMode ? 'ghost' : 'outline')} size={triggerSize ?? 'sm'}>
            {triggerLabel ?? (editMode ? t('education.edit') || 'Edit' : t('education.addEducation') || 'Add Education')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex w-[calc(100vw-0.75rem)] max-w-[720px] flex-col overflow-hidden rounded-lg border border-border bg-card p-0 max-h-[calc(100dvh-0.75rem)] sm:w-[min(100vw-1.5rem,720px)] sm:max-h-[90vh]">

        {/* Sticky Header */}
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border bg-card px-3 pb-2 pt-3">
          <div>
            <DialogTitle className="text-sm font-semibold text-foreground">
              {editMode ? t('education.editEducation') || 'Edit education' : t('education.addEducation') || 'Add Education'}
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              {editMode
                ? t('education.editEducationDesc') || 'Update this education record.'
                : t('education.addEducationDesc') || 'Add a new education record'}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          <form id="education-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            <div className="space-y-1">
              <label className="text-[11px] uppercase text-muted-foreground">
                {t('education.title') || 'Title'}
              </label>
              <Input className="h-9 text-sm" {...register('title', { required: true })} />
              {errors.title && <p className="text-xs text-destructive">{t('education.titleRequired') || 'Title is required'}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase text-muted-foreground">
                {t('education.institution') || 'Institution'}
              </label>
              <Input className="h-9 text-sm" {...register('institution', { required: true })} />
              {errors.institution && <p className="text-xs text-destructive">{t('education.institutionRequired') || 'Institution is required'}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase text-muted-foreground">
                {t('education.level') || 'Level'}
              </label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                {...(register('level') as any)}
              >
                <option value="">{t('education.levelPlaceholder') || 'Select level'}</option>
                <option value="HIGH_SCHOOL">{t('education.levelHighSchool') || 'High School'}</option>
                <option value="BACHELORS">{t('education.levelBachelors') || 'Bachelors'}</option>
                <option value="MASTERS">{t('education.levelMasters') || 'Masters'}</option>
                <option value="PHD">{t('education.levelPhd') || 'PhD'}</option>
                <option value="OTHER">{t('education.levelOther') || 'Other'}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] uppercase text-muted-foreground">
                  {t('education.startDate') || 'Start Date'}
                </label>
                <Input className="h-9 text-sm" type="date" {...register('startDate')} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase text-muted-foreground">
                  {t('education.endDate') || 'End Date'}
                </label>
                <Input className="h-9 text-sm" type="date" {...register('endDate')} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase text-muted-foreground">
                {t('education.description') || 'Description'}
              </label>
              <textarea
                className="min-h-[72px] w-full rounded-md border border-input bg-background px-2 py-2 text-sm resize-none"
                {...register('description')}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase text-muted-foreground">
                {t('education.degreeFile') || 'Degree / Marksheet (optional)'}
              </label>
              <div className="rounded-md border border-input bg-background p-3 space-y-1">
                <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="text-sm w-full" />
                <p className="text-xs text-muted-foreground">
                  {t('education.degreeFileHint') || 'Upload a photo or PDF of the certificate.'}
                </p>
                {file && <p className="text-xs text-foreground">{file.name}</p>}
              </div>
            </div>

          </form>
        </div>

        {/* Sticky Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('education.cancel') || 'Cancel'}
          </Button>
          <Button type="submit" form="education-form" size="sm" disabled={uploading}>
            {uploading
              ? (t('education.uploading') || 'Uploading...')
              : editMode
              ? (t('education.update') || 'Update')
              : (t('education.save') || 'Save')}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
