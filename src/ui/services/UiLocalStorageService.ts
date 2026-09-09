/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { pushErrorNotification } from "./NotificationService";
import { loggerUi } from "./UiLoggingService";

const PREFIX = {
    PENDING_SCREENSHOT: "view-options-wants-screenshot-",
    SCENE_MANAGER_TAB: "scene-manager-tab-",
    SCENE_MANAGER_BUILDER_SIDEBAR: "scene-manager-builder-sidebar",
    VIEW_BUILDER_ASSET: "view-builder-expanded-asset-",
    VIEW_BUILDER_TAB: "view-builder-tab-",
    VIEW_BUILDER_VOLUME_GENERAL_SECTION: "view-builder-volume-general-section-",
    VIEW_BUILDER_VOLUME_REPRESENTATION_SECTION:
        "view-builder-volume-representation",
    VIEW_BUILDER_VOLUME_TRANSFORM_SECTION:
        "view-builder-volume-transform-section-",
    VIEW_BUILDER_STRUCTURE_GENERAL_SECTION:
        "view-builder-structure-general-section-",
    VIEW_BUILDER_STRUCTURE_GENERAL_ADVANCED_SECTION:
        "view-builder-structure-general-advanced-section-",
    VIEW_BUILDER_STRUCTURE_COMPONENTS_SECTION:
        "view-builder-structure-components-section-",
    VIEW_BUILDER_STRUCTURE_TOOLTIPS_AND_LABELS_SECTION:
        "view-builder-structure-tooltips-and-labels-section",
    VIEW_BUILDER_STRUCTURE_TRANSFORM_SECTION:
        "view-builder-structure-transform-section-",
    VIEW_BUILDER_STRUCTURE_COMPONENT_REPRESENTATION_SECTION:
        "view-builder-structure-component-representation",
    VIEW_BUILDER_STRUCTURE_COMPONENT_FOCUS_SECTION:
        "view-builder-structure-component-focus",
    VIEW_BUILDER_STRUCTURE_COMPONENT_TOOLTIPS_AND_LABELS_SECTION:
        "view-builder-structure-component-tooltips-and-labels-section",
    VIEW_BUILDER_STRUCTURE_COMPONENT_TRANSFORM_SECTION:
        "view-builder-structure-component-transform-section-",
    VIEW_BUILDER_FILTER_SECTION: "view-builder-asset-filter-section-",
    VIEW_BUILDER_FILTERS: "view-builder-asset-filters-",
    VIEW_BUILDER_FOLDER: "view-builder-asset-folders-",
    ASSETS_TREE: "assets-tree-",
    PROCESSING_JOBS: "processing-jobs-",
};

