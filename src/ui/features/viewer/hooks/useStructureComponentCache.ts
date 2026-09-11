/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useCallback } from "react";
import { UiLocalStorageService } from "../../../services/UiLocalStorageService";

export type ComponentCacheAccessor = {
    readCache: (key: string) => unknown;
    writeCache: (key: string, value: unknown) => void;
    removeCache: (key: string) => void;
};

/**
 * Access to a per-component localStorage cache used to stash the state of a
 * mode (e.g. expression selector, color-from-URI) the user is switching away
 * from, so it can be restored when switching back. Reads/merges are done
 * fresh on each call so multiple sections sharing the same component cache
 * do not overwrite each other.
 */
export function useStructureComponentCache(
    assetId: string,
    viewKey: string,
    componentId: string | undefined,
): ComponentCacheAccessor {
    const getCache = useCallback((): Record<string, unknown> => {
        if (!componentId) return {};
        return UiLocalStorageService.ViewBuilder.getStructureComponentCache(
            assetId,
            viewKey,
            componentId,
        );
    }, [assetId, viewKey, componentId]);

    const saveCache = useCallback(
        (cache: Record<string, unknown>) => {
            if (!componentId) return;
            UiLocalStorageService.ViewBuilder.setStructureComponentCache(
                assetId,
                viewKey,
                componentId,
                cache,
            );
        },
        [assetId, viewKey, componentId],
    );

    const readCache = useCallback(
        (key: string): unknown => getCache()[key],
        [getCache],
    );

    const writeCache = useCallback(
        (key: string, value: unknown): void => {
            saveCache({ ...getCache(), [key]: value });
        },
        [getCache, saveCache],
    );

    const removeCache = useCallback(
        (key: string): void => {
            const cache = getCache();
            delete cache[key];
            saveCache(cache);
        },
        [getCache, saveCache],
    );

    return { readCache, writeCache, removeCache };
}
