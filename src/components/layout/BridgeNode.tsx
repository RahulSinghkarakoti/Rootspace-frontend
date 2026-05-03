import { Handle, Position } from "@xyflow/react";
export function BridgeNode() {
  const handleStyle = {
    opacity: 0,
    width: 1,
    height: 1,
    minWidth: 1,
    minHeight: 1,
    border: 'none',
    background: 'transparent',
    top: '0px',
    left: '0px',
  }

  return (
    <div style={{ width: 1, height: 1, position: 'relative' }}>
      <Handle id="left"   type="target" position={Position.Left}   style={handleStyle} />
      <Handle id="right"  type="source" position={Position.Right}  style={handleStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}