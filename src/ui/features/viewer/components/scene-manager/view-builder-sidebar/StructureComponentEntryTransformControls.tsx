/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import type { ComponentEntry } from "../../../models/MvsViewModels";
import { TransformControls } from "./TransformControls";

type StructureComponentEntryTransformControlsProps = {
    component?: ComponentEntry;
    onUpdateStructureComponentParam: (
        componentId: string,
        paramKey: keyof ComponentEntry,
        val: ComponentEntry[keyof ComponentEntry],
        syncToMolstar: boolean,
    ) => Promise<void>;
};

export function StructureComponentEntryTransformControls(
    props: StructureComponentEntryTransformControlsProps,
) {
    // Render the component.
    return (
        <TransformControls
            translationX={props.component?.translationX ?? 0.0}
            translationY={props.component?.translationY ?? 0.0}
            translationZ={props.component?.translationZ ?? 0.0}
            rotationX={props.component?.rotationX ?? 0.0}
            rotationY={props.component?.rotationY ?? 0.0}
            rotationZ={props.component?.rotationZ ?? 0.0}
            onTranslationXChange={(val, sync) => {
                if (props.component)
                    props.onUpdateStructureComponentParam(
                        props.component.id,
                        "translationX",
                        val,
                        sync,
                    );
            }}
            onTranslationYChange={(val, sync) => {
                if (props.component)
                    props.onUpdateStructureComponentParam(
                        props.component.id,
                        "translationY",
                        val,
                        sync,
                    );
            }}
            onTranslationZChange={(val, sync) => {
                if (props.component)
                    props.onUpdateStructureComponentParam(
                        props.component.id,
                        "translationZ",
                        val,
                        sync,
                    );
            }}
            onRotationXChange={(val, sync) => {
                if (props.component)
                    props.onUpdateStructureComponentParam(
                        props.component.id,
                        "rotationX",
                        val,
                        sync,
                    );
            }}
            onRotationYChange={(val, sync) => {
                if (props.component)
                    props.onUpdateStructureComponentParam(
                        props.component.id,
                        "rotationY",
                        val,
                        sync,
                    );
            }}
            onRotationZChange={(val, sync) => {
                if (props.component)
                    props.onUpdateStructureComponentParam(
                        props.component.id,
                        "rotationZ",
                        val,
                        sync,
                    );
            }}
        ></TransformControls>
    );
}
