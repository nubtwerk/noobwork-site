export function hasMultipleRooms(plants: { roomId: string }[]): boolean {
  return new Set(plants.map((p) => p.roomId)).size > 1;
}

export const DEFAULT_ROOM_ID = "living-room";
