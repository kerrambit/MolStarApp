/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useCallback, useMemo, useState } from "react";
import { UiLocalStorageService } from "../../../services/UiLocalStorageService";
import { pushErrorNotification } from "../../../services/NotificationService";
import { loggerUi } from "../../../services/UiLoggingService";
import { getFilePathWithoutFile } from "../../../utils/fileDataUtils";
import {
    getAllSupportedAssetsParsers,
    getParser,
} from "../../../config/assetsDefinitions";
import {
    addStructureNodeToTree,
    addVolumeNodeToTree,
    getAllDownloadUrlsFromSnapshot,
    getStructureNode,
    getStructureViewModel,
    getVolumeNode,
    getVolumeViewModel,
    reloadMolstarAndRestoreIndex,
    removeNodeFromTree,
    replaceAssetNodeInRoot,
} from "../../../lib/molstar";
import { type MVSData_States } from "molstar/lib/extensions/mvs/mvs-data";
import { useRegimeStore } from "../../../stores/regimeStore";
import { useManagedAssetsStore } from "../../../stores/managedAssetsStore";
import {
    DEFAULT_STRUCTURE_VIEW_MODEL,
    DEFAULT_VOLUME_VIEW_MODEL,
    type ComponentEntry,
    type StructureViewModel,
    type VolumeViewModel,
} from "../models/MvsViewModels";

export type TabType = "structure" | "volume";

