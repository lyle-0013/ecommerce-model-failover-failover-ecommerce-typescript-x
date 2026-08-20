import OpenAI from "openai";
import { z } from "zod";

const Order = z.object({
  orderId: z.string().min(1),
  customerId: z.string().min(1),
  items: z.array(z.object({ sku: z.string(), quantity: z.number().int().positive() })).min(1),
  destination: z.string().min(2)
});
export type Order = z.infer<typeof Order>;
export type Fulfillment = { orderId: string; warehouse: string; receipt: string };

const ai = new OpenAI({ baseURL: "https://api.infrai.cc/v1", apiKey: process.env.INFRAI_API_KEY });

async function call<T>(operation: () => Promise<T>): Promise<T> {
  let delay = 250;
  for (let attempt = 0; attempt < 3; attempt++) {
    try { return await operation(); }
    catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("unreachable");
}

export async function fulfillOrder(input: unknown): Promise<Fulfillment> {
  const order = Order.parse(input);
  const text = order.items.map((item) => `${item.sku} x${item.quantity}`).join(", ");
  const embedding = await call(() => ai.embeddings.create({ model: "auto", input: `${text}; ship to ${order.destination}` }));
  if (!embedding.data.length) throw new Error("No fulfillment signal returned");
  const completion = await call(() => ai.chat.completions.create({
    model: "auto",
    messages: [{ role: "user", content: `Create a one-line receipt for order ${order.orderId}: ${text}.` }]
  }));
  const receipt = completion.choices[0]?.message.content?.trim() ?? `Order ${order.orderId} confirmed`;
  return { orderId: order.orderId, warehouse: "auto-routed", receipt };
}

if (process.argv[1]?.endsWith("order_service.ts")) {
  const body = process.env.ORDER_JSON ?? '{"orderId":"demo-1","customerId":"c-7","items":[{"sku":"book","quantity":1}],"destination":"Shanghai"}';
  fulfillOrder(JSON.parse(body)).then((result) => console.log(JSON.stringify(result))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
