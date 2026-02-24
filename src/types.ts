// --- Shared Types ---

/** Result type returned by SAIL code generation for a node */
export type SAILNodeResult = string | { type: string; code: string }

/** Callback signature for recursive node code generation */
export type NodeGenerator = (node: BaseNode) => Promise<SAILNodeResult>
