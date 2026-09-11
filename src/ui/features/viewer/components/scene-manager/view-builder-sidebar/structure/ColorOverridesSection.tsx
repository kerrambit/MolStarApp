/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useState } from "react";
import {
    ColorInput,
    Group,
    NumberInput,
    Select,
    TextInput,
} from "@mantine/core";
import {
    createDefaultColorOverride,
    isSingleSelectorExpression,
    type ColorOverride,
    type ComponentEntry,
    type PredefinedSelector,
    type Selector,
    type SelectorExpression,
} from "../../../../models/MvsViewModels";
import { SegmentedController } from "../../../../../../components/common/segmented-controller/SegmentedController";
import { AssetBuilderCardSectionGroup } from "../AssetBuilderCardSectionGroup";
import { ActionableList } from "../../../../../../components/common/actionables/ActionableList";
import { ActionableListItem } from "../../../../../../components/common/actionables/ActionableListItem";
import { DeleteActionIcon } from "../../../../../../components/common/actionables/actions-icons/DeleteActionIcon";
import { PlusActionIcon } from "../../../../../../components/common/actionables/actions-icons/PlusActionIcon";
import { ActionableTile } from "../../../../../../components/common/actionables/ActionableTile";
import {
    normalizeToHex,
    PREDEFINED_SELECTOR_OPTIONS,
    SELECTOR_EXPRESSION_FIELDS,
    type UpdateComponentParam,
} from "./structureTabHelpers";
import { useStructureComponentCache } from "../../../../hooks/useStructureComponentCache";

type ColorOverridesSectionProps = {
    component: ComponentEntry;
    assetId: string;
    viewKey: string;
    onUpdateStructureComponentParam: UpdateComponentParam;
};

/**
 * Color override list for the "Color" mode of a component: each override has
 * a predefined or single-expression selector and its own color.
 */
