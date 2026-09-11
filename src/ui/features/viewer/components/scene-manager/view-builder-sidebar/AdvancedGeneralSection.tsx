/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { NumberInput, TextInput } from "@mantine/core";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";
import { IJKControls } from "./IJKControls";
import type { UpdateViewModelParam } from "./structureTabHelpers";
import type { StructureViewModel } from "../../../models/MvsViewModels";

type AdvancedGeneralSectionProps = {
    viewModel: StructureViewModel;
    onUpdateParam: UpdateViewModelParam;
};

/**
 * Advanced options of the structure general section: block/model indices,
 * coordinates reference and type-specific fields.
 */
export function AdvancedGeneralSection({
    viewModel,
    onUpdateParam,
}: AdvancedGeneralSectionProps) {
    // Generic string field bound to a viewModel key.
    const renderTextField = (
        label: string,
        key: keyof StructureViewModel,
        value: string | undefined,
    ) => (
        <TextInput
            label={label}
            value={value || undefined}
            placeholder="null"
            size="xs"
            onChange={(val) =>
                typeof val === "string" && onUpdateParam(key, val, false)
            }
            onBlur={() => onUpdateParam(key, value, true)}
            onKeyDown={(e) =>
                e.key === "Enter" && onUpdateParam(key, value, true)
            }
        />
    );

    // Generic number field bound to a viewModel key.
    const renderNumberField = (
        label: string,
        key: keyof StructureViewModel,
        value: number | undefined,
    ) => (
        <NumberInput
            label={label}
            value={value}
            size="xs"
            onChange={(val) =>
                typeof val === "number" && onUpdateParam(key, val, false)
            }
            onBlur={() => onUpdateParam(key, value, true)}
            onKeyDown={(e) =>
                e.key === "Enter" && onUpdateParam(key, value, true)
            }
        />
    );

    // Render the component.
    return (
        <AssetBuilderCardSectionGroup gap="0.25em" divider={false}>
            {renderTextField(
                "Block header",
                "block_header",
                viewModel.block_header,
            )}
            {renderNumberField(
                "Block index",
                "block_index",
                viewModel.block_index,
            )}
            {renderNumberField(
                "Model index",
                "model_index",
                viewModel.model_index,
            )}
            {renderTextField(
                "Coordinates reference",
                "coordinates_ref",
                viewModel.coordinates_ref,
            )}
            {viewModel.type === "assembly" &&
                renderTextField(
                    "Assembly Id",
                    "assembly_id",
                    viewModel.assembly_id,
                )}
            {viewModel.type === "symmetry_mates" &&
                renderNumberField("Radius", "radius", viewModel.radius)}
            {viewModel.type === "symmetry" && (
                <IJKControls
                    viewModel={viewModel}
                    onUpdateParam={onUpdateParam}
                />
            )}
        </AssetBuilderCardSectionGroup>
    );
}
