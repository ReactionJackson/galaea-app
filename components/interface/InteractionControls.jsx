import { Colors } from "@/constants/theme";
import styled from "styled-components/native";
import { CrossIcon } from "./icons/CrossIcon";
import { EditIcon } from "./icons/EditIcon";
import { InteractButton } from "./InteractButton";

const Column = styled.View`
  flex-direction: column;
  gap: 10px;
`;

export function InteractionControls({ onAdd, onEdit, onDelete, style }) {
  return (
    <Column style={style}>
      {onDelete && (
        <InteractButton variant="danger" haptic onPress={onDelete}>
          <CrossIcon rotation={45} />
        </InteractButton>
      )}
      {onEdit && (
        <InteractButton onPress={onEdit}>
          <EditIcon />
        </InteractButton>
      )}
      {onAdd && (
        <InteractButton onPress={onAdd}>
          <CrossIcon color={Colors.tags.default.primary} />
        </InteractButton>
      )}
    </Column>
  );
}
