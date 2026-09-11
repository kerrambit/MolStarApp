import { Divider } from "@mantine/core";

/**
 * Props for the AssetBuilderCardSectionGroup component.
 */
type AssetBuilderCardSectionGroupProps = React.PropsWithChildren<{
    divider?: boolean;
    bottomMargin?: "xs" | "sm" | "md" | "lg" | "xl";
    topMargin?: "xs" | "sm" | "md" | "lg" | "xl";
    gap?: string | number;
}>;

/**
 * A component that groups together sections in the asset builder card, optionally adding a divider at the bottom.
 */
export const AssetBuilderCardSectionGroup = (
    props: AssetBuilderCardSectionGroupProps,
) => {
    const anyDivider = props.divider ?? true;

    // Render the component.
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: props.gap || "0.75em",
            }}
        >
            {props.children}
            {anyDivider && (
                <Divider mb={props.bottomMargin} mt={props.topMargin} />
            )}
        </div>
    );
};
