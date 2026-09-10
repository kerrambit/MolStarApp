/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useState } from "react";
import { Text, Checkbox, Collapse } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { SegmentedController } from "../../../../../components/common/segmented-controller/SegmentedController";
import {
    getPrioritizedRenderStrategy,
    isExtensionSupported,
} from "../../../../../config/assetsDefinitions";
import { VolumeTab } from "./VolumeTab";
import { StructureTab } from "./StructureTab";
import type {
    ComponentEntry,
    StructureViewModel,
    VolumeViewModel,
} from "../../../models/MvsViewModels";
import type { TabType } from "../../../hooks/useViewBuilder";
import { pushInfoNotification } from "../../../../../services/NotificationService";

interface AssetBuilderCardProps {
    viewKey: string;
    asset: ManagedAsset;
    isDark: boolean;
    isExpanded: boolean;
    isSelected: boolean;
    volumeViewModel: VolumeViewModel;
    structureViewModel: StructureViewModel;
    onToggleExpand: () => void;
    onToggleSelect: (checked: boolean, tabType: TabType) => void;
    onUpdateVolumeParam: (
        key: keyof VolumeViewModel,
        val: VolumeViewModel[keyof VolumeViewModel],
        sync: boolean,
    ) => void;
    onUpdateStructureParam: (
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
    onUpdateStructureFields: (
        fields: Partial<StructureViewModel>,
        syncToMolstar: boolean,
    ) => Promise<void>;
    onUpdateStructureComponentFields: (
        componentId: string,
        fields: Partial<ComponentEntry>,
        syncToMolstar: boolean,
    ) => Promise<void>;
}

export function AssetBuilderCard({
    viewKey,
    asset,
    isDark,
    isExpanded,
    isSelected,
    volumeViewModel,
    structureViewModel,
    onToggleExpand,
    onToggleSelect,
    onUpdateVolumeParam,
    onUpdateStructureParam,
    onUpdateStructureComponentParam,
    onUpdateStructureFields,
    onUpdateStructureComponentFields,
}: AssetBuilderCardProps) {
    // Store active tab.
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        const tabFromDefinition = getPrioritizedRenderStrategy(asset.extension); // We can ignore if extension is "unknown" here as we won't even allow user to expand the card.
        return tabFromDefinition;
    });

    // Checks if the given asset checked is supported or not.
    const isSupported = isExtensionSupported(asset.extension);

    // Render the component.
    return (
        <div
            style={{
                border: isDark
                    ? "1px solid var(--mantine-color-dark-4)"
                    : "1px solid var(--mantine-color-gray-3)",
                borderRadius: "6px",
                backgroundColor: isDark
                    ? "var(--mantine-color-dark-7)"
                    : "var(--mantine-color-white)",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.75em 1em",
                    backgroundColor: isDark
                        ? "var(--mantine-color-dark-6)"
                        : "var(--mantine-color-gray-0)",
                    borderBottom:
                        isExpanded && isSupported
                            ? isDark
                                ? "1px solid var(--mantine-color-dark-4)"
                                : "1px solid var(--mantine-color-gray-2)"
                            : "none",
                    cursor: "pointer",
                }}
                onClick={onToggleExpand}
            >
                <div
                    style={{
                        flex: 1,
                        fontWeight: 500,
                        fontSize: "0.9em",
                        wordBreak: "break-all",
                    }}
                >
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                        {asset.tag}
                    </Text>
                    {asset.relativePath}
                </div>
                <Checkbox
                    title={
                        !isSupported
                            ? asset.extension === "unknown"
                                ? `Extension is unknown, go to Assets to check and edit the asset!`
                                : `This extension is not supported!`
                            : ""
                    }
                    checked={isSelected}
                    disabled={!isSupported}
                    onChange={(e) =>
                        onToggleSelect(e.currentTarget.checked, activeTab)
                    }
                    onClick={(e) => e.stopPropagation()}
                    mr="sm"
                />
                {isExpanded ? (
                    <IconChevronUp size={16} />
                ) : (
                    <IconChevronDown size={16} />
                )}
            </div>

            <Collapse expanded={isExpanded && isSupported}>
                <div
                    style={{
                        padding: "1em",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1em",
                    }}
                >
                    <SegmentedController<TabType>
                        value={activeTab}
                        onChange={(tab) => {
                            setActiveTab(tab);
                            if (isSelected) {
                                // TODO: when tab is changed, let's build the view with new tab type if possible
                                pushInfoNotification(
                                    `To rerender the asset as '${tab}', you might have to reselect the asset itself!`,
                                );
                            }
                        }}
                        data={[
                            {
                                label: "Structure",
                                value: "structure",
                            },
                            { label: "Volume", value: "volume" },
                        ]}
                        widthWrapOrientationLimit={200}
                    />

                    {activeTab === "structure" && (
                        <StructureTab
                            viewKey={viewKey}
                            asset={asset}
                            viewModel={structureViewModel}
                            onUpdateParam={onUpdateStructureParam}
                            onUpdateStructureComponentParam={
                                onUpdateStructureComponentParam
                            }
                            onUpdateFields={onUpdateStructureFields}
                            onUpdateStructureComponentFields={
                                onUpdateStructureComponentFields
                            }
                        ></StructureTab>
                    )}

                    {activeTab === "volume" && (
                        <VolumeTab
                            viewKey={viewKey}
                            asset={asset}
                            viewModel={volumeViewModel}
                            onUpdateParam={onUpdateVolumeParam}
                        ></VolumeTab>
                    )}
                </div>
            </Collapse>
        </div>
    );
}
