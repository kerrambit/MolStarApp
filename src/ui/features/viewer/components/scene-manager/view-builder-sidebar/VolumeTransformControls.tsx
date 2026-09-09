/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import type { VolumeViewModel } from "../../../models/MvsViewModels";
import { TransformControls } from "./TransformControls";

type VolumeTransformControlsProps = {
    viewModel: VolumeViewModel;
    onUpdateParam: (
        key: keyof VolumeViewModel,
        val: VolumeViewModel[keyof VolumeViewModel],
        sync: boolean,
    ) => void;
};

export function VolumeTransformControls(props: VolumeTransformControlsProps) {
    // Render the component.
    return (
        <TransformControls
            translationX={props.viewModel.translationX}
            translationY={props.viewModel.translationY}
            translationZ={props.viewModel.translationZ}
            rotationX={props.viewModel.rotationX}
            rotationY={props.viewModel.rotationY}
            rotationZ={props.viewModel.rotationZ}
            onTranslationXChange={(val, sync) => {
                props.onUpdateParam("translationX", val, sync);
            }}
            onTranslationYChange={(val, sync) => {
                props.onUpdateParam("translationY", val, sync);
            }}
            onTranslationZChange={(val, sync) => {
                props.onUpdateParam("translationZ", val, sync);
            }}
            onRotationXChange={(val, sync) => {
                props.onUpdateParam("rotationX", val, sync);
            }}
            onRotationYChange={(val, sync) => {
                props.onUpdateParam("rotationY", val, sync);
            }}
            onRotationZChange={(val, sync) => {
                props.onUpdateParam("rotationZ", val, sync);
            }}
        ></TransformControls>
    );
}
