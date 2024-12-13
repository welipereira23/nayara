import { supabase } from '../lib/supabase'

export interface Income {
  id?: number
  user_id: string
  date: string
  description: string
  amount: number
  category: string
  created_at?: string
  is_recurring?: boolean
  recurrence_period?: 'monthly' | 'yearly'
}

export interface MonthData {
  month: number
  year: number
  incomes: Income[]
  total: number
}

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Aluguel',
  'Bônus',
  'Outros'
]

export const saveIncome = async (income: Omit<Income, 'id' | 'user_id' | 'created_at'>) => {
  try {
    console.log('Iniciando saveIncome com dados:', income)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Usuário não autenticado')
    console.log('Usuário autenticado:', userData.user.id)

    const incomeData = {
      ...income,
      user_id: userData.user.id,
    }

    console.log('Enviando dados para o Supabase:', incomeData)

    const { data, error } = await supabase
      .from('incomes')
      .insert(incomeData)
      .select()

    if (error) {
      console.error('Erro ao salvar no Supabase:', error)
      throw error
    }

    console.log('Entrada salva com sucesso:', data)
    return data
  } catch (error) {
    console.error('Erro em saveIncome:', error)
    throw error
  }
}

export async function getIncomes(startDate: Date, endDate: Date): Promise<Income[]> {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Usuário não autenticado')

    const { data: incomes, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userData.user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      throw error
    }

    return incomes || []
  } catch (error) {
    console.error('Error fetching incomes:', error)
    return []
  }
}

export const getMonthsRange = async (range: number = 12) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Usuário não autenticado')

  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - range + 1, 1)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  // Busca todos os dados de uma vez
  const { data: incomesData, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('user_id', userData.user.id)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (error) throw error

  // Agrupa por mês
  const months: MonthData[] = []
  for (let i = 0; i < range; i++) {
    const date = new Date(today)
    date.setMonth(today.getMonth() - i)
    
    const month = date.getMonth()
    const year = date.getFullYear()
    
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    
    const incomes = incomesData.filter(income => {
      const incomeDate = new Date(income.date)
      return incomeDate >= monthStart && incomeDate <= monthEnd
    })
    
    const total = incomes.reduce((sum, income) => sum + income.amount, 0)
    
    months.push({
      month,
      year,
      incomes,
      total
    })
  }

  return months
}

export const deleteIncome = async (id: number) => {
  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
