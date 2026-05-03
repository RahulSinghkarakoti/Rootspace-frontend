import { Handle, Position } from "@xyflow/react";
import CreatePersonDialog from "../dialogs/CreatePersonDialog/CreatePersonDialog";
import { Plus } from "lucide-react";

interface FamilyMemberNodeData {
  id: string;
  name: string;
  tree_id: number;
  dates: string;
  gender: "male" | "female";
  mediaCount?: number;
  avatar?: string;
  isSelected?: boolean;
  onClick?: (id: string) => void;
}

export function FamilyMemberNode({ data }: { data: FamilyMemberNodeData }) {
  const isFemale = data.gender === "female";
  const initials = data.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={() => data.onClick?.(data.id)}
      className="relative cursor-pointer select-none flex flex-col items-center gap-1.5"
      style={{ width: 64 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-border !w-2 !h-2 !border-0"
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{
          opacity: 0,
          width: 1,
          height: 1,
          border: 'none',
          top: '28px',   // ← vertically align to center of avatar (56px / 2)
          left: 0,
        }}
      />

      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{
          opacity: 0,
          width: 1,
          height: 1,
          border: 'none',
          top: '28px',   // ← same vertical alignment
          right: 0,
        }}
      />
      {/* Avatar */}
      <div className="relative">
        <div
          className={`
        w-14 h-14 rounded-full border overflow-hidden
        flex items-center justify-center text-sm font-medium
        transition-all duration-150
        ${data.isSelected
              ? "border-2 border-info bg-info/10 text-info ring-2 ring-info/20 ring-offset-1"
              : "border border-border bg-background-secondary text-foreground"
            }
      `}
        >
          {data.avatar ? (
            <img
              src={data.avatar}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>



        {/* Add relationship button */}
        <CreatePersonDialog fromId={data.id} treeId={data.tree_id}>
          {/* <button className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border hover:border-primary hover:text-primary flex items-center justify-center text-muted-foreground text-sm leading-none transition-colors">
            +
          </button> */}
          <Plus />
        </CreatePersonDialog>
      </div>

      {/* Name */}
      <p className="text-[11px] font-medium text-foreground truncate w-full text-center leading-tight">
        {data.name}
      </p>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-border !w-2 !h-2 !border-0"
      />


      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 1, height: 1, border: 'none' }}
      />

      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 1, height: 1, border: 'none' }}
      />
    </div>
  );
}
