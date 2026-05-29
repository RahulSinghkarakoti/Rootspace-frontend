import {
    Eye,
    Image,
    UserPlus,
    PenSquare,
    ShieldCheck,
    Crown,
} from "lucide-react";

export const PERMISSION_OPTIONS = [
    {
        value: "VIEW_ONLY",
        rights: ["read"],
        label: "View Only",
        icon: Eye,
        description: "Can only view family tree and details.",
    },
    {
        value: "MEDIA_ONLY",
        rights: ["read", "media"],
        label: "Media Contributor",
        icon: Image,
        description: "Can upload and manage media files.",
    },
    {
        value: "ADD_PERSON",
        rights: ["read", "add_person"],
        label: "Person Contributor",
        icon: UserPlus,
        description: "Can add new people to the tree.",
    },
    {
        value: "CONTRIBUTOR",
        rights: ["read", "add_person", "media"],
        label: "Contributor",
        icon: PenSquare,
        description: "Can add people and upload media.",
    },
    {
        value: "EDITOR",
        rights: ["read", "add_person", "media", "edit_own"],
        label: "Editor",
        icon: ShieldCheck,
        description: "Can edit their own contributions.",
    },
    {
        value: "FULL_ACCESS",
        rights: ["read", "add_person", "media", "edit_own", "edit_any"],
        label: "Administrator",
        icon: Crown,
        description: "Full access including editing all records.",
    },
];

export const getPermissionRights = (permission?: string | null) =>
    PERMISSION_OPTIONS.find((item) => item.value === permission)?.rights ?? [];

export const hasPermissionRight = (permission: string | null | undefined, right: string) => {
     return getPermissionRights(permission).includes(right);
}
