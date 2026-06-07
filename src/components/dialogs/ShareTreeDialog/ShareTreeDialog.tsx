import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import React from 'react'
import { PERMISSION_OPTIONS } from "@/utils/permission";
import { useMutation } from "@tanstack/react-query";
import { treesApi } from "@/api/treesApi";
import type { treeLink } from "@/types/familyTree";
import { useToast } from "@/components/ui/toast";
import { getErrorMessage } from "@/lib/errors";
import { formatDistanceToNow } from "date-fns";
import { Copy, Trash, Eye, Pencil, MoreVertical } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const EXPIRY_OPTIONS = [
    { value: "3m", label: "3 months" },
    { value: "6m", label: "6 months" },
    { value: "12m", label: "12 months" },
    { value: "never", label: "Never" },
]

interface ShareTreeDialogProps {
    treeId: number
    onClose: () => void
    children: React.ReactNode
    linkHistory?: treeLink[]
}

const ShareTreeDialog = ({
    treeId,
    onClose,
    children,
    linkHistory = [],
}: ShareTreeDialogProps) => {
    const toast = useToast()
    const [open, setOpen] = React.useState(false)
    const [tab, setTab] = React.useState<'create' | 'history'>('create')
    const [permission, setPermission] = React.useState<string>("VIEW_ONLY")
    const [expiry, setExpiry] = React.useState<string>("never")
    const [personLimit, setPersonLimit] = React.useState<number | "">("")
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<string | null>(null)
    const [createdLinks, setCreatedLinks] = React.useState<treeLink[]>(linkHistory)

    const isPersonLimitRequired = permission === "ADD_PERSON" || permission === "EDITOR"

    const copyShareLink = async (link: string) => {
        try {
            await navigator.clipboard.writeText(link)
            setSuccess('Link copied to clipboard')
            toast.success('Link copied', 'The share link is ready to paste.')
        } catch (error) {
            setSuccess(null)
            toast.error(
                'Copy failed',
                getErrorMessage(error, 'The link was created, but could not be copied automatically.'),
            )
        }
    }

    const deleteShareLink = async (linkToken: string) => {
        try {
            await treesApi.deleteShareLink(linkToken, treeId)
            setCreatedLinks((prev) => prev.filter(link => link.token !== linkToken))
            toast.success('Link deleted', 'The share link has been successfully deleted.')
        } catch (error) {
            toast.error(
                'Delete failed',
                getErrorMessage(error, 'The link could not be deleted. Please try again.'),
            )
        }
    }


    const mutation = useMutation({
        mutationFn: async (payload: { permission: string; expiresAt: string; personLimit?: number | null }) =>
            await treesApi.genrateShareLink(treeId, payload),
        onSuccess: (response: any) => {
            const linkData = response.data.data
            const shareLink = linkData.link
            setError(null)
            setCreatedLinks((prev: treeLink[]) => [linkData, ...prev])
            setTab('history')
            void copyShareLink(shareLink)
        },
        onError: (err: any) => {
            const errorMessage = getErrorMessage(
                err,
                "An unexpected error occurred while generating the share link.",
            )
            setError(errorMessage)
            setSuccess(null)
            toast.error('Unable to create share link', errorMessage)
        },
    })

    const canGenerate = !mutation.isPending && (!isPersonLimitRequired || Number(personLimit) > 0)

    const handleGenerate = () => {
        setError(null)
        setSuccess(null)
        const payload = {
            permission,
            expiresAt: expiry,
            personLimit: isPersonLimitRequired ? Number(personLimit) || null : null,
        }
        mutation.mutate(payload)
    }

    return (
        <Dialog open={open} onOpenChange={(value) => {
            setOpen(value)
            if (!value) {
                setError(null)
                setSuccess(null)
                onClose()
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="flex max-h-[calc(100dvh-1rem)] flex-col overflow-hidden p-0">
                <DialogCloseButton />
                <DialogHeader className="shrink-0 px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
                    <DialogTitle>Share Tree</DialogTitle>
                    <DialogDescription>
                        Create or review generated sharing links for this tree.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-2 sm:space-y-4 sm:px-4 sm:py-3">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant={tab === 'create' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setTab('create')}
                        >
                            Create Link
                        </Button>
                        <Button
                            type="button"
                            variant={tab === 'history' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setTab('history')}
                        >
                            Created Links
                        </Button>
                    </div>

                    {tab === 'create' ? (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Permission Level
                                </label>
                                <Select value={permission} onValueChange={setPermission}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select permission" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PERMISSION_OPTIONS.map((perm) => {
                                            const Icon = perm.icon
                                            return (
                                                <SelectItem key={perm.value} value={perm.value}>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                                        <span>{perm.label}</span>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {PERMISSION_OPTIONS.find((p) => p.value === permission)?.description}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Link Expiration
                                </label>
                                <Select value={expiry} onValueChange={setExpiry}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select expiration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EXPIRY_OPTIONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {isPersonLimitRequired && (
                                <div className="space-y-2">
                                    <label htmlFor="personLimit" className="text-sm font-medium text-foreground">
                                        Person Limit
                                    </label>
                                    <Input
                                        id="personLimit"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={personLimit}
                                        onChange={(e) => setPersonLimit(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Number of persons allowed"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Set the maximum number of added people for this link.
                                    </p>
                                </div>
                            )}

                            {(error || success) && (
                                <div className="space-y-2">
                                    {error ? (
                                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                            {error}
                                        </div>
                                    ) : null}
                                    {success ? (
                                        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                            {success}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {createdLinks.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
                                    No share links created yet. Generate one from the Create Link tab.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {createdLinks.map((link) => (
                                        <ShareLinkCard
                                            key={link.id}
                                            link={link}
                                            permissionOptions={PERMISSION_OPTIONS}
                                            copyShareLink={copyShareLink}
                                            deleteShareLink={deleteShareLink}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="shrink-0 px-3 pb-3 sm:px-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(false)}
                    >
                        Close
                    </Button>
                    {tab === 'create' ? (
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                        >
                            Generate Link
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ShareTreeDialog

interface ShareLinkCardProps {
    link: treeLink
    permissionOptions: {
        value: string
        label: string
        description?: string
        rights?: string[]
        icon?: React.ElementType
    }[]
    copyShareLink: (url: string) => void
    deleteShareLink: (token: string) => void
}

export function ShareLinkCard({
    link,
    permissionOptions,
    copyShareLink,
    deleteShareLink,
}: ShareLinkCardProps) {
    const permission = permissionOptions.find(
        (item) => item.value === link.permission
    )

    const Icon = permission?.icon || Eye

    return (
        <div className="rounded-xl border bg-card p-2 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-4">

                {/* Content */}
                <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-3">
                        <div className=" w-full flex items-center justify-start">
                            <div className="flex h-9 w-9 mr-3 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                    {permission?.label || link.permission}
                                </p>

                                <p className="truncate text-xs text-muted-foreground">
                                    {permission?.description}
                                </p>
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2">
                            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => deleteShareLink(link.token)}>
                                <Trash className="h-4 w-4" />

                            </Button>


                        </div>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs">

                        {link.expiresAt && link.expiresAt !== "never"
                            ? (
                                <span className="rounded-md bg-muted px-2 py-1">
                                    `Expires ${formatDistanceToNow(link.expiresAt)}`
                                </span>
                            )
                            : ""}

                        {link.personLimit && (
                            <span className="rounded-md bg-muted px-2 py-1">
                                Limit {link.personLimit}
                            </span>
                        )}
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                        <p className="flex-1 truncate text-xs text-muted-foreground">{link.link}</p>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copyShareLink(link.link)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>


            </div>
        </div>
    )
}
