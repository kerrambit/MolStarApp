/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { useState } from "react";
import { Collapse, Group, Select, Text, Textarea } from "@mantine/core";
import {
    getBundlingKindOptions,
    getDownsamplingStrategyOptions,
    getSerializerKindOptions,
    type BundlingKind,
    type DownsamplingStrategy,
    type ProcessVolumeRequestWithoutFilepaths,
    type SerializerKind,
} from "../../../../../config/processingDefinitions";
import { IconHelpOctagonFilled } from "@tabler/icons-react";
import { UnstyledTextInput } from "../../../../../components/common/input/UnstyledTextInput";
import { useAppearance } from "../../../../../hooks/useAppearance";
import { CollapseTrigger } from "../../../../../components/common/collapse-trigger/CollapseTriger";
import { Button } from "../../../../../components/common/button/Button";

interface ProcessingPropertiesDialogueContentProps {
    file: FileData;
    close: (value?: ProcessVolumeRequestWithoutFilepaths) => void;
}

export function ProcessingPropertiesDialogueContent({
    file,
    close,
}: ProcessingPropertiesDialogueContentProps) {
    // Use apperance.
    const { colorScheme } = useAppearance();

    // Downsampling strategy state.
    const [downsamplingStrategy, setDownsamplingStrategy] =
        useState<DownsamplingStrategy>("tricubic");
    const downsamplingOptions = getDownsamplingStrategyOptions();

    // Volume serializer state.
    const [volumeSerializer, setVolumeSerializer] =
        useState<SerializerKind>("mrc");
    const serializerOptions = getSerializerKindOptions();

    // Bundling strategy state.
    const [bundlingStrategy, setBundlingStrategy] =
        useState<BundlingKind>("null");
    const bundlingOptions = getBundlingKindOptions();

    // Expanded states.
    const [isVolumeExpanded, setVolumeExpanded] = useState(true);
    const [isSegmentationExpanded, setSegmentationExpanded] = useState(false);
    const [isBundlingExpanded, setBundlingExpanded] = useState(false);

    // Generate summary text based on current options.
    const summaryText =
        (downsamplingStrategy === "null"
            ? `The volume source "${file.name}" won't be downsampled and will be serialized directly into the "${volumeSerializer}" format.\n\n`
            : `The volume source "${file.name}" will be processed using the "${downsamplingStrategy}" downsampling strategy and serialized into the "${volumeSerializer}" format.\n\n`) +
        (bundlingStrategy === "null"
            ? `Since the bundling approach is set to 'null', the output will be saved in its raw serialized format ("${volumeSerializer}"). This is the recommended workflow, as it allows you to easily add individual files to different views and work with them directly after processing.`
            : `The output will be bundled using the '${bundlingStrategy}' strategy. Please note that archiving the files prevents you from easily adding individual files to different views or working with them directly after processing.`);

    // Render the component.
    return (
        <div>
            {/* Header. */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "end",
                    alignItems: "center",
                    marginBottom: "0.5em",
                }}
            ></div>

            {/* Main body. */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "2em",
                }}
            >
                {/* Left column. */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        gap: "1em",
                    }}
                >
                    {/* Volume block. */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <CollapseTrigger
                            title={"Volume"}
                            titleTextSize="lg"
                            expanded={isVolumeExpanded}
                            onClick={() => {
                                setVolumeExpanded((prev) => !prev);
                            }}
                        />

                        <Collapse expanded={isVolumeExpanded}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1em",
                                    padding: "0.5em 0 0 0",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1em",
                                    }}
                                >
                                    <Text
                                        size="sm"
                                        fw={600}
                                        style={{ minWidth: "9em" }}
                                    >
                                        Volume source:
                                    </Text>
                                    <UnstyledTextInput
                                        value={file.name}
                                        enabled={false}
                                        style={{ flexGrow: 1 }}
                                    />
                                </div>

                                <Select
                                    label="Downsampling strategy:"
                                    data={downsamplingOptions}
                                    value={downsamplingStrategy}
                                    onChange={(value) =>
                                        setDownsamplingStrategy(
                                            value as DownsamplingStrategy,
                                        )
                                    }
                                    placeholder="Select a strategy..."
                                    size="sm"
                                    comboboxProps={{
                                        withinPortal: true,
                                        zIndex: 10000,
                                    }}
                                />

                                <Select
                                    label="Volume serialization:"
                                    data={serializerOptions}
                                    value={volumeSerializer}
                                    onChange={(value) =>
                                        setVolumeSerializer(
                                            value as SerializerKind,
                                        )
                                    }
                                    placeholder="Select a volume serializer..."
                                    size="sm"
                                    comboboxProps={{
                                        withinPortal: true,
                                        zIndex: 10000,
                                    }}
                                />
                            </div>
                        </Collapse>
                    </div>

                    {/* Segmentation block. */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <CollapseTrigger
                            title={"Segmentation"}
                            titleTextSize="lg"
                            expanded={isSegmentationExpanded}
                            onClick={() => {
                                setSegmentationExpanded((prev) => !prev);
                            }}
                        />

                        <Collapse expanded={isSegmentationExpanded}>
                            <div style={{ padding: "0.5em 0 0 0" }}>
                                <Text size="sm" c="dimmed" ta="center">
                                    Segmentations options coming soon...
                                </Text>
                            </div>
                        </Collapse>
                    </div>

                    {/* Bundling block. */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <CollapseTrigger
                            title={"Bundling"}
                            titleTextSize="lg"
                            expanded={isBundlingExpanded}
                            onClick={() => {
                                setBundlingExpanded((prev) => !prev);
                            }}
                        />

                        <Collapse expanded={isBundlingExpanded}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1em",
                                    padding: "0.5em 0 0 0",
                                }}
                            >
                                <Select
                                    label="Bundling:"
                                    data={bundlingOptions}
                                    value={bundlingStrategy}
                                    onChange={(value) =>
                                        setBundlingStrategy(
                                            value as BundlingKind,
                                        )
                                    }
                                    placeholder="Select a bundling strategy..."
                                    size="sm"
                                    comboboxProps={{
                                        withinPortal: true,
                                        zIndex: 10000,
                                    }}
                                />
                            </div>
                        </Collapse>
                    </div>
                </div>

                {/* Right column. */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        minHeight: "10em",
                        gap: "0.5em",
                    }}
                >
                    <Group gap="xs" justify="space-between" align="center">
                        <Text size="sm" fw={700}>
                            Summary
                        </Text>
                        <IconHelpOctagonFilled
                            style={{
                                opacity: 0.6,
                                cursor: "help",
                            }}
                            title={`This dialogue sets properties for the current processing.\nInitial settings for "${file.extension}" files can be changed in the Settings.\n\nNote: Settings page is not implemented yet, the only way to set properties for now is this dialogue!`}
                        />
                    </Group>

                    <Textarea
                        value={summaryText}
                        readOnly
                        styles={{
                            root: { height: "100%" },
                            wrapper: { height: "100%" },
                            input: {
                                height: "100%",
                                borderRadius: "6px",
                                backgroundColor:
                                    colorScheme === "dark"
                                        ? "var(--color-dark-ui-component-mantine)"
                                        : "var(--color-light-ui-component-mantine)",
                                color: "var(--input-color)",
                                border: "none",
                            },
                        }}
                        style={{ height: "100%" }}
                    />
                </div>
            </div>

            {/* Actions. */}
            <Group justify="center" mt="xl">
                <Button
                    variant="secondary"
                    size="medium"
                    onClick={() => close(undefined)}
                >
                    Close
                </Button>
                <Button
                    variant="primary"
                    size="medium"
                    onClick={() => {
                        close({
                            downsampling_strategy: downsamplingStrategy,
                            volume_serializer: volumeSerializer,
                            segmentation_mask_serializer: "mrc", // TODO: we do not care about segmentation for now
                            segmentation_volume_serializer: "mrc", // TODO: we do not care about segmentation for now
                            segmentation_mesh_serializer: "mrc", // TODO: we do not care about segmentation for now
                            bundling_approach: bundlingStrategy,
                        } as ProcessVolumeRequestWithoutFilepaths);
                    }}
                >
                    Start processing
                </Button>
            </Group>
        </div>
    );
}