export function ColorOverridesSection({
    component,
    assetId,
    viewKey,
    onUpdateStructureComponentParam,
}: ColorOverridesSectionProps) {
    // Stash/restore each override's selector when switching its mode.
    const { readCache, writeCache } = useStructureComponentCache(
        assetId,
        viewKey,
        component.id,
    );

    // Write the whole colorOverrides array back to the component.
    const setOverrides = (overrides: ColorOverride[], sync: boolean) => {
        onUpdateStructureComponentParam(
            component.id,
            "colorOverrides",
            overrides,
            sync,
        );
    };

    const handleAddColorOverride = () => {
        setOverrides(
            [...(component.colorOverrides || []), createDefaultColorOverride()],
            true,
        );
    };

    const handleRemoveColorOverride = (overrideId: string) => {
        setOverrides(
            (component.colorOverrides || []).filter((o) => o.id !== overrideId),
            true,
        );
    };

    const handleColorOverrideColorChange = (
        overrideId: string,
        color: string,
        sync: boolean,
    ) => {
        setOverrides(
            (component.colorOverrides || []).map((o) =>
                o.id === overrideId ? { ...o, color } : o,
            ),
            sync,
        );
    };

    // Per-override cache keys for the selector of the mode being switched away
    // from. Keyed by override INDEX, not id — override ids are UI-only random
    // UUIDs re-derived on every read from the Molstar tree, so they do not
    // survive the sync round-trip (component ids are positional and stable).
    const overridePredefinedCacheKey = (overrideIndex: number) =>
        `selepredefined-${overrideIndex}`;
    const overrideExpressionCacheKey = (overrideIndex: number) =>
        `seleexpression-${overrideIndex}`;

    const handleColorOverrideSelectorModeChange = (
        overrideId: string,
        overrideIndex: number,
        mode: "PredefinedSelector" | "ExpressionSelector",
    ) => {
        const current = (component.colorOverrides || []).find(
            (o) => o.id === overrideId,
        );
        if (!current) return;
        const currentIsPredefined = typeof current.selector === "string";
        if (currentIsPredefined === (mode === "PredefinedSelector")) return;

        // Stash the selector of the mode being left and restore the cached one.
        let nextSelector: Selector;
        if (currentIsPredefined) {
            writeCache(
                overridePredefinedCacheKey(overrideIndex),
                current.selector,
            );
            nextSelector =
                (readCache(overrideExpressionCacheKey(overrideIndex)) as
                    | Selector
                    | undefined) ?? {};
        } else {
            writeCache(
                overrideExpressionCacheKey(overrideIndex),
                current.selector,
            );
            nextSelector =
                (readCache(overridePredefinedCacheKey(overrideIndex)) as
                    | PredefinedSelector
                    | undefined) ?? "all";
        }

        setOverrides(
            (component.colorOverrides || []).map((o) =>
                o.id === overrideId ? { ...o, selector: nextSelector } : o,
            ),
            true,
        );
    };

    const handleColorOverridePredefinedChange = (
        overrideId: string,
        val: PredefinedSelector,
    ) => {
        setOverrides(
            (component.colorOverrides || []).map((o) =>
                o.id === overrideId ? { ...o, selector: val } : o,
            ),
            true,
        );
    };

    const handleColorOverrideExpressionFieldChange = (
        overrideId: string,
        field: keyof SelectorExpression,
        val: string | number | undefined,
        sync: boolean,
    ) => {
        setOverrides(
            (component.colorOverrides || []).map((o) => {
                if (o.id !== overrideId) return o;
                const expr = isSingleSelectorExpression(o.selector)
                    ? { ...o.selector }
                    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ({} as Record<string, any>);
                if (val === undefined || val === "") {
                    delete expr[field];
                } else {
                    expr[field] = val;
                }
                return { ...o, selector: expr };
            }),
            sync,
        );
    };

    const handleColorOverrideChangeFieldKey = (
        overrideId: string,
        oldField: keyof SelectorExpression,
        newField: keyof SelectorExpression,
    ) => {
        setOverrides(
            (component.colorOverrides || []).map((o) => {
                if (o.id !== overrideId) return o;
                const expr = isSingleSelectorExpression(o.selector)
                    ? { ...o.selector }
                    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ({} as Record<string, any>);
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
                return { ...o, selector: expr };
            }),
            true,
        );
    };

    const [overrideFieldDrafts, setOverrideFieldDrafts] = useState<
        Record<
            string,
            { field: keyof SelectorExpression | null; value: string }
        >
    >({});

    const handleSaveNewOverrideExpressionField = (overrideId: string) => {
        const draft = overrideFieldDrafts[overrideId] ?? {
            field: null,
            value: "",
        };
        if (!draft.field || draft.value === "") return;
        const fieldDef = SELECTOR_EXPRESSION_FIELDS.find(
            (f) => f.key === draft.field,
        );
        const value =
            fieldDef?.type === "number" ? Number(draft.value) : draft.value;
        if (fieldDef?.type === "number" && Number.isNaN(value)) return;
        setOverrides(
            (component.colorOverrides || []).map((o) => {
                if (o.id !== overrideId) return o;
                const expr = isSingleSelectorExpression(o.selector)
                    ? { ...o.selector }
                    : {};
                return { ...o, selector: { ...expr, [draft.field!]: value } };
            }),
            true,
        );
        setOverrideFieldDrafts((prev) => ({
            ...prev,
            [overrideId]: { field: null, value: "" },
        }));
    };

    // Render one override's expression-selector editor.
    const renderOverrideExpressionEditor = (override: ColorOverride) => {
        const expr = isSingleSelectorExpression(override.selector)
            ? override.selector
            : {};
        const usedFields = Object.keys(expr) as (keyof SelectorExpression)[];

        return (
            <>
                {usedFields.map((fieldKey) => {
                    const fieldDef = SELECTOR_EXPRESSION_FIELDS.find(
                        (f) => f.key === fieldKey,
                    );
                    if (!fieldDef) return null;

                    const fieldOptions = SELECTOR_EXPRESSION_FIELDS.filter(
                        (f) =>
                            f.key === fieldKey || !usedFields.includes(f.key),
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
                                    handleColorOverrideChangeFieldKey(
                                        override.id,
                                        fieldKey,
                                        val as keyof SelectorExpression,
                                    )
                                }
                                size="xs"
                                style={{ flex: 1 }}
                            />
                            {fieldDef.type === "text" ? (
                                <TextInput
                                    label="Value"
                                    value={(expr[fieldKey] as string) ?? ""}
                                    size="xs"
                                    style={{ flex: 1 }}
                                    onChange={(e) =>
                                        handleColorOverrideExpressionFieldChange(
                                            override.id,
                                            fieldKey,
                                            e.currentTarget.value,
                                            false,
                                        )
                                    }
                                    onBlur={(e) =>
                                        handleColorOverrideExpressionFieldChange(
                                            override.id,
                                            fieldKey,
                                            e.currentTarget.value,
                                            true,
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleColorOverrideExpressionFieldChange(
                                            override.id,
                                            fieldKey,
                                            e.currentTarget.value,
                                            true,
                                        )
                                    }
                                />
                            ) : (
                                <NumberInput
                                    label="Value"
                                    value={expr[fieldKey] as number | undefined}
                                    size="xs"
                                    style={{ flex: 1 }}
                                    onChange={(val) =>
                                        handleColorOverrideExpressionFieldChange(
                                            override.id,
                                            fieldKey,
                                            typeof val === "number"
                                                ? val
                                                : undefined,
                                            false,
                                        )
                                    }
                                    onBlur={(e) =>
                                        handleColorOverrideExpressionFieldChange(
                                            override.id,
                                            fieldKey,
                                            e.currentTarget
                                                .value as unknown as number,
                                            true,
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleColorOverrideExpressionFieldChange(
                                            override.id,
                                            fieldKey,
                                            e.currentTarget
                                                .value as unknown as number,
                                            true,
                                        )
                                    }
                                />
                            )}
                            <DeleteActionIcon
                                onClick={() =>
                                    handleColorOverrideExpressionFieldChange(
                                        override.id,
                                        fieldKey,
                                        undefined,
                                        true,
                                    )
                                }
                                tooltip="Remove field."
                            />
                        </Group>
                    );
                })}

                <Group align="flex-end" gap="0.33em" wrap="nowrap">
                    <Select
                        label="Add field"
                        placeholder="Choose field"
                        data={SELECTOR_EXPRESSION_FIELDS.filter(
                            (f) => !usedFields.includes(f.key),
                        ).map((f) => ({
                            value: f.key,
                            label: f.label,
                        }))}
                        value={overrideFieldDrafts[override.id]?.field || null}
                        onChange={(val) =>
                            setOverrideFieldDrafts((prev) => ({
                                ...prev,
                                [override.id]: {
                                    ...(prev[override.id] || { value: "" }),
                                    field:
                                        (val as keyof SelectorExpression) ??
                                        null,
                                },
                            }))
                        }
                        size="xs"
                        style={{ flex: 1 }}
                        clearable
                    />
                    <TextInput
                        label="Value"
                        value={overrideFieldDrafts[override.id]?.value || ""}
                        size="xs"
                        style={{ flex: 1 }}
                        disabled={!overrideFieldDrafts[override.id]?.field}
                        onChange={(e) =>
                            setOverrideFieldDrafts((prev) => ({
                                ...prev,
                                [override.id]: {
                                    ...(prev[override.id] || { field: null }),
                                    value: e.currentTarget.value,
                                },
                            }))
                        }
                        onKeyDown={(e) =>
                            e.key === "Enter" &&
                            handleSaveNewOverrideExpressionField(override.id)
                        }
                        onBlur={() =>
                            handleSaveNewOverrideExpressionField(override.id)
                        }
                    />
                    <DeleteActionIcon
                        tooltip="Cannot remove empty field."
                        enabled={false}
                    />
                </Group>
            </>
        );
    };

    // Render the component.
    return (
        <>
            {(component.colorOverrides || []).map((override, index) => (
                <AssetBuilderCardSectionGroup
                    key={override.id}
                    gap="0.33em"
                    divider={true}
                    bottomMargin="xs"
                    topMargin="xs"
                >
                    <ActionableList>
                        <ActionableListItem
                            title={`${index + 1}. color override `}
                            titleSize="sm"
                            rightComponent={
                                <DeleteActionIcon
                                    onClick={() =>
                                        handleRemoveColorOverride(override.id)
                                    }
                                    tooltip="Remove color override."
                                />
                            }
                        />
                    </ActionableList>
                    <Group justify="space-between" align="center">
                        <SegmentedController<
                            "PredefinedSelector" | "ExpressionSelector"
                        >
                            size="xs"
                            value={
                                typeof override.selector === "string"
                                    ? "PredefinedSelector"
                                    : "ExpressionSelector"
                            }
                            onChange={(mode) =>
                                handleColorOverrideSelectorModeChange(
                                    override.id,
                                    index,
                                    mode,
                                )
                            }
                            data={[
                                {
                                    label: "Predefined",
                                    value: "PredefinedSelector",
                                },
                                {
                                    label: "Expression",
                                    value: "ExpressionSelector",
                                },
                            ]}
                        />
                    </Group>

                    {typeof override.selector === "string" ? (
                        <Select
                            label="Selector"
                            size="xs"
                            data={PREDEFINED_SELECTOR_OPTIONS}
                            value={override.selector}
                            onChange={(val) =>
                                val &&
                                handleColorOverridePredefinedChange(
                                    override.id,
                                    val as PredefinedSelector,
                                )
                            }
                        />
                    ) : (
                        renderOverrideExpressionEditor(override)
                    )}

                    <ColorInput
                        label="Override Color"
                        value={normalizeToHex(override.color)}
                        size="xs"
                        format="hex"
                        onChange={(val) =>
                            val &&
                            handleColorOverrideColorChange(
                                override.id,
                                val,
                                false,
                            )
                        }
                        onChangeEnd={(val) =>
                            val &&
                            handleColorOverrideColorChange(
                                override.id,
                                val,
                                true,
                            )
                        }
                    />
                </AssetBuilderCardSectionGroup>
            ))}

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <ActionableTile>
                    <PlusActionIcon
                        onClick={handleAddColorOverride}
                        tooltip="Add new color override."
                    />
                </ActionableTile>
            </div>
        </>
    );
}
