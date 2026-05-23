import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { treesApi } from "@/api/treesApi";
import type { TreeSummary } from "@/types";
import { useTreeStore } from "@/store/treeStore";

interface DeleteTreeDialogProps {
  children: React.ReactNode;
  tree: TreeSummary;
  onSuccess?: () => void;
}

export default function DeleteTreeDialog({
  children,
  tree,
  onSuccess,
}: DeleteTreeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isDeleting = useTreeStore(s => s.deletingTree)
  const deleteTree = useTreeStore(s => s.deleteTree)

  const handleDelete = () => {
    setError(null)
    deleteTree(tree.id)
      .then(() => {
        setOpen(false)
        if (onSuccess) {
          onSuccess()
        }
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message ||
          "An unexpected error occurred while deleting the tree."
        setError(errorMessage)
      })
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 shrink-0">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-base text-red-900">
                Delete "{tree.name}"?
              </DialogTitle>
              <DialogDescription className="text-xs text-red-700">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2.5 py-3">
          <p className="text-xs text-muted-foreground">
            Deleting this tree will permanently remove it and all associated
            data including:
          </p>
          <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
            <li>All family members and relations</li>
            <li>All media and documents</li>
            <li>All collaborator access</li>
          </ul>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="text-xs"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete tree"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
