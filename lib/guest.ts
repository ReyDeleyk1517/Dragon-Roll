// Shared helpers for guest (unauthenticated) room access.
// Guest identity is kept in cookies so it never requires a User row.

export const GUEST_NAME_COOKIE = "dragon_guest_name";
export const GUEST_MEMBER_COOKIE_PREFIX = "dragon_guest_room_";
export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const GUEST_NAME_MIN_LENGTH = 2;
export const GUEST_NAME_MAX_LENGTH = 32;

// Letters/numbers (unicode), spaces and a few common name characters.
const GUEST_NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} _.'-]*$/u;

export type RoomJoinState = { error: string } | null;

/** Cookie name that remembers which guest member a browser is in a room. */
export function guestMemberCookieName(roomId: string): string {
  return `${GUEST_MEMBER_COOKIE_PREFIX}${roomId}`;
}

/** Returns a cleaned nickname, or `null` when it is not usable. */
export function normalizeGuestName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const name = value.trim().replace(/\s+/g, " ");

  if (name.length < GUEST_NAME_MIN_LENGTH || name.length > GUEST_NAME_MAX_LENGTH) {
    return null;
  }

  if (!GUEST_NAME_PATTERN.test(name)) {
    return null;
  }

  return name;
}
