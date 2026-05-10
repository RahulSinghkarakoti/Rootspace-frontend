import { Handle, Position } from "@xyflow/react";
import CreatePersonDialog from "../dialogs/CreatePersonDialog/CreatePersonDialog";

interface FamilyMemberNodeData {
  id: string;
  name: string;
  tree_id: number;
  dates: string;
  gender: "male" | "female";
  mediaCount?: number;
  avatar?: string;
  isSelected?: boolean;
  onClick?: (id: string, showInfo: boolean) => void;
}

const PlusIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 10, height: 10 }}>
    <line x1="5" y1="2" x2="5" y2="8" />
    <line x1="2" y1="5" x2="8" y2="5" />
  </svg>
);

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
      className="relative cursor-pointer select-none"
      style={{ width: 110 }}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} id="top" className="!bg-border !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-border !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-border !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-border !w-2 !h-2 !border-0" />

      {/* Card */}
      <div
        className={`
          relative rounded-[14px] bg-white 
          transition-shadow duration-200
          ${data.isSelected
            ? isFemale
              ? "border-2 border-pink-500 shadow-md"
              : "border-2 border-blue-600 shadow-md"
            : isFemale
              ? "border border-pink-200 shadow-sm hover:shadow-md"
              : "border border-blue-200 shadow-sm hover:shadow-md"
          }
        `}
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)" }}
      >


        {/* Avatar */}
        <div
          onClick={() => data.onClick?.(data.id,true)} className="flex justify-center pt-3.5 pb-2.5">
          <div className="relative inline-block">
            <div
              className={`
                w-13 h-13 rounded-full flex items-center justify-center
                text-[17px] font-semibold tracking-tight overflow-hidden
                ${data.isSelected
                  ? isFemale
                    ? "bg-pink-100 ring-2 ring-pink-500"
                    : "bg-blue-100 ring-2 ring-blue-600"
                  : isFemale
                    ? "bg-pink-50 text-pink-900"
                    : "bg-blue-50 text-blue-900"
                }
              `}
              style={{ width: 52, height: 52 }}
            >
              {data.avatar
                ? <img src={data.avatar} alt={data.name} className="w-full h-full object-cover" />
                : <span>{initials}</span>
              }
            </div>

            {/* Gender dot */}
            <span
              className={`
                absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white
                ${isFemale ? "bg-pink-500" : "bg-blue-600"}
              `}
            />
          </div>
        </div>

        {/* Name + dates */}
        <div className="px-2 pb-3 text-center">
          <p className="text-[12.5px] font-semibold text-neutral-900 truncate leading-tight">
            {data.name}
          </p>
          {data.dates && (
            <p className="text-[10.5px] text-neutral-400 mt-0.5 leading-none">
              {data.dates}
            </p>
          )}
        </div>

        {/* Add buttons */}
        {/* Top — parent */}

        <div onClick={(e) => e.stopPropagation()}>
          <CreatePersonDialog fromId={data.id} treeId={data.tree_id} relationType="CHILD_OF">
            <AddButton position="top" tooltip="Add parent" onClick={(e) => e.stopPropagation()} />
          </CreatePersonDialog>
        </div>

        <div onClick={(e) => e.stopPropagation()}>

          {/* Right — spouse */}
          <CreatePersonDialog fromId={data.id} treeId={data.tree_id} relationType="SPOUSE_OF">
            <AddButton position="right" tooltip="Add spouse" onClick={(e) => e.stopPropagation()} />
          </CreatePersonDialog>
        </div>

        <div onClick={(e) => e.stopPropagation()}>

          {/* Bottom — child */}
          <CreatePersonDialog fromId={data.id} treeId={data.tree_id} relationType="PARENT_OF">
            <AddButton position="bottom" tooltip="Add child" onClick={(e) => e.stopPropagation()} />
          </CreatePersonDialog>
        </div>

      </div>
    </div>
  );
}

// ── AddButton sub-component ──────────────────────────────────────
interface AddButtonProps {
  position: "top" | "bottom" | "right";
  tooltip: string;
  onClick?: (e: React.MouseEvent) => void;
}

function AddButton({ position, tooltip, onClick }: AddButtonProps) {
  const posClass = {
    top: "absolute -top-2.5 left-1/2 -translate-x-1/2",
    bottom: "absolute -bottom-2.5 left-1/2 -translate-x-1/2",
    right: "absolute -right-2.5 top-1/2 -translate-y-1/2",
  }[position];

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        ${posClass}
        w-5 h-5 rounded-full bg-white border border-neutral-300 z-10
        flex items-center justify-center text-neutral-400
        shadow-sm transition-all duration-150
        hover:bg-neutral-900 hover:border-neutral-900 hover:text-white hover:scale-110
      `}
    >
      <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 10, height: 10 }}>
        <line x1="5" y1="2" x2="5" y2="8" />
        <line x1="2" y1="5" x2="8" y2="5" />
      </svg>
    </button>
  );
}