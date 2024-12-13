export interface Expense {
  id: string
  created_at: string
  date: string
  description: string
  amount: number
  category: 'Pessoal' | 'Moradia' | 'Transporte'
}
