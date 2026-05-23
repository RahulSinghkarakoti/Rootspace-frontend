import * as React from 'react'
import { useMutation } from '@tanstack/react-query'
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
import { uploadApi } from '@/api/uploadApi'
import { useTreeStore } from '@/store/treeStore'
import { Camera, UploadCloud } from 'lucide-react'

interface AvatarUploadDialogProps {
  personId: string
  children: React.ReactNode
}

interface AvatarUploadResult {
  avatarUrl: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function AvatarUploadDialog({ personId, children }: AvatarUploadDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const people = useTreeStore((state) => state.people)
  const upsertPerson = useTreeStore((state) => state.upsertPerson)

  const person = React.useMemo(
    () => people.find((item) => item.id === personId) ?? null,
    [people, personId],
  )

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  React.useEffect(() => {
    if (!open) {
      setFile(null)
      setError(null)
      setDragActive(false)
    }
  }, [open])

  const mutation = useMutation<AvatarUploadResult, Error, void>({
    mutationFn: async () => {
      if (!file) throw new Error(t('dialogs.avatarUpload.noFile'))

      const signatureResponse = await uploadApi.getAvatarUploadSignature()
      const signatureData = signatureResponse.data.data

      const uploadForm = new FormData()
      uploadForm.append('file', file)
      uploadForm.append('api_key', signatureData.apiKey)
      uploadForm.append('timestamp', String(signatureData.timestamp))
      uploadForm.append('signature', signatureData.signature)
      uploadForm.append('folder', signatureData.folder)

      const uploadResponse = await fetch(signatureData.uploadUrl, {
        method: 'POST',
        body: uploadForm,
      })

      if (!uploadResponse.ok) {
        const body = await uploadResponse.text()
        throw new Error(body || t('dialogs.avatarUpload.uploadError'))
      }

      const uploadResult = await uploadResponse.json()
      const cloudinaryUrl = uploadResult.secure_url || uploadResult.url
      const publicId = uploadResult.public_id

      if (!cloudinaryUrl || !publicId) {
        throw new Error(t('dialogs.avatarUpload.uploadError'))
      }

      const saveResponse = await uploadApi.saveAvatar({
        personId,
        cloudinaryUrl,
        publicId,
      })

      return saveResponse.data.data
    },
    onSuccess: (data) => {
      setOpen(false)
      setFile(null)
      if (person) {
        upsertPerson({ ...person, avatarUrl: data.avatarUrl })
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : String(error))
    },
  })

  const isUploading = mutation.status === 'pending'

  const setSelectedFile = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null)
      setError(null)
      return
    }

    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError(t('dialogs.avatarUpload.invalidType'))
      return
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      setError(t('dialogs.avatarUpload.fileTooLarge'))
      return
    }

    setError(null)
    setFile(nextFile)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) setSelectedFile(dropped)
  }

  const handleBrowse = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (selected) setSelectedFile(selected)
  }

  const onClear = () => {
    setFile(null)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{t('dialogs.avatarUpload.title')}</DialogTitle>
          <DialogDescription>{t('dialogs.avatarUpload.description')}</DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border rounded-3xl p-6 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/10' : 'border-dashed border-border bg-slate-50/80'
            }`}
          >
            {previewUrl ? (
              <div className="mx-auto mb-4 w-28 h-28 rounded-full overflow-hidden border border-border bg-white">
                <img src={previewUrl} alt={t('dialogs.avatarUpload.previewAlt')} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-muted flex items-center justify-center text-foreground/70">
                <UploadCloud className="w-9 h-9" />
              </div>
            )}

            <p className="text-sm font-semibold text-foreground mb-2">
              {file ? file.name : t('dialogs.avatarUpload.dragDropPrompt')}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t('dialogs.avatarUpload.dragDropHint')}
            </p>

            <label className="inline-flex items-center justify-center rounded-full border border-input px-4 py-2 text-sm font-medium text-foreground shadow-sm cursor-pointer hover:bg-muted">
              {t('dialogs.avatarUpload.browseButton')}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleBrowse}
              />
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => mutation.mutate()}
              disabled={!file || isUploading}
              className="flex-1"
            >
              {isUploading ? t('dialogs.avatarUpload.uploading') : t('dialogs.avatarUpload.uploadAvatar')}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" onClick={onClear}>
                {t('dialogs.avatarUpload.cancel')}
              </Button>
            </DialogClose>
          </div>

          <div className="text-xs text-muted-foreground">
            {t('dialogs.avatarUpload.uploadHelp')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
