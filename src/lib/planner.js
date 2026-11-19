import { formatNumber, parseAmount, parseIngredient, validServings } from './recipe.js';
import { starterRecipes } from './starterRecipes.js';

export const PLANNER_KEY = 'leo-meal-planner-v1';
export const MEALS = ['breakfast', 'lunch', 'dinner'];
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const makeId = () => globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function fromDateKey(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d, 12); }
export function mondayOf(value = new Date()) { const d = typeof value === 'string' ? fromDateKey(value) : new Date(value); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dateKey(d); }
export function addDays(key, amount) { const d = fromDateKey(key); d.setDate(d.getDate() + amount); return dateKey(d); }
export function weekLabel(key) { return `${fromDateKey(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${fromDateKey(addDays(key, 6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`; }
export const emptyWeek = () => ({ meals: {}, items: {}, extras: [] });
export function newPlanner(legacyRaw) {
  const state = { version: 1, defaultServings: 2, stores: [{ id: 'costco', name: 'Costco', note: 'Bulk staples & freezer favorites' }, { id: 'ranch99', name: 'Ranch 99', note: 'Produce, noodles & pantry favorites' }, { id: 'unassigned', name: 'Other / decide later', note: 'Keep a place for anything else' }], recipes: structuredClone(starterRecipes), weeks: {}, storePreferences: {} };
  try {
    const legacy = JSON.parse(legacyRaw)?.recipe;
    if (legacy?.ingredients?.length && legacy.ingredients.every(i => typeof i.name === 'string' && typeof i.amount === 'string' && typeof i.unit === 'string')) state.recipes.push({ id: 'legacy-recipe', title: String(legacy.title || 'My saved recipe'), originalServings: legacy.originalServings || '', minutes: '', category: 'My recipes', notes: String(legacy.notes || ''), sourceText: String(legacy.sourceText || ''), ingredients: legacy.ingredients.map(i => ({ ...i, id: makeId(), storeId: 'unassigned', override: null, checked: false })), sourceKind: 'Imported from your previous recipe tool' });
  } catch { /* The original recipe storage remains untouched. */ }
  return state;
}
const str = value => typeof value === 'string';
const record = value => value && typeof value === 'object' && !Array.isArray(value);
export function validatePlanner(s) {
  if (!record(s) || s.version !== 1 || !validServings(s.defaultServings) || !Array.isArray(s.stores) || !s.stores.length || !Array.isArray(s.recipes) || !record(s.weeks) || !record(s.storePreferences)) return false;
  if (!s.stores.every(x => record(x) && str(x.id) && str(x.name) && x.name.trim() && str(x.note)) || !s.stores.some(x => x.id === 'unassigned') || new Set(s.stores.map(x => x.id)).size !== s.stores.length) return false;
  if (!s.recipes.every(r => record(r) && str(r.id) && str(r.title) && (str(r.originalServings) || typeof r.originalServings === 'number') && (r.category === undefined || str(r.category)) && (r.sourceKind === undefined || str(r.sourceKind)) && (r.minutes === undefined || str(r.minutes) || (typeof r.minutes === 'number' && Number.isFinite(r.minutes))) && Array.isArray(r.ingredients) && r.ingredients.every(i => record(i) && str(i.id) && str(i.name) && str(i.amount) && str(i.unit) && str(i.storeId) && (i.original === undefined || str(i.original))) && str(r.notes) && str(r.sourceText)) || new Set(s.recipes.map(r => r.id)).size !== s.recipes.length) return false;
  if (!Object.values(s.storePreferences).every(str)) return false;
  for (const [key, week] of Object.entries(s.weeks)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !record(week) || !record(week.meals) || !record(week.items) || !Array.isArray(week.extras)) return false;
    if (!Object.entries(week.meals).every(([slot, m]) => /^[0-6]-(breakfast|lunch|dinner)$/.test(slot) && record(m) && str(m.recipeId) && validServings(m.servings) && s.recipes.some(r => r.id === m.recipeId && validServings(r.originalServings)))) return false;
    if (!week.extras.every(i => record(i) && str(i.id) && str(i.name) && str(i.amount) && str(i.unit) && str(i.storeId))) return false;
    if (!Object.values(week.items).every(i => record(i) && (i.override === undefined || i.override === null || str(i.override)) && (i.checked === undefined || i.checked === null || str(i.checked)) && (i.owned === undefined || i.owned === null || str(i.owned)))) return false;
  }
  return true;
}
export function restorePlanner(raw, legacy) {
  if (raw) { const data = JSON.parse(raw); if (!validatePlanner(data)) throw new Error('The saved planner format could not be read.'); return data; }
  return newPlanner(legacy);
}
const unitGroups = [['g', 'gram', 'grams'], ['kg', 'kilogram', 'kilograms'], ['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres'], ['l', 'liter', 'liters', 'litre', 'litres'], ['cup', 'cups'], ['tbsp', 'tablespoon', 'tablespoons'], ['tsp', 'teaspoon', 'teaspoons'], ['oz', 'ounce', 'ounces'], ['lb', 'lbs', 'pound', 'pounds'], ['clove', 'cloves'], ['can', 'cans']];
const normalized = s => s.trim().toLowerCase().replace(/\s+/g, ' ');
export function canonicalUnit(unit) { const u = normalized(unit).replace(/\.$/, ''); return unitGroups.find(g => g.includes(u))?.[0] ?? u; }
export function ingredientKey(item) { return JSON.stringify([normalized(item.name), canonicalUnit(item.unit)]); }
export function planMeal(state, key, slot, recipeId, servings = state.defaultServings) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe || !validServings(recipe.originalServings) || !validServings(servings)) throw new Error('Set valid original and planned servings before adding this recipe.');
  if (!/^[0-6]-(breakfast|lunch|dinner)$/.test(slot)) throw new Error('Choose a valid day and meal.');
  const week = state.weeks[key] || emptyWeek();
  return { ...state, weeks: { ...state.weeks, [key]: { ...week, meals: { ...week.meals, [slot]: { recipeId, servings: Number(servings) } } } } };
}
export function copyWeek(state, from, to) {
  return { ...state, weeks: { ...state.weeks, [to]: { ...emptyWeek(), meals: structuredClone(state.weeks[from]?.meals || {}) } } };
}
export function groceryList(state, key) {
  const week = state.weeks[key] || emptyWeek(), groups = new Map();
  const add = (ingredient, factor, contribution, unique) => {
    const values = parseAmount(ingredient.amount), baseKey = ingredientKey(ingredient);
    // Unknown quantities remain separate. Only exact ingredient names and compatible unit spellings merge.
    const id = values ? baseKey : `${baseKey}:${unique}`;
    const proposedStore = state.storePreferences[baseKey] || ingredient.storeId || 'unassigned';
    const storeId = state.stores.some(s => s.id === proposedStore) ? proposedStore : 'unassigned';
    if (!groups.has(id)) groups.set(id, { id, baseKey, name: ingredient.name, unit: ingredient.unit, values: values ? [0, 0] : null, amount: ingredient.amount, sources: [], suggestedStores: new Set(), storeId });
    const item = groups.get(id);
    if (values) { item.values[0] += values[0] * factor; item.values[1] += (values[1] ?? values[0]) * factor; }
    item.sources.push(contribution); item.suggestedStores.add(storeId);
  };
  Object.entries(week.meals).sort(([a], [b]) => a.localeCompare(b)).forEach(([slot, meal]) => {
    const recipe = state.recipes.find(r => r.id === meal.recipeId);
    if (!recipe || !validServings(recipe.originalServings) || !validServings(meal.servings)) return;
    const [day, type] = slot.split('-');
    recipe.ingredients.forEach((i, n) => add(i, Number(meal.servings) / Number(recipe.originalServings), `${DAYS[Number(day)]} ${type} · ${recipe.title}`, `${slot}-${i.id}-${n}`));
  });
  week.extras.forEach(i => add(i, 1, 'Extra grocery item', i.id));
  return [...groups.values()].map(item => {
    const automaticAmount = item.values ? item.values.map(formatNumber).filter((v, i, a) => i === 0 || v !== a[0]).join('–') : item.amount;
    const saved = week.items[item.id] || {};
    const amount = saved.override != null ? saved.override : automaticAmount;
    const signature = JSON.stringify([amount, item.unit]);
    return { ...item, automaticAmount, amount, signature, override: saved.override ?? null, checked: saved.checked === signature, owned: saved.owned === signature, conflict: item.suggestedStores.size > 1, sources: [...new Set(item.sources)] };
  }).sort((a, b) => a.name.localeCompare(b.name));
}
export function groceryText(state, key, includeOwned = false) {
  const items = groceryList(state, key);
  return `Groceries · ${weekLabel(key)}\n` + state.stores.map(store => {
    const rows = items.filter(i => i.storeId === store.id && (includeOwned || !i.owned));
    return rows.length ? `\n${store.name}\n` + rows.map(i => `${i.owned ? '[at home]' : i.checked ? '[x]' : '[ ]'} ${[i.amount, i.unit, i.name].filter(Boolean).join(' ')}`).join('\n') + '\n' : '';
  }).join('');
}
export function removeStore(state, id) {
  if (id === 'unassigned') return state;
  return { ...state, stores: state.stores.filter(s => s.id !== id), storePreferences: Object.fromEntries(Object.entries(state.storePreferences).map(([key, value]) => [key, value === id ? 'unassigned' : value])), recipes: state.recipes.map(r => ({ ...r, ingredients: r.ingredients.map(i => i.storeId === id ? { ...i, storeId: 'unassigned' } : i) })), weeks: Object.fromEntries(Object.entries(state.weeks).map(([key, w]) => [key, { ...w, extras: w.extras.map(i => i.storeId === id ? { ...i, storeId: 'unassigned' } : i) }])) };
}
export function blankRecipe() { return { id: makeId(), title: '', originalServings: '', minutes: '', category: 'My recipes', notes: '', sourceText: '', ingredients: [ { ...parseIngredient(''), storeId: 'unassigned' } ], sourceKind: 'Your recipe' }; }
