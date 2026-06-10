import React from 'react'
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
import { Button } from '@/components/ui/button';

const isPdfUrl = (url: string) => /\.pdf(\?.*)?$/i.test(url)

const EducationMediaDialog = ({ urls, children }: { urls: string[]; children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false)
    const [currentIndex, setCurrentIndex] = React.useState(0)

    const normalizedUrls = urls ?? []
    const hasMedia = normalizedUrls.length > 0
    const currentUrl = hasMedia ? normalizedUrls[currentIndex] : ''

    const goPrevious = () => {
        if (!hasMedia) return
        setCurrentIndex((prev) => (prev - 1 + normalizedUrls.length) % normalizedUrls.length)
    }

    const goNext = () => {
        if (!hasMedia) return
        setCurrentIndex((prev) => (prev + 1) % normalizedUrls.length)
    }

    const renderPreview = (url: string, index: number) => {
        const selected = index === currentIndex
        const commonClasses = `rounded-lg border p-0.5 transition-all duration-200 cursor-pointer flex-shrink-0 ${selected
                ? 'border-primary ring-2 ring-primary/40'
                : 'border-border hover:border-primary'
            }`

        if (isPdfUrl(url)) {
            return (
                <button
                    key={url + index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`${commonClasses} flex h-16 w-16 sm:h-20 sm:w-20 flex-col items-center justify-center bg-muted text-xs text-muted-foreground`}
                >
                    <span className="font-semibold text-[11px]">PDF</span>
                    <span className="text-[10px]">{index + 1}</span>
                </button>
            )
        }

        return (
            <button
                key={url + index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={commonClasses}
            >
                <img
                    src={url}
                    alt={`preview-${index + 1}`}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-md object-cover block"
                />
            </button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(value) => {
            setOpen(value)
            if (!value) setCurrentIndex(0)
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="w-full max-w-3xl p-4 sm:p-6 gap-0">
                <DialogCloseButton />

                <DialogHeader className="mb-3">
                </DialogHeader>

                {!hasMedia ? (
                    <div className="rounded-lg border border-border bg-muted px-4 py-12 text-center text-sm text-muted-foreground">
                        No media available.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {/* Main viewer with overlaid nav buttons */}
                        <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted"
                            style={{ aspectRatio: '16/9' }}>

                            {isPdfUrl(currentUrl) ? (
                                <iframe
                                    title={`pdf-preview-${currentIndex}`}
                                    src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(currentUrl)}`}
                                    className="absolute inset-0 h-full w-full"
                                />
                            ) : (
                                <img
                                    src={currentUrl}
                                    alt={`media-${currentIndex + 1}`}
                                    className="absolute inset-0 h-full w-full object-contain"
                                />
                            )}

                            {/* Overlay nav — only show if more than 1 item */}
                            {normalizedUrls.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={goPrevious}
                                        aria-label="Previous"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                            strokeLinejoin="round" className="h-4 w-4">
                                            <path d="M15 18l-6-6 6-6" />
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={goNext}
                                        aria-label="Next"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                            strokeLinejoin="round" className="h-4 w-4">
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </button>

                                    {/* Dot indicator */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {normalizedUrls.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setCurrentIndex(i)}
                                                aria-label={`Go to item ${i + 1}`}
                                                className={`h-1.5 rounded-full transition-all ${i === currentIndex
                                                        ? 'w-4 bg-white'
                                                        : 'w-1.5 bg-white/50 hover:bg-white/80'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {normalizedUrls.length > 1 && (
                            <div className="overflow-x-auto pb-1 -mb-1">
                                <div className="flex gap-2 min-w-max">
                                    {normalizedUrls.map((url, index) => renderPreview(url, index))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </DialogContent>
        </Dialog>
    )
}

export default EducationMediaDialog