/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useState } from "react";
import { Divider, Group, NumberInput, Select, TextInput } from "@mantine/core";
import {
    isPredefinedSelector,
    isSelectorExpressionList,
    isSingleSelectorExpression,
    type ComponentEntry,
    type PredefinedSelector,
    type Selector,
    type SelectorExpression,
} from "../../../models/MvsViewModels";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";
import { ActionableList } from "../../../../../components/common/actionables/ActionableList";
import { ActionableListItem } from "../../../../../components/common/actionables/ActionableListItem";
import { DeleteActionIcon } from "../../../../../components/common/actionables/actions-icons/DeleteActionIcon";
import { PlusActionIcon } from "../../../../../components/common/actionables/actions-icons/PlusActionIcon";
import { ActionableTile } from "../../../../../components/common/actionables/ActionableTile";
import {
    PREDEFINED_SELECTOR_OPTIONS,
    SELECTOR_EXPRESSION_FIELDS,
    type UpdateComponentParam,
} from "./structureTabHelpers";
import { useStructureComponentCache } from "../../../hooks/useStructureComponentCache";

type ComponentSelectorType = "PredefinedSelector" | "ExpressionSelector";

// Cache keys for stashing the selector of the mode being switched away from.
const PREDEFINED_SELECTOR_CACHE_KEY = "selepredefined";
const EXPRESSION_SELECTOR_CACHE_KEY = "seleexpression";

type ComponentSelectorSectionProps = {
    component?: ComponentEntry;
    assetId: string;
    viewKey: string;
    onUpdateStructureComponentParam: UpdateComponentParam;
};

/**
 * Component selector subsection: predefined/expression selector mode switch and the editable list of selector expressions.
 */
