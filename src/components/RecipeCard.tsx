import { useMemo, useState } from 'react'
import type { MealType, Recipe } from '../types'
import { recipes as builtinRecipes, MEAL_LABELS, MEAL_ORDER } from '../data/recipes'
import styles from './RecipeCard.module.css'

type Draft = {
  id: string
  title: string
  time_min: string
  meal_type: MealType[]
  ingredients: string
  steps: string
}

function emptyDraft(meal: MealType): Draft {
  return { id: '', title: '', time_min: '', meal_type: [meal], ingredients: '', steps: '' }
}

function toDraft(r: Recipe): Draft {
  return {
    id: r.id,
    title: r.title,
    time_min: String(r.time_min || ''),
    meal_type: r.meal_type,
    ingredients: r.ingredients.join('\n'),
    steps: r.steps,
  }
}

export function RecipeCard({
  customRecipes,
  onSave,
  onDelete,
}: {
  customRecipes: Recipe[]
  onSave: (recipe: Recipe) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [meal, setMeal] = useState<MealType>('cafe_da_manha')
  const [idx, setIdx] = useState(0)
  const [draft, setDraft] = useState<Draft | null>(null) // null = não editando

  const all = useMemo(() => [...builtinRecipes, ...customRecipes], [customRecipes])
  const filtered = useMemo(() => all.filter((r) => r.meal_type.includes(meal)), [all, meal])
  const recipe = filtered.length > 0 ? filtered[idx % filtered.length] : null

  function selectMeal(m: MealType) {
    setMeal(m)
    setIdx(0)
  }

  async function submitDraft() {
    if (!draft || !draft.title.trim()) return
    const recipeOut: Recipe = {
      id: draft.id,
      title: draft.title.trim(),
      time_min: Number(draft.time_min) || 0,
      meal_type: draft.meal_type.length ? draft.meal_type : [meal],
      ingredients: draft.ingredients
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      steps: draft.steps.trim(),
      custom: true,
    }
    await onSave(recipeOut)
    setDraft(null)
    setIdx(0)
  }

  function toggleMealType(m: MealType) {
    if (!draft) return
    setDraft({
      ...draft,
      meal_type: draft.meal_type.includes(m)
        ? draft.meal_type.filter((x) => x !== m)
        : [...draft.meal_type, m],
    })
  }

  // ---- Editor -------------------------------------------------------------
  if (draft) {
    return (
      <div className={styles.editor}>
        <div className={styles.editorHead}>
          <h4 className={styles.editorTitle}>{draft.id ? 'Editar receita' : 'Nova receita'}</h4>
          <button className={styles.close} onClick={() => setDraft(null)}>
            ✕
          </button>
        </div>

        <label className={styles.eField}>
          <span>Título</span>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </label>

        <label className={styles.eField}>
          <span>Tempo (min)</span>
          <input
            type="number"
            inputMode="numeric"
            value={draft.time_min}
            onChange={(e) => setDraft({ ...draft, time_min: e.target.value })}
          />
        </label>

        <div className={styles.eField}>
          <span>Refeições</span>
          <div className={styles.mealChips}>
            {MEAL_ORDER.map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.mealChip} ${draft.meal_type.includes(m) ? styles.mealChipOn : ''}`}
                onClick={() => toggleMealType(m)}
              >
                {MEAL_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.eField}>
          <span>Ingredientes (um por linha)</span>
          <textarea
            rows={4}
            value={draft.ingredients}
            onChange={(e) => setDraft({ ...draft, ingredients: e.target.value })}
          />
        </label>

        <label className={styles.eField}>
          <span>Modo de preparo</span>
          <textarea
            rows={3}
            value={draft.steps}
            onChange={(e) => setDraft({ ...draft, steps: e.target.value })}
          />
        </label>

        <button className="nb-btn" onClick={submitDraft} disabled={!draft.title.trim()}>
          Salvar receita
        </button>
      </div>
    )
  }

  // ---- Visualização -------------------------------------------------------
  return (
    <div>
      <div className={styles.tabs}>
        {MEAL_ORDER.map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.tab} ${meal === m ? styles.tabActive : ''}`}
            onClick={() => selectMeal(m)}
          >
            {MEAL_LABELS[m]}
          </button>
        ))}
      </div>

      {recipe ? (
        <div className={styles.recipe}>
          <div className={styles.recipeHead}>
            <h4 className={styles.recipeTitle}>
              {recipe.title}
              {recipe.custom && <span className={styles.customTag}>minha</span>}
            </h4>
            <span className={styles.time}>{recipe.time_min} min</span>
          </div>
          <ul className={styles.ingredients}>
            {recipe.ingredients.map((ing) => (
              <li key={ing}>{ing}</li>
            ))}
          </ul>
          <p className={styles.steps}>{recipe.steps}</p>
          <div className={styles.footer}>
            <span className={styles.count}>
              {(idx % filtered.length) + 1} de {filtered.length}
            </span>
            <div className={styles.footerBtns}>
              {recipe.custom && (
                <>
                  <button className={styles.iconBtn} onClick={() => setDraft(toDraft(recipe))} title="Editar">
                    ✎
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={() => onDelete(recipe.id)}
                    title="Excluir"
                  >
                    🗑
                  </button>
                </>
              )}
              <button
                type="button"
                className={styles.next}
                onClick={() => setIdx((i) => i + 1)}
                disabled={filtered.length <= 1}
              >
                Próxima →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className={styles.empty}>Nenhuma receita para este filtro.</p>
      )}

      <button className={`nb-btn nb-btn--ghost ${styles.newBtn}`} onClick={() => setDraft(emptyDraft(meal))}>
        + Nova receita
      </button>
    </div>
  )
}
