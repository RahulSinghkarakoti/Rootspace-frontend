import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" 
import { useAuthStore } from "@/store/authStore" 
import { BadgeCheck } from "lucide-react" 
export default function SettingsProfilePage() {
  const user = useAuthStore((state) => state.user) 
  return (
    <div className="space-y-6 p-2 ">
      <div className=" ">
        <section className=" flex flex-col   rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {user?.firstName?.charAt(0).toUpperCase()}
                  {user?.lastName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {user?.isVerified && (
                <BadgeCheck className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full border border-card bg-blue-500 text-white" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email || 'Email not available'}</p>
            </div>
          </div>
 
        </section>
      </div>
    </div>
  )
}