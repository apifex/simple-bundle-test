import type { RunInput, FunctionRunResult, Discount } from "../generated/api";
import { DiscountApplicationStrategy, Scalars } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type Configuration = {};

export function run(input: RunInput): FunctionRunResult {
  // maybe to be used in the future
  const configuration: Configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );

  try {
    const packProductsWithQuantity = input.cart.lines.reduce(
      (acc, lineItem) => {
        if ("product" in lineItem.merchandise) {
          const threePackPrice = JSON.parse(
            lineItem.merchandise.product.threePackPrice?.value ?? "null"
          )?.amount;
          const twoPackPrice = JSON.parse(
            lineItem.merchandise.product.twoPackPrice?.value ?? "null"
          )?.amount;

          if (twoPackPrice || threePackPrice) {
            const prevQuantity =
              acc[lineItem.merchandise.product.id]?.quantity ?? 0;
            acc[lineItem.merchandise.product.id] = {
              quantity: prevQuantity + lineItem.quantity,
              twoPackPrice: twoPackPrice ?? null,
              threePackPrice: threePackPrice ?? null,
              discountApplied: 0,
            };
          }
        }
        return acc;
      },
      {} as Record<
        Scalars["ID"],
        {
          quantity: number;
          twoPackPrice: string | null;
          threePackPrice: string | null;
          discountApplied: number;
        }
      >
    );

    const discounts: Discount[] = [];

    input.cart.lines.forEach((lineItem) => {
      if ("product" in lineItem.merchandise) {
        const packProduct =
          packProductsWithQuantity[lineItem.merchandise.product.id];
        if (packProduct) {
          const { quantity, twoPackPrice, threePackPrice, discountApplied } =
            packProduct;

          if (quantity >= 3 && threePackPrice && discountApplied < 3) {
            const discountAmount =
              (lineItem.cost.amountPerQuantity.amount -
                Number(threePackPrice)) *
              lineItem.quantity;

            discounts.push({
              message: "3-Pack Discount",
              targets: [{ productVariant: { id: lineItem.merchandise.id } }],
              value: { fixedAmount: { amount: discountAmount.toString() } },
            });
            packProductsWithQuantity[
              lineItem.merchandise.product.id
            ].discountApplied = discountApplied + lineItem.quantity;
            return;
          }

          if (quantity >= 2 && twoPackPrice && discountApplied < 2) {
            const discountAmount =
              (lineItem.cost.amountPerQuantity.amount - Number(twoPackPrice)) *
              lineItem.quantity;

            discounts.push({
              message: "2-Pack Discount",
              targets: [{ productVariant: { id: lineItem.merchandise.id } }],
              value: { fixedAmount: { amount: discountAmount.toString() } },
            });
            packProductsWithQuantity[
              lineItem.merchandise.product.id
            ].discountApplied = discountApplied + lineItem.quantity;
            return;
          }
        }
      }
    });

    console.log(JSON.stringify(packProductsWithQuantity));

    if (discounts.length > 0) {
      return {
        discountApplicationStrategy: DiscountApplicationStrategy.All,
        discounts,
      };
    }

    return EMPTY_DISCOUNT;
  } catch (error) {
    console.error(error);
    return EMPTY_DISCOUNT;
  }
}
