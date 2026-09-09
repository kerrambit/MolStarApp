/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useState } from "react";
import { CollapseTrigger } from "../../../../../components/common/collapse-trigger/CollapseTriger";
import { UiLocalStorageService } from "../../../../../services/UiLocalStorageService";
import {
    AlphaSlider,
    Collapse,
    ColorInput,
    Divider,
    Group,
    NumberInput,
    Scroller,
    Select,
    Tabs,
    TextInput,
} from "@mantine/core";
import { getAllParserTypes } from "../../../../../config/assetsDefinitions";
import {
    getActiveColorProperty,
    getLabelMode,
    getTooltipMode,
    isPredefinedSelector,
    isSelectorExpressionList,
    isSingleSelectorExpression,
    selectorToString,
    type ComponenentEntryColorProperty,
    type ComponentEntry,
    type PredefinedSelector,
    type Selector,
    type SelectorExpression,
    type StructureViewModel,
} from "../../../models/MvsViewModels";
import { StructureComponentEntryTransformControls } from "./StructureComponentEntryTransformControls";
import { IJKControls } from "./IJKControls";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";
import { ActionableList } from "../../../../../components/common/actionables/ActionableList";
import { ActionableListItem } from "../../../../../components/common/actionables/ActionableListItem";
import { DeleteActionIcon } from "../../../../../components/common/actionables/actions-icons/DeleteActionIcon";
import { PlusActionIcon } from "../../../../../components/common/actionables/actions-icons/PlusActionIcon";
import { ActionableTile } from "../../../../../components/common/actionables/ActionableTile";
import { StructureTransformControls } from "./StructureTransformControls";

