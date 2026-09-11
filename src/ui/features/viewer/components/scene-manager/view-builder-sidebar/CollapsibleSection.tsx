/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { Collapse } from "@mantine/core";
import { CollapseTrigger } from "../../../../../components/common/collapse-trigger/CollapseTriger";

type CollapsibleSectionProps = {
    title: string;
    titleTextSize?: "lg" | "xs" | "sm" | "md" | "xl";
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
};

/**
 * A section header (collapse trigger) paired with a collapsible body.
 * The expanded state is owned by the caller so it can be persisted.
 */
export const CollapsibleSection = (props: CollapsibleSectionProps) => (
    <>
        <CollapseTrigger
            title={props.title}
            titleTextSize={props.titleTextSize}
            expanded={props.expanded}
            onClick={props.onToggle}
        />
        <Collapse expanded={props.expanded}>{props.children}</Collapse>
    </>
);
