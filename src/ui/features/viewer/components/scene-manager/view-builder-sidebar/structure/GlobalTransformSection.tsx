/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import type { StructureViewModel } from "../../../../models/MvsViewModels";
import { StructureTransformControls } from "./StructureTransformControls";
import type { UpdateViewModelParam } from "./structureTabHelpers";

type GlobalTransformSectionProps = {
    viewModel: StructureViewModel;
    onUpdateParam: UpdateViewModelParam;
};

/**
 * Global transform controls for the whole structure.
 */
export function GlobalTransformSection({
    viewModel,
    onUpdateParam,
}: GlobalTransformSectionProps) {
    return (
        <StructureTransformControls
            viewModel={viewModel}
            onUpdateParam={onUpdateParam}
        />
    );
}
