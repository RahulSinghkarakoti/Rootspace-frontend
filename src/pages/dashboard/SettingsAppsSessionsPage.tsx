import { useAuth } from "@/hooks/useAuth"
import { useAuthStore } from "@/store/authStore"
import { useEffect, useState } from "react"
import * as Separator from "@radix-ui/react-separator"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
    Monitor,
    Smartphone,
    Tablet,
    MapPin,
    Clock,
    LogOut,
    Shield,
    ShieldCheck,
    X,
    AlertTriangle,
    Loader2,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { Button } from "@/components/ui/button";

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
import { authApi } from "@/api/authApi"

export default function SettingsAppsSessionsPage() {
    const { getSessionInfo, isLoading } = useAuth()
    const { sessionInfo } = useAuthStore()
    const [revokingId, setRevokingId] = useState<number | null>(null)
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

    useEffect(() => {
        getSessionInfo()
    }, [getSessionInfo])
    async function handleRevoke(id: number) {
        setRevokingId(id)
        try {
            await authApi.revokeSession(id)
        } finally {
            setRevokingId(null)
            getSessionInfo()
        }
    }
    const sessions: SessionInfo[] = sessionInfo ?? []
    const otherSessions = sessions.filter((s) => !s.isCurrent)

    return (
        <div className="space-y-6 p-2 ">
            <div className=" ">
                <section className=" flex flex-col   rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Shield
                            className="w-10 h-10 text-primary"
                        />
                        <div className="space-y-1 flex flex-col ">
                            <h2
                                className="text-sm font-semibold text-foreground"
                            >
                                Active Sessions
                            </h2>
                            <p
                                className="text-xs leading-relaxed text-muted-foreground"
                            >
                                Sessions are the devices you are using or that have used your  account. These are the sessions where your account is currently logged in. You can log out of each session.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
            {isLoading ? (
                <div className="flex items-center gap-2 py-8 justify-center">
                    <Loader2
                        className="w-4 h-4 animate-spin"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                    />
                    <span
                        className="text-xs text-muted-foreground"
                    >
                        Loading sessions...
                    </span>
                </div>
            ) : sessions.length === 0 ? (
                <p
                    className="py-8 text-center text-xs text-muted-foreground"
                >
                    No active sessions found.
                </p>
            ) : (
                <div className="space-y-3">
                    {/* Current session first */}
                    {sessions
                        .filter((s) => s.isCurrent)
                        .map((s) => (
                            <SessionCard
                                key={s.id}
                                session={s}
                                onRevoke={handleRevoke}
                                revoking={revokingId === s.id}
                            />
                        ))}

                    {/* Other sessions */}
                    {otherSessions.length > 0 && (
                        <>
                            <p
                                className="pt-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                            >
                                Other Devices
                            </p>
                            {otherSessions.map((s) => (
                                <SessionCard
                                    key={s.id}
                                    session={s}
                                    onRevoke={handleRevoke}
                                    revoking={revokingId === s.id}
                                />
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* Session count footer */}
            {!isLoading && sessions.length > 0 && (
                <>
                    <Separator.Root
                        className="h-px bg-border "
                    />
                    <p
                        className="text-[11px] text-muted-foreground text-center"
                    >
                        {sessions.length} active{" "}
                        {sessions.length === 1 ? "session" : "sessions"} total
                    </p>
                </>
            )}
        </div>
    )
}


function parseDevice(ua: string): {
    icon: React.ReactNode
    label: string
    browser: string
    os: string
} {
    const isMobile = /Mobile|Android/i.test(ua)
    const isTablet = /Tablet|iPad/i.test(ua)

    let browser = "Unknown Browser"
    if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome"
    else if (/Firefox\//.test(ua)) browser = "Firefox"
    else if (/Safari\//.test(ua)) browser = "Safari"
    else if (/Edg\//.test(ua)) browser = "Edge"

    let os = "Unknown OS"
    if (/Windows NT/.test(ua)) os = "Windows"
    else if (/Mac OS X/.test(ua)) os = "macOS"
    else if (/Android/.test(ua)) os = "Android"
    else if (/Linux/.test(ua)) os = "Linux"
    else if (/iPhone|iPad/.test(ua)) os = "iOS"

    const iconClass = "w-5 h-5"
    const icon = isMobile ? (
        <Smartphone className={iconClass} />
    ) : isTablet ? (
        <Tablet className={iconClass} />
    ) : (
        <Monitor className={iconClass} />
    )

    return { icon, label: isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop", browser, os }
}

interface SessionInfo {
    id: number
    deviceInfo: string
    ipAddress: string
    createdAt: string
    expiresAt: string
    isCurrent: boolean
}

function SessionCard({
    session,
    onRevoke,
    revoking,
}: {
    session: SessionInfo
    onRevoke: (id: number) => void
    revoking: boolean
}) {
    const [confirmOpen, setConfirmOpen] = useState(false)
    const device = parseDevice(session.deviceInfo)
    const isCurrent = session?.isCurrent
    const expiry = formatDistanceToNow(session.expiresAt)

    return (
        <>
            <div
                className={`group relative rounded-lg border transition-all duration-200 ${isCurrent
                    ? "border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)]"
                    : "border-border"
                    } bg-card`}
            >
                {/* Current session badge */}
                {isCurrent && (
                    <div
                        className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full px-2 py-0.5 
                        text-[10px] font-semibold uppercase tracking-wider text-primary-foreground bg-primary"
                    >
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Current Session
                    </div>
                )}

                <div className="flex items-start gap-4 p-4">
                    {/* Device icon */}
                    <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isCurrent
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                            }`}
                    >
                        {device.icon}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span
                                className="text-sm font-semibold  "
                            >
                                {device.browser} on {device.os}
                            </span>
                            <span
                                className="text-[11px] font-medium px-1.5 py-0.5 rounded text-muted-foreground bg-muted/50"

                            >
                                {device.label}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span
                                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                                <MapPin className="w-3 h-3" />
                                {session.ipAddress}
                            </span>
                            <span
                                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                                <Clock className="w-3 h-3" />
                                Signed in {format(session.createdAt, "MMM d, yyyy 'at' h:mm a")}
                            </span>
                            <span
                                className={`flex items-center gap-1.5 text-xs font-medium  `}
                            >
                                {expiry}
                            </span>
                        </div>
                    </div>

                    {/* Revoke button */}
                    {!isCurrent && (
                        <Tooltip.Provider delayDuration={300}>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={() => setConfirmOpen(true)}
                                        disabled={revoking}
                                        className="shrink-0 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150 disabled:opacity-50 cursor-pointer text-destructive hover:bg-destructive/10 focus:outline-none focus:ring-2 
                                        focus:ring-destructive focus:ring-offset-2 disabled:hover:bg-transparent"

                                    >
                                        {revoking ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <LogOut className="w-3.5 h-3.5" />
                                        )}
                                        Revoke
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        side="top"
                                        className="rounded px-2 py-1 text-xs shadow-md bg-foreground text-background"
                                    >
                                        Sign out this device
                                        <Tooltip.Arrow className="fill-foreground"
                                        />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                    )}
                </div>
            </div>

            {/* Confirm dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent
                    className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-2xl bg-card border-border "

                >
                    <DialogHeader
                        className="mb-4 flex flex-row items-center gap-3 text-left"
                    >
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10"
                        >
                            <AlertTriangle
                                className="h-5 w-5 text-destructive"
                            />
                        </div>

                        <div>
                            <DialogTitle className="text-base font-semibold">
                                Revoke this session?
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    <div
                        className="text-xs leading-relaxed"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                        The device using {device.browser} on {device.os} will be
                        signed out immediately.
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            onClick={() => setConfirmOpen(false)}
                            type="button"
                            variant="outline"
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setConfirmOpen(false)
                                onRevoke(session.id)
                            }}
                            type="button"
                            variant="destructive"
                            size="sm"
                        >
                            Revoke Session
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    )
}