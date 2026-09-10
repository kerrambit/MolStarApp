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
    Checkbox,
    Collapse,
    ColorInput,
    Group,
    NumberInput,
    Select,
} from "@mantine/core";
import { getAllParserTypes } from "../../../../../config/assetsDefinitions";
import { pushWarningNotification } from "../../../../../services/NotificationService";
import type { VolumeViewModel } from "../../../models/MvsViewModels";
import { VolumeTransformControls } from "./VolumeTransformControls";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";

type VolumeTabProps = {
    viewKey: string;
    asset: ManagedAsset;
    viewModel: VolumeViewModel;
    onUpdateParam: (
        key: keyof VolumeViewModel,
        val: VolumeViewModel[keyof VolumeViewModel],
        sync: boolean,
    ) => void;
};

export function VolumeTab({
    viewKey,
    asset,
    viewModel,
    onUpdateParam,
}: VolumeTabProps) {
    // Store expanded sections.
    const [generalSectionExpanded, setGeneralSectionExpanded] = useState(
        UiLocalStorageService.ViewBuilder.getExpandedVolumeGeneralSection(
            asset.id,
            viewKey,
        ),
    );
    const [representationSectionExpanded, setRepresentationSectionExpanded] =
        useState(
            UiLocalStorageService.ViewBuilder.getExpandedVolumeRepresentationSection(
                asset.id,
                viewKey,
            ),
        );
    const [transformSectionExpanded, setTransformSectionExpanded] = useState(
        UiLocalStorageService.ViewBuilder.getExpandedVolumeTransformSection(
            asset.id,
            viewKey,
        ),
    );

    // Render the component.
    return (
        <div>
            {/* General settings for volume tab. */}
            <CollapseTrigger
                title={"General"}
                size={"md"}
                expanded={generalSectionExpanded}
                onClick={() => {
                    setGeneralSectionExpanded((prev) => {
                        const nextState = !prev;
                        UiLocalStorageService.ViewBuilder.setExpandedVolumeGeneralSection(
                            asset.id,
                            viewKey,
                            nextState,
                        );
                        return nextState;
                    });
                }}
            ></CollapseTrigger>

            <Collapse expanded={generalSectionExpanded}>
                <AssetBuilderCardSectionGroup divider={true}>
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
                        data={["isosurface", "grid_slice"]}
                        value={viewModel.type}
                        onChange={(val) => {
                            if (val === "grid_slice") {
                                pushWarningNotification(
                                    "The volume type of 'grid_slice' is not supported at the moment!",
                                );
                            } else if (val) {
                                onUpdateParam("type", val, true);
                            }
                        }}
                        size="xs"
                    />
                    <NumberInput
                        label="Relative isosurface"
                        value={viewModel.relative_isovalue}
                        step={0.1}
                        size="xs"
                        onChange={(val) =>
                            typeof val === "number" &&
                            onUpdateParam("relative_isovalue", val, false)
                        }
                        onBlur={() =>
                            onUpdateParam(
                                "relative_isovalue",
                                viewModel.relative_isovalue,
                                true,
                            )
                        }
                        onKeyDown={(e) =>
                            e.key === "Enter" &&
                            onUpdateParam(
                                "relative_isovalue",
                                viewModel.relative_isovalue,
                                true,
                            )
                        }
                    />
                </AssetBuilderCardSectionGroup>
            </Collapse>

            {/* Representation settings for volume tab. */}
            <CollapseTrigger
                title={"Representation"}
                size={"md"}
                expanded={representationSectionExpanded}
                onClick={() => {
                    setRepresentationSectionExpanded((prev) => {
                        const nextState = !prev;
                        UiLocalStorageService.ViewBuilder.setExpandedVolumeRepresentationSection(
                            asset.id,
                            viewKey,
                            nextState,
                        );
                        return nextState;
                    });
                }}
            ></CollapseTrigger>

            <Collapse expanded={representationSectionExpanded}>
                <AssetBuilderCardSectionGroup divider={true}>
                    <Group mt="xs">
                        <Checkbox
                            label="Show wireframe"
                            size="xs"
                            checked={viewModel.show_wireframe}
                            onChange={(e) =>
                                onUpdateParam(
                                    "show_wireframe",
                                    e.currentTarget.checked,
                                    true,
                                )
                            }
                        />
                        <Checkbox
                            label="Show faces"
                            size="xs"
                            checked={viewModel.show_faces}
                            onChange={(e) =>
                                onUpdateParam(
                                    "show_faces",
                                    e.currentTarget.checked,
                                    true,
                                )
                            }
                        />
                    </Group>
                    <ColorInput
                        label="Color"
                        value={viewModel.color}
                        size="xs"
                        format="hex"
                        onChange={(val) => onUpdateParam("color", val, false)}
                        onChangeEnd={(val) => onUpdateParam("color", val, true)}
                    />
                    <AlphaSlider
                        color={viewModel.color}
                        value={viewModel.opacity}
                        onChange={(val) => onUpdateParam("opacity", val, false)}
                        onChangeEnd={(val) =>
                            onUpdateParam("opacity", val, true)
                        }
                    ></AlphaSlider>
                </AssetBuilderCardSectionGroup>
            </Collapse>

            {/* Transform settings for volume tab. */}
            <CollapseTrigger
                title={"Transform"}
                size={"md"}
                expanded={transformSectionExpanded}
                onClick={() => {
                    setTransformSectionExpanded((prev) => {
                        const nextState = !prev;
                        UiLocalStorageService.ViewBuilder.setExpandedVolumeTransformSection(
                            asset.id,
                            viewKey,
                            nextState,
                        );
                        return nextState;
                    });
                }}
            ></CollapseTrigger>

            <Collapse expanded={transformSectionExpanded}>
                <VolumeTransformControls
                    viewModel={viewModel}
                    onUpdateParam={onUpdateParam}
                ></VolumeTransformControls>
            </Collapse>
        </div>
    );
}
