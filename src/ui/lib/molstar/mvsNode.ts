/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { type MVSTree } from "molstar/lib/extensions/mvs/tree/mvs/mvs-tree";
import { type Base64Png, type CameraState, type HexColor } from "./types";
import { ColorT } from "molstar/lib/extensions/mvs/tree/mvs/param-types";
import { getEulerAnglesFromMatrix3x3, getRotationMatrix3x3 } from "./math";
import type {
    ComponentEntry,
    StructureViewModel,
    VolumeViewModel,
} from "../../features/viewer/models/MvsViewModels";
import { createMVSBuilder } from "molstar/lib/extensions/mvs/tree/mvs/mvs-builder";

/**
 * Creates a deep copy of `node`.
 * @param node node to copy
 * @returns copy of node
 */
export function copyNode(node: MVSTree) {
    return structuredClone(node);
}

/**
 * Creates a deep copy of `node` and applies camera-related changes to the copy, which is then returned.
 * @param node node to copy and apply changes to
 * @param referenceCamera camera
 * @param thumbnail thumbnail
 * @returns copy of original `node` with applied changes
 */
export function applyCameraToNode(
    node: MVSTree,
    referenceCamera?: CameraState | undefined,
    thumbnail?: Base64Png,
): MVSTree {
    const nodeCopy = copyNode(node);

    if (referenceCamera) {
        const { position, target, up } = referenceCamera;

        const cameraNode = nodeCopy.children?.find(
            (child) => child.kind === "camera",
        );

        if (cameraNode) {
            cameraNode.params = {
                position: Array.from(position) as [number, number, number],
                target: Array.from(target) as [number, number, number],
                up: Array.from(up) as [number, number, number],
            };

            if (thumbnail) {
                cameraNode.custom = {
                    ...(cameraNode.custom || {}),
                    thumbnail: thumbnail,
                };
            } else if (cameraNode.custom) {
                delete cameraNode.custom.thumbnail;

                if (Object.keys(cameraNode.custom).length === 0) {
                    delete cameraNode.custom;
                }
            }
        } else {
            const newCameraNode: any = {
                kind: "camera" as const,
                params: {
                    position: Array.from(position) as [number, number, number],
                    target: Array.from(target) as [number, number, number],
                    up: Array.from(up) as [number, number, number],
                },
            };

            if (thumbnail) {
                newCameraNode.custom = { thumbnail: thumbnail };
            }

            if (!nodeCopy.children) {
                nodeCopy.children = [];
            }
            nodeCopy.children.unshift(newCameraNode);
        }
    }

    return nodeCopy;
}

/**
 * Creates a deep copy of `node` and applies background color.
 * @param node node to copy and apply changes to
 * @param backgroundColor color
 * @returns copy of original `node` with applied changes
 */
export function applyBackgroundColorToNode(
    node: MVSTree,
    backgroundColor?: HexColor,
): MVSTree {
    const nodeCopy = copyNode(node);

    if (backgroundColor) {
        const canvasNode = nodeCopy.children?.find(
            (child) => child.kind === "canvas",
        );

        if (canvasNode) {
            canvasNode.params = {
                background_color: backgroundColor as ColorT,
            };
        } else {
            const newCanvasNode = {
                kind: "canvas" as const,
                params: {
                    background_color: backgroundColor as ColorT,
                },
            };

            if (!nodeCopy.children) {
                nodeCopy.children = [];
            }
            nodeCopy.children.push(newCanvasNode);
        }
    } else {
        if (nodeCopy.children) {
            nodeCopy.children = nodeCopy.children.filter(
                (child) => child.kind !== "canvas",
            );
        }
    }

    return nodeCopy;
}

export const replaceAssetNodeInRoot = (
    rootNode: any,
    assetId: string,
    newNode: any,
) => ({
    ...rootNode,
    children: rootNode.children?.map((child: any) =>
        child.kind === "download" && child.params?.url === assetId
            ? newNode
            : child,
    ),
});

/**
 * Remove download node from the state tree.
 * @param rootNode root node
 * @param assetIdToRemove managed asset id in download node which will be removed
 * @returns modified node
 */
