import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, cookingServings, copyWeek, emptyWeek, groceryList, groceryText, ingredientKey, leftoverChoices, mealRecipe, mondayOf, newPlanner, planLeftovers, planMeal, removeMeal, removeStore, restorePlanner, validatePlanner } from '../src/lib/planner.js';
import { parseIngredient } from '../src/lib/recipe.js';

const key = '2026-11-16';
function fixture() {
  const state = newPlanner();
  state.recipes = [{ id: 'a', title: 'Dinner A', originalServings: 4, category: 'Dinner', notes: '', sourceText: '', ingredients: [{ ...parseIngredient('400 g pasta'), id: 'pasta', storeId: 'costco' }, { ...parseIngredient('1–2 lemons'), id: 'lemon', storeId: 'ranch99' }, { ...parseIngredient('Salt to taste'), id: 'salt', storeId: 'unassigned' }] }];
  return state;
}
test('dates use local calendar weeks across month/year boundaries', () => {
  assert.equal(mondayOf('2026-11-19'), '2026-11-16');
  assert.equal(mondayOf('2026-11-22'), '2026-11-16');
  assert.equal(mondayOf('2027-01-01'), '2026-12-28');
  assert.equal(addDays('2026-12-28', 7), '2027-01-04');
  assert.equal(addDays('2026-03-02', 7), '2026-03-09');
});
test('built-in recipes and migrated recipe validate without touching old storage', () => {
  const starter = newPlanner();
  assert.equal(starter.recipes.length, 8); assert.equal(validatePlanner(starter), true);
  assert.ok(starter.recipes.every(r => r.ingredients.every(i => i.name.trim())));
  const legacy = JSON.stringify({ recipe: { title: 'Saved pasta', originalServings: 4, ingredients: [parseIngredient('400 g pasta')] } });
  const migrated = restorePlanner(null, legacy);
  assert.equal(migrated.recipes.length, 9); assert.equal(migrated.recipes.at(-1).title, 'Saved pasta');
  assert.equal(validatePlanner(migrated), true);
});
test('plans multiple recipes with per-meal scaling and combines compatible amounts/ranges', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 6);
  state = planMeal(state, key, '1-lunch', 'a', 2);
  const list = groceryList(state, key);
  assert.equal(list.find(i => i.name === 'pasta').amount, '800');
  assert.equal(list.find(i => i.name === 'lemons').amount, '2–4');
  assert.equal(list.filter(i => i.name === 'Salt to taste').length, 2);
  assert.equal(list.find(i => i.name === 'pasta').sources.length, 2);
  assert.equal(groceryList(state, addDays(key, 7)).length, 0);
});
test('rescaling comes from original amounts; removing a meal removes its contribution', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 6);
  state = planMeal(state, key, '0-dinner', 'a', 2);
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '200');
  state = planMeal(state, key, '0-dinner', 'a', 4);
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '400');
  delete state.weeks[key].meals['0-dinner']; assert.equal(groceryList(state, key).length, 0);
});
test('requires known original and target servings instead of silently guessing', () => {
  const state = fixture();
  assert.throws(() => planMeal(state, key, '0-dinner', 'a', ''));
  state.recipes[0].originalServings = '';
  assert.throws(() => planMeal(state, key, '0-dinner', 'a', 4));
});
test('does not merge incompatible units or different ingredient names', () => {
  const state = fixture();
  state.recipes[0].ingredients = ['1 cup flour', '100 g flour', '1 cup almond flour', '2 cups flour'].map((line, n) => ({ ...parseIngredient(line, n), storeId: 'costco' }));
  const list = groceryList(planMeal(state, key, '0-dinner', 'a', 4), key);
  assert.equal(list.length, 3); assert.equal(list.find(i => i.name === 'flour' && i.unit === 'cup').amount, '3');
});
test('checks and pantry flags survive restore, and reset if quantity requirements change', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 4);
  let item = groceryList(state, key).find(i => i.name === 'pasta');
  state.weeks[key].items[item.id] = { checked: item.signature, owned: item.signature };
  state = restorePlanner(JSON.stringify(state));
  item = groceryList(state, key).find(i => i.name === 'pasta');
  assert.equal(item.checked, true); assert.equal(item.owned, true);
  state = planMeal(state, key, '0-dinner', 'a', 6);
  item = groceryList(state, key).find(i => i.name === 'pasta');
  assert.equal(item.checked, false); assert.equal(item.owned, false);
});
test('manual quantity overrides survive servings changes and restore automatic amounts', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 4);
  const item = groceryList(state, key).find(i => i.name === 'pasta');
  state.weeks[key].items[item.id] = { override: 'Buy 1 bag' };
  state = planMeal(state, key, '0-dinner', 'a', 8);
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, 'Buy 1 bag');
  state.weeks[key].items[item.id].override = null;
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '800');
});
test('stores persist as ingredient preferences across weeks and remove safely', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 4);
  const item = groceryList(state, key).find(i => i.name === 'pasta');
  state.stores.push({ id: 'local', name: 'Local market', note: '' });
  state.storePreferences[ingredientKey(item)] = 'local';
  state = planMeal(state, addDays(key, 7), '1-dinner', 'a', 4);
  assert.equal(groceryList(state, addDays(key, 7)).find(i => i.name === 'pasta').storeId, 'local');
  state = removeStore(state, 'local');
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').storeId, 'unassigned');
  assert.equal(validatePlanner(state), true);
});
test('copying a week resets shopping progress and extras and does not alias meals', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 4);
  state.weeks[key].extras.push({ id: 'coffee', name: 'coffee', unit: 'bag', amount: '1', storeId: 'costco' });
  const destination = addDays(key, 7);
  state = copyWeek(state, key, destination);
  assert.deepEqual(state.weeks[destination].extras, []); assert.deepEqual(state.weeks[destination].items, {});
  state.weeks[destination].meals['0-dinner'].servings = 7;
  assert.equal(state.weeks[key].meals['0-dinner'].servings, 4);
});
test('extra groceries combine with recipe needs and exports exclude pantry items', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 4);
  state.weeks[key].extras.push({ id: 'extra', name: 'pasta', amount: '100', unit: 'grams', storeId: 'costco' });
  const item = groceryList(state, key).find(i => i.name === 'pasta');
  assert.equal(item.amount, '500');
  assert.match(groceryText(state, key), /Costco/); assert.match(groceryText(state, key), /500 g pasta/);
  state.weeks[key].items[item.id] = { owned: item.signature };
  assert.doesNotMatch(groceryText(state, key), /pasta/);
  assert.match(groceryText(state, key, true), /\[at home\] 500 g pasta/);
});
test('restores complete multiweek state, rejects invalid backups', () => {
  const state = fixture(); state.weeks[key] = emptyWeek();
  assert.deepEqual(restorePlanner(JSON.stringify(state)), state);
  assert.throws(() => restorePlanner('{broken'));
  assert.equal(validatePlanner({ version: 1, stores: [] }), false);
  state.weeks[key].meals['0-dinner'] = { recipeId: 'missing', servings: 4 };
  assert.equal(validatePlanner(state), false);
  const malformed = fixture(); malformed.recipes[0].category = { unexpected: true };
  assert.equal(validatePlanner(malformed), false);
});

