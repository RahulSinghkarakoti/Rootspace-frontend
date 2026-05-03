import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Settings page coming soon. Use the profile dropdown in the top navbar to sign out.
          </p>
          <div className="mt-4">
            <Button variant="outline">Open Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
