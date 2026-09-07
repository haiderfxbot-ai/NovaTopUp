export const PAYMENT_METHODS = ["easypaisa", "jazzcash", "binance", "debitcard"];

export function validateServicePayload(body) {
  if (!body.name || !body.category) {
    throw new Error("Name and category are required.");
  }
  if (!Array.isArray(body.packages) || body.packages.length === 0) {
    throw new Error("Add at least one package (amount + price).");
  }
  for (const pkg of body.packages) {
    if (!pkg.label || pkg.price == null) {
      throw new Error("Every package needs a label and a price.");
    }
  }
  const allowedPaymentMethods =
    body.allowAllPaymentMethods === true
      ? PAYMENT_METHODS
      : (body.allowedPaymentMethods || []).filter((m) => PAYMENT_METHODS.includes(m));

  if (allowedPaymentMethods.length === 0) {
    throw new Error("Select at least one allowed payment method for this service.");
  }

  return {
    name: body.name,
    category: body.category,
    description: body.description || "",
    packages: body.packages,
    allowedPaymentMethods,
    active: body.active !== false,
    updatedAt: Date.now(),
  };
}
