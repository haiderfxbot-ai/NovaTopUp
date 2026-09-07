import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

// Public: anyone with the order ID can check its status. Deliberately
// returns only non-sensitive fields (no email, no card/reference details)
// so an order ID alone can't be used to pull someone else's payment info.
export async function GET(request, { params }) {
  try {
    const db = getAdminDb();
    const snapshot = await db.ref(`transactions/${params.id}`).get();
    if (!snapshot.exists()) {
      return NextResponse.json({ error: "No order found with that ID." }, { status: 404 });
    }
    const t = snapshot.val();
    return NextResponse.json({
      orderId: params.id,
      serviceName: t.serviceName,
      packageLabel: t.packageLabel,
      price: t.price,
      status: t.status,
      createdAt: t.createdAt,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
