/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { Text, Divider, MultiSelect, Collapse } from "@mantine/core";
import { CloseActionIcon } from "../../../../../components/common/actionables/actions-icons/CloseActionIcon";
import { useViewBuilder } from "../../../hooks/useViewBuilder";
import { AssetBuilderCard } from "./AssetBuilderCard";
import { AutoScrollList } from "../../../../../components/common/auto-scroll-list/AutoScrollList";
import { UiLocalStorageService } from "../../../../../services/UiLocalStorageService";
import { getFilePathWithoutFile } from "../../../../../utils/fileDataUtils";
import { CollapseTrigger } from "../../../../../components/common/collapse-trigger/CollapseTriger";
import { useAppearance } from "../../../../../hooks/useAppearance";
import { getAllExtensions } from "../../../../../config/assetsDefinitions";

interface ViewBuilderProps {
    viewKey: string;
    onClose?: () => void;
}

export function ViewBuilder(props: ViewBuilderProps) {
    // Use apperance.
    const { colorScheme } = useAppearance();
    const isDark = colorScheme === "dark";

    // Use view builder.
    const {
        view,
        assetsInView,
        assetsFilteredByType,
        areFiltersExpanded,
        setAreFiltersExpanded,
        selectedAssetFilters,
        setSelectedAssetFilters,
        selectedAssetRelativePaths,
        setSelectedAssetRelativePaths,
        selectedAssetIds,
        expandedAssetId,
        getVolumeViewModelForAsset,
        getStructureViewModelForAsset,
        toggleExpandAsset,
        updateVolumeViewModelForAsset,
        updateStructureViewModelForAsset,
        updateStructureComponentViewModel,
        handleAssetToggle,
    } = useViewBuilder(props.viewKey);

    // Render nothing if no view was found with given key.
    if (!view) return <></>;

    // Computes index of first selected asset in the list, otherwise -1.
    const firstSelectedAssetIndex =
        expandedAssetId === null
            ? assetsInView.findIndex((asset) =>
                  selectedAssetIds.includes(asset.id),
              )
            : assetsInView.findIndex((asset) => asset.id === expandedAssetId);

    // Render the component.
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "0.5em",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "1em",
                }}
            >
                <div>
                    <Text size="xl" fw={520}>
                        View Builder
                    </Text>
                    <Text size="sm" c="dimmed">
                        Editing: {view.metadata.title || "untitled"}
                    </Text>
                </div>
                <CloseActionIcon
                    onClick={() => {
                        if (props.onClose) {
                            props.onClose();
                        }
                    }}
                    tooltip="Close View Builder sidebar."
                />
            </div>

            <Divider style={{ paddingBottom: "1em" }} />

            <CollapseTrigger
                title={"Filters"}
                size="lg"
                expanded={areFiltersExpanded}
                onClick={() => {
                    setAreFiltersExpanded((prev) => {
                        const nextState = !prev;
                        UiLocalStorageService.ViewBuilder.setExpandedFiltersSection(
                            props.viewKey,
                            nextState,
                        );
                        return nextState;
                    });
                }}
            ></CollapseTrigger>

            <Collapse expanded={areFiltersExpanded}>
                <MultiSelect
                    label="Select asset type filters"
                    data={[
                        "All",
                        "Local assets",
                        "Remote assets",
                        ...getAllExtensions(),
                    ]}
                    value={selectedAssetFilters}
                    onChange={(filters) => {
                        setSelectedAssetFilters(filters);
                        UiLocalStorageService.ViewBuilder.setAssetFilters(
                            props.viewKey,
                            filters,
                        );
                    }}
                    placeholder="Select asset types filters."
                    defaultValue={["All"]}
                    checkIconPosition="left"
                    withAlignedLabels
                    clearable
                    hidePickedOptions
                    searchable
                    nothingFoundMessage="No asset found!"
                    style={{ paddingBottom: "1em" }}
                    styles={{
                        pill: {
                            background:
                                colorScheme === "dark"
                                    ? "var(--mantine-primary-color-7)"
                                    : "var(--mantine-primary-color-3)",
                        },
                    }}
                ></MultiSelect>

                <MultiSelect
                    label="Select asset folders"
                    data={[
                        "All",
                        ...Array.from(
                            new Set(
                                assetsFilteredByType.map((asset) => {
                                    const path = getFilePathWithoutFile(
                                        asset.relativePath,
                                    );
                                    if (!path) {
                                        return "./";
                                    } else {
                                        return path;
                                    }
                                }),
                            ),
                        ),
                    ]}
                    value={selectedAssetRelativePaths}
                    onChange={(paths) => {
                        setSelectedAssetRelativePaths(paths);
                        UiLocalStorageService.ViewBuilder.setAssetFolders(
                            props.viewKey,
                            paths,
                        );
                    }}
                    placeholder="Select asset folders."
                    defaultValue={["All"]}
                    checkIconPosition="left"
                    withAlignedLabels
                    clearable
                    hidePickedOptions
                    searchable
                    nothingFoundMessage="No paths found!"
                    style={{ paddingBottom: "1em" }}
                    styles={{
                        pill: {
                            background:
                                colorScheme === "dark"
                                    ? "var(--mantine-primary-color-7)"
                                    : "var(--mantine-primary-color-3)",
                        },
                    }}
                ></MultiSelect>

                <Divider style={{ paddingBottom: "1em" }} />
            </Collapse>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5em",
                }}
            >
                <AutoScrollList
                    list={assetsInView}
                    activeIndex={
                        firstSelectedAssetIndex === -1
                            ? 0
                            : firstSelectedAssetIndex
                    }
                    renderItem={(asset) => {
                        return (
                            <AssetBuilderCard
                                viewKey={props.viewKey}
                                key={asset.id}
                                asset={asset}
                                isDark={isDark}
                                isExpanded={expandedAssetId === asset.id}
                                isSelected={selectedAssetIds.includes(asset.id)}
                                volumeViewModel={getVolumeViewModelForAsset(
                                    asset.id,
                                )}
                                structureViewModel={getStructureViewModelForAsset(
                                    asset.id,
                                )}
                                onToggleExpand={() =>
                                    toggleExpandAsset(asset.id)
                                }
                                onToggleSelect={(checked, tabType) =>
                                    handleAssetToggle(
                                        asset.id,
                                        checked,
                                        tabType,
                                    )
                                }
                                onUpdateVolumeParam={(key, val, sync) =>
                                    updateVolumeViewModelForAsset(
                                        asset.id,
                                        key,
                                        val,
                                        sync,
                                    )
                                }
                                onUpdateStructureParam={(key, val, sync) =>
                                    updateStructureViewModelForAsset(
                                        asset.id,
                                        key,
                                        val,
                                        sync,
                                    )
                                }
                                onUpdateStructureComponentParam={(
                                    component,
                                    key,
                                    val,
                                    sync,
                                ) =>
                                    updateStructureComponentViewModel(
                                        asset.id,
                                        component,
                                        key,
                                        val,
                                        sync,
                                    )
                                }
                            />
                        );
                    }}
                ></AutoScrollList>
            </div>
        </div>
    );
}
