# ST-2: Add a part to the cart from the part detail page

**Company:** Brazos Ridge Electronics (fictional illustrative sample).  
**Status:** Ready for refinement  
**Persona:** Buyer placing a quote line

## User story

As a buyer, I can open a part detail page, enter a quantity, and add the line to my cart so I can build a quote.

## Background

- The cart is session-based for this training app (no login).
- The part detail page shows stock on hand and unit price context from the sample catalog.
- Linked requirement: REQ-CART-010 (cart lines show part number and quantity).

## Acceptance criteria

- **AC1:** From the catalog, a buyer can open a part detail page for any listed part.
- **AC2:** The detail page shows part number, description, stock on hand, and packaging type.
- **AC3:** The buyer can enter a quantity of at least 1 and click **Add to cart**.
- **AC4:** After adding, the cart page lists the part number and quantity (REQ-CART-010).
- **AC5:** The buyer can change quantity on the cart page and update the line.

## Out of scope

- Checkout, pricing, and account-specific price breaks.