export function removeNodeFromTree(rootNode: MVSTree, assetIdToRemove: string) {
    return {
        ...rootNode,
        children: rootNode.children?.filter((child: any) => {
            if (
                child.kind === "download" &&
                child.params?.url === assetIdToRemove
            ) {
                return false;
            }
            return true;
        }),
    };
}

/**
 * Traverses an MVS node and its children immutably.
 * Replaces any `url` parameters with the corresponding `ManagedAsset.id`.
 * @param node node
 * @param assets list of assets
 * @returns modified node
 */
export function replaceNodeUrlsWithIds(node: any, assets: ManagedAsset[]): any {
    let newParams = node.params;

    if (newParams && typeof newParams.url === "string") {
        const currentUrl = newParams.url;
        const normalizedCurrentUrl = currentUrl.startsWith("./")
            ? currentUrl.slice(2)
            : currentUrl;

        const matchedAsset = assets.find((a) => {
            const assetUrl =
                typeof a.asset === "string" ? a.asset : a.asset?.url;

            return (
                assetUrl === currentUrl ||
                a.relativePath === normalizedCurrentUrl
            );
        });
        if (matchedAsset) {
            newParams = {
                ...newParams,
                url: matchedAsset.id,
            };
        }
    } else if (newParams && typeof newParams.uri === "string") {
        const currentUri = newParams.uri;
        const normalizedCurrentUrl = currentUri.startsWith("./")
            ? currentUri.slice(2)
            : currentUri;

        const matchedAsset = assets.find((a) => {
            const assetUrl =
                typeof a.asset === "string" ? a.asset : a.asset?.url;

            return (
                assetUrl === currentUri ||
                a.relativePath === normalizedCurrentUrl
            );
        });

        if (matchedAsset) {
            newParams = {
                ...newParams,
                uri: matchedAsset.id,
            };
        }
    }

    let newChildren = node.children;
    if (Array.isArray(node.children) && node.children.length > 0) {
        newChildren = node.children.map((child: any) =>
            replaceNodeUrlsWithIds(child, assets),
        );
    }

    return {
        ...node,
        params: newParams,
        children: newChildren,
    };
}

/**
 * Replace asset IDs in node with arcp protocol url value.
 * @param node node
 * @param assets list of assets
 * @returns modified node
 */
export function replaceNodeIdsWithMolstarUrls(
    node: any,
    assets: ManagedAsset[],
): any {
    let newParams = node.params;

    if (newParams) {
        if (typeof newParams.url === "string") {
            const currentId = newParams.url;
            const matchedAsset = assets.find((a) => a.id === currentId);

            if (matchedAsset) {
                newParams = {
                    ...newParams,
                    url:
                        typeof matchedAsset.asset === "string"
                            ? matchedAsset.asset
                            : matchedAsset.asset.url,
                };
            }
        } else if (typeof newParams.uri === "string") {
            const currentId = newParams.uri;
            const matchedAsset = assets.find((a) => a.id === currentId);

            if (matchedAsset) {
                newParams = {
                    ...newParams,
                    uri:
                        typeof matchedAsset.asset === "string"
                            ? matchedAsset.asset
                            : matchedAsset.asset.url,
                };
            }
        }
    }

    let newChildren = node.children;
    if (Array.isArray(node.children) && node.children.length > 0) {
        newChildren = node.children.map((child: any) =>
            replaceNodeIdsWithMolstarUrls(child, assets),
        );
    }

    return {
        ...node,
        params: newParams,
        children: newChildren,
    };
}

/**
 * Traverses an MVS node and its children immutably.
 * Replaces any `url` or `uri` parameters matching an Asset ID back to its relative path.
 */
export function replaceNodeIdsWithRelativePaths(
    node: any,
    assets: ManagedAsset[],
): any {
    let newParams = node.params;

    if (newParams) {
        if (typeof newParams.url === "string") {
            const currentId = newParams.url;
            const matchedAsset = assets.find((a) => a.id === currentId);

            if (matchedAsset) {
                let newPath = matchedAsset.relativePath;
                if (matchedAsset.tag === "local" && !newPath.startsWith("./")) {
                    newPath = `./${newPath}`;
                }
                newParams = {
                    ...newParams,
                    url: newPath,
                };
            }
        } else if (typeof newParams.uri === "string") {
            const currentId = newParams.uri;
            const matchedAsset = assets.find((a) => a.id === currentId);

            if (matchedAsset) {
                let newPath = matchedAsset.relativePath;
                if (matchedAsset.tag === "local" && !newPath.startsWith("./")) {
                    newPath = `./${newPath}`;
                }
                newParams = {
                    ...newParams,
                    uri: newPath,
                };
            }
        }
    }

    let newChildren = node.children;
    if (Array.isArray(node.children) && node.children.length > 0) {
        newChildren = node.children.map((child: any) =>
            replaceNodeIdsWithRelativePaths(child, assets),
        );
    }

    return {
        ...node,
        params: newParams,
        children: newChildren,
    };
}

