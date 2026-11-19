import { useEffect, useRef, useState } from 'react';
import { Check, Clipboard, CookingPot, Link2, ListChecks, Plus, Printer, RotateCcw, Trash2 } from 'lucide-react';
import { exampleRecipe, listText, parseAmount, parseIngredient, parseRecipe, quantity, validServings } from '../lib/recipe';
import './Recipes.css';

const storageKey = 'leo-recipe-list-v1';
const empty = { title: '', originalServings: '', targetServings: '', ingredients: [], notes: '', sourceText: '', sourceUrl: '', sourceKind: '', stage: 'import', draft: '', link: '' };
function restore() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey));
    if (data?.version === 1 && Array.isArray(data.recipe?.ingredients) && data.recipe.ingredients.every(i => typeof i.name === 'string' && typeof i.amount === 'string' && typeof i.unit === 'string' && (i.override === null || typeof i.override === 'string')) && ['import', 'review', 'shop'].includes(data.recipe.stage)) return { ...empty, ...data.recipe };
  } catch { /* A fresh session remains usable if saved data cannot be read. */ }
  return { ...empty };
}

export default function Recipes() {
  const [recipe, setRecipe] = useState(restore);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved on this device');
  const titleRef = useRef(null);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, recipe })); setSaveStatus('Saved on this device'); }
    catch { setSaveStatus('Device saving unavailable. Copy your list before leaving.'); }
  }, [recipe]);
  const update = patch => setRecipe(r => ({ ...r, ...patch }));
  const edit = (id, patch) => setRecipe(r => ({ ...r, ingredients: r.ingredients.map(i => i.id === id ? { ...i, ...patch } : i) }));
  const openRecipe = data => { setRecipe(r => ({ ...r, ...data, stage: 'review' })); setMessage('Recipe loaded. Review every ingredient and confirm the serving count.'); requestAnimationFrame(() => titleRef.current?.focus()); };
  const hasServings = validServings(recipe.originalServings) && validServings(recipe.targetServings);
  const invalidItems = recipe.ingredients.some(i => !i.name.trim());
  const checked = recipe.ingredients.filter(i => i.checked).length;
  const needsReview = recipe.ingredients.filter(i => !i.reviewed && (!i.amount || !parseAmount(i.amount))).length;
  async function importLink() {
    setMessage('');
    let url;
    try { url = new URL(recipe.link); if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error(); }
    catch { setMessage('Enter a complete public website URL, including https://.'); return; }
    if (/(^|\.)(youtube\.com|youtu\.be|instagram\.com)$/.test(url.hostname)) { setMessage('This release cannot read videos, captions, or transcripts from this link. Paste the recipe caption or transcript below, or import the linked recipe website. No video was analyzed.'); return; }
    const endpoint = import.meta.env.VITE_RECIPE_IMPORT_URL;
    if (!endpoint) { setMessage('Website importing is not connected yet. Copy the ingredients and serving count from the website into the recipe text box below.'); return; }
    setBusy(true);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.href }), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The page could not be read.');
      if (!Array.isArray(data.ingredients) || !data.ingredients.length || !data.ingredients.every(i => typeof i === 'string')) throw new Error('No ingredient list was available.');
      openRecipe({ title: data.title || 'Imported recipe', originalServings: data.servings || '', targetServings: data.servings || '', ingredients: data.ingredients.map(parseIngredient), notes: '', sourceText: data.ingredients.join('\n'), sourceUrl: url.href, sourceKind: 'Website recipe data' });
      if (!data.servings) setMessage(`Ingredients imported. ${data.yield ? `The website says “${data.yield}”. ` : ''}Enter the original number of people served; it could not be confirmed.`);
    } catch (error) { setMessage(`${error.name === 'TimeoutError' ? 'The website took too long to respond.' : error.message} Paste the recipe ingredients and serving count below to continue.`); }
    finally { setBusy(false); }
  }
  async function copyList() {
    if (!hasServings || invalidItems) { setMessage('Enter valid serving counts and ingredient names before copying.'); return; }
    try { await navigator.clipboard.writeText(listText(recipe)); setMessage('Shopping list copied.'); }
    catch { setMessage('Copy is unavailable in this browser. Select and copy the list in the text box below.'); }
  }
  const switchStage = stage => { update({ stage }); setMessage(''); };
  return <div className="container recipe-tool">
    <div className="recipe-heading"><div><p className="recipe-eyebrow"><CookingPot size={18} aria-hidden="true" /> A LITTLE LESS MEAL MATH</p><h1>From recipe to <span className="text-accent">ready to shop.</span></h1><p className="text-muted">Your ingredients. Your headcount. One simple shopping list.</p></div><span className="recipe-save"><Check size={16} aria-hidden="true" />{saveStatus}</span></div>
    <nav className="recipe-steps" aria-label="Recipe progress">{[['import', 'Add a recipe'], ['review', 'Review & scale'], ['shop', 'Shopping list']].map(([stage, label]) => <button key={stage} aria-current={recipe.stage === stage ? 'step' : undefined} disabled={stage !== 'import' && (!recipe.ingredients.length || (stage === 'shop' && (!hasServings || invalidItems)))} onClick={() => switchStage(stage)}>{label}</button>)}</nav>
    <div className="recipe-message" role="status" aria-live="polite">{message}</div>
    {recipe.stage === 'import' ? <div className="recipe-import-layout">
      <section className="recipe-card"><div className="recipe-section-title"><Clipboard aria-hidden="true" /><h2>Start with a recipe</h2></div><p className="text-muted">Paste ingredient lines, a caption, or a transcript. Include the title and “Serves 4” if you have them.</p><label htmlFor="recipe-text">Recipe text</label><textarea id="recipe-text" rows={12} value={recipe.draft} onChange={e => update({ draft: e.target.value })} placeholder={'Weeknight pasta\nServes 4\nIngredients\n400 g pasta\n2 tbsp olive oil\nSalt to taste'} maxLength={50000} /><div className="recipe-actions"><button className="btn btn-primary" disabled={!recipe.draft.trim()} onClick={() => { const parsed = parseRecipe(recipe.draft); if (!parsed.ingredients.length) setMessage('Add at least one ingredient line before continuing.'); else openRecipe(parsed); }}>Review ingredients</button><button className="recipe-button" onClick={() => { update({ draft: exampleRecipe }); openRecipe(parseRecipe(exampleRecipe)); }}>Try an example</button></div>{recipe.ingredients.length > 0 && <p className="recipe-small">Loading another recipe replaces your current list. Your current list is kept until you load one.</p>}</section>
      <aside><section className="recipe-card"><div className="recipe-section-title"><Link2 aria-hidden="true" /><h2>Have a link?</h2></div><p className="text-muted">Import ingredient data from supported public recipe websites.</p><label htmlFor="recipe-url">Recipe website or video link</label><input id="recipe-url" type="url" value={recipe.link} onChange={e => update({ link: e.target.value })} placeholder="https://…" maxLength={2048} /><button className="recipe-button recipe-wide" disabled={busy || !recipe.link.trim()} onClick={importLink}>{busy ? 'Reading recipe…' : 'Import recipe link'}</button><p className="recipe-small">YouTube & Instagram: paste the caption or transcript if the link cannot be read. This tool does not analyze video.</p></section><div className="recipe-tip"><h3>A list that fits your table</h3><p>400 g of pasta for four becomes 600 g for six. Fractions and ranges scale too.</p><p>No account needed. Your recipe stays on this browser unless you copy or print it.</p></div></aside>
    </div> : <>
      <div className="recipe-workspace"><section className="recipe-card recipe-main-card"><div className="recipe-section-title"><ListChecks aria-hidden="true" /><h2>{recipe.stage === 'review' ? 'Make it your recipe' : 'Your shopping list'}</h2></div>
        <label htmlFor="recipe-title">Recipe name</label><input ref={titleRef} id="recipe-title" value={recipe.title} maxLength={200} onChange={e => update({ title: e.target.value })} />
        <p className="recipe-small">{recipe.sourceKind}{recipe.sourceUrl && <> · <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">View source recipe</a></>}</p>
        {recipe.stage === 'review' ? <><p className="recipe-review-note">Edit the original amounts below. Uncertain lines stay in your list for you to check.{needsReview > 0 && ` ${needsReview} ${needsReview === 1 ? 'line needs' : 'lines need'} review.`}</p>
          {recipe.ingredients.map((item, idx) => <div className="recipe-ingredient" key={item.id}><div className="recipe-ingredient-fields"><label>Amount<input aria-label={`Original amount ${idx + 1}`} value={item.amount} onChange={e => edit(item.id, { amount: e.target.value, reviewed: false })} /></label><label>Unit<input aria-label={`Unit ${idx + 1}`} value={item.unit} onChange={e => edit(item.id, { unit: e.target.value })} /></label><label className="recipe-name-field">Ingredient<input aria-label={`Ingredient ${idx + 1}`} value={item.name} onChange={e => edit(item.id, { name: e.target.value })} /></label><button className="recipe-icon-button" aria-label={`Remove ingredient ${idx + 1}`} onClick={() => update({ ingredients: recipe.ingredients.filter(i => i.id !== item.id) })}><Trash2 size={18} /></button></div>
          <p className="recipe-original">Original: {item.original || 'Added by you'}</p>{(!item.amount || !parseAmount(item.amount)) && <label className="recipe-confirm"><input type="checkbox" checked={item.reviewed} onChange={e => edit(item.id, { reviewed: e.target.checked })} />{item.reviewed ? 'Reviewed · kept as written' : 'Check this amount · kept as written'}</label>}</div>)}
        </> : <><div className="recipe-progress-label"><span>{checked} of {recipe.ingredients.length} items in your basket</span><strong>{recipe.ingredients.length && checked === recipe.ingredients.length ? 'All done!' : `${recipe.targetServings} people`}</strong></div><progress value={checked} max={recipe.ingredients.length || 1} aria-label="Shopping progress" />
          <ul className="recipe-shopping">{recipe.ingredients.map((item, idx) => <li key={item.id} className={item.checked ? 'is-checked' : ''}><label className="recipe-check"><input type="checkbox" checked={item.checked} onChange={e => edit(item.id, { checked: e.target.checked })} /><span>{item.name}<small>{item.unit || 'No unit specified'}</small></span></label><label className="recipe-shopping-amount"><span className="recipe-small">Quantity{item.override !== null ? ' · manual' : ''}</span><input aria-label={`Shopping quantity for ${item.name || idx + 1}`} value={quantity(item, recipe.originalServings, recipe.targetServings)} placeholder="As needed" onChange={e => edit(item.id, { override: e.target.value })} />{item.override !== null && <button onClick={() => edit(item.id, { override: null })} className="recipe-reset"><RotateCcw size={13} aria-hidden="true" /> Use scaled</button>}</label><button className="recipe-icon-button" aria-label={`Remove ${item.name}`} onClick={() => update({ ingredients: recipe.ingredients.filter(i => i.id !== item.id) })}><Trash2 size={18} /></button></li>)}</ul><p className="recipe-small">Manual quantities stay fixed when the headcount changes. Use “Use scaled” to restore automatic scaling. For 1½ onions, you may choose to buy two; purchase amounts are your choice.</p></>}
        <button className="recipe-button" onClick={() => update({ ingredients: [...recipe.ingredients, parseIngredient('', recipe.ingredients.length)] , stage: 'review' })}><Plus size={18} aria-hidden="true" /> Add ingredient</button>
        <details className="recipe-source"><summary>Original text & retained notes</summary><pre>{recipe.sourceText}{recipe.notes && !recipe.sourceText.includes(recipe.notes) ? '\n\n' + recipe.notes : ''}</pre></details>
      </section>
      <aside className="recipe-sidebar"><section className="recipe-card"><p className="recipe-eyebrow">SET YOUR TABLE</p><h2>How many people?</h2><label htmlFor="original-servings">Original recipe serves</label><input id="original-servings" type="number" min="0.1" max="10000" step="any" value={recipe.originalServings} onChange={e => update({ originalServings: e.target.value })} placeholder="Required" /><label htmlFor="target-servings">People to feed</label><input id="target-servings" type="number" min="0.1" max="10000" step="any" value={recipe.targetServings} onChange={e => update({ targetServings: e.target.value })} placeholder="Required" /><p className="recipe-scale">{hasServings ? `${Number((recipe.targetServings / recipe.originalServings).toFixed(3))}× the original recipe` : 'Enter both serving counts to scale.'}</p><p className="recipe-small">Only ingredient amounts scale. Check cooking time and equipment separately.</p>{recipe.stage === 'review' && <button className="btn btn-primary recipe-wide" disabled={!hasServings || !recipe.ingredients.length || invalidItems} onClick={() => switchStage('shop')}>Make shopping list</button>}{invalidItems && <p className="recipe-small">Give each ingredient a name to continue.</p>}</section>
      {recipe.stage === 'shop' && <section className="recipe-card recipe-export"><h3>Take it with you</h3><button className="recipe-button" disabled={!hasServings || invalidItems} onClick={copyList}><Clipboard size={18} aria-hidden="true" /> Copy list</button><button className="recipe-button" disabled={!hasServings || invalidItems} onClick={() => window.print()}><Printer size={18} aria-hidden="true" /> Print list</button><details><summary>Plain text list</summary><textarea readOnly aria-label="Copyable shopping list" value={hasServings ? listText(recipe) : 'Enter valid serving counts first.'} rows={10} onFocus={e => e.target.select()} /></details><button className="recipe-button" onClick={() => switchStage('review')}>Edit recipe ingredients</button></section>}
      <p className="recipe-small">One recipe at a time. Units are kept as written. Nothing is automatically merged or converted.</p></aside></div>
      <div className="recipe-print"><h1>{recipe.title}</h1><p>Shopping for {recipe.targetServings} people</p><pre>{listText(recipe).split('\n').slice(3).join('\n')}</pre></div>
    </>}
  </div>;
}
