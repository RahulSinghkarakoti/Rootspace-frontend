import { GitBranch, Plus, ExternalLink, Share2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { treesApi } from "@/api/treesApi";
import AddTreeDialog from "@/components/dialogs/AddTreeDialog";
import type { TreeSummary } from "@/types";
import DeleteTreeDialog from "@/components/dialogs/DeleteTreeDialog";

export default function TreesPage() {
  const {
    data: trees,
    isLoading,
    isError,
    error,
  } = useQuery<TreeSummary[], Error>({
    queryKey: ["trees"],
    queryFn: async () => {
      const response = await treesApi.getAll();
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
        Loading your trees...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-foreground">
        Unable to load trees: {(error as Error)?.message ?? "Unexpected error"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My Trees</h1>
          <p className="text-xs text-muted-foreground">
            Manage all your family trees
          </p>
        </div>
        <AddTreeDialog>
          <Button variant="gold" size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> New Tree
          </Button>
        </AddTreeDialog>
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
                <DeleteTreeDialog tree={tree}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    aria-label="Delete item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </DeleteTreeDialog>
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