/**
 * Builds a full `download` node (download -> parse -> structure -> ...) from
 * a StructureViewModel using the real MVS builder.
 *
 * Two deviations from the originally-sketched version, both because the real
 * builder doesn't support what was written:
 * - `parsed.structure(params)` doesn't exist — `Parse` only exposes
 *   `.modelStructure()` / `.assemblyStructure()` / `.symmetryStructure()` /
 *   `.symmetryMatesStructure()`, so we dispatch on `viewModel.type`.
 * - `componentNode.tooltipFromUri()` / `.labelFromUri()` don't exist —
 *   `Component` only has inline `.tooltip()`/`.label()`. The annotation-driven
 *   variants only exist on `Structure` (handled below via
 *   `viewModel.tooltip_from_uri` etc., not per-component).
 *
 * @param assetId used as the download node's `url`
 * @param viewModel fully-resolved structure view model
 * @returns the built `download` node, ready to splice into a hand-maintained tree
 */
export function getStructureNode(
    assetId: string,
    viewModel: StructureViewModel,
): any {
    const builder = createMVSBuilder();

    // Root & Data Source.
    const downloaded = builder.download({ url: assetId });
    const parsed = downloaded.parse({ format: viewModel.format as any });

    // Structure Node — dispatch to the type-specific builder method, since
    // Parse has no generic `.structure()`.
    const baseStructureParams = {
        block_header: viewModel.block_header ?? undefined,
        block_index: viewModel.block_index,
        model_index: viewModel.model_index,
        coordinates_ref: viewModel.coordinates_ref ?? undefined,
    };

    const structureNode = (() => {
        switch (viewModel.type) {
            case "assembly":
                return parsed.assemblyStructure({
                    ...baseStructureParams,
                    assembly_id: viewModel.assembly_id,
                });
            case "symmetry":
                return parsed.symmetryStructure({
                    ...baseStructureParams,
                    ijk_min: viewModel.ijk_min,
                    ijk_max: viewModel.ijk_max,
                });
            case "symmetry_mates":
                return parsed.symmetryMatesStructure({
                    ...baseStructureParams,
                    radius: viewModel.radius,
                });
            case "model":
            default:
                return parsed.modelStructure(baseStructureParams);
        }
    })();

    // Structure-level Transform
    const hasStructureTransform =
        viewModel.translationX !== 0 ||
        viewModel.translationY !== 0 ||
        viewModel.translationZ !== 0 ||
        viewModel.rotationX !== 0 ||
        viewModel.rotationY !== 0 ||
        viewModel.rotationZ !== 0;

    if (hasStructureTransform) {
        structureNode.transform({
            translation: [
                viewModel.translationX,
                viewModel.translationY,
                viewModel.translationZ,
            ],
            rotation: getRotationMatrix3x3(
                viewModel.rotationX,
                viewModel.rotationY,
                viewModel.rotationZ,
            ),
        });
    }

    // Structure-level annotation-driven label/tooltip (the *_from_uri/*_from_source
    // variants — these are the ones that actually exist at this level).
    if (viewModel.label_from_uri)
        structureNode.labelFromUri(viewModel.label_from_uri);
    if (viewModel.label_from_source)
        structureNode.labelFromSource(viewModel.label_from_source);
    if (viewModel.tooltip_from_uri)
        structureNode.tooltipFromUri(viewModel.tooltip_from_uri);
    if (viewModel.tooltip_from_source)
        structureNode.tooltipFromSource(viewModel.tooltip_from_source as never);

    // 4. Components & Annotations
    viewModel.components.forEach((comp: ComponentEntry) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const componentNode = structureNode.component({
            selector: comp.selector as any,
        });

        // Component-level transform
        const hasComponentTransform =
            comp.translationX !== 0 ||
            comp.translationY !== 0 ||
            comp.translationZ !== 0 ||
            comp.rotationX !== 0 ||
            comp.rotationY !== 0 ||
            comp.rotationZ !== 0;

        if (hasComponentTransform) {
            componentNode.transform({
                translation: [
                    comp.translationX,
                    comp.translationY,
                    comp.translationZ,
                ],
                rotation: getRotationMatrix3x3(
                    comp.rotationX,
                    comp.rotationY,
                    comp.rotationZ,
                ),
            });
        }

        if (comp.show_focus) {
            componentNode.focus({
                direction: comp.focus_direction,
                up: comp.focus_up,
            });
        }

        // Representation
        const repParams: Record<string, unknown> = {
            type: comp.representationType,
            size_factor: comp.size_factor,
        };
        if (comp.representationType === "cartoon")
            repParams.tubular_helices = comp.tubular_helices;
        if (
            comp.representationType === "ball_and_stick" ||
            comp.representationType === "line" ||
            comp.representationType === "spacefill" ||
            comp.representationType === "surface"
        ) {
            repParams.ignore_hydrogens = comp.ignore_hydrogens;
        }
        if (comp.representationType === "surface")
            repParams.surface_type = comp.surface_type;
        if (comp.representationType === "putty")
            repParams.size_theme = comp.size_theme;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const representationNode = componentNode.representation(
            repParams as any,
        );

        // Color variants are mutually exclusive in MVS — the UI's selector-type
        // toggle pattern should ensure only one of these three is ever set.
        if (comp.color_from_source) {
            representationNode.colorFromSource(comp.color_from_source);
        } else if (comp.color_from_uri) {
            representationNode.colorFromUri(comp.color_from_uri);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            representationNode.color({ color: comp.color as any });
        }
        representationNode.opacity({ opacity: comp.opacity });

        // Tooltip / Label — inline only, componentNode has no *FromUri/*FromSource.
        if (comp.tooltip) componentNode.tooltip({ text: comp.tooltip });
        if (comp.label) componentNode.label({ text: comp.label });
    });

    return builder.getState().root.children?.[0];
}

