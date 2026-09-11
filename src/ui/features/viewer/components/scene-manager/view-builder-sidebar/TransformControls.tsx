/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { Text } from "@mantine/core";
import { SliderInputGroup } from "../../../../../components/common/slider-input-group/SliderInputGroup";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";

type TransformControlsProps = {
    translationX: number;
    translationY: number;
    translationZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    onTranslationXChange: (val: number, sync: boolean) => void;
    onTranslationYChange: (val: number, sync: boolean) => void;
    onTranslationZChange: (val: number, sync: boolean) => void;
    onRotationXChange: (val: number, sync: boolean) => void;
    onRotationYChange: (val: number, sync: boolean) => void;
    onRotationZChange: (val: number, sync: boolean) => void;
};

// TODO: set these in settings
const TRANSLATION_MIN = -100;
const TRANSLATION_MAX = 100;
const ROTATION_MIN = -180;
const ROTATION_MAX = 180;

export function TransformControls(props: TransformControlsProps) {
    return (
        <AssetBuilderCardSectionGroup divider={false}>
            <AssetBuilderCardSectionGroup
                gap={"0.25em"}
                bottomMargin="xs"
                topMargin="xs"
            >
                <Text fw={550} size="sm" mb="xs">
                    Translation (Å)
                </Text>
                <SliderInputGroup
                    label="X axis"
                    labelColor="red"
                    value={props.translationX}
                    sliderMin={TRANSLATION_MIN}
                    sliderMax={TRANSLATION_MAX}
                    sliderStep={0.5}
                    textInputStep={0.5}
                    onChange={(val: number) =>
                        props.onTranslationXChange(val, false)
                    }
                    onChangeEnd={(val: number) =>
                        props.onTranslationXChange(val, true)
                    }
                />
                <SliderInputGroup
                    label="Y axis"
                    labelColor="green"
                    value={props.translationY}
                    sliderMin={TRANSLATION_MIN}
                    sliderMax={TRANSLATION_MAX}
                    sliderStep={0.5}
                    textInputStep={0.5}
                    onChange={(val: number) =>
                        props.onTranslationYChange(val, false)
                    }
                    onChangeEnd={(val: number) =>
                        props.onTranslationYChange(val, true)
                    }
                />
                <SliderInputGroup
                    label="Z axis"
                    labelColor="blue"
                    value={props.translationZ}
                    sliderMin={TRANSLATION_MIN}
                    sliderMax={TRANSLATION_MAX}
                    sliderStep={0.5}
                    textInputStep={0.5}
                    onChange={(val: number) =>
                        props.onTranslationZChange(val, false)
                    }
                    onChangeEnd={(val: number) =>
                        props.onTranslationZChange(val, true)
                    }
                />
            </AssetBuilderCardSectionGroup>

            <AssetBuilderCardSectionGroup
                divider={false}
                gap={"0.25em"}
                bottomMargin="xs"
                topMargin="xs"
            >
                <Text fw={550} size="sm" mb="xs">
                    Rotation Angles (°)
                </Text>
                <SliderInputGroup
                    label="Pitch (X)"
                    labelColor="red"
                    value={props.rotationX}
                    sliderMin={ROTATION_MIN}
                    sliderMax={ROTATION_MAX}
                    sliderStep={1}
                    textInputStep={1}
                    onChange={(val: number) =>
                        props.onRotationXChange(val, false)
                    }
                    onChangeEnd={(val: number) =>
                        props.onRotationXChange(val, true)
                    }
                />
                <SliderInputGroup
                    label="Yaw (Y)"
                    labelColor="green"
                    value={props.rotationY}
                    sliderMin={ROTATION_MIN}
                    sliderMax={ROTATION_MAX}
                    sliderStep={1}
                    textInputStep={1}
                    onChange={(val: number) =>
                        props.onRotationYChange(val, false)
                    }
                    onChangeEnd={(val: number) =>
                        props.onRotationYChange(val, true)
                    }
                />
                <SliderInputGroup
                    label="Roll (Z)"
                    labelColor="blue"
                    value={props.rotationZ}
                    sliderMin={ROTATION_MIN}
                    sliderMax={ROTATION_MAX}
                    sliderStep={1}
                    textInputStep={1}
                    onChange={(val: number) =>
                        props.onRotationZChange(val, false)
                    }
                    onChangeEnd={(val: number) =>
                        props.onRotationZChange(val, true)
                    }
                />
            </AssetBuilderCardSectionGroup>
        </AssetBuilderCardSectionGroup>
    );
}
