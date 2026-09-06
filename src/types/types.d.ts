/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

/**
 * Helper type to make payloads optional if they are typed as 'void'.
 */
type Args<T> = T extends void ? [] : [payload: T];

/**
 * Unsubscribe function.
 */
type UnsubscribeFunction = () => void;

/**
 * Unified single source of truth for all IPC channels.
 * Defines the parameters, expected return values, and communication behavior.
 */
type IpcApiChannelMap = {
    requestUserSettings: { args: []; reply: UserSettings; type: "sync" };

    requestBuildInformation: {
        args: [];
        reply: BuildInformation;
        type: "sync";
    };

    requestApplicationExit: { args: []; reply: void; type: "invoke" };

    requestToOpenDevTools: { args: []; reply: void; type: "send" };

    requestEnvironment: { args: []; reply: Environment; type: "sync" };

    requestToOpenUserDataFolder: {
        args: [];
        reply: void | Error;
        type: "invoke";
    };

    getRecentFiles: { args: []; reply: string[]; type: "sync" };

    openFileExplorer: {
        args: [multiSelections: boolean, filters: FileFilter[]];
        reply: FileData[] | Error;
        type: "invoke";
    };

    getFileData: {
        args: [paths: string[]];
        reply: FileData[] | Error;
        type: "invoke";
    };

    saveData: {
        args: [data: ArrayBuffer, path: string];
        reply: void | Error;
        type: "invoke";
    };

    saveTemporaryData: {
        args: [data: ArrayBuffer, path: string];
        reply: void | Error;
        type: "invoke";
    };

    requestToOpenExternal: { args: [url: string]; reply: void; type: "send" };

    changeUserSettings: {
        args: [settings: UserSettings];
        reply: void;
        type: "send";
    };

    addRecentFile: { args: [path: string]; reply: void; type: "send" };

    checkForUpdates: {
        args: [];
        reply: {
            version: string;
            releaseDate: string;
        } | null;
        type: "invoke";
    };
};

/**
 * Automatically builds the Window["electron"] method signatures directly from `IpcApiChannelMap` configuration.
 */
type DeriveElectronApi<
    T extends Record<
        string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { args: any[]; reply: any; type: "invoke" | "sync" | "send" }
    >,
> = {
    [K in keyof T]: T[K]["type"] extends "invoke"
        ? (...args: T[K]["args"]) => Promise<T[K]["reply"]>
        : T[K]["type"] extends "sync"
        ? (...args: T[K]["args"]) => T[K]["reply"]
        : (...args: T[K]["args"]) => void;
};

/**
 * Interface `Window`.
 */
interface Window {
    electron: DeriveElectronApi<IpcApiChannelMap>;
}

type FileFilter = {
    name: string;
    extensions: string[];
};

type Environment = {
    isDev: boolean;
    userDataPath: string;
};

interface FileData {
    /**
     * The whole complete file path, e.g. "/home/user/data/tmp/emd_53130_r2_tf0.cif".
     */
    path: string;
    /**
     * Extension without dot, e.g. "cif".
     */
    extension: string;
    /**
     * Name of the file with extension "emd_53130_r2_tf0.cif".
     */
    // TODO: remove extension from here
    name: string;
    /**
     * Flag if the file is binary or not.
     */
    binary: boolean;
    /**
     * Content of the file.
     */
    content: string | Uint8Array<ArrayBuffer>;
}

interface SaveDataPackage {
    data: ArrayBuffer;
    path: string;
}

type Language = "en" | "de";

type UserSettings = {
    lang: Language;
    preferredServerPort: number;
    serverPort: number;
    colorScheme: "light" | "dark";
    colorTheme:
        | "ocean"
        | "forest"
        | "sunset"
        | "royal"
        | "crimson"
        | "golden"
        | "teal"
        | "lavender"
        | "charcoal"
        | "sky"
        | "emerald"
        | "amber";
};

type TranslateFunction = TFunction<"translation", undefined>;

interface BuildInformation {
    app: string;
    appVersion: string;
    commit: string;
    buildDate: string;
    electron: string;
    chrome: string;
    node: string;
    platform: string;
    arch: string;
    osRelease: string;
    molstarVersion: string;
    volsegtoolsVersion: string;
}

/**
 * Type Url based on Molstar's Asset.Url type.
 */
type Url = {
    kind: "url";
    id: UUID;
    url: string;
    title?: string;
    body?: string;
    headers?: Record<string, string>;
};

type AssetId = string;

/**
 * Object mirroring Assets as managed by Molstar Asset Manager.
 */
interface ManagedAsset {
    /**
     * Id of the managed assset, which does not change through the app lifetime.
     */
    id: AssetId;

    /**
     * All managed assets are of type `Url`, that is because remotes are URL always,
     * and local files are converted into assets in the form of `arcp` protocol and thus available via URL, too.
     */
    asset: Url;

    /**
     * Relative path inside MVSX archive. E.g. "volume.bcif" or "volumes/volume.bcif".
     * For `remote` ManagedAsset it is same as `asset.url`.
     */
    relativePath: string;

    /**
     * Mirrors Molstar Asset Manager function `set()` and its parameter `isStatic` (true value is "local").
     */
    tag: "local" | "remote";

    /**
     * Only the name of the file with its extension.
     * For `remote` ManagedAsset it is same as `asset.url`.
     */
    name: string;

    /**
     * Number of times this asset is referenced across all views.
     */
    useCount: number;

    /**
     * Determines how the data will be parsed and handled, usually mirrors extension from the `name`. Special value `unknown` tells that extension could not be detected from `name`.
     */
    extension: string;
}
