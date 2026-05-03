import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { treesApi } from '@/api/treesApi'
import type { CreateTreePayload, TreeSummary } from '@/types'

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
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTreePayload>({
    defaultValues: defaultFormValues,
  })

  React.useEffect(() => {
    if (!open) {
      reset(defaultFormValues)
    }
  }, [open, reset])

  const mutation = useMutation({
    mutationFn: (payload: CreateTreePayload) => treesApi.create(payload),
    onSuccess: (response) => {
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['trees'] })
      onSuccess?.(response.data.data)
    },
  })

  const onSubmit = (formValues: CreateTreePayload) => {
    mutation.mutate(formValues)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{t('dialogs.createTree.title')}</DialogTitle>
          <DialogDescription className="text-xs">
            {t('dialogs.createTree.description')}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label htmlFor="treeName" className="text-xs">
              {t('dialogs.createTree.treeName')}
            </Label>
            <Input
              id="treeName"
              {...register('treeName', { required: t('dialogs.createTree.treeNameRequired') })}
              placeholder="Johnson Family Tree"
              className="h-8 text-xs"
            />
            {errors.treeName && (
              <p className="text-xs text-destructive">{errors.treeName.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="treeType" className="text-xs">
              {t('dialogs.createTree.treeType')}
            </Label>
            <select
              id="treeType"
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('type')}
            >
              <option value="FAMILY">Family</option>
              <option value="EDUCATIONAL">Educational</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="coverImage" className="text-xs">
              {t('dialogs.createTree.coverImage')}
            </Label>
            <Input
              id="coverImage"
              {...register('coverImage')}
              placeholder="https://..."
              className="h-8 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isPublic"
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-input text-amber-500 focus:ring-amber-500"
              {...register('isPublic')}
            />
            <Label htmlFor="isPublic" className="mb-0 text-xs">
              {t('dialogs.createTree.publicTree')}
            </Label>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" className="text-xs">
                {t('dialogs.createTree.cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" className="text-xs" disabled={mutation.isPending}>
              {mutation.isPending ? t('dialogs.createTree.creating') : t('dialogs.createTree.createTree')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
