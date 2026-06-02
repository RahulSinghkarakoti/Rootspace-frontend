import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AncestralSearchPage() {
  return (
           <div className="space-y-8 p-4">

      <div>
        <h1 className="font-display text-2xl font-bold">Ancestral Search</h1>
        <p className="text-sm text-muted-foreground">Discover records and relatives from historical databases</p>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, location, or year..."
            className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="gold">Search Records</Button>
      </div>
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm font-medium text-foreground">Enter a name to search ancestral records</p>
        <p className="text-xs text-muted-foreground mt-1">Access 180M+ historical records worldwide</p>
      </div>
    </div>
  )
}