export function ComponentSelectorSection({
    component,
    assetId,
    viewKey,
    onUpdateStructureComponentParam,
}: ComponentSelectorSectionProps) {
    // Stash/restore the selector when switching between the two modes.
    const { readCache, writeCache } = useStructureComponentCache(
        assetId,
        viewKey,
        component?.id,
    );

    const handleSelectorModeChange = (value: ComponentSelectorType) => {
        if (!component) return;
        const currentIsPredefined = typeof component.selector === "string";
        if (value === "PredefinedSelector") {
            if (currentIsPredefined) return;
            // Stash the expression selector and restore the predefined one.
            writeCache(EXPRESSION_SELECTOR_CACHE_KEY, component.selector);
            const cached = readCache(PREDEFINED_SELECTOR_CACHE_KEY);
            setSelector(
                (cached as PredefinedSelector | undefined) ?? "all",
                true,
            );
        } else {
            if (!currentIsPredefined) return;
            // Stash the predefined selector and restore the expression one.
            writeCache(PREDEFINED_SELECTOR_CACHE_KEY, component.selector);
            const cached = readCache(EXPRESSION_SELECTOR_CACHE_KEY);
            setSelector((cached as Selector | undefined) ?? {}, true);
        }
    };

    const currentExpressions: SelectorExpression[] =
        component && !isPredefinedSelector(component.selector)
            ? Array.isArray(component.selector)
                ? component.selector
                : [component.selector]
            : [];

    // Collapse an expression list back into the minimal selector shape.
    function collapseExpressions(expressions: SelectorExpression[]): Selector {
        if (expressions.length === 0) return {};
        if (expressions.length === 1) return expressions[0];
        return expressions;
    }

    const setSelector = (selector: Selector, sync: boolean) => {
        if (!component) return;
        onUpdateStructureComponentParam(
            component.id,
            "selector",
            selector,
            sync,
        );
    };

    const handleExpressionFieldChange = (
        index: number,
        field: keyof SelectorExpression,
        val: string | number | undefined,
        sync: boolean,
    ) => {
        if (!component) return;
        const nextExpressions = currentExpressions.map((expr, i) =>
            i === index
                ? { ...expr, [field]: val === "" ? undefined : val }
                : expr,
        );
        setSelector(collapseExpressions(nextExpressions), sync);
    };

    const handleAddExpression = () => {
        setSelector(collapseExpressions([...currentExpressions, {}]), true);
    };

    const handleRemoveExpression = (index: number) => {
        setSelector(
            collapseExpressions(
                currentExpressions.filter((_, i) => i !== index),
            ),
            true,
        );
    };

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

    const handleChangeExpressionFieldKey = (
        exprIndex: number,
        oldField: keyof SelectorExpression,
        newField: keyof SelectorExpression,
    ) => {
        if (!component) return;
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
        setSelector(collapseExpressions(nextExpressions), true);
    };

    const handleRemoveExpressionField = (
        exprIndex: number,
        field: keyof SelectorExpression,
    ) => {
        if (!component) return;
        const expr = { ...currentExpressions[exprIndex] };
        delete expr[field];
        const nextExpressions = currentExpressions.map((e, i) =>
            i === exprIndex ? expr : e,
        );
        setSelector(collapseExpressions(nextExpressions), true);
    };

    const handleSaveNewExpressionField = (exprIndex: number) => {
        if (!component) return;
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
        setSelector(collapseExpressions(nextExpressions), true);
        setDraft(exprIndex, { field: null, value: "" });
    };

    // Field key options for a used field: itself plus all unused fields.
    const fieldOptionsFor = (
        fieldKey: keyof SelectorExpression,
        usedFields: (keyof SelectorExpression)[],
    ) =>
        SELECTOR_EXPRESSION_FIELDS.filter(
            (f) => f.key === fieldKey || !usedFields.includes(f.key),
        ).map((f) => ({ value: f.key, label: f.label }));

    // Render the component.
    return (
        <>
            <SegmentedController<ComponentSelectorType>
                orientation="vertical"
                size={"xs"}
                value={
                    typeof component?.selector === "string"
                        ? "PredefinedSelector"
                        : "ExpressionSelector"
                }
                onChange={handleSelectorModeChange}
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

            {component?.selector !== undefined &&
                isPredefinedSelector(component.selector) && (
                    <Select
                        label="Type"
                        data={PREDEFINED_SELECTOR_OPTIONS}
                        value={component.selector}
                        onChange={(val) => {
                            if (val)
                                setSelector(val as PredefinedSelector, true);
                        }}
                        size="xs"
                    />
                )}

            {component?.selector !== undefined &&
                (isSelectorExpressionList(component.selector) ||
                    isSingleSelectorExpression(component.selector)) && (
                    <AssetBuilderCardSectionGroup divider={false}>
                        {currentExpressions.map((expr, index) => {
                            const usedFields = Object.keys(
                                expr,
                            ) as (keyof SelectorExpression)[];
                            const draft = getDraft(index);

                            return (
                                <AssetBuilderCardSectionGroup
                                    key={index}
                                    divider={false}
                                >
                                    <ActionableList>
                                        <ActionableListItem
                                            title={`${index + 1}. expression `}
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
                                                (f) => f.key === fieldKey,
                                            );
                                        if (!fieldDef) return null;

                                        return (
                                            <Group
                                                key={fieldKey}
                                                align="flex-end"
                                                gap="0.33em"
                                                wrap="nowrap"
                                            >
                                                <Select
                                                    label="Field"
                                                    data={fieldOptionsFor(
                                                        fieldKey,
                                                        usedFields,
                                                    )}
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
                                                    style={{ flex: 1 }}
                                                />
                                                {fieldDef.type === "text" ? (
                                                    <TextInput
                                                        label="Value"
                                                        value={
                                                            (expr[
                                                                fieldKey
                                                            ] as string) ?? ""
                                                        }
                                                        size="xs"
                                                        style={{ flex: 1 }}
                                                        onChange={(e) =>
                                                            handleExpressionFieldChange(
                                                                index,
                                                                fieldKey,
                                                                e.currentTarget
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
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" &&
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
                                                            expr[fieldKey] as
                                                                | number
                                                                | undefined
                                                        }
                                                        size="xs"
                                                        style={{ flex: 1 }}
                                                        onChange={(val) =>
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
                                                        onKeyDown={(e) =>
                                                            e.key === "Enter" &&
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

                                    <Group
                                        align="flex-end"
                                        gap="0.33em"
                                        wrap="nowrap"
                                    >
                                        <Select
                                            label="Add field"
                                            placeholder="Choose field"
                                            data={SELECTOR_EXPRESSION_FIELDS.filter(
                                                (f) =>
                                                    !usedFields.includes(f.key),
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
                                                    value: e.currentTarget
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
                                    {index < currentExpressions.length - 1 && (
                                        <Divider />
                                    )}
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
        </>
    );
}
