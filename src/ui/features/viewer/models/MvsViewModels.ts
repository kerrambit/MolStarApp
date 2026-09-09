/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

export type PredefinedSelector =
    | "all"
    | "polymer"
    | "protein"
    | "nucleic"
    | "branched"
    | "ligand"
    | "ion"
    | "water"
    | "coarse";

export interface SelectorExpression {
    label_entity_id?: string;
    label_asym_id?: string;
    auth_asym_id?: string;
    label_seq_id?: number;
    auth_seq_id?: number;
    label_comp_id?: string;
    auth_comp_id?: string;
    label_atom_id?: string;
    auth_atom_id?: string;
    type_symbol?: string;
}

export type Selector =
    | PredefinedSelector
    | SelectorExpression
    | SelectorExpression[];

export function isPredefinedSelector(
    selector: Selector,
): selector is PredefinedSelector {
    return typeof selector === "string";
}
export function isSelectorExpressionList(
    selector: Selector,
): selector is SelectorExpression[] {
    return Array.isArray(selector);
}
export function isSingleSelectorExpression(
    selector: Selector,
): selector is SelectorExpression {
    return typeof selector === "object" && !Array.isArray(selector);
}

export function selectorToString(selector: Selector, truncate = true): string {
    if (typeof selector === "string") {
        return selector;
    }
    const formatExpression = (expr: SelectorExpression) => {
        const parts = Object.entries(expr)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => `${key}: ${value}`);
        const result = `{ ${parts.join(", ")} }`;
        return truncate && result.length > 24
            ? `${result.substring(0, 24)}...`
            : result;
    };
    if (Array.isArray(selector)) {
        const result = `[ ${selector.map(formatExpression).join(", ")} ]`;
        return truncate && result.length > 5
            ? `${result.substring(0, 5)}...`
            : result;
    }
    return formatExpression(selector);
}

export type AnnotationSchema =
    | "whole_structure"
    | "entity"
    | "chain"
    | "auth_chain"
    | "residue"
    | "auth_residue"
    | "residue_range"
    | "auth_residue_range"
    | "atom"
    | "auth_atom"
    | "all_atomic";

export interface DataFromUriParams {
    uri: string;
    format: "cif" | "bcif" | "json";
    schema: AnnotationSchema;
    category_name?: string;
    field_name?: string;
    block_header?: string;
    block_index?: number;
}

export interface DataFromSourceParams {
    schema: AnnotationSchema;
    category_name: string;
    field_name: string;
    block_header?: string;
    block_index?: number;
}

/**
 * A single component: its selection, how it's rendered, its color/opacity,
 * its own optional inline label/tooltip, camera focus, and transform.
 *
 * NOTE: label/tooltip on a component can ONLY be inline text in MVS — the
 * `*_from_uri`/`*_from_source` variants only exist on `structure`, not on
 * `component` (confirmed against molstar's mvs-builder.d.ts: `Component`
 * only exposes `.label()`/`.tooltip()`, no annotation-driven variants). If
 * you need annotation-driven labels/tooltips, use the ones already on
 * StructureViewModel instead.
 */
export interface ComponentEntry {
    id: string;
    selector: Selector;

    representationType:
        | "cartoon"
        | "backbone"
        | "ball_and_stick"
        | "line"
        | "spacefill"
        | "carbohydrate"
        | "surface"
        | "putty";
    size_factor: number;
    /** Used ONLY when representationType is "ball_and_stick", "line", "spacefill", or "surface". */
    ignore_hydrogens: boolean;
    /** Used ONLY when representationType is "cartoon". */
    tubular_helices: boolean;
    /** Used ONLY when representationType is "surface". */
    surface_type: "molecular" | "gaussian";
    /** Used ONLY when representationType is "putty". */
    size_theme: "uniform" | "uncertainty";

    // --- Color (mutually exclusive in MVS — UI must ensure only one is set) ---
    color: string;
    color_from_uri?: DataFromUriParams;
    color_from_source?: DataFromSourceParams;

    opacity: number;

    // --- Focus ---
    show_focus: boolean;
    focus_direction: [number, number, number];
    focus_up: [number, number, number];

