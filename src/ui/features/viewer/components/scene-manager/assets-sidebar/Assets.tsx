/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { Text } from "@mantine/core";
import { IconAlertOctagonFilled, IconWorldWww } from "@tabler/icons-react";
import { Button } from "../../../../../components/common/button/Button";
import { DeleteActionIcon } from "../../../../../components/common/actionables/actions-icons/DeleteActionIcon";
import {
    AddLocalAssetDialogueContent,
    type AddLocalAssetDialogueReturnType,
} from "./AddLocalAssetDialogueContent";
import { pushErrorNotification } from "../../../../../services/NotificationService";
import { useWorkspaceManagement } from "../../../../workspace/hooks/useWorkspaceManagement";
import { ActionableList } from "../../../../../components/common/actionables/ActionableList";
import { ActionableListItem } from "../../../../../components/common/actionables/ActionableListItem";
import { LocalAssetsTree } from "./LocalAssetsTree";
import { DeleteAssetDialogueContent } from "./DeleteAssetDialogueContent";
import {
    AddRemoteAssetDialogueContent,
    type AddRemoteAssetDialogueReturnType,
} from "./AddRemoteAssetDialogueContent";
import { EditActionIcon } from "../../../../../components/common/actionables/actions-icons/EditActionIcon";
import {
    isManagedAssetLocal,
    isManagedAssetRemote,
    useManagedAssetsStore,
} from "../../../../../stores/managedAssetsStore";
import { useDialogueStore } from "../../../../../stores/dialogueStore";
import { ProcessingPropertiesDialogueContent } from "./ProcessingPropertiesDialogueContent";
import type { ProcessVolumeRequestWithoutFilepaths } from "../../../../../config/processingDefinitions";

