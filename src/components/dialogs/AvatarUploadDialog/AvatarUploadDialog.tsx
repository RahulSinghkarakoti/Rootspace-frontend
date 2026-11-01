import * as React from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from '@/components/ui/dialog'
import { uploadApi } from '@/api/uploadApi'
import { useTreeStore } from '@/store/treeStore'
import { useSharedTreeStore } from '@/store/sharedTreeStore'
import { Camera, UploadCloud, X } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'

interface AvatarUploadDialogProps {
  personId: string
  children: React.ReactNode
  sharedToken?: string
}

interface AvatarUploadResult {
  avatarUrl: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function AvatarUploadDialog({ personId, children, sharedToken }: AvatarUploadDialogProps) {
  const { t } = useTranslation()
  const toast = useToast()
  const [open, setOpen] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const treePeople = useTreeStore((state) => state.people)
  const treeUpsertPerson = useTreeStore((state) => state.upsertPerson)
  const sharedPeople = useSharedTreeStore((state) => state.people)
  const sharedUpsertPerson = useSharedTreeStore((state) => state.upsertPerson)

  const people = sharedToken ? sharedPeople : treePeople
  const upsertPerson = sharedToken ? sharedUpsertPerson : treeUpsertPerson

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

      const signatureResponse = await uploadApi.getAvatarUploadSignature(personId, 'avatar', sharedToken)
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
        shareToken: sharedToken,
      })

      return saveResponse.data.data
    },
    onSuccess: (data) => {
      setOpen(false)
      setFile(null)
      toast.success(
        t('dialogs.avatarUpload.title'),
        t('dialogs.avatarUpload.uploadSuccess', { defaultValue: 'Avatar uploaded successfully.' }),
      )
      if (person) {
        upsertPerson({ ...person, avatarUrl: data.avatarUrl })
      }
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error, t('dialogs.avatarUpload.uploadError'))
      setError(errorMessage)
      toast.error(t('dialogs.avatarUpload.uploadError'), errorMessage)
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
      const message = t('dialogs.avatarUpload.invalidType')
      setError(message)
      toast.error(t('dialogs.avatarUpload.uploadError'), message)
      return
    }

    if (nextFile.size > MAX_FILE_SIZE) {
      const message = t('dialogs.avatarUpload.fileTooLarge')
      setError(message)
      toast.error(t('dialogs.avatarUpload.uploadError'), message)
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
      <DialogContent className="flex w-[calc(100vw-1rem)] max-w-lg flex-col overflow-hidden p-0">
        <DialogCloseButton />
        <DialogHeader className="shrink-0 px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
          <DialogTitle>{t('dialogs.avatarUpload.title')}</DialogTitle>
          <DialogDescription>{t('dialogs.avatarUpload.description')}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 pb-3 pt-3 sm:space-y-4 sm:px-4 sm:pb-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`rounded-lg border p-3 text-center transition-colors sm:rounded-xl sm:p-4 ${dragActive ? 'border-primary bg-primary/10' : 'border-dashed border-border bg-muted/40'
              }`}
          >
            <div className="flex items-center gap-3">
              {previewUrl ? (
                <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden border border-border bg-white">
                  <img src={previewUrl} alt={t('dialogs.avatarUpload.previewAlt')} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-14 h-14 shrink-0 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <UploadCloud className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {file ? file.name : t('dialogs.avatarUpload.dragDropPrompt')}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {t('dialogs.avatarUpload.dragDropHint')}
                </p>
                <label className="mt-2 inline-flex items-center rounded-full border border-input px-3 py-1 text-xs font-medium text-foreground cursor-pointer hover:bg-muted">
                  {t('dialogs.avatarUpload.browseButton')}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleBrowse} />
                </label>
              </div>
            </div>
          </div>



          {error && (
            <div className="rounded-xl border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {
            file &&
            (


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
              </div>
            )
          }

        </div>
      </DialogContent>
    </Dialog>
  )
}
