import { getAdminDb } from "./firebaseAdmin";

export async function resolveEmailFromIdentifier(identifier) {
  if (identifier.includes("@")) return identifier.trim().toLowerCase();

  const db = getAdminDb();
  const snapshot = await db.ref("users").orderByChild("username").equalTo(identifier).get();
  if (!snapshot.exists()) return null;
  const [profile] = Object.values(snapshot.val());
  return profile.email || null;
}
