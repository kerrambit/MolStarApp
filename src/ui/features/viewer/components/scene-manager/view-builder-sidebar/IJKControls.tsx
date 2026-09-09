/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { Text, Group, NumberInput, Stack } from "@mantine/core";
import type { StructureViewModel } from "../../../models/MvsViewModels";

type IJKControlsProps = {
    viewModel: StructureViewModel;
    onUpdateParam: (
        key: keyof StructureViewModel,
        val: StructureViewModel[keyof StructureViewModel],
        sync: boolean,
    ) => void;
};

export function IJKControls(props: IJKControlsProps) {
    const handleUpdate = (
        key: "ijk_min" | "ijk_max",
        index: 0 | 1 | 2,
        val: number | string,
        sync: boolean,
    ) => {
        const numVal = typeof val === "number" ? val : 0;
        const newTuple = [...props.viewModel[key]] as [number, number, number];
        newTuple[index] = numVal;
        props.onUpdateParam(key, newTuple, sync);
    };

    // Render the component.
    return (
        <Stack gap="sm" style={{ marginTop: "0.75em", paddingLeft: "0.25em" }}>
            {/* IJK minimal. */}
            <Group wrap="nowrap" align="center" gap="md" w="100%">
                <Text fw={600} size="xs" w={60}>
                    IJK Min
                </Text>
                <Group wrap="nowrap" grow style={{ flex: 1 }} gap="xs">
                    {[0, 1, 2].map((idx) => (
                        <NumberInput
                            key={`min-${idx}`}
                            value={props.viewModel.ijk_min[idx as 0 | 1 | 2]}
                            size="xs"
                            onChange={(val) =>
                                handleUpdate(
                                    "ijk_min",
                                    idx as 0 | 1 | 2,
                                    val,
                                    false,
                                )
                            }
                            onBlur={() =>
                                handleUpdate(
                                    "ijk_min",
                                    idx as 0 | 1 | 2,
                                    props.viewModel.ijk_min[idx as 0 | 1 | 2],
                                    true,
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleUpdate(
                                        "ijk_min",
                                        idx as 0 | 1 | 2,
                                        props.viewModel.ijk_min[
                                            idx as 0 | 1 | 2
                                        ],
                                        true,
                                    );
                                }
                            }}
                        />
                    ))}
                </Group>
            </Group>

            {/* IJK maximal. */}
            <Group wrap="nowrap" align="center" gap="md" w="100%">
                <Text fw={550} size="xs" w={60}>
                    IJK Max
                </Text>
                <Group wrap="nowrap" grow style={{ flex: 1 }} gap="xs">
                    {[0, 1, 2].map((idx) => (
                        <NumberInput
                            key={`max-${idx}`}
                            value={props.viewModel.ijk_max[idx as 0 | 1 | 2]}
                            size="xs"
                            onChange={(val) =>
                                handleUpdate(
                                    "ijk_max",
                                    idx as 0 | 1 | 2,
                                    val,
                                    false,
                                )
                            }
                            onBlur={() =>
                                handleUpdate(
                                    "ijk_max",
                                    idx as 0 | 1 | 2,
                                    props.viewModel.ijk_max[idx as 0 | 1 | 2],
                                    true,
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleUpdate(
                                        "ijk_max",
                                        idx as 0 | 1 | 2,
                                        props.viewModel.ijk_max[
                                            idx as 0 | 1 | 2
                                        ],
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
