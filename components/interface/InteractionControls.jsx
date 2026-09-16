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
      {onAdd && (
        <InteractButton onPress={onAdd}>
          <CrossIcon color={Colors.black} />
        </InteractButton>
      )}
      {onEdit && (
        <InteractButton onPress={onEdit}>
          <EditIcon color={Colors.black} />
        </InteractButton>
      )}
      {onDelete && (
        <InteractButton variant="danger" haptic onPress={onDelete}>
          <CrossIcon rotation={45} />
        </InteractButton>
      )}
    </Column>
  );
}
