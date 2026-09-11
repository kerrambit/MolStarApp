/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useState } from "react";
import { Scroller, Tabs } from "@mantine/core";
import {
    selectorToString,
    type ComponentEntry,
} from "../../../models/MvsViewModels";
import { AssetBuilderCardSectionGroup } from "./AssetBuilderCardSectionGroup";
import { CollapsibleSection } from "./CollapsibleSection";
import { ComponentSelectorSection } from "./ComponentSelectorSection";
import { ComponentRepresentationSection } from "./ComponentRepresentationSection";
import { ComponentTooltipsAndLabelsSection } from "./ComponentTooltipsAndLabelsSection";
import { ComponentFocusSection } from "./ComponentFocusSection";
import { StructureComponentEntryTransformControls } from "./StructureComponentEntryTransformControls";
import { UiLocalStorageService } from "../../../../../services/UiLocalStorageService";
import type {
    UpdateComponentFields,
    UpdateComponentParam,
} from "./structureTabHelpers";
import { ComponentEntryTabContent } from "./ComponentEntryTabContent";
import { useAppearance } from "../../../../../hooks/useAppearance";

type ComponentsSectionProps = {
    viewKey: string;
    asset: ManagedAsset;
    components: ComponentEntry[];
    onUpdateStructureComponentParam: UpdateComponentParam;
    onUpdateStructureComponentFields: UpdateComponentFields;
    onAddStructureComponent: () => Promise<string>;
    onDeleteStructureComponent: (componentId: string) => Promise<void>;
};

/**
 * The "Components" section of the structure tab: a tab per component plus the
 * per-component subsections (selector, representation, tooltips & labels,
 * focus and transform).
 */
