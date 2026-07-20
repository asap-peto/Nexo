import type { Recipe } from '../types'
import { RecipeCard } from '../components/RecipeCard'

export function Receitas({
  customRecipes,
  onSaveRecipe,
  onDeleteRecipe,
}: {
  customRecipes: Recipe[]
  onSaveRecipe: (recipe: Recipe) => Promise<void>
  onDeleteRecipe: (id: string) => Promise<void>
}) {
  return (
    <section className="card">
      <p className="card-title">Ideias de refeição</p>
      <p className="section-hint">Rápidas, com proteína e fáceis. Você pode adicionar, editar e excluir as suas.</p>
      <RecipeCard customRecipes={customRecipes} onSave={onSaveRecipe} onDelete={onDeleteRecipe} />
    </section>
  )
}
