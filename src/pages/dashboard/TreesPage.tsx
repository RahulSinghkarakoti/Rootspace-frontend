import { GitBranch, Plus, ExternalLink, Share2, Trash2, RefreshCcw, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { treesApi } from "@/api/treesApi";
import type { TreeSummary } from "@/types";
import { DeleteTreeDialog, AddTreeDialog, ShareTreeDialog } from "@/components/dialogs";
import { useTreeStore } from "@/store/treeStore";
import { useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function TreesPage() {

  const loadAllTrees = useTreeStore(s => s.loadAllTrees)
  const isLoading = useTreeStore(s => s.isLoading)
  const error = useTreeStore(s => s.error)
  const trees = useTreeStore(s => s.trees)
  const treesLoaded = useTreeStore(s => s.treesLoaded)
  const setTreesLoaded = useTreeStore(s => s.setTreeLoaded)

  useEffect(() => {
    if (!treesLoaded) {
      loadAllTrees().then(() => setTreesLoaded(true))
    }
  }, [loadAllTrees, setTreesLoaded, treesLoaded])


  if (isLoading) {
    return (
      <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
        Loading your trees...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-foreground">
        Unable to load trees: {typeof error === 'string' ? error : 'An unexpected error occurred.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My Trees

          </h1>
          <p className="text-xs text-muted-foreground">
            Manage all your family trees
          </p>
        </div>
        <div className="flex items-center gap-2">

          <AddTreeDialog>
            <Button variant="gold" size="sm" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> New Tree
            </Button>
          </AddTreeDialog>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"
            onClick={() => loadAllTrees()}>
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {trees?.length ? (
        <div className="space-y-2">
          {trees.map((tree) => (
                
            <div
              
              key={tree.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <GitBranch className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-sm text-foreground truncate">
                      {tree.name}
                    </h3>
                    <Badge variant="gold" className="text-[8px] shrink-0">
                      {tree.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {tree._count?.persons ?? 0} members
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Link to={`/dashboard/editor?tree=${tree.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-[11px] h-7 px-2"
                  >
                    <ExternalLink className="h-3 w-3" /> Open
                  </Button>
                </Link>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      sideOffset={4}
                      className="min-w-[180px] rounded-md border bg-background p-1 shadow-md"
                    >
                      <ShareTreeDialog treeId={tree.id} onClose={() => { }} linkHistory={tree.linkHistory || []}>
                        <DropdownMenu.Item
                          onSelect={(e) => e.preventDefault()}
                         className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer outline-none hover:bg-muted">
                          <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Share</span>
                        </DropdownMenu.Item>
                      </ShareTreeDialog> 

                      <DeleteTreeDialog tree={tree} >
                        <DropdownMenu.Item
                          onSelect={(e) => e.preventDefault()}
                          className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer outline-none text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </DropdownMenu.Item>
                      </DeleteTreeDialog>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>

              </div>
            </div> 
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm font-semibold text-foreground mb-1.5">
            No trees available yet
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Create your first tree to get started with family history and
            relationships.
          </p>
          <AddTreeDialog>
            <Button variant="gold" size="sm" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Create New Tree
            </Button>
          </AddTreeDialog>
        </div>
      )}
    </div>
  );
}