export function Assets() {
    // Use managed assets.
    const assets = useManagedAssetsStore((state) => state.assets);
    const addLocalAsset = useManagedAssetsStore((state) => state.addLocalAsset);
    const addRemoteAsset = useManagedAssetsStore(
        (state) => state.addRemoteAsset,
    );
    const editRemoteAsset = useManagedAssetsStore(
        (state) => state.editRemoteAsset,
    );
    const removeAsset = useManagedAssetsStore((state) => state.removeAsset);

    // Use workspace management.
    const { startFileProcessing } = useWorkspaceManagement();

    // Render the component.
    return (
        <div>
            {/* Local assets part. */}
            <div>
                {/* Header label. */}
                <Text
                    size="xl"
                    mb="sm"
                    title="Navigate with <Up>/<Down>, Expand with <Space>."
                >
                    Local
                </Text>

                {/* Render all local assets in the form of a tree. */}
                {Array.from(assets.values()).filter(isManagedAssetLocal)
                    .length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center">
                        No local assets found...
                    </Text>
                ) : (
                    <LocalAssetsTree />
                )}

                {/* Button to open a dialogue to add new local assets. */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "1em",
                    }}
                >
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={async () => {
                            const result = await useDialogueStore
                                .getState()
                                .showDialogue<AddLocalAssetDialogueReturnType>({
                                    title: "Add local asset",
                                    width: "800px",
                                    showCloseButton: true,
                                    content: (close) => (
                                        <AddLocalAssetDialogueContent
                                            close={close}
                                        />
                                    ),
                                });

                            if (result) {
                                if (!result.processAsset) {
                                    const wasSuccessful = addLocalAsset(
                                        result.file,
                                        result.relativePath,
                                    );
                                    if (!wasSuccessful) {
                                        pushErrorNotification(
                                            `Asset "${result.relativePath}${result.file.name}" already exists!`,
                                        );
                                    }
                                } else {
                                    const processingProperties =
                                        await useDialogueStore
                                            .getState()
                                            .showDialogue<ProcessVolumeRequestWithoutFilepaths>(
                                                {
                                                    title: "Processing properties",
                                                    width: "1000px",
                                                    showCloseButton: true,
                                                    content: (close) => (
                                                        <ProcessingPropertiesDialogueContent
                                                            file={result.file}
                                                            close={close}
                                                        />
                                                    ),
                                                },
                                            );

                                    if (processingProperties) {
                                        await startFileProcessing(
                                            result.file,
                                            result.relativePath,
                                            processingProperties,
                                        );
                                    }
                                }
                            }
                        }}
                        tooltip="Open dialogue to add new local asset."
                    >
                        Add...
                    </Button>
                </div>
            </div>

            {/* Remote assets part. */}
            <div style={{ marginTop: "2em" }}>
                {/* Label. */}
                <Text size="xl" mb="sm">
                    Remote
                </Text>

                {/* Info text if no remote assets are found. */}
                {Array.from(assets.values()).filter(isManagedAssetRemote)
                    .length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center">
                        No remote assets found...
                    </Text>
                ) : (
                    <></>
                )}

                {/* Flat list of remote assets. */}
                <ActionableList>
                    {Array.from(assets.values())
                        .filter(isManagedAssetRemote)
                        .map((asset) => {
                            // Asset might has `unknown` extension and we must force user to fix the extension in the dialogue window.
                            const hasUnknownExtension =
                                asset.extension === "unknown";

                            return (
                                <ActionableListItem
                                    key={asset.asset.id}
                                    style={
                                        hasUnknownExtension
                                            ? {
                                                  backgroundColor:
                                                      "rgba(251, 191, 36, 0.35)",
                                              }
                                            : undefined
                                    }
                                    title={asset.relativePath}
                                    titleSize="sm"
                                    tooltip={asset.asset.url}
                                    leftComponent={
                                        hasUnknownExtension ? (
                                            <div
                                                title="Could not detect file extension! Please set it manually."
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "row",
                                                    gap: "0.35em",
                                                }}
                                            >
                                                <IconWorldWww
                                                    size={16}
                                                    style={{ opacity: 0.6 }}
                                                />
                                                <IconAlertOctagonFilled
                                                    size={16}
                                                    style={{ opacity: 0.6 }}
                                                ></IconAlertOctagonFilled>
                                            </div>
                                        ) : (
                                            <IconWorldWww
                                                size={16}
                                                style={{ opacity: 0.6 }}
                                            />
                                        )
                                    }
                                    rightComponent={
                                        <>
                                            <EditActionIcon
                                                onClick={async () => {
                                                    const originalUrl =
                                                        asset.asset.url;
                                                    const result =
                                                        await useDialogueStore
                                                            .getState()
                                                            .showDialogue<AddRemoteAssetDialogueReturnType>(
                                                                {
                                                                    title: "Edit remote asset",
                                                                    width: "800px",
                                                                    showCloseButton:
                                                                        true,
                                                                    content: (
                                                                        close,
                                                                    ) => (
                                                                        <AddRemoteAssetDialogueContent
                                                                            url={
                                                                                asset
                                                                                    .asset
                                                                                    .url
                                                                            }
                                                                            extension={
                                                                                asset.extension ===
                                                                                "unknown"
                                                                                    ? undefined
                                                                                    : asset.extension
                                                                            }
                                                                            close={
                                                                                close
                                                                            }
                                                                        />
                                                                    ),
                                                                },
                                                            );

                                                    if (result) {
                                                        if (
                                                            result.url &&
                                                            result.url.trim() !==
                                                                ""
                                                        ) {
                                                            editRemoteAsset(
                                                                originalUrl,
                                                                result.url.trim(),
                                                                result.extension,
                                                            );
                                                        }
                                                    }
                                                }}
                                            ></EditActionIcon>
                                            <DeleteActionIcon
                                                onClick={async () => {
                                                    const result =
                                                        await useDialogueStore
                                                            .getState()
                                                            .showDialogue<boolean>(
                                                                {
                                                                    title: "Delete Confirmation",
                                                                    width: "550px",
                                                                    showCloseButton:
                                                                        true,
                                                                    content: (
                                                                        close,
                                                                    ) => (
                                                                        <DeleteAssetDialogueContent
                                                                            assetName={
                                                                                asset.name
                                                                            }
                                                                            close={
                                                                                close
                                                                            }
                                                                        />
                                                                    ),
                                                                },
                                                            );

                                                    if (result) {
                                                        removeAsset(
                                                            asset.asset.url,
                                                        );
                                                    }
                                                }}
                                                tooltip={
                                                    asset.useCount > 0
                                                        ? "Cannot delete remote asset, as it is being referenced in view."
                                                        : "Delete remote asset."
                                                }
                                                enabled={!(asset.useCount > 0)}
                                            />
                                        </>
                                    }
                                />
                            );
                        })}
                </ActionableList>

                {/* Input form to add new remote asset. */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop:
                            Array.from(assets.values()).filter(
                                isManagedAssetRemote,
                            ).length === 0
                                ? "0.5em"
                                : "1em",
                        gap: "0.5em",
                    }}
                >
                    <Button
                        variant="primary"
                        size="medium"
                        onClick={async () => {
                            const result = await useDialogueStore
                                .getState()
                                .showDialogue<AddRemoteAssetDialogueReturnType>(
                                    {
                                        title: "Add remote asset",
                                        width: "800px",
                                        showCloseButton: true,
                                        content: (close) => (
                                            <AddRemoteAssetDialogueContent
                                                url={undefined}
                                                extension={undefined}
                                                close={close}
                                            />
                                        ),
                                    },
                                );

                            if (result) {
                                if (result.url && result.url.trim() !== "") {
                                    addRemoteAsset(
                                        result.url.trim(),
                                        result.extension,
                                    );
                                }
                            }
                        }}
                        tooltip="Add new remote asset."
                    >
                        Add...
                    </Button>
                </div>
            </div>
        </div>
    );
}
