import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, parseIngredient, parseRecipe, scaleAmount, quantity, listText, validServings } from '../src/lib/recipe.js';

test('scales original quantities without cumulative drift', () => {
  const item = parseIngredient('400 g pasta');
  for (const [servings, expected] of [[6, '600'], [8, '800'], [2, '200'], [4, '400']]) assert.equal(quantity(item, 4, servings), expected);
  assert.equal(item.amount, '400');
});
test('supports mixed fractions, unicode fractions, decimals, and ranges', () => {
  for (const [input, factor, expected] of [['1½', 2, '3'], ['½', 2, '1'], ['1 1/2', .5, '3/4'], ['1 / 2', 2, '1'], ['1–2', 2, '2–4'], ['1 to 2', .5, '1/2–1'], ['.5', 3, '1 1/2'], ['1/3', 3, '1']]) assert.equal(scaleAmount(input, factor), expected);
  assert.equal(parseAmount('1/0'), null);
  assert.equal(scaleAmount('to taste', 2), 'to taste');
});
test('keeps unknown lines and original text rather than inventing quantities', () => {
  const recipe = parseRecipe('Salt to taste\nA handful of herbs\n1 (400 g) can tomatoes');
  assert.equal(recipe.ingredients.length, 3);
  assert.equal(recipe.ingredients[0].name, 'Salt to taste');
  assert.equal(recipe.ingredients[0].original, 'Salt to taste');
  assert.equal(recipe.originalServings, '');
  assert.equal(parseRecipe('Bread\nYield: 1 loaf\nIngredients\n500 g flour').originalServings, '');
  assert.equal(parseRecipe('Pasta\nServes 4–6\nIngredients\n400 g pasta').originalServings, '');
});
test('extracts title and servings while retaining instructions', () => {
  const recipe = parseRecipe('Pasta\nServes 4\nIngredients\n400g pasta\nSalt to taste\nInstructions\nBoil water.');
  assert.equal(recipe.title, 'Pasta'); assert.equal(recipe.originalServings, 4);
  assert.equal(recipe.ingredients.length, 2); assert.equal(recipe.ingredients[0].unit, 'g');
  assert.match(recipe.notes, /Boil water/);
});
test('manual quantities stay fixed, and restored scaling uses original values', () => {
  const item = { ...parseIngredient('1 onion'), override: 'Buy 2', checked: true };
  assert.equal(quantity(item, 4, 12), 'Buy 2');
  item.override = null; assert.equal(quantity(item, 4, 6), '1 1/2');
  const recipe = { title: 'Dinner', targetServings: 6, originalServings: 4, ingredients: [item] };
  assert.match(listText(JSON.parse(JSON.stringify(recipe))), /\[x\] 1 1\/2 onion/);
});
test('requires usable serving counts', () => { for (const n of ['', 0, -1, NaN, Infinity, 10001]) assert.equal(validServings(n), false); assert.equal(validServings('6'), true); });
