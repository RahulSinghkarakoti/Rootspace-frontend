import { Download, Maximize2, Minus, Plus, Users, ZoomIn } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { toPng } from "html-to-image";
import CreatePersonDialog from "../dialogs/CreateUpdatePersonDialog/CreatePersonDialog";
import { useTreeStore } from "../../store/treeStore";
import { useToast } from "@/components/ui/toast";

interface Props {
  memberCount: number;
  selectedName?: string;
  toggleMinimap: () => void;
}

export function TreeToolbar({ memberCount, selectedName, toggleMinimap }: Props) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const currentTreeId = useTreeStore((state) => state.currentTreeId)
  const toast = useToast();

  const exportPng = () => {
    const el = document.querySelector(".react-flow") as HTMLElement;
    if (!el) return;
    const isDark = document.documentElement.classList.contains("dark");
    const backgroundColor = isDark ? "#09090b" : "#ffffff";

    toPng(el, { backgroundColor })
      .then((url) => {
        const a = document.createElement("a");
        a.download = "family-tree.png";
        a.href = url;
        a.click();
      })
      .catch((err) => {
        console.error("Failed to export PNG", err);
        toast.error("Export Failed", "Could not export family tree as image.");
      });
  };

  return (
    <>
      {/* Top-right toolbar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="flex flex-col gap-1 p-2 rounded-2xl bg-card/90 backdrop-blur-md border border-white/10 shadow-xl">

          <ToolBtn title="Zoom In" onClick={() => zoomIn({ duration: 200 })}>
            <Plus className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn title="Zoom Out" onClick={() => zoomOut({ duration: 200 })}>
            <Minus className="w-4 h-4" />
          </ToolBtn>
          <div className="w-full h-px bg-white/8 my-0.5" />
          <ToolBtn
            title="Fit View"
            onClick={() => fitView({ duration: 400, padding: 0.1 })}
          >
            <Maximize2 className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn title="Toggle Minimap" onClick={toggleMinimap}>
            <ZoomIn className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn title="Export PNG" onClick={exportPng}>
            <Download className="w-4 h-4" />
          </ToolBtn>
        </div>
      </div>

      {/* Bottom-left stats bar */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card/90 backdrop-blur-md border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-foreground font-semibold">{memberCount}</span>
            <span>members</span>
          </div>
          {selectedName && (
            <>
              <div className="w-px h-3.5 bg-white/10" />
              <div className="flex items-center gap-1.5 text-[11px]">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 font-medium truncate max-w-[120px]">
                  {selectedName}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ToolBtn({
  children,
  title,
  onClick,
  gold,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  gold?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`
        flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150
        ${gold
          ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30"
          : "text-muted-foreground hover:text-foreground hover:bg-white/10"
        }
      `}
    >
      {children}
    </button>
  );
}
