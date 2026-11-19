import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PlannerDialog from './PlannerDialog';
import { parseIngredient, parseRecipe, validServings } from '../../lib/recipe';

export default function RecipeEditor({ recipe, stores, onSave, onClose }) {
  const [draft, setDraft] = useState(() => structuredClone(recipe));
  const [text, setText] = useState(''), [link, setLink] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const update = patch => setDraft(r => ({ ...r, ...patch }));
  const ingredient = (id, patch) => setDraft(r => ({ ...r, ingredients: r.ingredients.map(i => i.id === id ? { ...i, ...patch } : i) }));
  function useText() {
    const parsed = parseRecipe(text);
    if (!parsed.ingredients.length) { setMessage('Paste at least one ingredient line.'); return; }
    update({ title: parsed.title === 'My recipe' ? draft.title : parsed.title, originalServings: parsed.originalServings || draft.originalServings, ingredients: parsed.ingredients.map(i => ({ ...i, storeId: 'unassigned' })), notes: parsed.notes, sourceText: text, sourceKind: 'Pasted recipe text' });
    setMessage('Ingredients loaded. Check the amounts and original servings before saving.');
  }
  async function importWebsite() {
    let url;
    try { url = new URL(link); if (url.protocol !== 'https:' || url.username || url.password) throw new Error(); }
    catch { setMessage('Use a complete public HTTPS recipe URL.'); return; }
    if (/(^|\.)(youtube\.com|youtu\.be|instagram\.com)$/.test(url.hostname)) { setMessage('Paste the recipe caption or transcript instead. Video is not analyzed.'); return; }
    const endpoint = import.meta.env.VITE_RECIPE_IMPORT_URL;
    if (!endpoint) { setMessage('Website import is not connected. Paste the recipe text above to continue.'); return; }
    setBusy(true);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.href }), signal: AbortSignal.timeout(15000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The website could not be read.');
      if (!Array.isArray(result.ingredients) || !result.ingredients.length || !result.ingredients.every(i => typeof i === 'string')) throw new Error('No ingredient list was available.');
      update({ title: result.title || draft.title, originalServings: result.servings || '', ingredients: result.ingredients.map((line, index) => ({ ...parseIngredient(line, index), storeId: 'unassigned' })), sourceText: result.ingredients.join('\n'), sourceKind: 'Website recipe data', sourceUrl: url.href });
      setMessage(result.servings ? 'Ingredients imported. Review them before saving.' : 'Ingredients imported. Enter the original number of people served; the website yield could not be confirmed.');
    } catch (error) { setMessage(`${error.message} Paste the recipe text instead.`); }
    finally { setBusy(false); }
  }
  function save(event) {
    event.preventDefault();
    if (!draft.title.trim() || !validServings(draft.originalServings) || !draft.ingredients.length || draft.ingredients.some(i => !i.name.trim())) { setMessage('Add a recipe name, original servings, and at least one named ingredient.'); return; }
    onSave({ ...draft, title: draft.title.trim(), originalServings: Number(draft.originalServings), ingredients: draft.ingredients.map(i => ({ ...i, name: i.name.trim() })) });
  }
  return <PlannerDialog title={recipe.title ? 'Recipe details' : 'Add a recipe'} onClose={onClose} wide>
    <p className="mp-muted mp-editor-intro">Keep a recipe you can use every week. Ingredient amounts below are for the original serving count.</p>
    <details className="mp-import"><summary>Paste a recipe or import a website</summary><label>Recipe text<textarea rows={5} maxLength={50000} placeholder={'Recipe name\nServes 4\nIngredients\n400 g pasta\nInstructions\n…'} value={text} onChange={e => setText(e.target.value)} /></label><button type="button" className="mp-btn" disabled={!text.trim()} onClick={useText}>Read ingredients from text</button><div className="mp-link-import"><label>Recipe website<input type="url" value={link} maxLength={2048} onChange={e => setLink(e.target.value)} placeholder="https://…" /></label><button type="button" className="mp-btn" disabled={!link.trim() || busy} onClick={importWebsite}>{busy ? 'Reading…' : 'Import website'}</button></div><p className="mp-help">Pasted captions work too. Videos are not analyzed.</p></details>
    <p role="status" className="mp-inline-message">{message}</p>
    <form onSubmit={save}>
      <label>Recipe name<input value={draft.title} onChange={e => update({ title: e.target.value })} maxLength={160} required /></label>
      <div className="mp-editor-meta"><label>Original servings<input type="number" min="0.1" max="10000" step="any" value={draft.originalServings} onChange={e => update({ originalServings: e.target.value })} required /></label><label>Minutes <span className="mp-muted">(optional)</span><input type="number" min="1" max="10000" value={draft.minutes || ''} onChange={e => update({ minutes: e.target.value })} /></label><label>Meal type<select value={draft.category} onChange={e => update({ category: e.target.value })}>{['Breakfast', 'Lunch', 'Dinner', 'My recipes'].map(c => <option key={c}>{c}</option>)}</select></label></div>
      <div className="mp-section-line"><h3>Ingredients</h3><span className="mp-help">Store choices are your preferences.</span></div>
      <div className="mp-editor-ingredients">{draft.ingredients.map((i, n) => <div className="mp-editor-ingredient" key={i.id}><label>Amount<input aria-label={`Ingredient ${n + 1} amount`} value={i.amount} maxLength={80} placeholder="To taste" onChange={e => ingredient(i.id, { amount: e.target.value })} /></label><label>Unit<input aria-label={`Ingredient ${n + 1} unit`} value={i.unit} maxLength={50} placeholder="g, cup…" onChange={e => ingredient(i.id, { unit: e.target.value })} /></label><label className="mp-ingredient-name">Ingredient<input aria-label={`Ingredient ${n + 1} name`} value={i.name} maxLength={300} onChange={e => ingredient(i.id, { name: e.target.value })} required /></label><label className="mp-ingredient-store">Preferred store<select aria-label={`Ingredient ${n + 1} store`} value={stores.some(s => s.id === i.storeId) ? i.storeId : 'unassigned'} onChange={e => ingredient(i.id, { storeId: e.target.value })}>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><button className="mp-icon" type="button" aria-label={`Remove ingredient ${n + 1}`} onClick={() => update({ ingredients: draft.ingredients.filter(item => item.id !== i.id) })}><Trash2 size={17} /></button>{i.original && <p className="mp-help mp-original">Original: {i.original}</p>}</div>)}</div>
      <button type="button" className="mp-btn" onClick={() => update({ ingredients: [...draft.ingredients, { ...parseIngredient('', draft.ingredients.length), storeId: 'unassigned' }] })}><Plus size={16} /> Add ingredient</button>
      <label>Cooking instructions & notes<textarea rows={6} maxLength={15000} value={draft.notes} onChange={e => update({ notes: e.target.value })} placeholder="How to make it, substitutions, batch prep notes…" /></label>
      {draft.sourceText && <details className="mp-source"><summary>Original recipe text</summary><pre>{draft.sourceText}</pre></details>}
      <p className="mp-help">Edits update this recipe wherever it is planned. Quantities scale; cooking time and equipment do not.</p>
      <div className="mp-dialog-footer"><button type="button" className="mp-btn" onClick={onClose}>Cancel</button><button className="mp-btn mp-primary" type="submit">Save recipe</button></div>
    </form>
  </PlannerDialog>;
}
