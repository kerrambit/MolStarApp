/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import type {
    ComponentEntry,
    PredefinedSelector,
    SelectorExpression,
    StructureViewModel,
} from "../../../models/MvsViewModels";

// Callback types shared by the structure tab and its section components.
export type UpdateViewModelParam = (
    key: keyof StructureViewModel,
    val: StructureViewModel[keyof StructureViewModel],
    sync: boolean,
) => void;

export type UpdateViewModelFields = (
    fields: Partial<StructureViewModel>,
    syncToMolstar: boolean,
) => Promise<void>;

export type UpdateComponentParam = (
    componentId: string,
    paramKey: keyof ComponentEntry,
    val: ComponentEntry[keyof ComponentEntry],
    syncToMolstar: boolean,
) => Promise<void>;

export type UpdateComponentFields = (
    componentId: string,
    fields: Partial<ComponentEntry>,
    syncToMolstar: boolean,
) => Promise<void>;

// Fields editable on a SelectorExpression, driving the generated forms.
export const SELECTOR_EXPRESSION_FIELDS: {
    key: keyof SelectorExpression;
    label: string;
    type: "text" | "number";
}[] = [
    { key: "label_entity_id", label: "Label entity ID", type: "text" },
    { key: "label_asym_id", label: "Label asym ID", type: "text" },
    { key: "auth_asym_id", label: "Auth asym ID", type: "text" },
    { key: "label_seq_id", label: "Label seq ID", type: "number" },
    { key: "auth_seq_id", label: "Auth seq ID", type: "number" },
    { key: "label_comp_id", label: "Label comp ID", type: "text" },
    { key: "auth_comp_id", label: "Auth comp ID", type: "text" },
    { key: "label_atom_id", label: "Label atom ID", type: "text" },
    { key: "auth_atom_id", label: "Auth atom ID", type: "text" },
    { key: "type_symbol", label: "Type symbol", type: "text" },
];

export const schemaOptions = [
    "whole_structure",
    "entity",
    "chain",
    "auth_chain",
    "residue",
    "auth_residue",
    "residue_range",
    "auth_residue_range",
    "atom",
    "auth_atom",
    "all_atomic",
];

// Predefined selector options, shared by component and color-override selectors.
export const PREDEFINED_SELECTOR_OPTIONS: PredefinedSelector[] = [
    "all",
    "polymer",
    "protein",
    "nucleic",
    "branched",
    "ligand",
    "ion",
    "water",
    "coarse",
];

// Helper to ensure Mantine ColorInput handles css text colors (like "green")
export function normalizeToHex(color: string): string {
    if (!color) return "#ffffff";
    if (color.startsWith("#")) return color;
    if (typeof document === "undefined") return color;

    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return color;

    ctx.fillStyle = color;
    return ctx.fillStyle;
}
