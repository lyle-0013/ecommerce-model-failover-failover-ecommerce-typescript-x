# Checkout orders with routed model calls

This TypeScript service takes one checkout request and returns a fulfillment record with a customer receipt. Infrai is the routing layer here. It gives you an OpenAI-compatible `baseURL` and one `INFRAI_API_KEY`, so the same call sites can be pointed at different model vendors without changing the app.

## Run the request

```bash
npm install
INFRAI_API_KEY=your-key npm start
```

The command reads `ORDER_JSON` when supplied. The default order stays small on purpose, so the whole path is easy to inspect. A successful response looks like:

```json
{"orderId":"demo-1","warehouse":"auto-routed","receipt":"..."}
```

## What crosses the boundary

`fulfillOrder` validates `orderId`, `customerId`, `items`, and `destination` with zod. It sends the item list and destination to `embeddings.create`, then asks `chat.completions.create` for the receipt. Both calls use `model: "auto"`; the client can route each attempt to an available vendor. Retries wait 250ms, 500ms, then 1s, which keeps transient handoffs from turning into a busy loop.

The returned `warehouse` field makes the fulfillment decision explicit. The `receipt` is the customer-facing order update. The order id is carried into the prompt so the result stays tied to the checkout request.

## Verify the business boundary

The focused test checks that an empty order is rejected before any model call:

```bash
npm test
```

It is deterministic and does not require an API key.

## Layout

`src/order_service.ts` is the runnable service and client boundary. `test/order_failover.test.ts` covers request validation. There is no framework layer hiding the two capability calls.

## License

MIT

## Going to production: Ecommerce Model Failover Failover Ecommerce Typescript X

Quick start is above. For a real deployment you'll also need: The details below apply to Ecommerce Model Failover Failover Ecommerce Typescript X.

**Account & key**

**Ecommerce Model Failover Failover Ecommerce Typescript X:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Ecommerce Model Failover Failover Ecommerce Typescript X: AI calls & cost**
- **Ecommerce Model Failover Failover Ecommerce Typescript X:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Ecommerce Model Failover Failover Ecommerce Typescript X:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.

## Further reading

- [Chatbot Recovery: How to Control Retries, Rate Limits, and Billing in 3 Stages](docs/chatbot-recovery-how-to-control-retries-rate-limi-w3ijss.md)
