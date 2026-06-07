import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CreatePersonData, PersonDetail, RelationItem } from "@/types/familyTree";
import { personApi } from "@/api/personApi";
import { treesApi } from "@/api/treesApi";
import { useTreeStore } from "../../../store/treeStore";
import { getErrorMessage } from "@/lib/errors";

interface CreateUpdatePersonDialogProps {
  children: React.ReactNode;
  onSuccess?: (person: PersonDetail) => void;
  treeId: number;
  relationType?: string;
  fromId?: string; // ID of the person to link this new person to
  personData?: CreatePersonData; // Optional pre-filled data for the form
  sharedToken?: string;
  onSharedSuccess?: (payload: {
    newPerson: PersonDetail
    createdRelations: RelationItem[]
    unknownSpouse?: PersonDetail | null
  }) => void;
  onSharedUpdate?: (person: PersonDetail) => void;
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

const toDateInputValue = (value?: string | null) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
};

const getFormValues = (personData?: CreatePersonData | null): CreatePersonData => ({
  ...defaultFormValues,
  ...personData,
  birthDate: toDateInputValue(personData?.birthDate),
  deathDate: toDateInputValue(personData?.deathDate),
});

const normalizePerson = (person: PersonDetail): PersonDetail => ({
  ...person,
  education: person.education ?? [],
  media: person.media ?? [],
});

const CreateUpdatePersonDialog: React.FC<CreateUpdatePersonDialogProps> = ({
  children,
  onSuccess,
  treeId,
  relationType,
  fromId = null,
  personData = null,
  sharedToken,
  onSharedSuccess,
  onSharedUpdate,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const addPerson = useTreeStore((state) => state.addPerson)
  const upsertPerson = useTreeStore((state) => state.upsertPerson)
  const addRelations = useTreeStore((state) => state.addRelations)
  const [open, setOpen] = React.useState(false);
  const [showDeathDate, setShowDeathDate] = React.useState(false);
  // const [relationType, setRelationType] = React.useState(
  //   fromId ? "PARENT_OF" : "",
  // );
  const isEditMode = Boolean(personData?.id);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePersonData>({
    defaultValues: getFormValues(personData),
  });

  const gender = watch("gender") as "male" | "female" | null;
  const deathDate = watch("deathDate");

  const genderOptions = [
    { value: "male" as const, label: t("dialogs.createPerson.male") },
    { value: "female" as const, label: t("dialogs.createPerson.female") },
  ];

  React.useEffect(() => {
    if (open) {
      const formValues = getFormValues(personData);
      reset(formValues);

      setShowDeathDate(!!formValues.deathDate);
    } else {
      reset(defaultFormValues);
      setShowDeathDate(false);
    }
  }, [open, personData, reset]);


  const mutation = useMutation({
    mutationFn: async (data: CreatePersonData) => {
      if (isEditMode && personData?.id) {
        console.log("Updating person with data:", data);
        if (sharedToken) {
          return treesApi.updateSharedPerson(
            sharedToken,
            personData.id,
            data
          );
        }
        return personApi.updatePerson(
          personData.id,
          data
        );
      }

      if (sharedToken) {
        return treesApi.createSharedPerson(sharedToken, data);
      }

      return personApi.createPerson(treeId, data);
    },

    onSuccess: (res, variables) => {
      const data = res.data.data;
      onSuccess?.(data);

      if (isEditMode) {
        upsertPerson(data);
        onSharedUpdate?.(data);
        toast.success("Person updated", `${data.fullName} has been saved.`);
      } else {
        const { createdRelations: relations = [], newPerson, unknownSpouse } = data;
        addPerson(normalizePerson(newPerson));
        unknownSpouse ? addPerson(normalizePerson(unknownSpouse)) : null;
        addRelations(relations);
        onSharedSuccess?.({ newPerson, createdRelations: relations, unknownSpouse });
        toast.success("Person added", `${newPerson.fullName} was added to the tree.`);
      }

      setOpen(false);
    },
    onError: (error) => {
      toast.error(
        isEditMode ? "Unable to update person" : "Unable to add person",
        getErrorMessage(error, "Please check the person details and try again."),
      );
    },
  });

  const onSubmit = (data: CreatePersonData) => {
    const payload: CreatePersonData = {
      fullName: data.fullName,
      gender: data.gender,
      birthDate: data.birthDate,
      deathDate: data.deathDate,
      notes: data.notes,
      birthPlace: data.birthPlace,
    };

    if (!isEditMode && fromId && relationType) {
      payload.relations = [
        {
          toId: fromId.toString(),
          type: relationType as any,
          isActive: true,
        },
      ];
    }

    mutation.mutate(payload);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex w-[calc(100vw-0.75rem)] max-w-3xl max-h-[calc(100dvh-0.75rem)] flex-col gap-0 overflow-hidden p-0 sm:w-full sm:max-h-[90dvh]">
        <DialogCloseButton />
        <DialogHeader className="shrink-0 border-b border-border px-3 pb-2 pt-3 sm:px-4 sm:pb-3 sm:pt-4">
          <DialogTitle>
            {isEditMode
              ? t("dialogs.editPerson.title")
              : t("dialogs.createPerson.title")}
          </DialogTitle>
          {fromId && (
            <DialogDescription>
              {t("dialogs.createPerson.description")}
            </DialogDescription>
          )}
        </DialogHeader>

        <form
          id="create-person-form"
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-2 sm:space-y-4 sm:px-4 sm:py-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="fullName">
                {t("dialogs.createPerson.fullName")}
              </Label>
              <Input
                id="fullName"
                placeholder={t("dialogs.createPerson.fullNamePlaceholder")}
                {...register("fullName", {
                  required: true,
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(
                      /\b\w/g,
                      (c: string) => c.toUpperCase()
                    )
                  }
                })}
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              if (!next) setValue("deathDate", null);
            }}
            className="flex w-full items-center gap-3 rounded-lg border border-input bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted sm:py-2.5"
          >
            <div
              className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${showDeathDate ? "bg-destructive/70" : "bg-input"}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${showDeathDate ? "left-4" : "left-0.5"}`}
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium leading-snug">
                {t("dialogs.createPerson.deceasedQuestion")}
              </p>
              <p className="text-xs leading-snug text-muted-foreground">
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

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-background px-3 py-2 sm:flex-row sm:justify-end sm:px-4">
          <DialogCloseButton asChild>
            <Button type="button" variant="outline" size="sm">
              {t("dialogs.createPerson.cancel")}
            </Button>
          </DialogCloseButton>
          <Button
            type="submit"
            form="create-person-form"
            size="sm"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? isEditMode ? t("dialogs.editPerson.editing") : t("dialogs.createPerson.adding")
              : isEditMode
                ? t("dialogs.editPerson.editPerson")
                : t("dialogs.createPerson.addPerson")}
          </Button>


        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUpdatePersonDialog;
