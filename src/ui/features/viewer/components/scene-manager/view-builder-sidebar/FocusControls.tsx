/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { Text, Group, NumberInput, Stack } from "@mantine/core";
import type { ComponentEntry } from "../../../models/MvsViewModels";

type FocusControlsProps = {
    component?: ComponentEntry;
    enable?: boolean;
    onUpdateParam: (
        component: string,
        key: keyof ComponentEntry,
        val: ComponentEntry[keyof ComponentEntry],
        sync: boolean,
    ) => void;
};

export function FocusControls(props: FocusControlsProps) {
    const enabled = props.enable ?? "true";

    // Handler for update.
    const handleUpdate = (
        key: "focus_direction" | "focus_up",
        index: 0 | 1 | 2,
        val: number | string,
        sync: boolean,
    ) => {
        if (!props.component || !enabled) {
            return;
        }

        const numVal = typeof val === "number" ? val : 0;
        const newTuple = [...props.component[key]] as [number, number, number];
        newTuple[index] = numVal;
        props.onUpdateParam(props.component.id, key, newTuple, sync);
    };

    // Render the component.
    return (
        <Stack gap="sm" style={{ marginTop: "0.75em", paddingLeft: "0.25em" }}>
            {/* Focus direction. */}
            <Group wrap="nowrap" align="center" gap="md" w="100%">
                <Text fw={600} size="xs" w={60}>
                    Focus direction
                </Text>
                <Group wrap="nowrap" grow style={{ flex: 1 }} gap="xs">
                    {[0, 1, 2].map((idx) => (
                        <NumberInput
                            key={`min-${idx}`}
                            value={
                                props.component?.focus_direction[
                                    idx as 0 | 1 | 2
                                ] ?? (idx === 2 ? "-1.0" : "0.0")
                            }
                            disabled={!enabled}
                            size="xs"
                            onChange={(val) =>
                                handleUpdate(
                                    "focus_direction",
                                    idx as 0 | 1 | 2,
                                    val,
                                    false,
                                )
                            }
                            onBlur={() =>
                                handleUpdate(
                                    "focus_direction",
                                    idx as 0 | 1 | 2,
                                    props.component?.focus_direction[
                                        idx as 0 | 1 | 2
                                    ] ?? (idx === 2 ? "-1.0" : "0.0"),
                                    true,
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleUpdate(
                                        "focus_direction",
                                        idx as 0 | 1 | 2,
                                        props.component?.focus_direction[
                                            idx as 0 | 1 | 2
                                        ] ?? (idx === 2 ? "-1.0" : "0.0"),
                                        true,
                                    );
                                }
                            }}
                        />
                    ))}
                </Group>
            </Group>

            {/* Focus up. */}
            <Group wrap="nowrap" align="center" gap="md" w="100%">
                <Text fw={550} size="xs" w={60}>
                    Focus up
                </Text>
                <Group wrap="nowrap" grow style={{ flex: 1 }} gap="xs">
                    {[0, 1, 2].map((idx) => (
                        <NumberInput
                            key={`max-${idx}`}
                            value={
                                props.component?.focus_up[idx as 0 | 1 | 2] ??
                                (idx === 1 ? "1.0" : "0.0")
                            }
                            disabled={!enabled}
                            size="xs"
                            onChange={(val) =>
                                handleUpdate(
                                    "focus_up",
                                    idx as 0 | 1 | 2,
                                    val,
                                    false,
                                )
                            }
                            onBlur={() =>
                                handleUpdate(
                                    "focus_up",
                                    idx as 0 | 1 | 2,
                                    props.component?.focus_up[
                                        idx as 0 | 1 | 2
                                    ] ?? (idx === 1 ? "1.0" : "0.0"),
                                    true,
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleUpdate(
                                        "focus_up",
                                        idx as 0 | 1 | 2,
                                        props.component?.focus_up[
                                            idx as 0 | 1 | 2
                                        ] ?? (idx === 1 ? "1.0" : "0.0"),
                                        true,
                                    );
                                }
                            }}
                        />
                    ))}
                </Group>
            </Group>
        </Stack>
    );
}