/**
 * Appends a new structure asset to the tree, built via getStructureNode.
 */
export function addStructureNodeToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rootNode: any,
    assetIdToAdd: string,
    extension: string,
    extensionParserRecord: Record<string, string>,
    viewModel: Omit<StructureViewModel, "format">,
) {
    const format = extensionParserRecord[extension] ?? "bcif";
    const newDownloadNode = getStructureNode(assetIdToAdd, {
        ...viewModel,
        format,
    });
    return {
        ...rootNode,
        children: [...(rootNode.children || []), newDownloadNode],
    };
}

/**
 * Builds a full `download` node (download -> parse -> volume -> ...) from a
 * VolumeViewModel, same conditional-transform pattern as structure.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getVolumeNode(
    assetId: string,
    viewModel: VolumeViewModel,
): any {
    const builder = createMVSBuilder();

    const downloaded = builder.download({ url: assetId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = downloaded.parse({ format: viewModel.format as any });
    const volumeNode = parsed.volume({});

    const hasTransform =
        viewModel.translationX !== 0 ||
        viewModel.translationY !== 0 ||
        viewModel.translationZ !== 0 ||
        viewModel.rotationX !== 0 ||
        viewModel.rotationY !== 0 ||
        viewModel.rotationZ !== 0;

    if (hasTransform) {
        volumeNode.transform({
            translation: [
                viewModel.translationX,
                viewModel.translationY,
                viewModel.translationZ,
            ],
            rotation: getRotationMatrix3x3(
                viewModel.rotationX,
                viewModel.rotationY,
                viewModel.rotationZ,
            ),
        });
    }

    const representationNode = volumeNode.representation({
        type: viewModel.type as never,
        relative_isovalue: viewModel.relative_isovalue,
        show_wireframe: viewModel.show_wireframe,
        show_faces: viewModel.show_faces,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    representationNode.color({ color: viewModel.color as any });
    representationNode.opacity({ opacity: viewModel.opacity });

    return builder.getState().root.children?.[0];
}

export function addVolumeNodeToTree(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rootNode: any,
    assetIdToAdd: string,
    extension: string,
    extensionParserRecord: Record<string, string>,
    viewModel: Omit<VolumeViewModel, "format">,
) {
    const format = extensionParserRecord[extension] ?? "bcif";
    const newDownloadNode = getVolumeNode(assetIdToAdd, {
        ...viewModel,
        format,
    });
    return {
        ...rootNode,
        children: [...(rootNode.children || []), newDownloadNode],
    };
}

/** Finds the first node of `targetKind` inside the branch belonging to `assetId`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findNodeInAssetBranch(
    node: any,
    assetId: string,
    targetKind: string,
    inBranch = false,
): any {
    let isInBranch = inBranch;
    if (node.kind === "download" && node.params?.url === assetId) {
        isInBranch = true;
    }
    if (isInBranch && node.kind === targetKind) {
        return node;
    }
    for (const child of node.children || []) {
        const found = findNodeInAssetBranch(
            child,
            assetId,
            targetKind,
            isInBranch,
        );
        if (found) return found;
    }
    return undefined;
}

/** Reads one ComponentEntry from a `component` node's own direct children only. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readComponentEntry(
    componentNode: any,
    id: string,
    defaults: ComponentEntry,
): ComponentEntry {
    const entry: ComponentEntry = {
        ...defaults,
        id,
        selector: componentNode.params?.selector ?? defaults.selector,
    };

    for (const child of componentNode.children || []) {
        if (child.kind === "representation" && child.params) {
            entry.representationType =
                child.params.type ?? entry.representationType;
            if (child.params.size_factor !== undefined)
                entry.size_factor = child.params.size_factor;
            if (child.params.tubular_helices !== undefined)
                entry.tubular_helices = child.params.tubular_helices;
            if (child.params.ignore_hydrogens !== undefined)
                entry.ignore_hydrogens = child.params.ignore_hydrogens;
            if (child.params.surface_type !== undefined)
                entry.surface_type = child.params.surface_type;
            if (child.params.size_theme !== undefined)
                entry.size_theme = child.params.size_theme;

            for (const grandchild of child.children || []) {
                if (
                    grandchild.kind === "color" &&
                    grandchild.params?.color !== undefined
                ) {
                    entry.color = grandchild.params.color;
                }
                if (grandchild.kind === "color_from_uri")
                    entry.color_from_uri = grandchild.params;
                if (grandchild.kind === "color_from_source")
                    entry.color_from_source = grandchild.params;
                if (
                    grandchild.kind === "opacity" &&
                    grandchild.params?.opacity !== undefined
                ) {
                    entry.opacity = grandchild.params.opacity;
                }
            }
        }

        if (child.kind === "label" && child.params?.text !== undefined)
            entry.label = child.params.text;
        if (child.kind === "tooltip" && child.params?.text !== undefined)
            entry.tooltip = child.params.text;

        if (child.kind === "focus") {
            entry.show_focus = true;
            if (Array.isArray(child.params?.direction))
                entry.focus_direction = child.params.direction;
            if (Array.isArray(child.params?.up))
                entry.focus_up = child.params.up;
        }

        if (child.kind === "transform" && child.params) {
            if (
                Array.isArray(child.params.translation) &&
                child.params.translation.length === 3
            ) {
                entry.translationX = child.params.translation[0];
                entry.translationY = child.params.translation[1];
                entry.translationZ = child.params.translation[2];
            }
            if (
                Array.isArray(child.params.rotation) &&
                child.params.rotation.length === 9
            ) {
                const [pitch, yaw, roll] = getEulerAnglesFromMatrix3x3(
                    child.params.rotation,
                );
                entry.rotationX = pitch;
                entry.rotationY = yaw;
                entry.rotationZ = roll;
            }
        }
    }

    return entry;
}

/**
 * Retrieves the current StructureViewModel for a specific asset branch,
 * falling back to `defaultViewModel` for anything not found in the tree.
 */
