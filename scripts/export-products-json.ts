import { writeFileSync } from "node:fs";
import { PRODUCTS_MOCK } from "../server/api/shop/[slug]";

writeFileSync("products_seed.json", JSON.stringify(PRODUCTS_MOCK, null, 2), "utf-8");
console.log("ok: products_seed.json");
