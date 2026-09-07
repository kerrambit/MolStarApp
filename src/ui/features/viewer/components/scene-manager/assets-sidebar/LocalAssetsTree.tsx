/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useMemo, useState } from "react";
import { Text, Group, Tree, useTree } from "@mantine/core";
import { IconFile, IconFolder, IconFolderOpen } from "@tabler/icons-react";
import {
    buildAssetTree,
    type AssetTreeNode,
} from "../../../utils/buildAssetTree";
import { useRegimeStore } from "../../../../../stores/regimeStore";
import { computeOptimalYellow } from "../../../../../components/common/actionables/actions-icons/utils/computeOptimalYellow";
import { EditActionIcon } from "../../../../../components/common/actionables/actions-icons/EditActionIcon";
import {
    EditAssetDialogueContent,
    type EditAssetDialogueReturnType,
} from "./EditAssetDialogueContent";
import { pushErrorNotification } from "../../../../../services/NotificationService";
import { DeleteActionIcon } from "../../../../../components/common/actionables/actions-icons/DeleteActionIcon";
import { DeleteAssetDialogueContent } from "./DeleteAssetDialogueContent";
import { UiLocalStorageService } from "../../../../../services/UiLocalStorageService";

import "../../../../../components/common/actionables/ActionableListItem.css";
import {
    isManagedAssetLocal,
    useManagedAssetsStore,
} from "../../../../../stores/managedAssetsStore";
import { useDialogueStore } from "../../../../../stores/dialogueStore";
import { useAppearance } from "../../../../../hooks/useAppearance";

export function LocalAssetsTree() {
    // Use appearance.
    const { colorScheme } = useAppearance();

    // Use regime.
    const regime = useRegimeStore((state) => state.regime);

    // Use managed assets.
    const assets = useManagedAssetsStore((state) => state.assets);
    const removeAsset = useManagedAssetsStore((state) => state.removeAsset);
    const editRelativePathAndFilenameOfLocalAsset = useManagedAssetsStore(
        (state) => state.editRelativePathAndFilenameOfLocalAsset,
    );

    // State for the tree.
    const [expandedState, setExpandedState] = useState<Record<string, boolean>>(
        UiLocalStorageService.Assets.getInitialTreeExpandedState(
            regime.kind === "viewing" ? regime.viewedFile.path : "",
        ),
    );

    // Use tree.
    const tree = useTree({
        expandedState,
        onExpandedStateChange: (nextState) => {
            setExpandedState(nextState);
            UiLocalStorageService.Assets.setInitialTreeExpandedState(
                regime.kind === "viewing" ? regime.viewedFile.path : "",
                nextState,
            );
        },
    });

    // Memoize managed assets.
    const localAssetsTreeData = useMemo(() => {
        return buildAssetTree(
            Array.from(assets.values()).filter(isManagedAssetLocal),
        );
    }, [assets]);

    // Render the component.
    return (
        <div
            style={{
                padding: "0.25em",
            }}
            title="Navigate with <Up>/<Down>, Expand with <Space>."
        >
            <Tree
                tree={tree}
                data={localAssetsTreeData}
                levelOffset={16}
                expandOnSpace={true}
                renderNode={({ node, expanded, hasChildren, elementProps }) => {
                    // Custom node.
                    const customNode = node as AssetTreeNode;

                    // Checks if current node is leaf (file) or not (folder).
                    const isFile = !hasChildren && customNode.assetRef;

                    // Data packet of type ManagedAsset.
                    const asset = customNode.assetRef;

                    // One branch/leaf (mirrors the style of `ActionableListItem`).
                    return (
                        <Group
                            {...elementProps}
                            className={`actionableListItemColor ${
                                elementProps.className || ""
                            }`}
                            justify="space-between"
                            style={{
                                ...elementProps.style,
                                marginBottom: "0.5em",
                            }}
                            title={asset?.name}
                        >
                            {/* Left section. */}
                            <Group gap="xs">
                                {hasChildren ? (
                                    expanded ? (
                                        <IconFolderOpen
                                            size={18}
                                            style={{
                                                color: computeOptimalYellow(
                                                    colorScheme,
                                                ),
                                            }}
                                        />
                                    ) : (
                                        <IconFolder
                                            size={18}
                                            style={{
                                                color: computeOptimalYellow(
                                                    colorScheme,
                                                ),
                                            }}
                                        />
                                    )
                                ) : (
                                    <IconFile
                                        size={18}
                                        style={{ opacity: 0.6 }}
                                    />
                                )}

                                <Text size="sm">{node.label}</Text>
                            </Group>

                            {/* If the node is leaf (file), we add the right section with action buttons. */}
                            {isFile && asset && (
                                <Group
                                    gap={"0.1em"}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <EditActionIcon
                                        onClick={async () => {
                                            const result =
                                                await useDialogueStore
                                                    .getState()
                                                    .showDialogue<EditAssetDialogueReturnType>(
                                                        {
                                                            title: "Edit local asset",
                                                            width: "800px",
                                                            showCloseButton:
                                                                true,
                                                            content: (
                                                                close,
                                                            ) => (
                                                                <EditAssetDialogueContent
                                                                    filename={
                                                                        asset.name
                                                                    }
                                                                    pathSegments={asset.relativePath
                                                                        .split(
                                                                            "/",
                                                                        )
                                                                        .filter(
                                                                            Boolean,
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            -1,
                                                                        )}
                                                                    close={
                                                                        close
                                                                    }
                                                                />
                                                            ),
                                                        },
                                                    );

                                            if (result) {
                                                const wasSuccessful =
                                                    editRelativePathAndFilenameOfLocalAsset(
                                                        asset.asset.url,
                                                        `${result.newFileName}`,
                                                        `${result.relativePath}`,
                                                    );
                                                if (!wasSuccessful) {
                                                    pushErrorNotification(
                                                        `Could not edit "${result.relativePath}${asset.name}" asset!`,
                                                    );
                                                }
                                            }
                                        }}
                                        tooltip="Edit local asset."
                                    />

                                    <DeleteActionIcon
                                        onClick={async () => {
                                            // Show confirmation dialogue.
                                            const result =
                                                await useDialogueStore
                                                    .getState()
                                                    .showDialogue<boolean>({
                                                        title: "Delete Confirmation",
                                                        width: "550px",
                                                        showCloseButton: true,
                                                        content: (close) => (
                                                            <DeleteAssetDialogueContent
                                                                assetName={
                                                                    asset.name
                                                                }
                                                                close={close}
                                                            />
                                                        ),
                                                    });

                                            if (result) {
                                                removeAsset(asset.asset.url);
                                            }
                                        }}
                                        tooltip={
                                            asset.useCount > 0
                                                ? "Cannot delete asset, as it is being referenced in view."
                                                : "Delete local asset."
                                        }
                                        enabled={!(asset.useCount > 0)}
                                    />
                                </Group>
                            )}
                        </Group>
                    );
                }}
            />
        </div>
    );
}