export function ComponentsSection({
    viewKey,
    asset,
    components,
    onUpdateStructureComponentParam,
    onUpdateStructureComponentFields,
    onAddStructureComponent,
    onDeleteStructureComponent,
}: ComponentsSectionProps) {
    // Use apperance.
    const colorScheme = useAppearance().colorScheme;

    // Active component tab; falls back to the first available component.
    const [currentComponentId, setCurrentComponentId] = useState<
        string | undefined
    >();

    const activeComponentId =
        currentComponentId &&
        components.some((c) => c.id === currentComponentId)
            ? currentComponentId
            : components.at(0)?.id;

    const currentComponent = components.find(
        (component) => component.id === activeComponentId,
    );

    // UI sections expanded states.
    const [componentsSectionExpanded, setComponentsSectionExpanded] = useState(
        () => {
            if (!activeComponentId) return true;
            return UiLocalStorageService.ViewBuilder.getExpandedStructureComponentsSection(
                asset.id,
                viewKey,
                activeComponentId,
            );
        },
    );

    const [
        componentRepresentationSectionExpanded,
        setComponentRepresentationSectionExpanded,
    ] = useState(() => {
        if (!activeComponentId) return false;
        return UiLocalStorageService.ViewBuilder.getExpandedStructureComponentRepresentationSection(
            asset.id,
            viewKey,
            activeComponentId,
        );
    });

    const [
        componentTooltipsAndLabelsSectionExpanded,
        setComponentTooltipsAndLabelsSectionExpanded,
    ] = useState(() => {
        if (!activeComponentId) return false;
        return UiLocalStorageService.ViewBuilder.getExpandedStructureComponentTooltipsAndLabelsSection(
            asset.id,
            viewKey,
            activeComponentId,
        );
    });

    const [componentFocusSectionExpanded, setComponentFocusSectionExpanded] =
        useState(() => {
            if (!activeComponentId) return false;
            return UiLocalStorageService.ViewBuilder.getExpandedStructureComponentFocusSection(
                asset.id,
                viewKey,
                activeComponentId,
            );
        });

    const [
        componentTransformSectionExpanded,
        setComponentTransformSectionExpanded,
    ] = useState(() => {
        if (!activeComponentId) return false;
        return UiLocalStorageService.ViewBuilder.getExpandedStructureComponentTransformSection(
            asset.id,
            viewKey,
            activeComponentId,
        );
    });

    // Toggle a per-component section and persist its state.
    const toggleComponentSection = (
        setter: React.Dispatch<React.SetStateAction<boolean>>,
        persist: (expanded: boolean) => void,
    ) => {
        setter((prev) => {
            const nextState = !prev;
            if (activeComponentId) persist(nextState);
            return nextState;
        });
    };

    // Render the component.
    return (
        <CollapsibleSection
            title="Components"
            titleTextSize="md"
            expanded={componentsSectionExpanded}
            onToggle={() =>
                toggleComponentSection(
                    setComponentsSectionExpanded,
                    (nextState) =>
                        UiLocalStorageService.ViewBuilder.setExpandedStructureComponentsSection(
                            asset.id,
                            viewKey,
                            activeComponentId!,
                            nextState,
                        ),
                )
            }
        >
            <AssetBuilderCardSectionGroup divider={false}>
                <Tabs
                    value={activeComponentId || null}
                    color={
                        colorScheme === "dark"
                            ? "var(--mantine-primary-color-7)"
                            : "var(--mantine-primary-color-5)"
                    }
                    onChange={(value) => {
                        if (!value) {
                            return;
                        }
                        if (value === "+") {
                            onAddStructureComponent().then((newId) => {
                                setCurrentComponentId(newId);
                            });
                            return;
                        }
                        setCurrentComponentId(value);
                    }}
                >
                    <Tabs.List>
                        <Scroller>
                            <Tabs.Tab
                                key={"+"}
                                value={"+"}
                                title="Add new component."
                            >
                                <b>+</b>
                            </Tabs.Tab>
                            {components.map((component) => (
                                <Tabs.Tab
                                    key={component.id}
                                    value={component.id}
                                    title={`${selectorToString(
                                        component.selector,
                                        false,
                                    )}`}
                                >
                                    <ComponentEntryTabContent
                                        component={component}
                                        onDeleteStructureComponent={
                                            onDeleteStructureComponent
                                        }
                                    />
                                </Tabs.Tab>
                            ))}
                        </Scroller>
                    </Tabs.List>
                </Tabs>

                <ComponentSelectorSection
                    component={currentComponent}
                    onUpdateStructureComponentParam={
                        onUpdateStructureComponentParam
                    }
                />

                <CollapsibleSection
                    title="Representation"
                    titleTextSize="md"
                    expanded={componentRepresentationSectionExpanded}
                    onToggle={() =>
                        toggleComponentSection(
                            setComponentRepresentationSectionExpanded,
                            (nextState) =>
                                UiLocalStorageService.ViewBuilder.setExpandedStructureComponentRepresentationSection(
                                    asset.id,
                                    viewKey,
                                    activeComponentId!,
                                    nextState,
                                ),
                        )
                    }
                >
                    <ComponentRepresentationSection
                        component={currentComponent}
                        activeComponentId={activeComponentId}
                        onUpdateStructureComponentParam={
                            onUpdateStructureComponentParam
                        }
                        onUpdateStructureComponentFields={
                            onUpdateStructureComponentFields
                        }
                    />
                </CollapsibleSection>

                <CollapsibleSection
                    title="Tooltips & Labels"
                    titleTextSize="md"
                    expanded={componentTooltipsAndLabelsSectionExpanded}
                    onToggle={() =>
                        toggleComponentSection(
                            setComponentTooltipsAndLabelsSectionExpanded,
                            (nextState) =>
                                UiLocalStorageService.ViewBuilder.setExpandedStructureComponentTooltipsAndLabelsSection(
                                    asset.id,
                                    viewKey,
                                    activeComponentId!,
                                    nextState,
                                ),
                        )
                    }
                >
                    <ComponentTooltipsAndLabelsSection
                        component={currentComponent}
                        activeComponentId={activeComponentId}
                        onUpdateStructureComponentParam={
                            onUpdateStructureComponentParam
                        }
                    />
                </CollapsibleSection>

                <CollapsibleSection
                    title="Focus"
                    titleTextSize="md"
                    expanded={componentFocusSectionExpanded}
                    onToggle={() =>
                        toggleComponentSection(
                            setComponentFocusSectionExpanded,
                            (nextState) =>
                                UiLocalStorageService.ViewBuilder.setExpandedStructureComponentFocusSection(
                                    asset.id,
                                    viewKey,
                                    activeComponentId!,
                                    nextState,
                                ),
                        )
                    }
                >
                    <ComponentFocusSection
                        component={currentComponent}
                        activeComponentId={activeComponentId}
                        onUpdateStructureComponentParam={
                            onUpdateStructureComponentParam
                        }
                    />
                </CollapsibleSection>

                <CollapsibleSection
                    title="Transform"
                    titleTextSize="md"
                    expanded={componentTransformSectionExpanded}
                    onToggle={() =>
                        toggleComponentSection(
                            setComponentTransformSectionExpanded,
                            (nextState) =>
                                UiLocalStorageService.ViewBuilder.setExpandedStructureComponentTransformSection(
                                    asset.id,
                                    viewKey,
                                    activeComponentId!,
                                    nextState,
                                ),
                        )
                    }
                >
                    <StructureComponentEntryTransformControls
                        component={currentComponent}
                        onUpdateStructureComponentParam={
                            onUpdateStructureComponentParam
                        }
                    />
                </CollapsibleSection>
            </AssetBuilderCardSectionGroup>
        </CollapsibleSection>
    );
}
