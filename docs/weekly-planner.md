# Weekly meal planner

The `/recipes` page now opens a weekly kitchen planner. The previous single-recipe tool remains at `/recipes/single`; its saved data is untouched. If a saved recipe exists when the planner is first opened, a copy is added to the recipe library.

## Daily workflow

1. Pick a week and set default servings for newly added meals. Dinner is the initial view; breakfast and lunch are available through a toggle.
2. Choose a built-in or personal recipe for each day. Each planned meal has its own serving count. Empty slots can stay empty for leftovers or meals out. Hidden breakfast/lunch slots still count toward groceries.
3. Open Groceries. Amounts are scaled from original recipes and combined for the entire week. Mark items already at home before shopping.
4. Assign preferred stores, then check off purchases. Copy or print the full list grouped by store. Screen store filters do not restrict copy/print output.

## Recipes and stores

Eight original, editable starter recipes cover breakfast, lunch, and dinner. Recipes include ingredients, original servings, estimated preparation time, notes/instructions, and store preferences. Users can create and edit recipes manually, paste recipe text, or use the existing website importer when its endpoint is configured. Video analysis is not required or attempted.

Costco, Ranch 99, and Other / decide later are initial grocery groups. Users can add, rename, annotate, and remove stores. Removing a store moves assignments to Other rather than dropping ingredients. Stores are user preferences; the application does not fetch stock, pack sizes, prices, or store accounts. Recipe edits affect all planned uses of that recipe.

## Quantity and persistence rules

- Per-meal servings always scale from the original ingredient amount; totals do not accumulate rounding drift.
- Only matching ingredient names and equivalent unit spellings combine. Different units, preparation names, and unspecified quantities remain separate. There is no volume/weight conversion or automatic purchase rounding.
- Ranges sum as ranges. Original ingredient lines remain available in the recipe editor.
- Pantry flags and purchase checks apply to the displayed quantity. A change in the required quantity makes those flags stale and clears their visible state. Manual overrides stay fixed until explicitly reset.
- Meal plans, extras, and shopping progress are separated by week. Ingredient store preferences apply across weeks. Copy previous week copies meal assignments and servings, with fresh shopping progress and no extra items.
- All data is browser-local. JSON backup/restore includes recipe library, stores, weeks, and shopping progress. Restore validates the format and asks before replacing the active planner. Unreadable existing data is not overwritten automatically.

## Verification

Automated planner tests cover calendar week boundaries, recipe seeding and migration, per-meal scaling, compatible merging, ranges and unspecified amounts, unknown servings, quantity/checkmark invalidation, manual overrides, store preferences/removal, independent weeks, extras, exports, and backup validation. Existing parser/importer/API tests remain in the suite. Production build is required for the release.

Release validation on November 19, 2026: all 24 automated tests pass, the production build passes, and a server-rendered initial-page check confirms the seven dinner slots, recipe cards, store names, and page content. This render check does not verify interactive browser behavior. The browser connection/URL-identification limitation encountered in the previous release remains unresolved; interactive visual and print checks are unverified.

Browser acceptance checklist: check the 7-day calendar on desktop and mobile; add and swap recipes; show breakfast/lunch; change meal servings; create/edit a recipe; assign and remove stores; mark items at home/purchased; refresh and confirm state; navigate weeks; copy/print; download/restore a backup; tab through controls and close dialogs with Escape. Browser verification limitations must be recorded in the pull request rather than reported as passed.
