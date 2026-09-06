/**
 * Copyright (c) 2025-now MolViewStudio contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Marek Eibel
 */

import { SegmentedControl, useComputedColorScheme } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

export interface SegmentedControllerItem<T extends string = string> {
    value: T;
    label: React.ReactNode;
    disabled?: boolean;
}

interface SegmentedControllerProps<T extends string = string> {
    data: SegmentedControllerItem<T>[];
    value?: T;
    onChange?: (value: T) => void;
    defaultValue?: T;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    /**
     * Pixel limit when the controller orientation changes from 'horizontal' to 'vertical'.
     */
    widthWrapOrientationLimit?: number;
    /**
     * Force the orientation of the controller. If not provided, the orientation will be determined by the width of the component and the `widthWrapOrientationLimit` prop.
     */
    orientation?: "horizontal" | "vertical";
}

export function SegmentedController<T extends string = string>(
    props: SegmentedControllerProps<T>,
) {
    const ref = useRef<HTMLDivElement>(null);
    const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
        props.orientation ?? "horizontal",
    );

    useEffect(() => {
        if (!ref.current || props.orientation) return;

        const threshold = props.widthWrapOrientationLimit ?? 100;

        const resizeObserver = new ResizeObserver(([entry]) => {
            const width = entry.contentRect.width;
            setOrientation(width < threshold ? "vertical" : "horizontal");
        });

        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, [props.widthWrapOrientationLimit, props.orientation]);

    const colorScheme = useComputedColorScheme();

    const [internal, setInternal] = useState<T | undefined>(props.defaultValue);
    const currentValue = props.value ?? internal;

    const handleChange = (value: string) => {
        const typed = value as T;

        props.onChange?.(typed);
        if (props.value === undefined) {
            setInternal(typed);
        }
    };

    return (
        <div
            ref={ref}
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
            <SegmentedControl
                size={props.size}
                value={currentValue}
                onChange={handleChange}
                data={props.data}
                orientation={orientation}
                radius="md"
                fw={500}
                withItemsBorders={false}
                styles={{
                    root: {
                        display: "flex",
                        width: "100%",
                        border: `1px solid ${
                            colorScheme === "dark"
                                ? "var(--mantine-color-dark-4)"
                                : "var(--mantine-color-gray-3)"
                        }`,
                    },
                    indicator: {
                        background:
                            colorScheme === "dark"
                                ? "var(--mantine-primary-color-7)"
                                : "var(--mantine-primary-color-3)",
                    },
                }}
            />
        </div>
    );
}
