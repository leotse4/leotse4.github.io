import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import PlannerDialog from './PlannerDialog';
import { DAYS, fromDateKey, leftoverChoices } from '../../lib/planner';
import { validServings } from '../../lib/recipe';

export default function MealPicker({ state, weekKey, slot, onRecipe, onLeftovers, onCreate, onClose }) {
  const [query, setQuery] = useState(''), [showAll, setShowAll] = useState(false);
  const lunch = slot.endsWith('-lunch'), choices = lunch ? leftoverChoices(state, weekKey, slot) : [];
  const recipes = state.recipes.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) && (!lunch || showAll || r.category === 'Lunch'));
  return <PlannerDialog title={`Choose ${DAYS[Number(slot[0])]} ${slot.split('-')[1]}`} onClose={onClose} wide>
    {lunch && <section className="mp-leftover-picker"><h3>Use dinner leftovers</h3><p className="mp-help">Reserve {state.defaultServings} lunch servings. The dinner’s cooking quantity and groceries increase automatically; lunch is not counted again.</p>{choices.length ? <div className="mp-picker-list">{choices.map(choice => <button key={choice.sourceWeek + choice.sourceSlot} className="mp-picker-recipe" onClick={() => onLeftovers(choice.sourceWeek, choice.sourceSlot)}><span className="mp-picker-symbol" aria-hidden="true">◒</span><span><strong>{choice.recipe.title}</strong><small>{fromDateKey(choice.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} dinner{choice.sourceWeek !== weekKey ? ' · groceries in previous week' : ''}</small></span><Plus size={18} /></button>)}</div> : <p className="mp-help">Plan an earlier dinner first, or choose a quick lunch below.</p>}</section>}
    <h3 className="mp-picker-subheading">{lunch ? 'Or make a quick lunch' : 'Pick a recipe'}</h3>
    <label className="mp-search"><Search size={18} /><input type="search" aria-label="Find a recipe to plan" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your recipes…" /></label>
    {lunch && <label className="mp-toggle mp-show-all"><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />Show all recipes</label>}
    <p className="mp-help">New meals use {state.defaultServings} servings. Adjust the count on the calendar.</p><div className="mp-picker-list">{recipes.map(recipe => <button key={recipe.id} className="mp-picker-recipe" disabled={!validServings(recipe.originalServings)} onClick={() => onRecipe(recipe.id)}><span><strong>{recipe.title}</strong><small>{recipe.category} · {recipe.minutes ? `${recipe.minutes} min · ` : ''}{validServings(recipe.originalServings) ? `${recipe.originalServings} original servings` : 'Edit original servings in your library first'}</small></span><Plus size={18} /></button>)}</div>{!recipes.length && <p className="mp-help">No matching recipes. Try another search or show all recipes.</p>}<button className="mp-btn" onClick={onCreate}><Plus size={17} />Create a new recipe</button>
  </PlannerDialog>;
}
