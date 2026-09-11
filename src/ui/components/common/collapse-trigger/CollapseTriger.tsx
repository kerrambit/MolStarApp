/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

type CollapseTriggerProps = {
    title: string;
    titleTextSize?: "lg" | "xs" | "sm" | "md" | "xl";
    expanded: boolean;
    onClick?: () => void;
};

export function CollapseTrigger(props: CollapseTriggerProps) {
    return (
        <UnstyledButton
            onClick={props.onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--mantine-spacing-xs)",
                cursor: "pointer",
                userSelect: "none",
            }}
        >
            <Text size={props.titleTextSize}>{props.title}</Text>
            {props.expanded ? (
                <IconChevronUp size={16} style={{ opacity: 0.7 }} />
            ) : (
                <IconChevronDown size={16} style={{ opacity: 0.7 }} />
            )}
        </UnstyledButton>
    );
}