    // --- Inline label/tooltip only — no *_from_uri/*_from_source at component level ---
    label: string;
    tooltip: string;

    // --- Component-level transform ---
    translationX: number;
    translationY: number;
    translationZ: number;
    rotationX: number; // Pitch (Degrees)
    rotationY: number; // Yaw (Degrees)
    rotationZ: number; // Roll (Degrees)
}

export type ComponenentEntryColorProperty =
    | "Color"
    | "Color from URI"
    | "Color from source";

export function getActiveColorProperty(
    entry?: ComponentEntry,
): ComponenentEntryColorProperty {
    if (!entry) {
        return "Color";
    }

    if (entry.color_from_uri !== undefined) {
        return "Color from URI";
    }

    if (entry.color_from_source !== undefined) {
        return "Color from source";
    }

    if (entry.color) {
        return "Color";
    }

    return "Color";
}

function generateComponentId(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `component-${Math.random().toString(36).slice(2)}`;
}

export function createDefaultComponentEntry(
    id: string = generateComponentId(),
): ComponentEntry {
    return {
        id,
        selector: "all",
        representationType: "cartoon",
        size_factor: 1,
        ignore_hydrogens: false,
        tubular_helices: false,
        surface_type: "molecular",
        size_theme: "uniform",
        color: "#ffffff",
        opacity: 1.0,
        show_focus: false,
        focus_direction: [0, 0, -1],
        focus_up: [0, 1, 0],
        label: "",
        tooltip: "",
        translationX: 0,
        translationY: 0,
        translationZ: 0,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
    };
}

export const getTooltipMode = (
    viewModel: StructureViewModel,
): "none" | "uri" | "source" => {
    if (viewModel.tooltip_from_uri) return "uri";
    if (viewModel.tooltip_from_source) return "source";
    return "none";
};

export const getLabelMode = (
    viewModel: StructureViewModel,
): "none" | "uri" | "source" => {
    if (viewModel.label_from_uri) return "uri";
    if (viewModel.label_from_source) return "source";
    return "none";
};

/**
 * The unified View-Model for structure parameters. Plain inline `label`/`tooltip`
 * do NOT exist on `structure` in the real builder API (only `label_from_uri`/
 * `label_from_source`/`tooltip_from_uri`/`tooltip_from_source` do) — for a
 * whole-structure inline label, add a component with `selector: "all"` and
 * set `label` there instead.
 */
export interface StructureViewModel {
    format: string;
    type: "model" | "assembly" | "symmetry" | "symmetry_mates";

    block_header?: string;
    block_index: number;
    model_index: number;
    coordinates_ref?: string;

    /** Used ONLY when type === "assembly" */
    assembly_id?: string;
    /** Used ONLY when type === "symmetry_mates" */
    radius: number;
    /** Used ONLY when type === "symmetry" */
    ijk_min: [number, number, number];
    /** Used ONLY when type === "symmetry" */
    ijk_max: [number, number, number];

    // --- Structure-wide annotation-driven tooltip/label (mutually exclusive per pair) ---
    tooltip_from_uri?: DataFromUriParams;
    tooltip_from_source?: DataFromSourceParams;
    label_from_uri?: DataFromUriParams;
    label_from_source?: DataFromSourceParams;

    // --- Structure-level transform (independent of any component's own transform) ---
    translationX: number;
    translationY: number;
    translationZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;

    components: ComponentEntry[];
}

export const DEFAULT_STRUCTURE_VIEW_MODEL: StructureViewModel = {
    format: "N/A",
    type: "model",
    block_index: 0,
    model_index: 0,
    radius: 5,
    ijk_min: [-1, -1, -1],
    ijk_max: [1, 1, 1],
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    components: [createDefaultComponentEntry("component-default")],
};

export interface VolumeViewModel {
    format: string;
    type: string;
    relative_isovalue: number;
    show_wireframe: boolean;
    show_faces: boolean;
    color: string;
    opacity: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
}

export const DEFAULT_VOLUME_VIEW_MODEL: VolumeViewModel = {
    format: "N/A",
    type: "isosurface",
    relative_isovalue: 1.0,
    show_wireframe: false,
    show_faces: true,
    color: "#ffffff",
    opacity: 1.0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
};
