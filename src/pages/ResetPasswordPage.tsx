import { useState } from 'react'
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { useAuth } from '@/hooks/useAuth';
import logoImg from '@/assets/logo.png';
const ResetPasswordPage = () => {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset, watch
    } = useForm<{ password: string; confirmPassword: string }>({
        defaultValues: { password: '', confirmPassword: '' }, mode: "onChange",
    })


    const password = watch("password");
    const confirmPassword = watch("confirmPassword");

    const passwordsMatch =
        password &&
        confirmPassword &&
        password === confirmPassword;

    const toast = useToast();

    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: { pathname: string; search?: string } })?.from
    const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard'
    const [searchParams] = useSearchParams();
    const onSubmit = async (data: { password: string }) => {
        try {
            setSubmitting(true);
            const token = searchParams.get('token');
            if (!token) {
                toast.error('Error', 'Invalid reset token.');
                return;
            }
            const response = await authApi.changePassword(data.password, token);
            if (response.data.success === true) {
                await login(response.data.data.email, data.password)
                navigate(redirectTo, { replace: true })
                reset()
                toast.success('Success', response.data.message || 'Password reset successful. You can now log in with your new password.');
            }
        } catch (e: any) {
            // Handle error (e.g., show a toast notification) 
            toast.error('Error', e.response?.data?.message || 'An error occurred. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    }
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md border border-border">
                <div className="flex items-center gap-2.5 mb-6">
                    <img src={logoImg} alt="RootSpace" className="h-8 w-8 rounded-lg object-contain" />
                    <span className="font-display text-xl font-bold">
                        Root<span className="text-amber-500">Space</span>
                    </span>
                </div>
                <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    <div className="space-y-1.5">
                        <Label htmlFor="email">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input
                                id="new-password"
                                className="pl-10"
                                required
                                type={showPassword ? 'text' : 'password'}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters",
                                    },
                                })} placeholder="Enter your new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input
                                type={showPassword ? 'text' : 'password'}
                                id="confirm-password"
                                className="pl-10"
                                required
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === password || "Passwords do not match",
                                })} placeholder="Confirm your new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                    <Button
                        type="submit"
                        disabled={!isValid || !passwordsMatch}
                        className="w-full bg-amber-500 text-white py-2 px-4 rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    >
                        Reset Password
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default ResetPasswordPage
