import { supabase } from '../lib/supabase'

export interface Expense {
  id?: number
  user_id: string
  date: string
  description: string
  amount: number
  category: string
  created_at?: string
  installments?: number
  installment_number?: number
  installment_group_id?: string
  total_amount?: number
}

export interface MonthData {
  month: number
  year: number
  expenses: Expense[]
  total: number
}

export const saveExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Usuário não autenticado')

    const installments = expense.installments || 1
    const total_amount = installments > 1 ? expense.amount * installments : expense.amount
    const installment_group_id = installments > 1 ? crypto.randomUUID() : undefined

    const expensesData = []
    const baseDate = new Date(expense.date)

    for (let i = 0; i < installments; i++) {
      const currentDate = new Date(baseDate)
      currentDate.setMonth(baseDate.getMonth() + i)

      const expenseItem = {
        description: expense.description,
        date: currentDate.toISOString().split('T')[0],
        amount: expense.amount,
        category: expense.category,
        total_amount: total_amount,
        installments: installments > 1 ? installments : null,
        installment_number: installments > 1 ? i + 1 : null,
        installment_group_id: installment_group_id || null,
        user_id: userData.user.id
      }

      expensesData.push(expenseItem)
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert(expensesData)
      .select()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    throw error
  }
}

export async function getExpenses(startDate: Date, endDate: Date): Promise<Expense[]> {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Usuário não autenticado')

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userData.user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      throw error
    }

    return expenses || []
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
}

export const getFutureExpenses = async (months: number = 12) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Usuário não autenticado')

  const today = new Date()
  const futureDate = new Date()
  futureDate.setMonth(today.getMonth() + months)

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userData.user.id)
    .gte('date', today.toISOString().split('T')[0])
    .lte('date', futureDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) throw error
  return data as Expense[]
}

export const deleteExpense = async (id: number, deleteAll: boolean = false) => {
  const { data: expense } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (!expense) throw new Error('Despesa não encontrada')

  if (deleteAll && expense.installment_group_id) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('installment_group_id', expense.installment_group_id)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const getMonthsRange = async (range: number = 12) => {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('Usuário não autenticado')

  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - range + 1, 1)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  // Busca todos os dados de uma vez
  const { data: expensesData, error } = await supabase
    .from('expenses')
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
    
    const expenses = expensesData.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= monthStart && expenseDate <= monthEnd
    })
    
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    months.push({
      month,
      year,
      expenses,
      total
    })
  }

  return months
}

export const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Compras',
  'Outros'
]
