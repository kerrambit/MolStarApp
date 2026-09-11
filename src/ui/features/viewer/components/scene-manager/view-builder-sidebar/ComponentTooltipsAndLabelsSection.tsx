/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { TextInput } from "@mantine/core";
import type { ComponentEntry } from "../../../models/MvsViewModels";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";
import type { UpdateComponentParam } from "./structureTabHelpers";

type ComponentTooltipsAndLabelsSectionProps = {
    component?: ComponentEntry;
    activeComponentId?: string;
    onUpdateStructureComponentParam: UpdateComponentParam;
};

/**
 * Component tooltips & labels subsection: inline label and tooltip text.
 */
export function ComponentTooltipsAndLabelsSection({
    component,
    activeComponentId,
    onUpdateStructureComponentParam,
}: ComponentTooltipsAndLabelsSectionProps) {
    // Render the component.
    return (
        <AssetBuilderCardSectionGroup>
            <TextInput
                label="Label"
                placeholder="Text to display next to the component"
                value={component?.label || ""}
                size="xs"
                onChange={(e) => {
                    if (activeComponentId)
                        onUpdateStructureComponentParam(
                            activeComponentId,
                            "label",
                            e.currentTarget.value,
                            false,
                        );
                }}
                onBlur={(e) => {
                    if (activeComponentId)
                        onUpdateStructureComponentParam(
                            activeComponentId,
                            "label",
                            e.currentTarget.value,
                            true,
                        );
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && activeComponentId)
                        onUpdateStructureComponentParam(
                            activeComponentId,
                            "label",
                            e.currentTarget.value,
                            true,
                        );
                }}
            />
            <TextInput
                label="Tooltip"
                placeholder="Text to show on hover"
                value={component?.tooltip || ""}
                size="xs"
                onChange={(e) => {
                    if (activeComponentId)
                        onUpdateStructureComponentParam(
                            activeComponentId,
                            "tooltip",
                            e.currentTarget.value,
                            false,
                        );
                }}
                onBlur={(e) => {
                    if (activeComponentId)
                        onUpdateStructureComponentParam(
                            activeComponentId,
                            "tooltip",
                            e.currentTarget.value,
                            true,
                        );
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && activeComponentId)
                        onUpdateStructureComponentParam(
                            activeComponentId,
                            "tooltip",
                            e.currentTarget.value,
                            true,
                        );
                }}
            />
        </AssetBuilderCardSectionGroup>
    );
}
