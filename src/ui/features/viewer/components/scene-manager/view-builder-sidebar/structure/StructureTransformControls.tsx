/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import type { StructureViewModel } from "../../../../models/MvsViewModels";
import { TransformControls } from "../TransformControls";

type StructureTransformControlsProps = {
    viewModel: StructureViewModel;
    onUpdateParam: (
        key: keyof StructureViewModel,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        val: any,
        sync: boolean,
    ) => void;
};

export function StructureTransformControls(
    props: StructureTransformControlsProps,
) {
    // Render the view model.
    return (
        <TransformControls
            translationX={props.viewModel?.translationX ?? 0.0}
            translationY={props.viewModel?.translationY ?? 0.0}
            translationZ={props.viewModel?.translationZ ?? 0.0}
            rotationX={props.viewModel?.rotationX ?? 0.0}
            rotationY={props.viewModel?.rotationY ?? 0.0}
            rotationZ={props.viewModel?.rotationZ ?? 0.0}
            onTranslationXChange={(val, sync) => {
                if (props.viewModel)
                    props.onUpdateParam("translationX", val, sync);
            }}
            onTranslationYChange={(val, sync) => {
                if (props.viewModel)
                    props.onUpdateParam("translationY", val, sync);
            }}
            onTranslationZChange={(val, sync) => {
                if (props.viewModel)
                    props.onUpdateParam("translationZ", val, sync);
            }}
            onRotationXChange={(val, sync) => {
                if (props.viewModel)
                    props.onUpdateParam("rotationX", val, sync);
            }}
            onRotationYChange={(val, sync) => {
                if (props.viewModel)
                    props.onUpdateParam("rotationY", val, sync);
            }}
            onRotationZChange={(val, sync) => {
                if (props.viewModel)
                    props.onUpdateParam("rotationZ", val, sync);
            }}
        ></TransformControls>
    );
}
