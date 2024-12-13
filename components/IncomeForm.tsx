'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  Switch,
  HStack,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { Income, INCOME_CATEGORIES, saveIncome } from '../utils/incomes'

export default function IncomeForm({ onIncomeAdded }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    recurrence_period: 'monthly' as 'monthly' | 'yearly'
  })
  const toast = useToast()

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      recurrence_period: 'monthly'
    })
    setIsRecurring(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Validação do valor
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, insira um valor válido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      setLoading(false)
      return
    }

    const incomeData: Partial<Income> = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      is_recurring: isRecurring,
      recurrence_period: isRecurring ? formData.recurrence_period : undefined,
    }

    try {
      await saveIncome(incomeData as Omit<Income, 'id' | 'user_id' | 'created_at'>)
      toast({
        title: 'Entrada registrada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      resetForm()

      // Notifica o componente pai antes de redirecionar
      if (onIncomeAdded) {
        onIncomeAdded()
      }

      // Pequeno delay antes de redirecionar para garantir que a atualização ocorra
      setTimeout(() => {
        router.push('/')
      }, 100)
    } catch (error: any) {
      toast({
        title: 'Erro ao registrar entrada',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Descrição</FormLabel>
          <Input 
            name="description" 
            placeholder="Ex: Salário"
            value={formData.description}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Valor</FormLabel>
          <InputGroup>
            <InputLeftElement
              pointerEvents='none'
              color='gray.500'
              children='R$'
            />
            <Input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            />
          </InputGroup>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Categoria</FormLabel>
          <Select 
            name="category" 
            placeholder="Selecione a categoria"
            value={formData.category}
            onChange={handleChange}
          >
            {INCOME_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Data</FormLabel>
          <Input 
            name="date" 
            type="date"
            value={formData.date}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <HStack justify="space-between">
            <FormLabel mb="0">Entrada Recorrente</FormLabel>
            <Switch
              colorScheme="income"
              isChecked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
          </HStack>
        </FormControl>

        {isRecurring && (
          <FormControl isRequired>
            <FormLabel>Periodicidade</FormLabel>
            <Select 
              name="recurrence_period" 
              value={formData.recurrence_period}
              onChange={handleChange}
            >
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </Select>
          </FormControl>
        )}

        <Button
          type="submit"
          colorScheme="green"
          size="lg"
          width="100%"
          isLoading={loading}
          loadingText="Salvando..."
          mb={4}
        >
          Registrar Entrada
        </Button>
      </VStack>
    </Box>
  )
}
