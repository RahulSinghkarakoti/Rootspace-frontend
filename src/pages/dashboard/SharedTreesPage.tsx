import { Link } from 'react-router-dom'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SharedTreesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Shared Trees</h1>
        <p className="text-sm text-muted-foreground">Trees shared with you or by you</p>
      </div>
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <Share2 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm font-medium text-foreground">No shared trees yet</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">Share your tree to collaborate with family members</p>
        <Link to="/dashboard/trees">
          <Button variant="gold" size="sm">
            Go to My Trees
          </Button>
        </Link>
      </div>
    </div>
  )
}
