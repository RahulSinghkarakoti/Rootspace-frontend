import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CreatePersonData, PersonDetail } from "@/types/familyTree";
import { personApi } from "@/api/personApi";
import { useTreeStore } from "../../../store/treeStore";

interface CreatePersonDialogProps {
  children: React.ReactNode;
  onSuccess?: (person: PersonDetail) => void;
  treeId: number;
  relationType?: string;
  fromId?: string; // ID of the person to link this new person to
}

const defaultFormValues: CreatePersonData = {
  fullName: "",
  gender: null,
  birthDate: null,
  deathDate: null,
  notes: "",
  birthPlace: "",
  relations: [],
};

const relationTypes = [
  { value: "PARENT_OF", key: "dialogs.relations.parentOf" },
  { value: "SPOUSE_OF", key: "dialogs.relations.spouseOf" },
  // { value: "SIBLING_OF", key: "dialogs.relations.siblingOf" },
];

const CreatePersonDialog: React.FC<CreatePersonDialogProps> = ({
  children,
  onSuccess,
  treeId,
  relationType,
  fromId = null,
}) => {
  const { t } = useTranslation();
  const loadCurrentTree = useTreeStore((state) => state.loadCurrentTree)
  const [open, setOpen] = React.useState(false);
  const [showDeathDate, setShowDeathDate] = React.useState(false);
  // const [relationType, setRelationType] = React.useState(
  //   fromId ? "PARENT_OF" : "",
  // );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePersonData>({
    defaultValues: defaultFormValues,
  });

  const gender = watch("gender") as "male" | "female" | null;
  const deathDate = watch("deathDate");

  const genderOptions = [
    { value: "male" as const, label: t("dialogs.createPerson.male") },
    { value: "female" as const, label: t("dialogs.createPerson.female") },
  ];

  React.useEffect(() => {
    if (!open) {
      reset(defaultFormValues);
      setShowDeathDate(false);
      // setRelationType(fromId ? "PARENT_OF" : "");
    }
  }, [open, fromId, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreatePersonData) =>
      personApi.createPerson(treeId, data),
    onSuccess: async (res) => {
      onSuccess?.(res.data.data);
      await loadCurrentTree(treeId, true)
      setOpen(false);
    },
  });

  const onSubmit = (data: CreatePersonData) => {
    mutation.mutate({
      ...data,
      relations:
        fromId && relationType
          ? [
            {
              toId: fromId.toString(),
              type: relationType as any,
              isActive: true,
            },
          ]
          : [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={
          "flex flex-col gap-0 p-0 overflow-hidden w-full h-[100dvh] rounded-none " +
          "sm:h-auto sm:max-h-[90dvh] sm:rounded-xl sm:max-w-2xl lg:max-w-3xl"
        }
      > 
        <DialogHeader className="shrink-0 px-5 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-base leading-snug">
            {t("dialogs.createPerson.title")}
          </DialogTitle>
          {fromId && (
            <DialogDescription className="text-xs mt-0.5">
              {t("dialogs.createPerson.description")}
            </DialogDescription>
          )}
        </DialogHeader>

        <form
          id="create-person-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="fullName">
                {t("dialogs.createPerson.fullName")}
              </Label>
              <Input
                id="fullName"
                placeholder={t("dialogs.createPerson.fullNamePlaceholder")}
                {...register("fullName", { required: true })}
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">
                  {t("dialogs.createTree.treeNameRequired")}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>{t("dialogs.createPerson.gender")}</Label>
              <div className="grid grid-cols-2 gap-2 h-10">
                {genderOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setValue(
                        "gender",
                        gender === option.value ? null : option.value,
                      )
                    }
                    className={`h-10 rounded-md border text-sm transition-colors ${gender === option.value
                        ? option.value === "male"
                          ? "border-sky-400 bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                          : "border-pink-400 bg-pink-50 text-pink-800 dark:bg-pink-950 dark:text-pink-200"
                        : "border-input bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="birthDate">
                {t("dialogs.createPerson.birthDate")}
              </Label>
              <Input id="birthDate" type="date" {...register("birthDate")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="birthPlace">
                {t("dialogs.createPerson.birthPlace")}
              </Label>
              <Input
                id="birthPlace"
                placeholder={t("dialogs.createPerson.birthPlacePlaceholder")}
                {...register("birthPlace")}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !showDeathDate;
              setShowDeathDate(next);
              if (!next) setValue("deathDate", "");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-input bg-muted/40 hover:bg-muted transition-colors text-left"
          >
            <div
              className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${showDeathDate ? "bg-destructive/70" : "bg-input"}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${showDeathDate ? "left-4" : "left-0.5"}`}
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">
                {t("dialogs.createPerson.deceasedQuestion")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("dialogs.createPerson.deceasedDescription")}
              </p>
            </div>
          </button>

          {showDeathDate && (
            <div className="space-y-1">
              <Label htmlFor="deathDate">
                {t("dialogs.createPerson.deathDate")}
              </Label>
              <Input id="deathDate" type="date" {...register("deathDate")} />
            </div>
          )}

          {/* {fromId && (
            <div className="space-y-1.5">
              <Label>{t("dialogs.createPerson.relationship")}</Label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {relationTypes.map((relation) => (
                  <button
                    key={relation.value}
                    type="button"
                    onClick={() => setRelationType(relation.value)}
                    className={`py-2 px-1 rounded-lg border text-center leading-tight transition-colors ${
                      relationType === relation.value
                        ? "border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
                        : "border-input bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="block text-xs font-medium">
                      {t(relation.key)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )} */}

          <div className="space-y-1">
            <Label htmlFor="notes">{t("dialogs.createPerson.notes")}</Label>
            <textarea
              id="notes"
              rows={2}
              placeholder={t("dialogs.createPerson.notesPlaceholder")}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              {...register("notes")}
            />
          </div>
        </form>

        <div className="shrink-0 flex justify-end gap-2 px-5 py-3 border-t border-border bg-background">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              {t("dialogs.createPerson.cancel")}
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="create-person-form"
            size="sm"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t("dialogs.createPerson.adding")
              : t("dialogs.createPerson.addPerson")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePersonDialog;
