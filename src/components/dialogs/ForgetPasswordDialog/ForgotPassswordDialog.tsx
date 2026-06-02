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
import { useToast } from "@/components/ui/toast";
import { useState } from "react";
import { useForm } from 'react-hook-form'
import { authApi } from "@/api/authApi";

interface ForgotPasswordDialogProps {
    children: React.ReactNode;
}
const ForgotPassswordDialog = ({ children }: ForgotPasswordDialogProps) => {

    const toast = useToast()
    const [open, setOpen] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
    } = useForm<{ email: string }>({
        defaultValues: { email: '' }, mode: "onChange",
    })

    const onForgotPassword = async (data: { email: string }) => {
        try {
            await authApi.sendPasswordResetEmail(data.email)
            toast.success('Reset link sent', `A password reset link has been sent to ${data.email} if it exists in our system.`)
            reset()
            setOpen(false)
        } catch (e) {
            toast.error('Error', 'An error occurred while sending the reset link. Please try again later.')
        }
    }
    return (
        <Dialog open={open} onOpenChange={(value) => {
            setOpen(value)
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogCloseButton />
                <DialogHeader>
                    <DialogTitle>Enter Email For Password Reset</DialogTitle>
                    <DialogDescription>
                        We'll send you a link to reset your password.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(onForgotPassword)}>

                    <Input type="email" placeholder="Enter your email" id="email" className="w-full"
                        {...register('email', { required: 'Email is required' })}
                    />
                    <Button type="submit" size="block" disabled={!isValid} >
                        Send Reset Link
                    </Button>
                </form>
            </DialogContent>

        </Dialog>
    )
}

export default ForgotPassswordDialog
