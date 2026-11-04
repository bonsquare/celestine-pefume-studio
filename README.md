# Perfume Studio

Mobile-first perfume formulation, costing, pricing, and production tracking PWA.

Start in the Fragrance Oil category and add each fragrance separately, for example “Cloud by Ariana Grande.” Enter its make or brand, supplier, purchased content quantity, unit (mL or g), purchase price, and density. Save it to calculate the cost per mL or g used in formulas. The same workflow is available for Alcohol, Fixative, Water, Solvent, Additive, and Other. Existing saved per-mL rates are retained as a 1 mL purchase on first load so their costs do not change; replace those placeholder purchase details with your actual supplier quantities and prices.

Use **Add raw material** to open a dedicated form. Choose its category there, then save it to the library list. The list groups saved materials as Fragrance Oil, Alcohol, Fixative, Water, Solvent, Additive, and Other. The same form edits existing materials. Edits affect formulation costs only after saving.

Use **Create new formula** in Formulation to open the formula workspace. First choose **By fragrance oil** or **By total output** and enter one target amount. Then select saved fragrance oils and other materials, enter each ingredient's percentage, and make the total 100%. Choose mL or grams; every ingredient quantity and batch total in the generated summary uses that unit. The app uses saved density values internally when converting between weight and volume. Generate the summary before saving. Saved formulas can be reopened and duplicated. Each target output is treated as one production unit for costing.

In Formulation history, **Open** displays a read-only summary focused on ingredient percentages and the exact grams or mL to measure. Use **Edit / update** to change it or **Delete formula** to remove it after confirmation. Cost figures and the raw-material cost breakdown are shown in **Costing**. Newly saved formulas keep a summary snapshot; older formulas without a snapshot display quantities calculated from current raw material density values.

## Run

Install dependencies with `pnpm install`, then run `pnpm dev`. Run `pnpm test` and `pnpm build` before release. Preview the production PWA with `pnpm preview` over localhost or HTTPS. Install from a supported browser's menu. On iOS, use Safari’s **Add to Home Screen**.

## Data

Formulas, ingredient and expense libraries, and historical batch snapshots are stored in IndexedDB on the current device. Download a JSON backup from Settings before clearing browser data or switching devices. Restoring a backup replaces current device data after confirmation. Cloud sync is not implemented.

The app shell is available offline after a successful online load and service-worker cache. It is a web app, not a native phone app.
