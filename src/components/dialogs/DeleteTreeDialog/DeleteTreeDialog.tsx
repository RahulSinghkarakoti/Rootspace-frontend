import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from "@/components/ui/dialog";
import type { TreeSummary } from "@/types";
import { useTreeStore } from "@/store/treeStore";
import { getErrorMessage } from "@/lib/errors";

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
  const toast = useToast()
  const [open, setOpen] = React.useState(false);

  const isDeleting = useTreeStore(s => s.deletingTree)
  const deleteTree = useTreeStore(s => s.deleteTree)

  const handleDelete = () => {
    deleteTree(tree.id)
      .then(() => {
        setOpen(false)
        toast.success("Tree deleted", `"${tree.name}" was removed.`)
        if (onSuccess) {
          onSuccess()
        }
      })
      .catch((err) => {
        toast.error(
          "Unable to delete tree",
          getErrorMessage(err, "An unexpected error occurred while deleting the tree."),
        )
      })
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogCloseButton />
        <DialogHeader>
          <div className="flex gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 shrink-0">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete "{tree.name}"?</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2.5 py-4">
          <p className="text-sm text-muted-foreground">
            Deleting this tree will permanently remove it and all associated
            data including:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>All family members and relations</li>
            <li>All media and documents</li>
            <li>All collaborator access</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDeleting}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
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
