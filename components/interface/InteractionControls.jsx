import styled from "styled-components/native";
import { CrossIcon } from "./icons/CrossIcon";
import { EditIcon } from "./icons/EditIcon";
import { TickIcon } from "./icons/TickIcon";
import { InteractButton } from "./InteractButton";

const Column = styled.View`
  flex-direction: ${({ $direction }) => $direction};
  gap: 10px;
`;

export function InteractionControls({
  onConfirm,
  onAdd,
  onCancel,
  onDelete,
  onEdit,
  direction = "column",
  style,
}) {
  return (
    <Column $direction={direction} style={style}>
      {onConfirm && (
        <InteractButton variant="primary" onPress={onConfirm}>
          <TickIcon />
        </InteractButton>
      )}
      {onAdd && (
        <InteractButton onPress={onAdd}>
          <CrossIcon />
        </InteractButton>
      )}
      {onCancel && (
        <InteractButton onPress={onCancel}>
          <CrossIcon rotation={45} />
        </InteractButton>
      )}
      {onDelete && (
        <InteractButton variant="primary" onPress={onDelete}>
          <CrossIcon rotation={45} />
        </InteractButton>
      )}
      {onEdit && (
        <InteractButton onPress={onEdit}>
          <EditIcon />
        </InteractButton>
      )}
    </Column>
  );
}
