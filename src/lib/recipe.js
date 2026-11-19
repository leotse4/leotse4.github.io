const fractions = { '¼': '1/4', '½': '1/2', '¾': '3/4', '⅐': '1/7', '⅑': '1/9', '⅒': '1/10', '⅓': '1/3', '⅔': '2/3', '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5', '⅙': '1/6', '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8' };
export function normalizeAmount(text) {
  return String(text).replace(/(\d)([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g, '$1 $2').replace(/[¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, c => fractions[c]).replace(/⁄/g, '/');
}
function numberValue(s) {
  const parts = s.trim().replace(/\s*\/\s*/g, '/').split(/\s+/);
  return parts.reduce((sum, p) => { const [a, b] = p.split('/').map(Number); return sum + (b === undefined ? a : b > 0 ? a / b : NaN); }, 0);
}
const numberPattern = '(?:\\d+\\s+\\d+\\s*/\\s*\\d+|\\d+\\s*/\\s*\\d+|\\d+(?:\\.\\d+)?|\\.\\d+)';
const amountPattern = new RegExp(`^(${numberPattern})(?:\\s*(?:[–—-]|to)\\s*(${numberPattern}))?$`, 'i');
const prefixPattern = new RegExp(`^(${numberPattern}(?:\\s*(?:[–—-]|to)\\s*${numberPattern})?)(?=\\s|[a-zA-Z(]|$)\\s*`, 'i');
export function parseAmount(value) {
  const match = normalizeAmount(value).trim().match(amountPattern);
  if (!match) return null;
  const result = [numberValue(match[1]), ...(match[2] ? [numberValue(match[2])] : [])];
  return result.every(n => Number.isFinite(n) && n >= 0) ? result : null;
}
export function formatNumber(value) {
  const whole = Math.floor(value), part = value - whole;
  for (const [n, d] of [[1, 8], [1, 4], [1, 3], [3, 8], [1, 2], [5, 8], [2, 3], [3, 4], [7, 8]]) {
    if (Math.abs(part - n / d) < 0.00001) return `${whole ? whole + ' ' : ''}${n}/${d}`;
  }
  return String(Number(value.toFixed(value > 0 && value < 0.01 ? 4 : 2)));
}
export function scaleAmount(value, factor) {
  const parsed = parseAmount(value);
  return parsed ? parsed.map(n => formatNumber(n * factor)).join('–') : value;
}
const units = /^(fluid ounces?|fl\.?\s*oz\.?|tablespoons?|teaspoons?|tbsp\.?|tsp\.?|cups?|kilograms?|kg|grams?|g|milligrams?|mg|millilit(?:er|re)s?|ml|lit(?:er|re)s?|l|ounces?|oz\.?|pounds?|lbs?\.?|cans?|jars?|packages?|packets?|bunch(?:es)?|cloves?|slices?|pinch(?:es)?|dashes?)\b\.?\s*/i;
export function parseIngredient(original, index = 0) {
  let text = normalizeAmount(original).trim().replace(/^[-*•]\s*/, '');
  const amountMatch = text.match(prefixPattern);
  const amount = amountMatch?.[1] || '';
  if (amountMatch) text = text.slice(amountMatch[0].length);
  const unitMatch = text.match(units);
  const unit = unitMatch ? unitMatch[1] : '';
  if (unitMatch) text = text.slice(unitMatch[0].length);
  return { id: `ingredient-${index}-${Math.random().toString(36).slice(2, 9)}`, original, amount, unit, name: text, reviewed: false, override: null, checked: false };
}
export function parseRecipe(text) {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const servingLine = lines.find(l => /^(?:serves|servings|yield)\s*:?\s*\d+/i.test(l) || /^\d+\s+servings?$/i.test(l));
  const servingMatch = servingLine?.match(/^(?:serves|servings)\s*:?\s*(\d+(?:\.\d+)?)(?:\s*(?:people|persons|servings?))?\s*$/i) || servingLine?.match(/^(\d+(?:\.\d+)?)\s+servings?$/i);
  let title = 'My recipe';
  const marker = lines.findIndex(l => /^ingredients\s*:?$/i.test(l));
  if ((marker > 0 || servingLine) && lines[0] && !/^ingredients\s*:?$/i.test(lines[0]) && lines[0] !== servingLine && !prefixPattern.test(normalizeAmount(lines[0]))) title = lines[0];
  const start = marker >= 0 ? marker + 1 : title !== 'My recipe' ? 1 : 0;
  const ingredients = [], notes = lines.slice(title !== 'My recipe' ? 1 : 0, marker >= 0 ? marker : 0).filter(l => l !== servingLine);
  let instructions = false;
  lines.slice(start).forEach(line => {
    if (line === servingLine) return;
    if (/^(?:instructions|directions|method|steps|preparation)\s*:?$/i.test(line)) instructions = true;
    if (instructions) notes.push(line);
    else ingredients.push(parseIngredient(line, ingredients.length));
  });
  return { title, originalServings: servingMatch ? Number(servingMatch[1]) : '', targetServings: servingMatch ? Number(servingMatch[1]) : '', ingredients, notes: notes.join('\n'), sourceText: text, sourceUrl: '', sourceKind: 'Pasted recipe text' };
}
export function validServings(value) { return Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= 10000; }
export function quantity(item, original, target) { return item.override !== null ? item.override : scaleAmount(item.amount, validServings(original) && validServings(target) ? Number(target) / Number(original) : 1); }
export function listText(recipe) {
  return `${recipe.title}\nShopping for ${recipe.targetServings} people\n\n` + recipe.ingredients.map(i => `${i.checked ? '[x]' : '[ ]'} ${[quantity(i, recipe.originalServings, recipe.targetServings), i.unit, i.name].filter(Boolean).join(' ')}`).join('\n');
}
export const exampleRecipe = 'Lemon & spinach pasta\nServes 4\nIngredients\n400 g pasta\n2 tbsp olive oil\n3 cloves garlic, minced\n1–2 lemons\n150 g baby spinach\n1/2 cup parmesan, grated\nSalt and pepper to taste\nInstructions\nCook pasta, then toss with the remaining ingredients.';
