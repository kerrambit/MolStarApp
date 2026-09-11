/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { Text, Select, TextInput } from "@mantine/core";
import {
    getLabelMode,
    getTooltipMode,
    type DataFromSourceParams,
    type DataFromUriParams,
    type StructureViewModel,
} from "../../../models/MvsViewModels";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";
import {
    schemaOptions,
    type UpdateViewModelFields,
    type UpdateViewModelParam,
} from "./structureTabHelpers";

type GlobalTooltipsAndLabelsSectionProps = {
    viewModel: StructureViewModel;
    onUpdateParam: UpdateViewModelParam;
    onUpdateFields: UpdateViewModelFields;
};

/**
 * Global tooltips & labels source pickers (none / URI / source) and the fields configuring the selected source.
 */
export function GlobalTooltipsAndLabelsSection({
    viewModel,
    onUpdateParam,
    onUpdateFields,
}: GlobalTooltipsAndLabelsSectionProps) {
    // Shared source picker (None / From URI / From Source) for tooltips or labels.
    const renderSourcePicker = (
        mode: "none" | "uri" | "source",
        onChange: (value: "none" | "uri" | "source") => void,
    ) => (
        <SegmentedController<"none" | "uri" | "source">
            orientation="vertical"
            size={"xs"}
            value={mode}
            onChange={onChange}
            data={[
                { label: "None", value: "none" },
                { label: "From URI", value: "uri" },
                { label: "From Source", value: "source" },
            ]}
        />
    );

    // Fields shown when the data comes from a URI.
    const renderFromUriFields = (
        paramKey: "tooltip_from_uri" | "label_from_uri",
        data: DataFromUriParams,
    ) => (
        <>
            <TextInput
                label="URI"
                size="xs"
                value={data.uri}
                onChange={(e) =>
                    onUpdateParam(
                        paramKey,
                        { ...data, uri: e.currentTarget.value },
                        false,
                    )
                }
                onBlur={(e) =>
                    onUpdateParam(
                        paramKey,
                        { ...data, uri: e.currentTarget.value },
                        true,
                    )
                }
            />
            <Select
                label="Format"
                size="xs"
                data={["cif", "bcif", "json"]}
                value={data.format}
                onChange={(val) =>
                    val &&
                    onUpdateParam(
                        paramKey,
                        { ...data, format: val as any },
                        true,
                    )
                }
            />
            <Select
                label="Schema"
                size="xs"
                data={schemaOptions}
                value={data.schema}
                onChange={(val) =>
                    val &&
                    onUpdateParam(
                        paramKey,
                        { ...data, schema: val as any },
                        true,
                    )
                }
            />
            <TextInput
                label="Category Name (Optional)"
                size="xs"
                value={data.category_name || ""}
                onChange={(e) =>
                    onUpdateParam(
                        paramKey,
                        { ...data, category_name: e.currentTarget.value },
                        false,
                    )
                }
                onBlur={(e) =>
                    onUpdateParam(
                        paramKey,
                        {
                            ...data,
                            category_name: e.currentTarget.value || undefined,
                        },
                        true,
                    )
                }
            />
            <TextInput
                label="Field Name (Optional)"
                size="xs"
                value={data.field_name || ""}
                onChange={(e) =>
                    onUpdateParam(
                        paramKey,
                        { ...data, field_name: e.currentTarget.value },
                        false,
                    )
                }
                onBlur={(e) =>
                    onUpdateParam(
                        paramKey,
                        {
                            ...data,
                            field_name: e.currentTarget.value || undefined,
                        },
                        true,
                    )
                }
            />
        </>
    );

    // Fields shown when the data comes from a source category/field.
    const renderFromSourceFields = (
        paramKey: "tooltip_from_source" | "label_from_source",
        data: DataFromSourceParams,
    ) => (
        <>
            <Select
                label="Schema"
                size="xs"
                data={schemaOptions}
                value={data.schema}
                onChange={(val) =>
                    val &&
                    onUpdateParam(
                        paramKey,
                        { ...data, schema: val as any },
                        true,
                    )
                }
            />
            <TextInput
                label="Category Name"
                size="xs"
                value={data.category_name}
                onChange={(e) =>
                    onUpdateParam(
                        paramKey,
                        { ...data, category_name: e.currentTarget.value },
                        false,
                    )
                }
                onBlur={(e) =>
                    onUpdateParam(
                        paramKey,
                        { ...data, category_name: e.currentTarget.value },
                        true,
                    )
                }
            />
            <TextInput
                label="Field Name"
                size="xs"
                value={data.field_name}
                onChange={(e) =>
                    onUpdateParam(
                        paramKey,
                        { ...data, field_name: e.currentTarget.value },
                        false,
                    )
                }
                onBlur={(e) =>
                    onUpdateParam(
                        paramKey,
                        { ...data, field_name: e.currentTarget.value },
                        true,
                    )
                }
            />
        </>
    );

    // Render the component.
    return (
        <>
            <AssetBuilderCardSectionGroup
                divider={true}
                bottomMargin="xs"
                topMargin="xs"
            >
                <Text fw={550} size="sm">
                    Structure Tooltips
                </Text>
                {renderSourcePicker(getTooltipMode(viewModel), (value) => {
                    if (value === "none") {
                        onUpdateFields(
                            {
                                tooltip_from_uri: undefined,
                                tooltip_from_source: undefined,
                            },
                            false,
                        );
                    } else if (value === "uri") {
                        onUpdateFields(
                            {
                                tooltip_from_source: undefined,
                                tooltip_from_uri: {
                                    uri: "",
                                    format: "json",
                                    schema: "whole_structure",
                                },
                            },
                            false,
                        );
                    } else if (value === "source") {
                        onUpdateFields(
                            {
                                tooltip_from_uri: undefined,
                                tooltip_from_source: {
                                    category_name: "",
                                    field_name: "",
                                    schema: "whole_structure",
                                },
                            },
                            false,
                        );
                    }
                })}

                {getTooltipMode(viewModel) === "uri" &&
                    viewModel.tooltip_from_uri &&
                    renderFromUriFields(
                        "tooltip_from_uri",
                        viewModel.tooltip_from_uri,
                    )}

                {getTooltipMode(viewModel) === "source" &&
                    viewModel.tooltip_from_source &&
                    renderFromSourceFields(
                        "tooltip_from_source",
                        viewModel.tooltip_from_source,
                    )}
            </AssetBuilderCardSectionGroup>

            <AssetBuilderCardSectionGroup
                divider={true}
                bottomMargin="sm"
                topMargin="sm"
            >
                <Text fw={550} size="sm">
                    Structure Labels
                </Text>
                {renderSourcePicker(getLabelMode(viewModel), (value) => {
                    if (value === "none") {
                        onUpdateFields(
                            {
                                label_from_uri: undefined,
                                label_from_source: undefined,
                            },
                            false,
                        );
                    } else if (value === "uri") {
                        onUpdateFields(
                            {
                                label_from_source: undefined,
                                label_from_uri: {
                                    uri: "",
                                    format: "json",
                                    schema: "whole_structure",
                                },
                            },
                            false,
                        );
                    } else if (value === "source") {
                        onUpdateFields(
                            {
                                label_from_uri: undefined,
                                label_from_source: {
                                    category_name: "",
                                    field_name: "",
                                    schema: "whole_structure",
                                },
                            },
                            false,
                        );
                    }
                })}

                {getLabelMode(viewModel) === "uri" &&
                    viewModel.label_from_uri &&
                    renderFromUriFields(
                        "label_from_uri",
                        viewModel.label_from_uri,
                    )}

                {getLabelMode(viewModel) === "source" &&
                    viewModel.label_from_source &&
                    renderFromSourceFields(
                        "label_from_source",
                        viewModel.label_from_source,
                    )}
            </AssetBuilderCardSectionGroup>
        </>
    );
}
