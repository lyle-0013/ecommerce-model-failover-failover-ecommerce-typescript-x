import assert from "node:assert/strict";
import { fulfillOrder } from "../src/order_service.js";

const rejected = await fulfillOrder({ orderId: "", customerId: "c", items: [], destination: "x" }).then(() => false, () => true);
assert.equal(rejected, true);
console.log("request boundary rejects an empty order");
