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
} from "../../../../models/MvsViewModels";
import { SegmentedController } from "../../../../../../components/common/segmented-controller/SegmentedController";
import { AssetBuilderCardSectionGroup } from "../AssetBuilderCardSectionGroup";
import { ColorOverridesSection } from "./ColorOverridesSection";
import {
    normalizeToHex,
    schemaOptions,
    type UpdateComponentFields,
    type UpdateComponentParam,
} from "./structureTabHelpers";
import { useStructureComponentCache } from "../../../../hooks/useStructureComponentCache";

// Cache keys for stashing the color-mode state being switched away from.
const COLOR_CACHE_KEY = "colorplain";
const COLOR_FROM_URI_CACHE_KEY = "colorfromuri";
const COLOR_FROM_SOURCE_CACHE_KEY = "colorfromsource";

type ComponentRepresentationSectionProps = {
    component?: ComponentEntry;
    activeComponentId?: string;
    assetId: string;
    viewKey: string;
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
    assetId,
    viewKey,
    onUpdateStructureComponentParam,
    onUpdateStructureComponentFields,
}: ComponentRepresentationSectionProps) {
    // Stash/restore the color-mode state when switching between the modes.
    const { readCache, writeCache } = useStructureComponentCache(
        assetId,
        viewKey,
        component?.id,
    );

    const handleColorModeChange = (value: ComponenentEntryColorProperty) => {
        if (!component) return;
        const currentMode = getActiveColorProperty(component);
        if (value === currentMode) return;

        // Stash whatever belongs to the mode being left.
        if (currentMode === "Color") {
            writeCache(COLOR_CACHE_KEY, {
                color: component.color,
                colorOverrides: component.colorOverrides,
            });
        } else if (currentMode === "Color from URI") {
            writeCache(COLOR_FROM_URI_CACHE_KEY, component.color_from_uri);
        } else if (currentMode === "Color from source") {
            writeCache(
                COLOR_FROM_SOURCE_CACHE_KEY,
                component.color_from_source,
            );
        }

        // Restore whatever was cached for the mode being entered.
        if (value === "Color") {
            const cached = readCache(COLOR_CACHE_KEY) as
                | {
                      color?: string;
                      colorOverrides?: ComponentEntry["colorOverrides"];
                  }
                | undefined;
            onUpdateStructureComponentFields(
                component.id,
                {
                    color: cached?.color ?? "#ffffff",
                    colorOverrides: cached?.colorOverrides,
                    color_from_uri: undefined,
                    color_from_source: undefined,
                },
                true,
            );
        } else if (value === "Color from URI") {
            const cached = readCache(COLOR_FROM_URI_CACHE_KEY) as
                | ComponentEntry["color_from_uri"]
                | undefined;
            onUpdateStructureComponentFields(
                component.id,
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color: undefined as any,
                    colorOverrides: [],
                    color_from_uri: cached ?? {
                        uri: "",
                        format: "json",
                        schema: "whole_structure",
                    },
                    color_from_source: undefined,
                },
                false,
            );
        } else if (value === "Color from source") {
            const cached = readCache(COLOR_FROM_SOURCE_CACHE_KEY) as
                | ComponentEntry["color_from_source"]
                | undefined;
            onUpdateStructureComponentFields(
                component.id,
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color: undefined as any,
                    colorOverrides: [],
                    color_from_source: cached ?? {
                        category_name: "",
                        field_name: "",
                        schema: "whole_structure",
                    },
                    color_from_uri: undefined,
                },
                false,
            );
        }
    };

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
                    onChange={handleColorModeChange}
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
                            assetId={assetId}
                            viewKey={viewKey}
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
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
