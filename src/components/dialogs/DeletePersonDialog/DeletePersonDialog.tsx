import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
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

interface DeletePersonDialogProps {
  children?: React.ReactNode;
  personName: string;
  isDeleting?: boolean;
  onConfirm: () => void | Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DeletePersonDialog({
  children,
  personName,
  isDeleting = false,
  onConfirm,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DeletePersonDialogProps) {
  const { t } = useTranslation();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? (setControlledOpen ?? (() => {})) : setUncontrolledOpen;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // Errors handled by caller / mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogCloseButton />
        <DialogHeader>
          <div className="flex gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 shrink-0 dark:bg-red-950/50">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle>
                {t("dialogs.deletePerson.title", { name: personName }) || `Delete "${personName}"?`}
              </DialogTitle>
              <DialogDescription>
                {t("dialogs.deletePerson.description") || "This action cannot be undone."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2.5 py-4">
          <p className="text-sm text-muted-foreground">
            {t("dialogs.deletePerson.warning") ||
              "Deleting this person will permanently remove them from the family tree, along with all their relationships."}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDeleting}
            onClick={() => setOpen(false)}
          >
            {t("dialogs.deletePerson.cancel") || "Cancel"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={handleConfirm}
          >
            {isDeleting
              ? t("dialogs.deletePerson.deleting") || "Deleting..."
              : t("dialogs.deletePerson.confirm") || "Delete person"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
