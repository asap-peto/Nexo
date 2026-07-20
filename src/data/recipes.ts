import type { Recipe, MealType } from '../types'

export const MEAL_LABELS: Record<MealType, string> = {
  cafe_da_manha: 'Café da manhã',
  almoco: 'Almoço',
  janta: 'Janta',
  lanche: 'Lanche',
}

export const MEAL_ORDER: MealType[] = ['cafe_da_manha', 'almoco', 'janta', 'lanche']

// Receitas curadas: rápidas, com proteína, ingredientes fáceis. São sugestões
// para facilitar a decisão do dia — não um plano alimentar. Adicionar receita
// futura = só acrescentar um item aqui (nada mais precisa mudar).
export const recipes: Recipe[] = [
  {
    id: 'ovos-espinafre-cottage',
    title: 'Ovos mexidos com espinafre e cottage',
    time_min: 5,
    meal_type: ['cafe_da_manha'],
    ingredients: ['3 ovos', '1 punhado de espinafre picado', '2 col. sopa de queijo cottage', 'sal e pimenta'],
    steps:
      'Bata os ovos, refogue o espinafre rapidamente na frigideira, adicione os ovos e mexa em fogo baixo. Misture o cottage no final, fora do fogo.',
  },
  {
    id: 'iogurte-aveia-banana',
    title: 'Iogurte com aveia, canela e banana',
    time_min: 2,
    meal_type: ['cafe_da_manha', 'lanche'],
    ingredients: ['1 pote de iogurte natural', '3 col. sopa de aveia', '1 banana fatiada', 'canela a gosto'],
    steps: 'Misture tudo numa tigela. Pode preparar na noite anterior e deixar na geladeira.',
  },
  {
    id: 'frango-arroz-brocolis',
    title: 'Frango grelhado com arroz integral e brócolis no vapor',
    time_min: 25,
    meal_type: ['almoco', 'janta'],
    ingredients: ['1 filé de frango', 'meia xícara de arroz integral cozido', '1 xícara de brócolis'],
    steps:
      'Tempere o frango e grelhe 5-6 min de cada lado. Cozinhe o brócolis no vapor 4 min. Sirva junto com o arroz.',
  },
  {
    id: 'omelete-forno-legumes',
    title: 'Omelete de forno com legumes (rende 3-4 porções)',
    time_min: 25,
    meal_type: ['cafe_da_manha', 'almoco'],
    ingredients: ['6 ovos', '1 abobrinha ralada', '1 cenoura ralada', 'cebola picada', 'sal'],
    steps:
      'Misture tudo, despeje numa forma untada, leve ao forno 180°C por 20 min. Corte em fatias e guarde na geladeira pra comer ao longo da semana.',
  },
  {
    id: 'salada-atum-grao-bico',
    title: 'Salada de atum com grão-de-bico e limão',
    time_min: 8,
    meal_type: ['almoco'],
    ingredients: ['1 lata de atum', '1 xícara de grão-de-bico cozido', 'meio limão', 'azeite', 'salsinha'],
    steps: 'Misture tudo numa tigela, tempere com limão e azeite.',
  },
  {
    id: 'sopa-lentilha-legumes',
    title: 'Sopa de lentilha com legumes (rende 3 porções)',
    time_min: 30,
    meal_type: ['janta'],
    ingredients: ['1 xícara de lentilha', '1 cenoura', '1 cebola', '1 tomate', 'caldo de legumes'],
    steps:
      'Refogue a cebola e o tomate, adicione a lentilha, a cenoura picada e o caldo. Cozinhe 20-25 min até a lentilha amolecer.',
  },
  {
    id: 'wrap-frango-desfiado',
    title: 'Wrap integral de frango desfiado',
    time_min: 10,
    meal_type: ['lanche', 'janta'],
    ingredients: [
      '1 pão wrap integral',
      'frango desfiado (pode ser sobra do dia anterior)',
      'alface',
      'iogurte natural como molho',
    ],
    steps: 'Monte o wrap com o frango, alface e um fio de iogurte temperado no lugar de maionese.',
  },
  {
    id: 'castanhas-queijo-magro',
    title: 'Mix de castanhas e queijo magro',
    time_min: 1,
    meal_type: ['lanche'],
    ingredients: ['um punhado de castanhas variadas', '2 fatias de queijo magro (minas ou cottage em cubos)'],
    steps: 'Sem preparo — bom pra ter sempre à mão quando bater a fome fora de hora.',
  },
]