// Fields editable on a SelectorExpression, driving the generated form below.
const SELECTOR_EXPRESSION_FIELDS: {
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

const schemaOptions = [
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

// Type for the component selector mode, either a predefined selector or an expression-based selector.
type ComponentEntryComponentSelectorType =
    | "PredefinedSelector"
    | "ExpressionSelector";

type StructureTabProps = {
    viewKey: string;
    asset: ManagedAsset;
    viewModel: StructureViewModel;
    onUpdateParam: (
        key: keyof StructureViewModel,
        val: StructureViewModel[keyof StructureViewModel],
        sync: boolean,
    ) => void;
    onUpdateStructureComponentParam: (
        componentId: string,
        paramKey: keyof ComponentEntry,
        val: ComponentEntry[keyof ComponentEntry],
        syncToMolstar: boolean,
    ) => Promise<void>;
};

export function StructureTab({
    viewKey,
    asset,
    viewModel,
    onUpdateParam,
    onUpdateStructureComponentParam,
}: StructureTabProps) {
    // Store the currently selected component ID, defaulting to the first component if available.
    const [currentComponentId, setCurrentComponentId] = useState<
        string | undefined
    >(
        viewModel.components.length > 0
            ? viewModel.components.at(0)?.id // TODO: UiStorageService should store last visited component
            : undefined,
    );

    // Get the current component from the view model.
    const currentComponent = viewModel.components.find(
        (component) => component.id === currentComponentId,
    );

    // Store expanded sections.
    const [generalSectionExpanded, setGeneralSectionExpanded] = useState(
        UiLocalStorageService.ViewBuilder.getExpandedStructureGeneralSection(
            asset.id,
            viewKey,
        ),
    );

    const [advancedGeneralSectionExpanded, setAdvancedGeneralSectionExpanded] =
        useState(
            UiLocalStorageService.ViewBuilder.getExpandedStructureAdvancedGeneralSection(
                asset.id,
                viewKey,
            ),
        );

    const [componentsSectionExpanded, setComponentsSectionExpanded] = useState(
        () => {
            if (!currentComponentId) {
                return true;
            }
            return UiLocalStorageService.ViewBuilder.getExpandedStructureComponentsSection(
                asset.id,
                viewKey,
                currentComponentId,
            );
        },
    );

    const [
        tooltipsAndLabelsSectionExpanded,
        setTooltipsAndLabelsSectionExpanded,
    ] = useState(() => {
        if (!currentComponentId) {
            return false;
        }
        return UiLocalStorageService.ViewBuilder.getExpandedStructureTooltipsAndLabelsSection(
            asset.id,
            viewKey,
        );
    });

    const [transformSectionExpanded, setTransformSectionExpanded] = useState(
        () => {
            if (!currentComponentId) {
                return false;
            }
            return UiLocalStorageService.ViewBuilder.getExpandedStructureTransformSection(
                asset.id,
                viewKey,
            );
        },
    );

    const [
        componentRepresentationSectionExpanded,
        setComponentRepresentationSectionExpanded,
    ] = useState(() => {
        if (!currentComponentId) {
            return false;
        }
        return UiLocalStorageService.ViewBuilder.getExpandedStructureComponentRepresentationSection(
            asset.id,
            viewKey,
            currentComponentId,
        );
    });

    const [
        componentTooltipsAndLabelsSectionExpanded,
        setComponentTooltipsAndLabelsSectionExpanded,
    ] = useState(() => {
        if (!currentComponentId) {
            return false;
        }
        return UiLocalStorageService.ViewBuilder.getExpandedStructureComponentTooltipsAndLabelsSection(
            asset.id,
            viewKey,
            currentComponentId,
        );
    });

    const [
        componentTransformSectionExpanded,
        setComponentTransformSectionExpanded,
    ] = useState(() => {
        if (!currentComponentId) {
            return false;
        }
        return UiLocalStorageService.ViewBuilder.getExpandedStructureComponentTransformSection(
            asset.id,
            viewKey,
            currentComponentId,
        );
    });

    // Normalized view of the current component's selector as a list - a single SelectorExpression is treated as a one-item list for editing purposes.
    const currentExpressions: SelectorExpression[] =
        currentComponent && !isPredefinedSelector(currentComponent.selector)
            ? Array.isArray(currentComponent.selector)
                ? currentComponent.selector
                : [currentComponent.selector]
            : [];

    // Collapses a list back to MVS's Selector shape: bare object for one entry, array for several, empty-object fallback if somehow emptied out entirely.
    function collapseExpressions(expressions: SelectorExpression[]): Selector {
        if (expressions.length === 0) return {};
        if (expressions.length === 1) return expressions[0];
        return expressions;
    }

    // Handler for changes to a field in a SelectorExpression, updating the current component's selector accordingly.
    const handleExpressionFieldChange = (
        index: number,
        field: keyof SelectorExpression,
        val: string | number | undefined,
        sync: boolean,
    ) => {
        if (!currentComponent) return;

        const nextExpressions = currentExpressions.map((expr, i) =>
            i === index
                ? { ...expr, [field]: val === "" ? undefined : val }
                : expr,
        );

        onUpdateStructureComponentParam(
            currentComponent.id,
            "selector",
            collapseExpressions(nextExpressions),
            sync,
        );
    };

    // Handler for adding a new empty SelectorExpression to the current component's selector.
    const handleAddExpression = () => {
        if (!currentComponent) return;
        onUpdateStructureComponentParam(
            currentComponent.id,
            "selector",
            collapseExpressions([...currentExpressions, {}]),
            true,
        );
    };

    // Handler for removing a SelectorExpression from the current component's selector.
    const handleRemoveExpression = (index: number) => {
        if (!currentComponent) return;
        onUpdateStructureComponentParam(
            currentComponent.id,
            "selector",
            collapseExpressions(
                currentExpressions.filter((_, i) => i !== index),
            ),
            true,
        );
    };

    // Draft state for the "add new field" row, keyed per expression index - each expression can be mid-way through adding a field independently.
    const [newFieldDrafts, setNewFieldDrafts] = useState<
        Record<
            number,
            { field: keyof SelectorExpression | null; value: string }
        >
    >({});

    const getDraft = (exprIndex: number) =>
        newFieldDrafts[exprIndex] ?? { field: null, value: "" };

    const setDraft = (
        exprIndex: number,
        draft: { field: keyof SelectorExpression | null; value: string },
    ) => {
        setNewFieldDrafts((prev) => ({ ...prev, [exprIndex]: draft }));
    };

    // Changes which field key a row targets — moves the value across, converting  type if the new field is numeric vs. text.
    const handleChangeExpressionFieldKey = (
        exprIndex: number,
        oldField: keyof SelectorExpression,
        newField: keyof SelectorExpression,
    ) => {
        if (!currentComponent) return;
        const expr = { ...currentExpressions[exprIndex] } as Record<
            string,
            unknown
        >;
        const rawValue = expr[oldField];
        const fieldDef = SELECTOR_EXPRESSION_FIELDS.find(
            (f) => f.key === newField,
        );

        delete expr[oldField];
        expr[newField] =
            fieldDef?.type === "number"
                ? typeof rawValue === "number"
                    ? rawValue
                    : Number(rawValue) || undefined
                : String(rawValue ?? "");

        const nextExpressions = currentExpressions.map((e, i) =>
            i === exprIndex ? (expr as SelectorExpression) : e,
        );
        onUpdateStructureComponentParam(
            currentComponent.id,
            "selector",
            collapseExpressions(nextExpressions),
            true,
        );
    };

    // Removes one field key from a given expression (not the whole expression).
    const handleRemoveExpressionField = (
        exprIndex: number,
        field: keyof SelectorExpression,
    ) => {
        if (!currentComponent) return;
        const expr = { ...currentExpressions[exprIndex] };
        delete expr[field];
        const nextExpressions = currentExpressions.map((e, i) =>
            i === exprIndex ? expr : e,
        );
        onUpdateStructureComponentParam(
            currentComponent.id,
            "selector",
            collapseExpressions(nextExpressions),
            true,
        );
    };

    // Commits the draft row (field + value) into the expression, then clears the draft.
    const handleSaveNewExpressionField = (exprIndex: number) => {
        if (!currentComponent) return;
        const draft = getDraft(exprIndex);
        if (!draft.field || draft.value === "") return;

        const fieldDef = SELECTOR_EXPRESSION_FIELDS.find(
            (f) => f.key === draft.field,
        );
        const value =
            fieldDef?.type === "number" ? Number(draft.value) : draft.value;
        if (fieldDef?.type === "number" && Number.isNaN(value)) return;

        const expr = { ...currentExpressions[exprIndex], [draft.field]: value };
        const nextExpressions = currentExpressions.map((e, i) =>
            i === exprIndex ? expr : e,
        );
        onUpdateStructureComponentParam(
            currentComponent.id,
            "selector",
            collapseExpressions(nextExpressions),
            true,
        );
        setDraft(exprIndex, { field: null, value: "" });
    };

    // Render the component.
    return (
        <div>
            {/* General settings for Structure tab. */}
            <CollapseTrigger
                title={"General"}
                size={"md"}
                expanded={generalSectionExpanded}
                onClick={() => {
                    setGeneralSectionExpanded((prev) => {
                        const nextState = !prev;
                        UiLocalStorageService.ViewBuilder.setExpandedStructureGeneralSection(
                            asset.id,
                            viewKey,
                            nextState,
                        );
                        return nextState;
                    });
                }}
            ></CollapseTrigger>

            <Collapse expanded={generalSectionExpanded}>
                <AssetBuilderCardSectionGroup>
                    <Select
                        label="Format"
                        disabled
                        data={getAllParserTypes()}
                        value={viewModel.format}
                        placeholder="N/A"
                        size="xs"
                    />
                    <Select
                        label="Type"
                        data={[
                            "model",
                            "assembly",
                            "symmetry",
                            "symmetry_mates",
                        ]}
                        value={viewModel.type}
                        onChange={(val) => {
                            if (val) {
                                onUpdateParam("type", val, true);
                            }
                        }}
                        size="xs"
                    />

                    {/* Advanced general settings for Structure tab. */}
                    <CollapseTrigger
                        title={"Advanced options"}
                        size={"sm"}
                        expanded={advancedGeneralSectionExpanded}
                        onClick={() => {
                            setAdvancedGeneralSectionExpanded((prev) => {
                                const nextState = !prev;
                                UiLocalStorageService.ViewBuilder.setExpandedStructureAdvancedGeneralSection(
                                    asset.id,
                                    viewKey,
                                    nextState,
                                );
                                return nextState;
                            });
                        }}
                    ></CollapseTrigger>

                    <Collapse expanded={advancedGeneralSectionExpanded}>
                        <AssetBuilderCardSectionGroup
                            divider={false}
                            gap="0.33em"
                        >
                            <TextInput
                                label="Block header"
                                value={viewModel.block_header || undefined}
                                placeholder="null"
                                size="xs"
                                onChange={(val) =>
                                    typeof val === "string" &&
                                    onUpdateParam("block_header", val, false)
                                }
                                onBlur={() =>
                                    onUpdateParam(
                                        "block_header",
                                        viewModel.block_header,
                                        true,
                                    )
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    onUpdateParam(
                                        "block_header",
                                        viewModel.block_header,
                                        true,
                                    )
                                }
                            ></TextInput>
                            <NumberInput
                                label="Block index"
                                value={viewModel.block_index}
                                size="xs"
                                onChange={(val) =>
                                    typeof val === "number" &&
                                    onUpdateParam("block_index", val, false)
                                }
                                onBlur={() =>
                                    onUpdateParam(
                                        "block_index",
                                        viewModel.block_index,
                                        true,
                                    )
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    onUpdateParam(
                                        "block_index",
                                        viewModel.block_index,
                                        true,
                                    )
                                }
                            />
                            <NumberInput
                                label="Model index"
                                value={viewModel.model_index}
                                size="xs"
                                onChange={(val) =>
                                    typeof val === "number" &&
                                    onUpdateParam("model_index", val, false)
                                }
                                onBlur={() =>
                                    onUpdateParam(
                                        "model_index",
                                        viewModel.model_index,
                                        true,
                                    )
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    onUpdateParam(
                                        "model_index",
                                        viewModel.model_index,
                                        true,
                                    )
                                }
                            />
                            <TextInput
                                label="Coordinates reference"
                                value={viewModel.coordinates_ref || undefined}
                                placeholder="null"
                                size="xs"
                                onChange={(val) =>
                                    typeof val === "string" &&
                                    onUpdateParam("coordinates_ref", val, false)
                                }
                                onBlur={() =>
                                    onUpdateParam(
                                        "coordinates_ref",
                                        viewModel.coordinates_ref,
                                        true,
                                    )
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    onUpdateParam(
                                        "coordinates_ref",
                                        viewModel.coordinates_ref,
                                        true,
                                    )
                                }
                            ></TextInput>
                            {viewModel.type === "assembly" && (
                                <TextInput
                                    label="Assembly Id"
                                    value={viewModel.assembly_id || undefined}
                                    placeholder="null"
                                    size="xs"
                                    onChange={(val) =>
                                        typeof val === "string" &&
                                        onUpdateParam("assembly_id", val, false)
                                    }
                                    onBlur={() =>
                                        onUpdateParam(
                                            "assembly_id",
                                            viewModel.assembly_id,
                                            true,
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        onUpdateParam(
                                            "assembly_id",
                                            viewModel.assembly_id,
                                            true,
                                        )
                                    }
                                ></TextInput>
                            )}
                            {viewModel.type === "symmetry_mates" && (
                                <NumberInput
                                    label="Radius"
                                    value={viewModel.radius || undefined}
                                    size="xs"
                                    onChange={(val) =>
                                        typeof val === "number" &&
                                        onUpdateParam("radius", val, false)
                                    }
                                    onBlur={() =>
                                        onUpdateParam(
                                            "radius",
                                            viewModel.radius,
                                            true,
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        onUpdateParam(
                                            "radius",
                                            viewModel.radius,
                                            true,
                                        )
                                    }
                                ></NumberInput>
                            )}
                            {viewModel.type === "symmetry" && (
                                <IJKControls
                                    viewModel={viewModel}
                                    onUpdateParam={onUpdateParam}
                                ></IJKControls>
                            )}

                            <Divider mt="md" mb="md"></Divider>

                            {/* Tooltips & Labels settings for structure tab. */}
                            <CollapseTrigger
                                title={"Global Tooltips & Labels"}
                                size={"md"}
                                expanded={tooltipsAndLabelsSectionExpanded}
                                onClick={() => {
                                    setTooltipsAndLabelsSectionExpanded(
                                        (prev) => {
                                            const nextState = !prev;
                                            UiLocalStorageService.ViewBuilder.setExpandedStructureTooltipsAndLabelsSection(
                                                asset.id,
                                                viewKey,
                                                nextState,
                                            );
                                            return nextState;
                                        },
                                    );
                                }}
                            ></CollapseTrigger>

                            <Collapse
                                expanded={tooltipsAndLabelsSectionExpanded}
                            >
                                <AssetBuilderCardSectionGroup
                                    divider={true}
                                    bottomMargin="sm"
                                >
                                    <div
                                        style={{
                                            fontSize: "0.85em",
                                            fontWeight: 600,
                                            marginBottom: "0.25em",
                                        }}
                                    >
                                        Structure Tooltips
                                    </div>
                                    <SegmentedController<
                                        "none" | "uri" | "source"
                                    >
                                        orientation="vertical"
                                        size={"xs"}
                                        value={getTooltipMode(viewModel)}
                                        onChange={(value) => {
                                            if (value === "none") {
                                                onUpdateParam(
                                                    "tooltip_from_uri",
                                                    undefined,
                                                    true,
                                                );
                                                onUpdateParam(
                                                    "tooltip_from_source",
                                                    undefined,
                                                    true,
                                                );
                                            } else if (value === "uri") {
                                                onUpdateParam(
                                                    "tooltip_from_source",
                                                    undefined,
                                                    true,
                                                );
                                                onUpdateParam(
                                                    "tooltip_from_uri",
                                                    {
                                                        uri: "",
                                                        format: "json",
                                                        schema: "whole_structure",
                                                    },
                                                    true,
                                                );
                                            } else if (value === "source") {
                                                onUpdateParam(
                                                    "tooltip_from_uri",
                                                    undefined,
                                                    true,
                                                );
                                                onUpdateParam(
                                                    "tooltip_from_source",
                                                    {
                                                        category_name: "",
                                                        field_name: "",
                                                        schema: "whole_structure",
                                                    },
                                                    true,
                                                );
                                            }
                                        }}
                                        data={[
                                            { label: "None", value: "none" },
                                            { label: "From URI", value: "uri" },
                                            {
                                                label: "From Source",
                                                value: "source",
                                            },
                                        ]}
                                    />

                                    {/* Tooltip from URI */}
                                    {getTooltipMode(viewModel) === "uri" &&
                                        viewModel.tooltip_from_uri && (
                                            <>
                                                <TextInput
                                                    label="URI"
                                                    size="xs"
                                                    value={
                                                        viewModel
                                                            .tooltip_from_uri
                                                            .uri
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_uri",
                                                            {
                                                                ...viewModel.tooltip_from_uri!,
                                                                uri: e
                                                                    .currentTarget
                                                                    .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_uri",
                                                            {
                                                                ...viewModel.tooltip_from_uri!,
                                                                uri: e
                                                                    .currentTarget
                                                                    .value,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <Select
                                                    label="Format"
                                                    size="xs"
                                                    data={[
                                                        "cif",
                                                        "bcif",
                                                        "json",
                                                    ]}
                                                    value={
                                                        viewModel
                                                            .tooltip_from_uri
                                                            .format
                                                    }
                                                    onChange={(val) =>
                                                        val &&
                                                        onUpdateParam(
                                                            "tooltip_from_uri",
                                                            {
                                                                ...viewModel.tooltip_from_uri!,
                                                                format: val as any,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <Select
                                                    label="Schema"
                                                    size="xs"
                                                    data={schemaOptions}
                                                    value={
                                                        viewModel
                                                            .tooltip_from_uri
                                                            .schema
                                                    }
                                                    onChange={(val) =>
                                                        val &&
                                                        onUpdateParam(
                                                            "tooltip_from_uri",
                                                            {
                                                                ...viewModel.tooltip_from_uri!,
                                                                schema: val as any,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    label="Category Name (Optional)"
                                                    size="xs"
                                                    value={
                                                        viewModel
                                                            .tooltip_from_uri
                                                            .category_name || ""
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_uri",
                                                            {
                                                                ...viewModel.tooltip_from_uri!,
                                                                category_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_uri",
                                                            {
                                                                ...viewModel.tooltip_from_uri!,
                                                                category_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value ||
                                                                    undefined,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    label="Field Name (Optional)"
                                                    size="xs"
                                                    value={
                                                        viewModel
                                                            .tooltip_from_uri
                                                            .field_name || ""
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_uri",
                                                            {
                                                                ...viewModel.tooltip_from_uri!,
                                                                field_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_uri",
                                                            {
                                                                ...viewModel.tooltip_from_uri!,
                                                                field_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value ||
                                                                    undefined,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                            </>
                                        )}

                                    {/* Tooltip from Source */}
                                    {getTooltipMode(viewModel) === "source" &&
                                        viewModel.tooltip_from_source && (
                                            <>
                                                <Select
                                                    label="Schema"
                                                    size="xs"
                                                    data={schemaOptions}
                                                    value={
                                                        viewModel
                                                            .tooltip_from_source
                                                            .schema
                                                    }
                                                    onChange={(val) =>
                                                        val &&
                                                        onUpdateParam(
                                                            "tooltip_from_source",
                                                            {
                                                                ...viewModel.tooltip_from_source!,
                                                                schema: val as any,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    label="Category Name"
                                                    size="xs"
                                                    value={
                                                        viewModel
                                                            .tooltip_from_source
                                                            .category_name
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_source",
                                                            {
                                                                ...viewModel.tooltip_from_source!,
                                                                category_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_source",
                                                            {
                                                                ...viewModel.tooltip_from_source!,
                                                                category_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    label="Field Name"
                                                    size="xs"
                                                    value={
                                                        viewModel
                                                            .tooltip_from_source
                                                            .field_name
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_source",
                                                            {
                                                                ...viewModel.tooltip_from_source!,
                                                                field_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "tooltip_from_source",
                                                            {
                                                                ...viewModel.tooltip_from_source!,
                                                                field_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                            </>
                                        )}
                                </AssetBuilderCardSectionGroup>

                                <AssetBuilderCardSectionGroup divider={false}>
                                    <div
                                        style={{
                                            fontSize: "0.85em",
                                            fontWeight: 600,
                                            marginBottom: "0.25em",
                                        }}
                                    >
                                        Structure Labels
                                    </div>
                                    <SegmentedController<
                                        "none" | "uri" | "source"
                                    >
                                        orientation="vertical"
                                        size={"xs"}
                                        value={getLabelMode(viewModel)}
                                        onChange={(value) => {
                                            if (value === "none") {
                                                onUpdateParam(
                                                    "label_from_uri",
                                                    undefined,
                                                    true,
                                                );
                                                onUpdateParam(
                                                    "label_from_source",
                                                    undefined,
                                                    true,
                                                );
                                            } else if (value === "uri") {
                                                onUpdateParam(
                                                    "label_from_source",
                                                    undefined,
                                                    true,
                                                );
                                                onUpdateParam(
                                                    "label_from_uri",
                                                    {
                                                        uri: "",
                                                        format: "json",
                                                        schema: "whole_structure",
                                                    },
                                                    true,
                                                );
                                            } else if (value === "source") {
                                                onUpdateParam(
                                                    "label_from_uri",
                                                    undefined,
                                                    true,
                                                );
                                                onUpdateParam(
                                                    "label_from_source",
                                                    {
                                                        category_name: "",
                                                        field_name: "",
                                                        schema: "whole_structure",
                                                    },
                                                    true,
                                                );
                                            }
                                        }}
                                        data={[
                                            { label: "None", value: "none" },
                                            { label: "From URI", value: "uri" },
                                            {
                                                label: "From Source",
                                                value: "source",
                                            },
                                        ]}
                                    />

                                    {/* Label from URI */}
                                    {getLabelMode(viewModel) === "uri" &&
                                        viewModel.label_from_uri && (
                                            <>
                                                <TextInput
                                                    label="URI"
                                                    size="xs"
                                                    value={
                                                        viewModel.label_from_uri
                                                            .uri
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "label_from_uri",
                                                            {
                                                                ...viewModel.label_from_uri!,
                                                                uri: e
                                                                    .currentTarget
                                                                    .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "label_from_uri",
                                                            {
                                                                ...viewModel.label_from_uri!,
                                                                uri: e
                                                                    .currentTarget
                                                                    .value,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <Select
                                                    label="Format"
                                                    size="xs"
                                                    data={[
                                                        "cif",
                                                        "bcif",
                                                        "json",
                                                    ]}
                                                    value={
                                                        viewModel.label_from_uri
                                                            .format
                                                    }
                                                    onChange={(val) =>
                                                        val &&
                                                        onUpdateParam(
                                                            "label_from_uri",
                                                            {
                                                                ...viewModel.label_from_uri!,
                                                                format: val as any,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <Select
                                                    label="Schema"
                                                    size="xs"
                                                    data={schemaOptions}
                                                    value={
                                                        viewModel.label_from_uri
                                                            .schema
                                                    }
                                                    onChange={(val) =>
                                                        val &&
                                                        onUpdateParam(
                                                            "label_from_uri",
                                                            {
                                                                ...viewModel.label_from_uri!,
                                                                schema: val as any,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    label="Category Name (Optional)"
                                                    size="xs"
                                                    value={
                                                        viewModel.label_from_uri
                                                            .category_name || ""
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "label_from_uri",
                                                            {
                                                                ...viewModel.label_from_uri!,
                                                                category_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "label_from_uri",
                                                            {
                                                                ...viewModel.label_from_uri!,
                                                                category_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value ||
                                                                    undefined,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    label="Field Name (Optional)"
                                                    size="xs"
                                                    value={
                                                        viewModel.label_from_uri
                                                            .field_name || ""
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "label_from_uri",
                                                            {
                                                                ...viewModel.label_from_uri!,
                                                                field_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "label_from_uri",
                                                            {
                                                                ...viewModel.label_from_uri!,
                                                                field_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value ||
                                                                    undefined,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                            </>
                                        )}

                                    {/* Label from Source */}
                                    {getLabelMode(viewModel) === "source" &&
                                        viewModel.label_from_source && (
                                            <>
                                                <Select
                                                    label="Schema"
                                                    size="xs"
                                                    data={schemaOptions}
                                                    value={
                                                        viewModel
                                                            .label_from_source
                                                            .schema
                                                    }
                                                    onChange={(val) =>
                                                        val &&
                                                        onUpdateParam(
                                                            "label_from_source",
                                                            {
                                                                ...viewModel.label_from_source!,
                                                                schema: val as any,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    label="Category Name"
                                                    size="xs"
                                                    value={
                                                        viewModel
                                                            .label_from_source
                                                            .category_name
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "label_from_source",
                                                            {
                                                                ...viewModel.label_from_source!,
                                                                category_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "label_from_source",
                                                            {
                                                                ...viewModel.label_from_source!,
                                                                category_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                                <TextInput
                                                    label="Field Name"
                                                    size="xs"
                                                    value={
                                                        viewModel
                                                            .label_from_source
                                                            .field_name
                                                    }
                                                    onChange={(e) =>
                                                        onUpdateParam(
                                                            "label_from_source",
                                                            {
                                                                ...viewModel.label_from_source!,
                                                                field_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            false,
                                                        )
                                                    }
                                                    onBlur={(e) =>
                                                        onUpdateParam(
                                                            "label_from_source",
                                                            {
                                                                ...viewModel.label_from_source!,
                                                                field_name:
                                                                    e
                                                                        .currentTarget
                                                                        .value,
                                                            },
                                                            true,
                                                        )
                                                    }
                                                />
                                            </>
                                        )}
                                </AssetBuilderCardSectionGroup>
                            </Collapse>

                            {/* Transform settings for structure tab. */}
                            <CollapseTrigger
                                title={"Global transform"}
                                size={"md"}
                                expanded={transformSectionExpanded}
                                onClick={() => {
                                    setTransformSectionExpanded((prev) => {
                                        const nextState = !prev;
                                        UiLocalStorageService.ViewBuilder.setExpandedStructureTransformSection(
                                            asset.id,
                                            viewKey,
                                            nextState,
                                        );
                                        return nextState;
                                    });
                                }}
                            ></CollapseTrigger>

                            <Collapse expanded={transformSectionExpanded}>
                                <StructureTransformControls
                                    viewModel={viewModel}
                                    onUpdateParam={onUpdateParam}
                                ></StructureTransformControls>
                            </Collapse>
                        </AssetBuilderCardSectionGroup>
                    </Collapse>
                </AssetBuilderCardSectionGroup>
            </Collapse>

            {/* Components settings for Structure tab. */}
            <CollapseTrigger
                title={"Components"}
                size={"md"}
                expanded={componentsSectionExpanded}
                onClick={() => {
                    setComponentsSectionExpanded((prev) => {
                        const nextState = !prev;
                        UiLocalStorageService.ViewBuilder.setExpandedStructureComponentsSection(
                            asset.id,
                            viewKey,
                            currentComponentId!,
                            nextState,
                        );
                        return nextState;
                    });
                }}
            ></CollapseTrigger>

            <Collapse expanded={componentsSectionExpanded}>
                <AssetBuilderCardSectionGroup divider={false}>
                    {/* Tabs for component selection. */}
                    <Tabs
                        onChange={(value) => {
                            if (!value) {
                                return;
                            }

                            if (value === "+") {
                                console.log("New component shall be added."); // TODO: add new component
                                return;
                            }
                            setCurrentComponentId(value);
                        }}
                        defaultValue={currentComponentId}
                        style={{ marginTop: "0.5em" }}
                    >
                        <Tabs.List>
                            <Scroller>
                                <Tabs.Tab
                                    key={"+"}
                                    value={"+"}
                                    title="Add new component."
                                >
                                    <b>+</b>
                                </Tabs.Tab>
                                {viewModel.components.map((component) => {
                                    return (
                                        <Tabs.Tab
                                            key={component.id}
                                            value={component.id}
                                            title={`${selectorToString(
                                                component.selector,
                                                false,
                                            )}`}
                                        >
                                            <span
                                                style={{
                                                    display: "flex",
                                                    gap: "0.5em",
                                                    alignItems: "center",
                                                }}
                                            >
                                                {selectorToString(
                                                    component.selector,
                                                )}
                                                <DeleteActionIcon
                                                    tooltip="Delete component."
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        console.log(
                                                            "Delete component.", // TODO: delete old component
                                                        );
                                                    }}
                                                ></DeleteActionIcon>
                                            </span>
                                        </Tabs.Tab>
                                    );
                                })}
                            </Scroller>
                        </Tabs.List>
                    </Tabs>

                    {/* Selector for given component. */}
                    <SegmentedController<ComponentEntryComponentSelectorType>
                        orientation="vertical"
                        size={"xs"}
                        value={
                            typeof currentComponent?.selector === "string"
                                ? "PredefinedSelector"
                                : "ExpressionSelector"
                        }
                        onChange={(value) => {
                            if (!currentComponent) {
                                return;
                            }

                            const nextSelector: Selector =
                                value === "PredefinedSelector" ? "all" : {};

                            onUpdateStructureComponentParam(
                                currentComponent.id,
                                "selector",
                                nextSelector,
                                true,
                            );
                        }}
                        data={[
                            {
                                label: "Predefined selector",
                                value: "PredefinedSelector",
                            },
                            {
                                label: "Expression selector (advanced)",
                                value: "ExpressionSelector",
                            },
                        ]}
                    />

                    {/* Predefined selector settings. */}
                    {currentComponent?.selector !== undefined &&
                        isPredefinedSelector(currentComponent.selector) && (
                            <Select
                                label="Type"
                                data={[
                                    "all",
                                    "polymer",
                                    "protein",
                                    "nucleic",
                                    "branched",
                                    "ligand",
                                    "ion",
                                    "water",
                                    "coarse",
                                ]}
                                value={currentComponent.selector}
                                onChange={(val) => {
                                    if (val) {
                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "selector",
                                            val as PredefinedSelector,
                                            true,
                                        );
                                    }
                                }}
                                size="xs"
                            />
                        )}

                    {/* Expression selector settings. */}
                    {currentComponent?.selector !== undefined &&
                        (isSelectorExpressionList(currentComponent.selector) ||
                            isSingleSelectorExpression(
                                currentComponent.selector,
                            )) && (
                            <AssetBuilderCardSectionGroup
                                divider={true}
                                bottomMargin="sm"
                            >
                                {currentExpressions.map((expr, index) => {
                                    const usedFields = Object.keys(
                                        expr,
                                    ) as (keyof SelectorExpression)[];
                                    const draft = getDraft(index);

                                    return (
                                        <AssetBuilderCardSectionGroup
                                            key={index}
                                            gap="0.33em"
                                            divider={false}
                                        >
                                            <ActionableList>
                                                <ActionableListItem
                                                    title={`${
                                                        index + 1
                                                    }. expression `}
                                                    titleSize="sm"
                                                    rightComponent={
                                                        <DeleteActionIcon
                                                            onClick={() =>
                                                                handleRemoveExpression(
                                                                    index,
                                                                )
                                                            }
                                                            tooltip="Remove expression."
                                                        />
                                                    }
                                                />
                                            </ActionableList>

                                            {usedFields.map((fieldKey) => {
                                                const fieldDef =
                                                    SELECTOR_EXPRESSION_FIELDS.find(
                                                        (f) =>
                                                            f.key === fieldKey,
                                                    )!;
                                                const fieldOptions =
                                                    SELECTOR_EXPRESSION_FIELDS.filter(
                                                        (f) =>
                                                            f.key ===
                                                                fieldKey ||
                                                            !usedFields.includes(
                                                                f.key,
                                                            ),
                                                    ).map((f) => ({
                                                        value: f.key,
                                                        label: f.label,
                                                    }));

                                                return (
                                                    <Group
                                                        key={fieldKey}
                                                        align="flex-end"
                                                        gap="0.33em"
                                                        wrap="nowrap"
                                                    >
                                                        <Select
                                                            label="Field"
                                                            data={fieldOptions}
                                                            value={fieldKey}
                                                            onChange={(val) =>
                                                                val &&
                                                                handleChangeExpressionFieldKey(
                                                                    index,
                                                                    fieldKey,
                                                                    val as keyof SelectorExpression,
                                                                )
                                                            }
                                                            size="xs"
                                                            style={{
                                                                flex: 1,
                                                            }}
                                                        />

                                                        {fieldDef.type ===
                                                        "text" ? (
                                                            <TextInput
                                                                label="Value"
                                                                value={
                                                                    (expr[
                                                                        fieldKey
                                                                    ] as string) ??
                                                                    ""
                                                                }
                                                                size="xs"
                                                                style={{
                                                                    flex: 1,
                                                                }}
                                                                onChange={(e) =>
                                                                    handleExpressionFieldChange(
                                                                        index,
                                                                        fieldKey,
                                                                        e
                                                                            .currentTarget
                                                                            .value,
                                                                        false,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    handleExpressionFieldChange(
                                                                        index,
                                                                        fieldKey,
                                                                        currentExpressions[
                                                                            index
                                                                        ]?.[
                                                                            fieldKey
                                                                        ] as string,
                                                                        true,
                                                                    )
                                                                }
                                                                onKeyDown={(
                                                                    e,
                                                                ) =>
                                                                    e.key ===
                                                                        "Enter" &&
                                                                    handleExpressionFieldChange(
                                                                        index,
                                                                        fieldKey,
                                                                        currentExpressions[
                                                                            index
                                                                        ]?.[
                                                                            fieldKey
                                                                        ] as string,
                                                                        true,
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <NumberInput
                                                                label="Value"
                                                                value={
                                                                    expr[
                                                                        fieldKey
                                                                    ] as
                                                                        | number
                                                                        | undefined
                                                                }
                                                                size="xs"
                                                                style={{
                                                                    flex: 1,
                                                                }}
                                                                onChange={(
                                                                    val,
                                                                ) =>
                                                                    handleExpressionFieldChange(
                                                                        index,
                                                                        fieldKey,
                                                                        typeof val ===
                                                                            "number"
                                                                            ? val
                                                                            : undefined,
                                                                        false,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    handleExpressionFieldChange(
                                                                        index,
                                                                        fieldKey,
                                                                        currentExpressions[
                                                                            index
                                                                        ]?.[
                                                                            fieldKey
                                                                        ] as number,
                                                                        true,
                                                                    )
                                                                }
                                                                onKeyDown={(
                                                                    e,
                                                                ) =>
                                                                    e.key ===
                                                                        "Enter" &&
                                                                    handleExpressionFieldChange(
                                                                        index,
                                                                        fieldKey,
                                                                        currentExpressions[
                                                                            index
                                                                        ]?.[
                                                                            fieldKey
                                                                        ] as number,
                                                                        true,
                                                                    )
                                                                }
                                                            />
                                                        )}

                                                        <DeleteActionIcon
                                                            onClick={() =>
                                                                handleRemoveExpressionField(
                                                                    index,
                                                                    fieldKey,
                                                                )
                                                            }
                                                            tooltip="Remove field."
                                                        />
                                                    </Group>
                                                );
                                            })}

                                            {/* Draft row for adding a new field to this expression. */}
                                            <Group
                                                align="flex-end"
                                                gap="0.33em"
                                                wrap="nowrap"
                                            >
                                                <Select
                                                    label="Field"
                                                    placeholder="Choose field"
                                                    data={SELECTOR_EXPRESSION_FIELDS.filter(
                                                        (f) =>
                                                            !usedFields.includes(
                                                                f.key,
                                                            ),
                                                    ).map((f) => ({
                                                        value: f.key,
                                                        label: f.label,
                                                    }))}
                                                    value={draft.field}
                                                    onChange={(val) =>
                                                        setDraft(index, {
                                                            ...draft,
                                                            field:
                                                                (val as keyof SelectorExpression) ??
                                                                null,
                                                        })
                                                    }
                                                    size="xs"
                                                    style={{ flex: 1 }}
                                                    clearable
                                                />
                                                <TextInput
                                                    label="Value"
                                                    value={draft.value}
                                                    size="xs"
                                                    style={{ flex: 1 }}
                                                    disabled={!draft.field}
                                                    onChange={(e) =>
                                                        setDraft(index, {
                                                            ...draft,
                                                            value: e
                                                                .currentTarget
                                                                .value,
                                                        })
                                                    }
                                                    onKeyDown={(e) =>
                                                        e.key === "Enter" &&
                                                        handleSaveNewExpressionField(
                                                            index,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        handleSaveNewExpressionField(
                                                            index,
                                                        )
                                                    }
                                                />
                                                <DeleteActionIcon
                                                    tooltip="Cannot remove empty field."
                                                    enabled={false}
                                                />
                                            </Group>

                                            {index <
                                                currentExpressions.length -
                                                    1 && <Divider />}
                                        </AssetBuilderCardSectionGroup>
                                    );
                                })}

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <ActionableTile>
                                        <PlusActionIcon
                                            onClick={handleAddExpression}
                                            tooltip="Add new expression."
                                        />
                                    </ActionableTile>
                                </div>
                            </AssetBuilderCardSectionGroup>
                        )}

                    {/* Representation settings for structure component tab. */}
                    <CollapseTrigger
                        title={"Representation"}
                        size={"md"}
                        expanded={componentRepresentationSectionExpanded}
                        onClick={() => {
                            setComponentRepresentationSectionExpanded(
                                (prev) => {
                                    const nextState = !prev;
                                    UiLocalStorageService.ViewBuilder.setExpandedStructureComponentRepresentationSection(
                                        asset.id,
                                        viewKey,
                                        currentComponentId!,
                                        nextState,
                                    );
                                    return nextState;
                                },
                            );
                        }}
                    ></CollapseTrigger>

                    <Collapse expanded={componentRepresentationSectionExpanded}>
                        <AssetBuilderCardSectionGroup>
                            <Select
                                label="Type"
                                data={[
                                    "cartoon",
                                    "backbone",
                                    "ball_and_stick",
                                    "line",
                                    "spacefill",
                                    "carbohydrate",
                                    "surface",
                                    "putty",
                                ]}
                                value={
                                    currentComponent?.representationType ||
                                    "cartoon"
                                }
                                onChange={(val) => {
                                    if (val && currentComponentId) {
                                        onUpdateStructureComponentParam(
                                            currentComponentId,
                                            "representationType",
                                            val,
                                            true,
                                        );
                                    }
                                }}
                                size="xs"
                            />
                            <SegmentedController<ComponenentEntryColorProperty>
                                orientation="vertical"
                                size={"xs"}
                                value={getActiveColorProperty(currentComponent)}
                                onChange={(value) => {
                                    if (!currentComponent) {
                                        return;
                                    }

                                    if (value === "Color") {
                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "color",
                                            "#ffffff",
                                            true,
                                        );
                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "color_from_uri",
                                            undefined,
                                            true,
                                        );
                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "color_from_source",
                                            undefined,
                                            true,
                                        );
                                    } else if (value === "Color from URI") {
                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "color",
                                            undefined,
                                            true,
                                        );

                                        // Matches DataFromUriParams perfectly
                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "color_from_uri",
                                            {
                                                uri: "",
                                                format: "json",
                                                schema: "whole_structure",
                                            },
                                            true,
                                        );

                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "color_from_source",
                                            undefined,
                                            true,
                                        );
                                    } else if (value === "Color from source") {
                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "color",
                                            undefined,
                                            true,
                                        );
                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "color_from_uri",
                                            undefined,
                                            true,
                                        );

                                        // Matches DataFromSourceParams perfectly
                                        onUpdateStructureComponentParam(
                                            currentComponent.id,
                                            "color_from_source",
                                            {
                                                category_name: "",
                                                field_name: "",
                                                schema: "whole_structure",
                                            },
                                            true,
                                        );
                                    }
                                }}
                                data={[
                                    {
                                        label: "Color",
                                        value: "Color",
                                    },
                                    {
                                        label: "Color from URI (advanced)",
                                        value: "Color from URI",
                                    },
                                    {
                                        label: "Color from source (advanced)",
                                        value: "Color from source",
                                    },
                                ]}
                            />
                            {getActiveColorProperty(currentComponent) ===
                                "Color" && (
                                <>
                                    <ColorInput
                                        label="Color"
                                        value={
                                            currentComponent?.color || "#ffffff"
                                        }
                                        size="xs"
                                        format="hex"
                                        onChange={(val) => {
                                            if (val && currentComponentId) {
                                                onUpdateStructureComponentParam(
                                                    currentComponentId,
                                                    "color",
                                                    val,
                                                    false,
                                                );
                                            }
                                        }}
                                        onChangeEnd={(val) => {
                                            if (val && currentComponentId) {
                                                onUpdateStructureComponentParam(
                                                    currentComponentId,
                                                    "color",
                                                    val,
                                                    true,
                                                );
                                            }
                                        }}
                                    />
                                </>
                            )}
                            {/* Color from URI */}
                            {getActiveColorProperty(currentComponent) ===
                                "Color from URI" &&
                                currentComponent?.color_from_uri && (
                                    <>
                                        <TextInput
                                            label="URI"
                                            size="xs"
                                            value={
                                                currentComponent.color_from_uri
                                                    .uri
                                            }
                                            onChange={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_uri",
                                                    {
                                                        ...currentComponent.color_from_uri!,
                                                        uri: e.currentTarget
                                                            .value,
                                                    },
                                                    false,
                                                )
                                            }
                                            onBlur={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_uri",
                                                    {
                                                        ...currentComponent.color_from_uri!,
                                                        uri: e.currentTarget
                                                            .value,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                        <Select
                                            label="Format"
                                            size="xs"
                                            data={["cif", "bcif", "json"]}
                                            value={
                                                currentComponent.color_from_uri
                                                    .format
                                            }
                                            onChange={(val) =>
                                                val &&
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_uri",
                                                    {
                                                        ...currentComponent.color_from_uri!,
                                                        format: val as any,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                        <Select
                                            label="Schema"
                                            size="xs"
                                            data={[
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
                                            ]}
                                            value={
                                                currentComponent.color_from_uri
                                                    .schema
                                            }
                                            onChange={(val) =>
                                                val &&
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_uri",
                                                    {
                                                        ...currentComponent.color_from_uri!,
                                                        schema: val as any,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                        <TextInput
                                            label="Category Name (Optional)"
                                            size="xs"
                                            value={
                                                currentComponent.color_from_uri
                                                    .category_name || ""
                                            }
                                            onChange={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_uri",
                                                    {
                                                        ...currentComponent.color_from_uri!,
                                                        category_name:
                                                            e.currentTarget
                                                                .value,
                                                    },
                                                    false,
                                                )
                                            }
                                            onBlur={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_uri",
                                                    {
                                                        ...currentComponent.color_from_uri!,
                                                        category_name:
                                                            e.currentTarget
                                                                .value ||
                                                            undefined,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                        <TextInput
                                            label="Field Name (Optional)"
                                            size="xs"
                                            value={
                                                currentComponent.color_from_uri
                                                    .field_name || ""
                                            }
                                            onChange={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_uri",
                                                    {
                                                        ...currentComponent.color_from_uri!,
                                                        field_name:
                                                            e.currentTarget
                                                                .value,
                                                    },
                                                    false,
                                                )
                                            }
                                            onBlur={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_uri",
                                                    {
                                                        ...currentComponent.color_from_uri!,
                                                        field_name:
                                                            e.currentTarget
                                                                .value ||
                                                            undefined,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                    </>
                                )}

                            {/* Color from Source */}
                            {getActiveColorProperty(currentComponent) ===
                                "Color from source" &&
                                currentComponent?.color_from_source && (
                                    <>
                                        <Select
                                            label="Schema"
                                            size="xs"
                                            data={[
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
                                            ]}
                                            value={
                                                currentComponent
                                                    .color_from_source.schema
                                            }
                                            onChange={(val) =>
                                                val &&
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_source",
                                                    {
                                                        ...currentComponent.color_from_source!,
                                                        schema: val as any,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                        <TextInput
                                            label="Category Name"
                                            size="xs"
                                            value={
                                                currentComponent
                                                    .color_from_source
                                                    .category_name
                                            }
                                            onChange={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_source",
                                                    {
                                                        ...currentComponent.color_from_source!,
                                                        category_name:
                                                            e.currentTarget
                                                                .value,
                                                    },
                                                    false,
                                                )
                                            }
                                            onBlur={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_source",
                                                    {
                                                        ...currentComponent.color_from_source!,
                                                        category_name:
                                                            e.currentTarget
                                                                .value,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                        <TextInput
                                            label="Field Name"
                                            size="xs"
                                            value={
                                                currentComponent
                                                    .color_from_source
                                                    .field_name
                                            }
                                            onChange={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_source",
                                                    {
                                                        ...currentComponent.color_from_source!,
                                                        field_name:
                                                            e.currentTarget
                                                                .value,
                                                    },
                                                    false,
                                                )
                                            }
                                            onBlur={(e) =>
                                                onUpdateStructureComponentParam(
                                                    currentComponent.id,
                                                    "color_from_source",
                                                    {
                                                        ...currentComponent.color_from_source!,
                                                        field_name:
                                                            e.currentTarget
                                                                .value,
                                                    },
                                                    true,
                                                )
                                            }
                                        />
                                    </>
                                )}
                            <AlphaSlider
                                color={currentComponent?.color || "#ffffff"}
                                value={currentComponent?.opacity || 1.0}
                                onChange={(val) => {
                                    if (val && currentComponentId) {
                                        onUpdateStructureComponentParam(
                                            currentComponentId,
                                            "opacity",
                                            val,
                                            false,
                                        );
                                    }
                                }}
                                onChangeEnd={(val) => {
                                    if (val && currentComponentId) {
                                        onUpdateStructureComponentParam(
                                            currentComponentId,
                                            "opacity",
                                            val,
                                            true,
                                        );
                                    }
                                }}
                            ></AlphaSlider>
                        </AssetBuilderCardSectionGroup>
                    </Collapse>

                    {/* Tooltips and labels settings for structure component tab. */}
                    <CollapseTrigger
                        title={"Tooltips & Labels"}
                        size={"md"}
                        expanded={componentTooltipsAndLabelsSectionExpanded}
                        onClick={() => {
                            setComponentTooltipsAndLabelsSectionExpanded(
                                (prev) => {
                                    const nextState = !prev;
                                    UiLocalStorageService.ViewBuilder.setExpandedStructureComponentTooltipsAndLabelsSection(
                                        asset.id,
                                        viewKey,
                                        currentComponentId!,
                                        nextState,
                                    );
                                    return nextState;
                                },
                            );
                        }}
                    ></CollapseTrigger>

                    <Collapse
                        expanded={componentTooltipsAndLabelsSectionExpanded}
                    >
                        <AssetBuilderCardSectionGroup>
                            <TextInput
                                label="Label"
                                placeholder="Text to display next to the component"
                                value={currentComponent?.label || ""}
                                size="xs"
                                onChange={(e) => {
                                    if (currentComponentId) {
                                        onUpdateStructureComponentParam(
                                            currentComponentId,
                                            "label",
                                            e.currentTarget.value,
                                            false,
                                        );
                                    }
                                }}
                                onBlur={(e) => {
                                    if (currentComponentId) {
                                        onUpdateStructureComponentParam(
                                            currentComponentId,
                                            "label",
                                            e.currentTarget.value,
                                            true,
                                        );
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        currentComponentId
                                    ) {
                                        onUpdateStructureComponentParam(
                                            currentComponentId,
                                            "label",
                                            e.currentTarget.value,
                                            true,
                                        );
                                    }
                                }}
                            />

                            <TextInput
                                label="Tooltip"
                                placeholder="Text to show on hover"
                                value={currentComponent?.tooltip || ""}
                                size="xs"
                                onChange={(e) => {
                                    if (currentComponentId) {
                                        onUpdateStructureComponentParam(
                                            currentComponentId,
                                            "tooltip",
                                            e.currentTarget.value,
                                            false,
                                        );
                                    }
                                }}
                                onBlur={(e) => {
                                    if (currentComponentId) {
                                        onUpdateStructureComponentParam(
                                            currentComponentId,
                                            "tooltip",
                                            e.currentTarget.value,
                                            true,
                                        );
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        currentComponentId
                                    ) {
                                        onUpdateStructureComponentParam(
                                            currentComponentId,
                                            "tooltip",
                                            e.currentTarget.value,
                                            true,
                                        );
                                    }
                                }}
                            />
                        </AssetBuilderCardSectionGroup>
                    </Collapse>

                    {/* Transform settings for structure component tab. */}
                    <CollapseTrigger
                        title={"Transform"}
                        size={"md"}
                        expanded={componentTransformSectionExpanded}
                        onClick={() => {
                            setComponentTransformSectionExpanded((prev) => {
                                const nextState = !prev;
                                UiLocalStorageService.ViewBuilder.setExpandedStructureComponentTransformSection(
                                    asset.id,
                                    viewKey,
                                    currentComponentId!,
                                    nextState,
                                );
                                return nextState;
                            });
                        }}
                    ></CollapseTrigger>

                    <Collapse expanded={componentTransformSectionExpanded}>
                        <StructureComponentEntryTransformControls
                            component={currentComponent}
                            onUpdateStructureComponentParam={
                                onUpdateStructureComponentParam
                            }
                        ></StructureComponentEntryTransformControls>
                    </Collapse>
                </AssetBuilderCardSectionGroup>
            </Collapse>
        </div>
    );
}
