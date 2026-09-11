/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import {
    Text,
    AlphaSlider,
    ColorInput,
    Select,
    TextInput,
    Divider,
} from "@mantine/core";
import {
    getActiveColorProperty,
    type ComponenentEntryColorProperty,
    type ComponentEntry,
} from "../../../models/MvsViewModels";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";
import { ColorOverridesSection } from "./ColorOverridesSection";
import {
    normalizeToHex,
    schemaOptions,
    type UpdateComponentFields,
    type UpdateComponentParam,
} from "./structureTabHelpers";

type ComponentRepresentationSectionProps = {
    component?: ComponentEntry;
    activeComponentId?: string;
    onUpdateStructureComponentParam: UpdateComponentParam;
    onUpdateStructureComponentFields: UpdateComponentFields;
};

/**
 * Component representation subsection: representation type, color mode
 * (plain color with overrides, URI or source) and opacity.
 */
export function ComponentRepresentationSection({
    component,
    activeComponentId,
    onUpdateStructureComponentParam,
    onUpdateStructureComponentFields,
}: ComponentRepresentationSectionProps) {
    // Render the component.
    return (
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
                value={component?.representationType || "cartoon"}
                onChange={(val) => {
                    if (val && activeComponentId)
                        onUpdateStructureComponentParam(
                            activeComponentId,
                            "representationType",
                            val,
                            true,
                        );
                }}
                size="xs"
            />

            <Divider />

            <>
                <Text fw={550} size="xs">
                    Colors
                </Text>
                <SegmentedController<ComponenentEntryColorProperty>
                    orientation="vertical"
                    size={"xs"}
                    value={getActiveColorProperty(component)}
                    onChange={(value) => {
                        if (!component) return;
                        if (value === "Color") {
                            onUpdateStructureComponentFields(
                                component.id,
                                {
                                    color: component.color || "#ffffff",
                                    color_from_uri: undefined,
                                    color_from_source: undefined,
                                },
                                true,
                            );
                        } else if (value === "Color from URI") {
                            onUpdateStructureComponentFields(
                                component.id,
                                {
                                    color: undefined as any,
                                    colorOverrides: [],
                                    color_from_uri: {
                                        uri: "",
                                        format: "json",
                                        schema: "whole_structure",
                                    },
                                    color_from_source: undefined,
                                },
                                false,
                            );
                        } else if (value === "Color from source") {
                            onUpdateStructureComponentFields(
                                component.id,
                                {
                                    color: undefined as any,
                                    colorOverrides: [],
                                    color_from_source: {
                                        category_name: "",
                                        field_name: "",
                                        schema: "whole_structure",
                                    },
                                    color_from_uri: undefined,
                                },
                                false,
                            );
                        }
                    }}
                    data={[
                        { label: "Color", value: "Color" },
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
            </>

            {getActiveColorProperty(component) === "Color" && (
                <>
                    <ColorInput
                        label={
                            (component?.colorOverrides?.length ?? 0) > 0
                                ? "Base Color"
                                : "Color"
                        }
                        value={normalizeToHex(component?.color || "#ffffff")}
                        size="xs"
                        format="hex"
                        onChange={(val) => {
                            if (val && activeComponentId)
                                onUpdateStructureComponentParam(
                                    activeComponentId,
                                    "color",
                                    val,
                                    false,
                                );
                        }}
                        onChangeEnd={(val) => {
                            if (val && activeComponentId)
                                onUpdateStructureComponentParam(
                                    activeComponentId,
                                    "color",
                                    val,
                                    true,
                                );
                        }}
                    />

                    {component && (
                        <ColorOverridesSection
                            component={component}
                            onUpdateStructureComponentParam={
                                onUpdateStructureComponentParam
                            }
                        />
                    )}
                </>
            )}

            {getActiveColorProperty(component) === "Color from URI" &&
                component?.color_from_uri && (
                    <>
                        <TextInput
                            label="URI"
                            size="xs"
                            value={component.color_from_uri.uri}
                            onChange={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_uri",
                                    {
                                        ...component.color_from_uri!,
                                        uri: e.currentTarget.value,
                                    },
                                    false,
                                )
                            }
                            onBlur={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_uri",
                                    {
                                        ...component.color_from_uri!,
                                        uri: e.currentTarget.value,
                                    },
                                    true,
                                )
                            }
                        />
                        <Select
                            label="Format"
                            size="xs"
                            data={["cif", "bcif", "json"]}
                            value={component.color_from_uri.format}
                            onChange={(val) =>
                                val &&
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_uri",
                                    {
                                        ...component.color_from_uri!,
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
                            value={component.color_from_uri.schema}
                            onChange={(val) =>
                                val &&
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_uri",
                                    {
                                        ...component.color_from_uri!,
                                        schema: val as any,
                                    },
                                    true,
                                )
                            }
                        />
                        <TextInput
                            label="Category Name (Optional)"
                            size="xs"
                            value={component.color_from_uri.category_name || ""}
                            onChange={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_uri",
                                    {
                                        ...component.color_from_uri!,
                                        category_name: e.currentTarget.value,
                                    },
                                    false,
                                )
                            }
                            onBlur={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_uri",
                                    {
                                        ...component.color_from_uri!,
                                        category_name:
                                            e.currentTarget.value || undefined,
                                    },
                                    true,
                                )
                            }
                        />
                        <TextInput
                            label="Field Name (Optional)"
                            size="xs"
                            value={component.color_from_uri.field_name || ""}
                            onChange={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_uri",
                                    {
                                        ...component.color_from_uri!,
                                        field_name: e.currentTarget.value,
                                    },
                                    false,
                                )
                            }
                            onBlur={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_uri",
                                    {
                                        ...component.color_from_uri!,
                                        field_name:
                                            e.currentTarget.value || undefined,
                                    },
                                    true,
                                )
                            }
                        />
                    </>
                )}

            {getActiveColorProperty(component) === "Color from source" &&
                component?.color_from_source && (
                    <>
                        <Select
                            label="Schema"
                            size="xs"
                            data={schemaOptions}
                            value={component.color_from_source.schema}
                            onChange={(val) =>
                                val &&
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_source",
                                    {
                                        ...component.color_from_source!,
                                        schema: val as any,
                                    },
                                    true,
                                )
                            }
                        />
                        <TextInput
                            label="Category Name"
                            size="xs"
                            value={component.color_from_source.category_name}
                            onChange={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_source",
                                    {
                                        ...component.color_from_source!,
                                        category_name: e.currentTarget.value,
                                    },
                                    false,
                                )
                            }
                            onBlur={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_source",
                                    {
                                        ...component.color_from_source!,
                                        category_name: e.currentTarget.value,
                                    },
                                    true,
                                )
                            }
                        />
                        <TextInput
                            label="Field Name"
                            size="xs"
                            value={component.color_from_source.field_name}
                            onChange={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_source",
                                    {
                                        ...component.color_from_source!,
                                        field_name: e.currentTarget.value,
                                    },
                                    false,
                                )
                            }
                            onBlur={(e) =>
                                onUpdateStructureComponentParam(
                                    component.id,
                                    "color_from_source",
                                    {
                                        ...component.color_from_source!,
                                        field_name: e.currentTarget.value,
                                    },
                                    true,
                                )
                            }
                        />
                    </>
                )}
            <AlphaSlider
                color={normalizeToHex(component?.color || "#ffffff")}
                value={component?.opacity ?? 1.0}
                onChange={(val) => {
                    if (val !== undefined && activeComponentId)
                        onUpdateStructureComponentParam(
                            activeComponentId,
                            "opacity",
                            val,
                            false,
                        );
                }}
                onChangeEnd={(val) => {
                    if (val !== undefined && activeComponentId)
                        onUpdateStructureComponentParam(
                            activeComponentId,
                            "opacity",
                            val,
                            true,
                        );
                }}
            />
        </AssetBuilderCardSectionGroup>
    );
}
