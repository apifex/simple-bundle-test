import { describe, it, expect } from "vitest";
import { run } from "./run";
import { FunctionResult, DiscountApplicationStrategy } from "../generated/api";

describe("product discounts function", () => {
  it("returns no discounts without configuration", () => {
    const result = run({
      discountNode: {
        metafield: null,
      },
      cart: {
        bundleTest: {
          value: "enabled",
        },
        lines: [
          {
            id: "gid://shopify/CartLine/0",
            quantity: 3,
            cost: {
              amountPerQuantity: {
                amount: "24.95",
              },
            },
            bundleItem: null,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/49007315190084",
              product: {
                id: "gid://shopify/Product/9475821044036",
                twoPackPrice: {
                  value: '{"amount":"20.00","currency_code":"PLN"}',
                },
                threePackPrice: {
                  value: '{"amount":"15.00","currency_code":"PLN"}',
                },
              },
            },
          },
          {
            id: "gid://shopify/CartLine/1",
            quantity: 4,
            cost: {
              amountPerQuantity: {
                amount: "24.95",
              },
            },
            bundleItem: null,
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/49007315157316",
              product: {
                id: "gid://shopify/Product/9475821044036",
                twoPackPrice: {
                  value: '{"amount":"20.00","currency_code":"PLN"}',
                },
                threePackPrice: {
                  value: '{"amount":"15.00","currency_code":"PLN"}',
                },
              },
            },
          },
          {
            id: "gid://shopify/CartLine/2",
            quantity: 1,
            cost: {
              amountPerQuantity: {
                amount: "24.95",
              },
            },
            bundleItem: {
              value: "Yes",
            },
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/49007315157316",
              product: {
                id: "gid://shopify/Product/9475821044036",
                twoPackPrice: {
                  value: '{"amount":"20.00","currency_code":"PLN"}',
                },
                threePackPrice: {
                  value: '{"amount":"15.00","currency_code":"PLN"}',
                },
              },
            },
          },
        ],
      },
    });
    const expected: FunctionResult = {
      discounts: [],
      discountApplicationStrategy: DiscountApplicationStrategy.First,
    };

    expect(result).toEqual(expected);
  });
});
