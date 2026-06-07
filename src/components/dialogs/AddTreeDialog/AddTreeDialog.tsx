import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type { CreateTreePayload, TreeSummary } from '@/types'
import { useTreeStore } from '@/store/treeStore'
import { getErrorMessage } from '@/lib/errors'

interface AddTreeDialogProps {
  children: React.ReactNode
  onSuccess?: (tree: TreeSummary) => void
}

const defaultFormValues: CreateTreePayload = {
  treeName: '',
  type: 'FAMILY',
  coverImage: '',
  isPublic: false,
}

export default function AddTreeDialog({ children, onSuccess }: AddTreeDialogProps) {
  const { t } = useTranslation() 
  const toast = useToast()
  const [open, setOpen] = React.useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateTreePayload>({
    defaultValues: defaultFormValues,
  })

  const creaatingTree = useTreeStore(s => s.creatingTree)
  const createTree = useTreeStore(s => s.createTree)
  const treeType = watch('type') ?? 'FAMILY'

  React.useEffect(() => {
    if (!open) {
      reset(defaultFormValues)
    }
  }, [open, reset])
 

  const onSubmit = (formValues: CreateTreePayload) => {
     createTree(formValues)
      .then((newTree) => {
        setOpen(false)
        toast.success('Tree created', `"${newTree.name}" is ready to edit.`)
        if (onSuccess) {
          onSuccess(newTree)
        }
      })
      .catch((error) => {
        toast.error('Unable to create tree', getErrorMessage(error, 'Please check the tree details and try again.'))
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-1rem)] flex-col overflow-hidden p-0">
        <DialogCloseButton />
        <DialogHeader className="shrink-0 px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
          <DialogTitle>{t('dialogs.createTree.title')}</DialogTitle>
          <DialogDescription>
            {t('dialogs.createTree.description')}
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-2 sm:space-y-4 sm:px-4">
            <div className="grid gap-1.5">
              <Label htmlFor="treeName" className="text-sm font-medium">
                {t('dialogs.createTree.treeName')}
              </Label>
              <Input
                id="treeName"
                {...register('treeName', { required: t('dialogs.createTree.treeNameRequired') })}
                placeholder="Johnson Family Tree"
              />
              {errors.treeName && (
                <p className="text-xs text-destructive">{errors.treeName.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="treeType" className="text-sm font-medium">
                {t('dialogs.createTree.treeType')}
              </Label>
              <Select value={treeType} onValueChange={(value) => setValue('type', value as CreateTreePayload['type'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAMILY">Family</SelectItem>
                  <SelectItem value="EDUCATIONAL">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="coverImage" className="text-sm font-medium">
                {t('dialogs.createTree.coverImage')}
              </Label>
              <Input
                id="coverImage"
                {...register('coverImage')}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isPublic"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-amber-500 focus:ring-amber-500"
                {...register('isPublic')}
              />
              <Label htmlFor="isPublic" className="mb-0 text-sm font-medium">
                {t('dialogs.createTree.publicTree')}
              </Label>
            </div>
          </div>

          <DialogFooter className="shrink-0 px-3 pb-3 sm:px-4">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              {t('dialogs.createTree.cancel')}
            </Button>
            <Button type="submit" size="sm" disabled={creaatingTree}>
              {creaatingTree ? t('dialogs.createTree.creating') : t('dialogs.createTree.createTree')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