export function useViewBuilder(viewKey: string) {
    // Use regime.
    const regime = useRegimeStore((state) => state.regime);

    // Use managed assets.
    const assets = useManagedAssetsStore((state) => state.assets);
    const getAsset = useManagedAssetsStore((state) => state.getAsset);
    const incrementAssetUseCount = useManagedAssetsStore(
        (state) => state.incrementAssetUseCount,
    );
    const decrementAssetUseCount = useManagedAssetsStore(
        (state) => state.decrementAssetUseCount,
    );

    // Memoized view.
    const view = useMemo(() => {
        return regime.kind === "viewing"
            ? regime.history
                  .current()
                  .stateTree.snapshots.find(
                      (snap) => snap.metadata.key === viewKey,
                  )
            : null;
    }, [regime, viewKey]);

    // State to keep track which asset in the list is expanded.
    const [expandedAssetId, setExpandedAssetId] = useState<string | null>(() =>
        UiLocalStorageService.ViewBuilder.getExpandedAssetId(viewKey),
    );

    // State for all selected assets IDs in UI.
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(() =>
        view ? getAllDownloadUrlsFromSnapshot(view) : [],
    );

    // Current record of volumeview models for each asset.
    const [volumeViewModels, setVolumeViewModels] = useState<
        Record<AssetId, VolumeViewModel>
    >({});

    // Current record of structure view models for each asset.
    const [structureViewModels, setStructureViewModels] = useState<
        Record<AssetId, StructureViewModel>
    >({});

    // Refresh UI if view changes (as result of undo/redo actions).
    const [prevView, setPrevView] = useState(view);
    if (view !== prevView) {
        setPrevView(view);
        setSelectedAssetIds(view ? getAllDownloadUrlsFromSnapshot(view) : []);
        setVolumeViewModels({});
        setStructureViewModels({});
    }

    // Current selected asset filters.
    const [selectedAssetFilters, setSelectedAssetFilters] = useState<string[]>(
        UiLocalStorageService.ViewBuilder.getAssetFilters(viewKey) ?? ["All"],
    );

    // Current selected asset relative paths.
    const [selectedAssetRelativePaths, setSelectedAssetRelativePaths] =
        useState<string[]>(
            UiLocalStorageService.ViewBuilder.getAssetFolders(viewKey) ?? [
                "All",
            ],
        );

    const [areFiltersExpanded, setAreFiltersExpanded] = useState(
        UiLocalStorageService.ViewBuilder.getExpandedFiltersSection(viewKey),
    );

    // Memoized assets filtered only by tag (local/remote) and extension (.cif/.map/...).
    const assetsFilteredByType = useMemo(() => {
        const allAssets = Array.from(assets.values());

        if (selectedAssetFilters.length === 0) return [];
        if (selectedAssetFilters.includes("All")) return allAssets;

        const hasLocationFilters = selectedAssetFilters.some(
            (f) => f === "Local assets" || f === "Remote assets",
        );
        const hasExtensionFilters = selectedAssetFilters.some((f) =>
            f.startsWith("."),
        );

        return allAssets.filter((asset) => {
            let matchesLocation = !hasLocationFilters;
            if (hasLocationFilters) {
                if (
                    selectedAssetFilters.includes("Local assets") &&
                    asset.tag === "local"
                )
                    matchesLocation = true;
                if (
                    selectedAssetFilters.includes("Remote assets") &&
                    asset.tag === "remote"
                )
                    matchesLocation = true;
            }

            let matchesExtension = !hasExtensionFilters;
            if (hasExtensionFilters) {
                matchesExtension = selectedAssetFilters.some(
                    (ext) =>
                        asset.extension.toLowerCase() ===
                        ext.slice(1).toLowerCase(),
                );
            }

            return matchesLocation && matchesExtension;
        });
    }, [assets, selectedAssetFilters]);

    // Memoized assets further narrowed down by relative paths.
    const assetsInView = useMemo(() => {
        if (selectedAssetRelativePaths.includes("All")) {
            return assetsFilteredByType;
        }

        return assetsFilteredByType.filter((asset) => {
            const path = getFilePathWithoutFile(asset.relativePath);
            const normalizedAssetPath = !path ? "./" : path;
            return selectedAssetRelativePaths.includes(normalizedAssetPath);
        });
    }, [assetsFilteredByType, selectedAssetRelativePaths]);

    // Function which returns safe volume view model based on asset ID.
    const getVolumeViewModelForAsset = useCallback(
        (assetId: AssetId): VolumeViewModel => {
            if (volumeViewModels[assetId]) {
                return volumeViewModels[assetId];
            }

            const fallback: VolumeViewModel = {
                ...DEFAULT_VOLUME_VIEW_MODEL,
                format:
                    getParser(getAsset(assetId)?.extension || "unknown") ||
                    "N/A",
            };

            if (!view) {
                return fallback;
            }

            return getVolumeViewModel(view.root, assetId, fallback);
        },
        [volumeViewModels, getAsset, view],
    );

    // Function which returns safe structure view model based on asset ID.
    const getStructureViewModelForAsset = useCallback(
        (assetId: AssetId): StructureViewModel => {
            if (structureViewModels[assetId]) {
                return structureViewModels[assetId];
            }

            const fallback: StructureViewModel = {
                ...DEFAULT_STRUCTURE_VIEW_MODEL,
                format:
                    getParser(getAsset(assetId)?.extension || "unknown") ||
                    "N/A",
            };

            if (!view) {
                return fallback;
            }

            return getStructureViewModel(view.root, assetId, fallback);
        },
        [structureViewModels, getAsset, view],
    );

    // Handler for expanding the asset card.
    const toggleExpandAsset = (assetId: AssetId) => {
        const nextId = expandedAssetId === assetId ? null : assetId;
        setExpandedAssetId(nextId);
        UiLocalStorageService.ViewBuilder.setExpandedAssetId(viewKey, nextId);
    };

    // Function which updates volume view model and optionally sync it to Molstar.
    const updateVolumeViewModelForAsset = async (
        assetId: AssetId,
        paramKey: keyof VolumeViewModel,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        val: any,
        syncToMolstar: boolean,
    ) => {
        // Get updated view model .
        const updatedVm = {
            ...getVolumeViewModelForAsset(assetId),
            [paramKey]: val,
        };

        // Update UI instantly.
        setVolumeViewModels((prev) => ({ ...prev, [assetId]: updatedVm }));

        // Sync to Molstar only if requested and the asset is checked.
        if (
            syncToMolstar &&
            selectedAssetIds.includes(assetId) &&
            regime.kind === "viewing"
        ) {
            const updatedTree: MVSData_States = {
                ...regime.history.current().stateTree,
                snapshots: regime.history
                    .current()
                    .stateTree.snapshots.map((snap) => {
                        if (snap.metadata.key === viewKey) {
                            const extension =
                                getAsset(assetId)?.extension || "unknown";
                            const format =
                                getAllSupportedAssetsParsers()[extension] ??
                                "bcif";
                            const newNode = getVolumeNode(assetId, {
                                ...updatedVm,
                                format,
                            });

                            return {
                                ...snap,
                                root: replaceAssetNodeInRoot(
                                    snap.root,
                                    assetId,
                                    newNode,
                                ),
                            };
                        }
                        return snap;
                    }),
            };

            // Update regime.
            regime.commitStateTree(
                updatedTree,
                `Updated "${paramKey}" for view "${view?.metadata.title}" (${viewKey}).`,
            );

            // Try to reload Molstar viewer.
            const result = await reloadMolstarAndRestoreIndex(
                { key: viewKey },
                Array.from(assets.values()),
                updatedTree,
            );
            if (result instanceof Error) {
                pushErrorNotification(
                    `Failed to apply changes! For more information, check the logs.`,
                );
                loggerUi.error(result.message);

                regime.undo();
            }
        }
    };

    // Function which updates structure view model and optionally sync it to Molstar.
    const updateStructureViewModelForAsset = async (
        assetId: AssetId,
        paramKey: keyof StructureViewModel,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        val: any,
        syncToMolstar: boolean,
    ) => {
        const updatedVm = {
            ...getStructureViewModelForAsset(assetId),
            [paramKey]: val,
        };

        // Update UI instantly.
        setStructureViewModels((prev) => ({ ...prev, [assetId]: updatedVm }));

        // Sync to Molstar only if requested and the asset is checked.
        if (
            syncToMolstar &&
            selectedAssetIds.includes(assetId) &&
            regime.kind === "viewing"
        ) {
            const updatedTree: MVSData_States = {
                ...regime.history.current().stateTree,
                snapshots: regime.history
                    .current()
                    .stateTree.snapshots.map((snap) => {
                        if (snap.metadata.key === viewKey) {
                            const extension =
                                getAsset(assetId)?.extension || "unknown";
                            const format =
                                getAllSupportedAssetsParsers()[extension] ??
                                "bcif";
                            const newNode = getStructureNode(assetId, {
                                ...updatedVm,
                                format,
                            });

                            return {
                                ...snap,
                                root: replaceAssetNodeInRoot(
                                    snap.root,
                                    assetId,
                                    newNode,
                                ),
                            };
                        }
                        return snap;
                    }),
            };

            // Update regime.
            regime.commitStateTree(
                updatedTree,
                `Updated "${paramKey}" for view "${view?.metadata.title}" (${viewKey}).`,
            );

            // Try to reload Molstar viewer.
            const result = await reloadMolstarAndRestoreIndex(
                { key: viewKey },
                Array.from(assets.values()),
                updatedTree,
            );
            if (result instanceof Error) {
                pushErrorNotification(
                    `Failed to apply changes! For more information, check the logs.`,
                );
                loggerUi.error(result.message);

                regime.undo();
            }
        }
    };

    const updateStructureComponentViewModel = async (
        assetId: AssetId,
        componentId: string,
        paramKey: keyof ComponentEntry,
        val: ComponentEntry[keyof ComponentEntry],
        syncToMolstar: boolean,
    ) => {
        // Current view model.
        const currentVm = getStructureViewModelForAsset(assetId);

        //  Map over components to apply the change to the specific component ID.
        const updatedComponents = currentVm.components.map((comp) =>
            comp.id === componentId ? { ...comp, [paramKey]: val } : comp,
        );

        const updatedVm: StructureViewModel = {
            ...currentVm,
            components: updatedComponents,
        };

        // Update UI.
        setStructureViewModels((prev) => ({ ...prev, [assetId]: updatedVm }));

        // Sync to Molstar if requested and viewing conditions are met
        if (
            syncToMolstar &&
            selectedAssetIds.includes(assetId) &&
            regime.kind === "viewing"
        ) {
            const updatedTree: MVSData_States = {
                ...regime.history.current().stateTree,
                snapshots: regime.history
                    .current()
                    .stateTree.snapshots.map((snap) => {
                        if (snap.metadata.key === viewKey) {
                            const extension =
                                getAsset(assetId)?.extension || "unknown";
                            const format =
                                getAllSupportedAssetsParsers()[extension] ??
                                "bcif";
                            const newNode = getStructureNode(assetId, {
                                ...updatedVm,
                                format,
                            });

                            return {
                                ...snap,
                                root: replaceAssetNodeInRoot(
                                    snap.root,
                                    assetId,
                                    newNode,
                                ),
                            };
                        }
                        return snap;
                    }),
            };

            // Update regime history
            regime.commitStateTree(
                updatedTree,
                `Updated component "${componentId}" param "${paramKey}" for view "${view?.metadata.title}" (${viewKey}).`,
            );

            // Try to reload Molstar viewer
            const result = await reloadMolstarAndRestoreIndex(
                { key: viewKey },
                Array.from(assets.values()),
                updatedTree,
            );

            if (result instanceof Error) {
                pushErrorNotification(
                    `Failed to apply component changes! For more information, check the logs.`,
                );
                loggerUi.error(result.message);
                regime.undo();
            }
        }
    };

    // Handler when asset is toggled.
    const handleAssetToggle = async (
        toggledAssetId: string,
        isChecked: boolean,
        tabType: TabType,
    ) => {
        // If it is checked, it means we need to add it, otherwise remove it.
        let newSelectedIds: string[];
        if (isChecked) {
            newSelectedIds = [...selectedAssetIds, toggledAssetId];
        } else {
            newSelectedIds = selectedAssetIds.filter(
                (id) => id !== toggledAssetId,
            );
        }

        // Inform managed asset manager this given asset count was increased/decreased.
        const a = getAsset(toggledAssetId);
        if (a) {
            if (isChecked) {
                incrementAssetUseCount(a.asset.url);
            } else {
                decrementAssetUseCount(a.asset.url);
            }
        }

        // Update UI state.
        setSelectedAssetIds(newSelectedIds);

        if (regime.kind !== "viewing") {
            return;
        }

        // Create updated state tree.
        const updatedTree: MVSData_States = {
            ...regime.history.current().stateTree,
            snapshots: regime.history
                .current()
                .stateTree.snapshots.map((snap) => {
                    if (snap.metadata.key === viewKey) {
                        let newRoot;

                        if (isChecked) {
                            if (tabType === "volume") {
                                // Get changes from our view model.
                                const volumeModel =
                                    getVolumeViewModelForAsset(toggledAssetId);

                                // New root.
                                newRoot = addVolumeNodeToTree(
                                    snap.root,
                                    toggledAssetId,
                                    getAsset(toggledAssetId)?.extension ||
                                        "unknown",
                                    getAllSupportedAssetsParsers(),
                                    volumeModel,
                                );
                            } else {
                                // Get changes from our view model.
                                const volumeModel =
                                    getStructureViewModelForAsset(
                                        toggledAssetId,
                                    );

                                // New root.
                                newRoot = addStructureNodeToTree(
                                    snap.root,
                                    toggledAssetId,
                                    getAsset(toggledAssetId)?.extension ||
                                        "unknown",
                                    getAllSupportedAssetsParsers(),
                                    volumeModel,
                                );
                            }
                        } else {
                            newRoot = removeNodeFromTree(
                                snap.root,
                                toggledAssetId,
                            );
                        }

                        return { ...snap, root: newRoot };
                    }
                    return snap;
                }),
        };

        // Update regime.
        regime.commitStateTree(
            updatedTree,
            `Updated asset "${toggledAssetId}" for view "${view?.metadata.title}" (${viewKey}).`,
        );

        // Try to reload Molstar viewer.
        const result = await reloadMolstarAndRestoreIndex(
            { key: viewKey },
            Array.from(assets.values()),
            updatedTree,
        );

        if (result instanceof Error) {
            pushErrorNotification(
                `Failed to apply changes! It is possible that given asset cannot be used in the MVS. For more information, check the logs.`,
            );
            loggerUi.error(result.message);

            if (a) {
                if (isChecked) {
                    decrementAssetUseCount(a.asset.url);
                } else {
                    incrementAssetUseCount(a.asset.url);
                }
            }

            setSelectedAssetIds(selectedAssetIds);
            regime.undo();
        }
    };

    return {
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
    };
}