export function getStructureViewModel(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rootNode: any,
    assetId: string,
    defaultViewModel: StructureViewModel,
): StructureViewModel {
    const structureNode = findNodeInAssetBranch(rootNode, assetId, "structure");
    if (!structureNode) {
        return defaultViewModel;
    }

    const params: StructureViewModel = {
        ...defaultViewModel,
        type: structureNode.params?.type ?? defaultViewModel.type,
        block_header:
            structureNode.params?.block_header ?? defaultViewModel.block_header,
        block_index:
            structureNode.params?.block_index ?? defaultViewModel.block_index,
        model_index:
            structureNode.params?.model_index ?? defaultViewModel.model_index,
        coordinates_ref:
            structureNode.params?.coordinates_ref ??
            defaultViewModel.coordinates_ref,
        assembly_id:
            structureNode.params?.assembly_id ?? defaultViewModel.assembly_id,
        radius: structureNode.params?.radius ?? defaultViewModel.radius,
        ijk_min: structureNode.params?.ijk_min ?? defaultViewModel.ijk_min,
        ijk_max: structureNode.params?.ijk_max ?? defaultViewModel.ijk_max,
    };

    for (const child of structureNode.children || []) {
        if (child.kind === "label_from_uri")
            params.label_from_uri = child.params;
        if (child.kind === "label_from_source")
            params.label_from_source = child.params;
        if (child.kind === "tooltip_from_uri")
            params.tooltip_from_uri = child.params;
        if (child.kind === "tooltip_from_source")
            params.tooltip_from_source = child.params;

        if (child.kind === "transform" && child.params) {
            if (
                Array.isArray(child.params.translation) &&
                child.params.translation.length === 3
            ) {
                params.translationX = child.params.translation[0];
                params.translationY = child.params.translation[1];
                params.translationZ = child.params.translation[2];
            }
            if (
                Array.isArray(child.params.rotation) &&
                child.params.rotation.length === 9
            ) {
                const [pitch, yaw, roll] = getEulerAnglesFromMatrix3x3(
                    child.params.rotation,
                );
                params.rotationX = pitch;
                params.rotationY = yaw;
                params.rotationZ = roll;
            }
        }
    }

    const componentNodes = (structureNode.children || []).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) =>
            c.kind === "component" ||
            c.kind === "component_from_uri" ||
            c.kind === "component_from_source",
    );
    if (componentNodes.length > 0) {
        const defaultComponent = defaultViewModel.components[0];
        let componentIdCounter = 0;
        params.components = componentNodes.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (c: any) =>
                readComponentEntry(
                    c,
                    `component-${componentIdCounter++}`,
                    defaultComponent,
                ),
        );
    }

    return params;
}