test('leftover lunch adds extra portions to dinner and groceries only once', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 2);
  state = planLeftovers(state, key, '1-lunch', key, '0-dinner', 2);
  assert.equal(cookingServings(state, key, '0-dinner'), 4);
  const pasta = groceryList(state, key).find(i => i.name === 'pasta');
  assert.equal(pasta.amount, '400'); assert.equal(pasta.sources.length, 1);
  assert.match(pasta.sources[0], /includes 2 leftover lunch servings/);
  assert.equal(mealRecipe(state, key, '1-lunch').id, 'a');
  assert.equal(validatePlanner(restorePlanner(JSON.stringify(state))), true);
});
test('changes and removing a leftover reservation rescale original dinner amounts', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 2);
  state = planLeftovers(state, key, '1-lunch', key, '0-dinner', 3);
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '500');
  state = planLeftovers(state, key, '1-lunch', key, '0-dinner', 1);
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '300');
  state = removeMeal(state, key, '1-lunch');
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '200');
});
test('quick lunches are independent recipes and multiple leftovers reserve enough portions', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 2);
  state = planLeftovers(state, key, '1-lunch', key, '0-dinner', 2);
  state = planLeftovers(state, key, '2-lunch', key, '0-dinner', 1);
  state = planMeal(state, key, '3-lunch', 'a', 2);
  assert.equal(cookingServings(state, key, '0-dinner'), 5);
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '700');
});
test('cross-week leftovers count groceries in the source dinner week', () => {
  let state = planMeal(fixture(), key, '6-dinner', 'a', 2);
  const next = addDays(key, 7);
  state = planLeftovers(state, next, '0-lunch', key, '6-dinner', 2);
  assert.equal(groceryList(state, next).length, 0);
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '400');
  assert.equal(leftoverChoices(state, next, '0-lunch')[0].sourceSlot, '6-dinner');
  assert.equal(validatePlanner(state), true);
});
test('rejects future, same-day, missing, and non-dinner leftover sources', () => {
  const state = planMeal(fixture(), key, '1-dinner', 'a', 2);
  assert.throws(() => planLeftovers(state, key, '0-lunch', key, '1-dinner', 2));
  assert.throws(() => planLeftovers(state, key, '1-lunch', key, '1-dinner', 2));
  assert.throws(() => planLeftovers(state, key, '2-lunch', key, '0-dinner', 2));
  assert.throws(() => planLeftovers(state, key, '2-dinner', key, '1-dinner', 2));
  assert.throws(() => planLeftovers(state, key, '2-lunch', key, '1-dinner', 0));
});
test('removing a dinner removes its linked lunches across weeks', () => {
  let state = planMeal(fixture(), key, '6-dinner', 'a', 2);
  state = planLeftovers(state, addDays(key, 7), '0-lunch', key, '6-dinner', 2);
  state = removeMeal(state, key, '6-dinner');
  assert.deepEqual(state.weeks[addDays(key, 7)].meals, {});
  assert.equal(validatePlanner(state), true);
});
test('copying a week shifts leftover links and preserves original week references', () => {
  let state = planMeal(fixture(), key, '0-dinner', 'a', 2);
  state = planLeftovers(state, key, '1-lunch', key, '0-dinner', 2);
  const next = addDays(key, 7); state = copyWeek(state, key, next);
  assert.equal(state.weeks[next].meals['1-lunch'].sourceWeek, next);
  assert.equal(state.weeks[key].meals['1-lunch'].sourceWeek, key);
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '400');
  assert.equal(groceryList(state, next).find(i => i.name === 'pasta').amount, '400');
  assert.equal(validatePlanner(state), true);
});

test('swapping a dinner updates the linked lunch recipe; replacing leftovers with a quick lunch releases the reservation', () => {
  let state = fixture();
  state.recipes.push({ ...state.recipes[0], id: 'b', title: 'Quick bowl', ingredients: [{ ...parseIngredient('200 g rice'), id: 'rice', storeId: 'ranch99' }] });
  state = planMeal(state, key, '0-dinner', 'a', 2);
  state = planLeftovers(state, key, '1-lunch', key, '0-dinner', 2);
  state = planMeal(state, key, '0-dinner', 'b', 2);
  assert.equal(mealRecipe(state, key, '1-lunch').title, 'Quick bowl');
  assert.equal(groceryList(state, key).find(i => i.name === 'rice').amount, '200');
  assert.equal(groceryList(state, key).some(i => i.name === 'pasta'), false);
  state = planMeal(state, key, '1-lunch', 'a', 2);
  assert.equal(cookingServings(state, key, '0-dinner'), 2);
  assert.equal(groceryList(state, key).find(i => i.name === 'rice').amount, '100');
  assert.equal(groceryList(state, key).find(i => i.name === 'pasta').amount, '200');
});
