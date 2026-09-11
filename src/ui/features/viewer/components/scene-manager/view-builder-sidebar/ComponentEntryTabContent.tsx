import { DeleteActionIcon } from "../../../../../components/common/actionables/actions-icons/DeleteActionIcon";
import {
    selectorToString,
    type ComponentEntry,
} from "../../../models/MvsViewModels";

type ComponentEntryTabContentProps = {
    component: ComponentEntry;
    onDeleteStructureComponent: (componentId: string) => Promise<void>;
};

export function ComponentEntryTabContent(props: ComponentEntryTabContentProps) {
    return (
        <span
            style={{
                display: "flex",
                gap: "0.5em",
                alignItems: "center",
            }}
        >
            {selectorToString(props.component.selector, true)}
            <DeleteActionIcon
                tooltip="Delete component."
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    props.onDeleteStructureComponent(props.component.id);
                }}
            />
        </span>
    );
}