/**
 * Retrieves the current VolumeViewModel for a specific asset branch.
 */
export function getVolumeViewModel(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rootNode: any,
    assetId: string,
    defaultViewModel: VolumeViewModel,
): VolumeViewModel {
    const params = { ...defaultViewModel };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function traverse(node: any, inBranch: boolean) {
        let currentInBranch = inBranch;
        if (node.kind === "download" && node.params?.url === assetId)
            currentInBranch = true;

        if (currentInBranch) {
            if (node.kind === "parse" && node.params?.format !== undefined)
                params.format = node.params.format;

            if (node.kind === "volume_representation" && node.params) {
                if (node.params.type !== undefined)
                    params.type = node.params.type;
                if (node.params.relative_isovalue !== undefined)
                    params.relative_isovalue = node.params.relative_isovalue;
                if (node.params.show_wireframe !== undefined)
                    params.show_wireframe = node.params.show_wireframe;
                if (node.params.show_faces !== undefined)
                    params.show_faces = node.params.show_faces;
            }
            if (node.kind === "color" && node.params?.color)
                params.color = node.params.color;
            if (node.kind === "opacity" && node.params?.opacity !== undefined)
                params.opacity = node.params.opacity;

            if (node.kind === "transform" && node.params) {
                if (
                    Array.isArray(node.params.translation) &&
                    node.params.translation.length === 3
                ) {
                    params.translationX = node.params.translation[0];
                    params.translationY = node.params.translation[1];
                    params.translationZ = node.params.translation[2];
                }
                if (
                    Array.isArray(node.params.rotation) &&
                    node.params.rotation.length === 9
                ) {
                    const [pitch, yaw, roll] = getEulerAnglesFromMatrix3x3(
                        node.params.rotation,
                    );
                    params.rotationX = pitch;
                    params.rotationY = yaw;
                    params.rotationZ = roll;
                }
            }
        }

        for (const child of node.children || [])
            traverse(child, currentInBranch);
    }

    traverse(rootNode, false);
    return params;
}
