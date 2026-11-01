import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogCloseButton,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";
import { useForm } from 'react-hook-form';
import { authApi } from "@/api/authApi";
import { Loader2 } from "lucide-react";

interface ForgotPasswordDialogProps {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const ForgotPassswordDialog = ({
    children,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: ForgotPasswordDialogProps) => {
    const toast = useToast();
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
    } = useForm<{ email: string }>({
        defaultValues: { email: '' },
        mode: "onChange",
    });

    const handleOpenChange = (value: boolean) => {
        if (!isControlled) {
            setUncontrolledOpen(value);
        }
        controlledOnOpenChange?.(value);
        if (!value) {
            reset();
        }
    };

    const onForgotPassword = async (data: { email: string }) => {
        try {
            setSubmitting(true);
            await authApi.sendPasswordResetEmail(data.email);
            toast.success('Reset link sent', `A password reset link has been sent to ${data.email} if it exists in our system.`);
            reset();
            handleOpenChange(false);
        } catch (e: any) {
            toast.error('Error', e?.response?.data?.message || 'An error occurred while sending the reset link. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    const onSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(onForgotPassword)(e);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogCloseButton />
                <DialogHeader>
                    <DialogTitle>Enter Email For Password Reset</DialogTitle>
                    <DialogDescription>
                        We'll send you a link to reset your password.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={onSubmitHandler}>
                    <div className="space-y-1.5">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            id="reset-password-email"
                            className="w-full"
                            disabled={submitting}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Please enter a valid email address',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        size="block"
                        disabled={!isValid || submitting}
                        className="gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending Link...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ForgotPassswordDialog;
