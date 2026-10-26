# BUG-101: Part detail shows "null wk" when lead time is missing

## Summary

The part detail page renders the literal text **null wk** when `leadTimeWeeks` is null in the sample catalog.

## Environment

- App: `npm start` (Brazos Ridge illustrative sample)
- Page: `public/part.html`

## Steps to reproduce

1. Start the catalog locally.
2. Open the catalog and search for **BR-1013-47** (capacitor with no listed lead time).
3. Click **View** to open the part detail page (`/part.html?id=br-1013-47`).
4. Read the **Lead time** field.

## Expected result

Lead time should read **Not listed** (consistent with catalog results per LT-1 AC7).

## Actual result

Lead time displays **null wk**.

## Notes

Screenshot: `docs/bugs/part-null-lead-time-screenshot.png`. Fictional training data only.
