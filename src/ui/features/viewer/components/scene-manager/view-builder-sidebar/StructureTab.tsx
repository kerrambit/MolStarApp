/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { GeneralSection } from "./GeneralSection";
import { ComponentsSection } from "./ComponentsSection";
import type { StructureViewModel } from "../../../models/MvsViewModels";
import type {
    UpdateComponentFields,
    UpdateComponentParam,
    UpdateViewModelFields,
    UpdateViewModelParam,
} from "./structureTabHelpers";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";

type StructureTabProps = {
    viewKey: string;
    asset: ManagedAsset;
    viewModel: StructureViewModel;
    onUpdateParam: UpdateViewModelParam;
    onUpdateStructureComponentParam: UpdateComponentParam;
    onUpdateFields: UpdateViewModelFields;
    onUpdateStructureComponentFields: UpdateComponentFields;
    onAddStructureComponent: () => Promise<string>;
    onDeleteStructureComponent: (componentId: string) => Promise<void>;
};

/**
 * The structure tab of the view builder sidebar, composed of the "General" and "Components" sections.
 */
export function StructureTab({
    viewKey,
    asset,
    viewModel,
    onUpdateParam,
    onUpdateStructureComponentParam,
    onUpdateFields,
    onUpdateStructureComponentFields,
    onAddStructureComponent,
    onDeleteStructureComponent,
}: StructureTabProps) {
    // Render the component.
    return (
        <AssetBuilderCardSectionGroup divider={false}>
            <GeneralSection
                viewKey={viewKey}
                asset={asset}
                viewModel={viewModel}
                onUpdateParam={onUpdateParam}
                onUpdateFields={onUpdateFields}
            />

            <ComponentsSection
                viewKey={viewKey}
                asset={asset}
                components={viewModel.components}
                onUpdateStructureComponentParam={
                    onUpdateStructureComponentParam
                }
                onUpdateStructureComponentFields={
                    onUpdateStructureComponentFields
                }
                onAddStructureComponent={onAddStructureComponent}
                onDeleteStructureComponent={onDeleteStructureComponent}
            />
        </AssetBuilderCardSectionGroup>
    );
}