export const UiLocalStorageService = {
    clear: () => {
        localStorage.clear();
    },

    ViewOptions: {
        getPending: (viewKey: string): boolean | undefined => {
            const value = localStorage.getItem(
                `${PREFIX.PENDING_SCREENSHOT}${viewKey}`,
            );
            if (value === null) {
                return undefined;
            }
            return value === "true";
        },

        setPending: (viewKey: string, wantsScreenshot: boolean): void => {
            localStorage.setItem(
                `${PREFIX.PENDING_SCREENSHOT}${viewKey}`,
                String(wantsScreenshot),
            );
        },

        clearPending: (viewKey: string): void => {
            localStorage.removeItem(`${PREFIX.PENDING_SCREENSHOT}${viewKey}`);
        },
    },

    SceneManager: {
        getTab: (): "storyOptions" | "assets" | "views" => {
            const value = localStorage.getItem(`${PREFIX.SCENE_MANAGER_TAB}`);
            return (
                (value as "storyOptions" | "assets" | "views") || "storyOptions"
            );
        },

        setTab: (tabType: "storyOptions" | "assets" | "views"): void => {
            localStorage.setItem(
                `${PREFIX.SCENE_MANAGER_TAB}`,
                String(tabType),
            );
        },

        getBuilderSidebar: (): string | undefined => {
            const value = localStorage.getItem(
                `${PREFIX.SCENE_MANAGER_BUILDER_SIDEBAR}`,
            );
            return value || undefined;
        },

        setBuilderSidebar: (viewKey: string | undefined): void => {
            if (viewKey) {
                localStorage.setItem(
                    `${PREFIX.SCENE_MANAGER_BUILDER_SIDEBAR}`,
                    viewKey,
                );
            } else {
                localStorage.removeItem(
                    `${PREFIX.SCENE_MANAGER_BUILDER_SIDEBAR}`,
                );
            }
        },
    },

    ViewBuilder: {
        getExpandedAssetId: (viewKey: string): string | null => {
            return localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_ASSET}${viewKey}`,
            );
        },

        setExpandedAssetId: (viewKey: string, assetId: string | null): void => {
            if (assetId) {
                localStorage.setItem(
                    `${PREFIX.VIEW_BUILDER_ASSET}${viewKey}`,
                    assetId,
                );
            } else {
                localStorage.removeItem(
                    `${PREFIX.VIEW_BUILDER_ASSET}${viewKey}`,
                );
            }
        },

        getExpandedVolumeGeneralSection: (
            assetId: string,
            viewKey: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_VOLUME_GENERAL_SECTION}${viewKey}-${assetId}`,
            );
            if (value === null || value === "true") {
                return true;
            }
            return false;
        },

        setExpandedVolumeGeneralSection: (
            assetId: string,
            viewKey: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_VOLUME_GENERAL_SECTION}${viewKey}-${assetId}`,
                String(expanded),
            );
        },

        getExpandedStructureGeneralSection: (
            assetId: string,
            viewKey: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_GENERAL_SECTION}${viewKey}-${assetId}`,
            );
            if (value === null || value === "true") {
                return true;
            }
            return false;
        },

        setExpandedStructureGeneralSection: (
            assetId: string,
            viewKey: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_GENERAL_SECTION}${viewKey}-${assetId}`,
                String(expanded),
            );
        },

        getExpandedStructureAdvancedGeneralSection: (
            assetId: string,
            viewKey: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_GENERAL_ADVANCED_SECTION}${viewKey}-${assetId}`,
            );
            if (value === "true") {
                return true;
            }
            return false;
        },

        setExpandedStructureAdvancedGeneralSection: (
            assetId: string,
            viewKey: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_GENERAL_ADVANCED_SECTION}${viewKey}-${assetId}`,
                String(expanded),
            );
        },

        getExpandedStructureTooltipsAndLabelsSection: (
            assetId: string,
            viewKey: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_TOOLTIPS_AND_LABELS_SECTION}${viewKey}-${assetId}`,
            );
            if (value === "true") {
                return true;
            }
            return false;
        },

        setExpandedStructureTooltipsAndLabelsSection: (
            assetId: string,
            viewKey: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_TOOLTIPS_AND_LABELS_SECTION}${viewKey}-${assetId}`,
                String(expanded),
            );
        },

        getExpandedStructureTransformSection: (
            assetId: string,
            viewKey: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_TRANSFORM_SECTION}${viewKey}-${assetId}`,
            );
            if (value === "true") {
                return true;
            }
            return false;
        },

        setExpandedStructureTransformSection: (
            assetId: string,
            viewKey: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_TRANSFORM_SECTION}${viewKey}-${assetId}`,
                String(expanded),
            );
        },

        getExpandedStructureComponentsSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENTS_SECTION}${viewKey}-${assetId}-${componentId}`,
            );
            if (value === "true" || value === null) {
                return true;
            }
            return false;
        },

        setExpandedStructureComponentsSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENTS_SECTION}${viewKey}-${assetId}-${componentId}`,
                String(expanded),
            );
        },

        getExpandedVolumeRepresentationSection: (
            assetId: string,
            viewKey: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_VOLUME_REPRESENTATION_SECTION}${viewKey}-${assetId}`,
            );
            if (value === null || value === "true") {
                return true;
            }
            return false;
        },

        setExpandedVolumeRepresentationSection: (
            assetId: string,
            viewKey: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_VOLUME_REPRESENTATION_SECTION}${viewKey}-${assetId}`,
                String(expanded),
            );
        },

        getExpandedVolumeTransformSection: (
            assetId: string,
            viewKey: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_VOLUME_TRANSFORM_SECTION}${viewKey}-${assetId}`,
            );
            if (value === null) {
                return false;
            }
            if (value === "true") {
                return true;
            }
            return false;
        },

        setExpandedVolumeTransformSection: (
            assetId: string,
            viewKey: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_VOLUME_TRANSFORM_SECTION}${viewKey}-${assetId}`,
                String(expanded),
            );
        },

        getExpandedStructureComponentTransformSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENT_TRANSFORM_SECTION}${viewKey}-${assetId}-${componentId}`,
            );
            if (value === null) {
                return false;
            }
            if (value === "true") {
                return true;
            }
            return false;
        },

        setExpandedStructureComponentTransformSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENT_TRANSFORM_SECTION}${viewKey}-${assetId}-${componentId}`,
                String(expanded),
            );
        },

        getExpandedStructureComponentFocusSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENT_FOCUS_SECTION}${viewKey}-${assetId}-${componentId}`,
            );
            if (value === null) {
                return false;
            }
            if (value === "true") {
                return true;
            }
            return false;
        },

        setExpandedStructureComponentFocusSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENT_FOCUS_SECTION}${viewKey}-${assetId}-${componentId}`,
                String(expanded),
            );
        },

        getExpandedStructureComponentTooltipsAndLabelsSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENT_TOOLTIPS_AND_LABELS_SECTION}${viewKey}-${assetId}-${componentId}`,
            );
            if (value === null) {
                return false;
            }
            if (value === "true") {
                return true;
            }
            return false;
        },

        setExpandedStructureComponentTooltipsAndLabelsSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENT_TOOLTIPS_AND_LABELS_SECTION}${viewKey}-${assetId}-${componentId}`,
                String(expanded),
            );
        },

        getExpandedStructureComponentRepresentationSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
        ): boolean => {
            const value = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENT_REPRESENTATION_SECTION}${viewKey}-${assetId}-${componentId}`,
            );
            if (value === null) {
                return false;
            }
            if (value === "true") {
                return true;
            }
            return false;
        },

        setExpandedStructureComponentRepresentationSection: (
            assetId: string,
            viewKey: string,
            componentId: string,
            expanded: boolean,
        ): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_STRUCTURE_COMPONENT_REPRESENTATION_SECTION}${viewKey}-${assetId}-${componentId}`,
                String(expanded),
            );
        },

        getAssetFilters: (viewKey: string): string[] | null => {
            const stored = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_FILTERS}${viewKey}`,
            );

            if (!stored) return null;

            try {
                return JSON.parse(stored) as string[];
            } catch (error) {
                pushErrorNotification(
                    `Internal error occured concerning reading the stored UI state!`,
                );
                loggerUi.error(
                    `Failed to parse asset filters from localStorage! Details: <${error}>.`,
                );
                return null;
            }
        },

        setAssetFilters: (viewKey: string, filters: string[]): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_FILTERS}${viewKey}`,
                JSON.stringify(filters),
            );
        },

        getAssetFolders: (viewKey: string): string[] | null => {
            const stored = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_FOLDER}${viewKey}`,
            );

            if (!stored) return null;

            try {
                return JSON.parse(stored) as string[];
            } catch (error) {
                pushErrorNotification(
                    `Internal error occured concerning reading the stored UI state!`,
                );
                loggerUi.error(
                    `Failed to parse asset folders from localStorage! Details: <${error}>.`,
                );
                return null;
            }
        },

        setAssetFolders: (viewKey: string, folders: string[]): void => {
            localStorage.setItem(
                `${PREFIX.VIEW_BUILDER_FOLDER}${viewKey}`,
                JSON.stringify(folders),
            );
        },

        getExpandedFiltersSection: (viewKey: string): boolean => {
            const result = localStorage.getItem(
                `${PREFIX.VIEW_BUILDER_FILTER_SECTION}${viewKey}`,
            );
            if (result) {
                return result === "true";
            }
            return true;
        },

        setExpandedFiltersSection: (
            viewKey: string,
            isExpanded: boolean,
        ): void => {
            if (isExpanded) {
                localStorage.setItem(
                    `${PREFIX.VIEW_BUILDER_FILTER_SECTION}${viewKey}`,
                    "true",
                );
            } else {
                localStorage.setItem(
                    `${PREFIX.VIEW_BUILDER_FILTER_SECTION}${viewKey}`,
                    "false",
                );
            }
        },
    },
    Assets: {
        getInitialTreeExpandedState: (
            filepath: string,
        ): Record<string, boolean> => {
            try {
                const stored = localStorage.getItem(
                    `${PREFIX.ASSETS_TREE}${filepath}`,
                );
                return stored ? JSON.parse(stored) : {};
            } catch {
                return {};
            }
        },

        setInitialTreeExpandedState: (
            filepath: string,
            state: Record<string, boolean>,
        ) => {
            localStorage.setItem(
                `${PREFIX.ASSETS_TREE}${filepath}`,
                JSON.stringify(state),
            );
        },
    },
    ProcessingJobs: {
        getJobExpandedState: (jobId: string) => {
            const result = localStorage.getItem(
                `${PREFIX.PROCESSING_JOBS}${jobId}`,
            );
            if (result) {
                return result === "true";
            }
            return true;
        },

        setJobExpandedState: (jobId: string, isExpanded: boolean): void => {
            if (isExpanded) {
                localStorage.setItem(
                    `${PREFIX.PROCESSING_JOBS}${jobId}`,
                    "true",
                );
            } else {
                localStorage.setItem(
                    `${PREFIX.PROCESSING_JOBS}${jobId}`,
                    "false",
                );
            }
        },
    },
};
