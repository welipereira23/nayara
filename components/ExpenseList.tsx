'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  useToast,
  Card,
  CardBody,
  Center,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  ToastId,
} from '@chakra-ui/react'
import {
  MdDelete,
  MdFastfood,
  MdDirectionsBus,
  MdHome,
  MdLocalHospital,
  MdSchool,
  MdSportsEsports,
  MdShoppingBag,
  MdMore,
  MdMoreVert,
  MdReceiptLong,
  MdDeleteSweep,
} from 'react-icons/md'
import { Expense, getExpenses, deleteExpense } from '../utils/expenses'
import { useRef, useState, useEffect } from 'react'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const categoryIcons = {
  'Alimentação': MdFastfood,
  'Transporte': MdDirectionsBus,
  'Moradia': MdHome,
  'Saúde': MdLocalHospital,
  'Educação': MdSchool,
  'Lazer': MdSportsEsports,
  'Compras': MdShoppingBag,
  'Outros': MdMore,
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

interface ExpenseListProps {
  currentDate: Date
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Alimentação':
      return MdFastfood
    case 'Transporte':
      return MdDirectionsBus
    case 'Moradia':
      return MdHome
    case 'Saúde':
      return MdLocalHospital
    case 'Educação':
      return MdSchool
    case 'Lazer':
      return MdSportsEsports
    case 'Compras':
      return MdShoppingBag
    default:
      return MdMore
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Alimentação':
      return 'blue.500'
    case 'Transporte':
      return 'red.500'
    case 'Moradia':
      return 'green.500'
    case 'Saúde':
      return 'purple.500'
    case 'Educação':
      return 'yellow.500'
    case 'Lazer':
      return 'orange.500'
    case 'Compras':
      return 'pink.500'
    default:
      return 'gray.500'
  }
}

const getCategoryColorScheme = (category: string) => {
  switch (category) {
    case 'Alimentação':
      return 'blue'
    case 'Transporte':
      return 'red'
    case 'Moradia':
      return 'green'
    case 'Saúde':
      return 'purple'
    case 'Educação':
      return 'yellow'
    case 'Lazer':
      return 'orange'
    case 'Compras':
      return 'pink'
    default:
      return 'gray'
  }
}

export default function ExpenseList({ currentDate }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const toastIdRef = useRef<ToastId>()

  useEffect(() => {
    const fetchExpenses = async () => {
      if (isLoading) return // Evita múltiplas chamadas simultâneas
      
      setIsLoading(true)
      try {
        const startDate = new Date(currentDate)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(currentDate)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)
        endDate.setHours(23, 59, 59, 999)

        const data = await getExpenses(startDate, endDate)
        setExpenses(data)
        
        // Limpa toast de erro se existir
        if (toastIdRef.current) {
          toast.close(toastIdRef.current)
          toastIdRef.current = undefined
        }
      } catch (error) {
        if (!toastIdRef.current) {
          toastIdRef.current = toast({
            title: 'Erro ao carregar despesas',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchExpenses()
  }, [currentDate, toast])

  const handleDelete = async (id: number, hasInstallments: boolean) => {
    try {
      if (hasInstallments) {
        const result = window.confirm(
          'Esta é uma despesa parcelada. Deseja excluir todas as parcelas ou apenas esta?'
        )
        await deleteExpense(id, result)
      } else {
        await deleteExpense(id, false)
      }

      toast({
        title: 'Despesa excluída com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir despesa',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      {expenses.map((expense) => (
        <Card
          key={expense.id}
          borderRadius="xl"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        >
          <CardBody>
            <HStack spacing={4}>
              <Center
                w="48px"
                h="48px"
                borderRadius="xl"
                bg={getCategoryColor(expense.category)}
                color="white"
              >
                <Icon as={getCategoryIcon(expense.category)} boxSize={5} />
              </Center>
              
              <VStack flex={1} align="start" spacing={1}>
                <HStack w="100%" justify="space-between">
                  <Text fontWeight="semibold" fontSize="md">
                    {expense.description}
                  </Text>
                  <Text color="red.500" fontWeight="bold">
                    R$ {expense.amount.toFixed(2)}
                  </Text>
                </HStack>
                
                <HStack spacing={4}>
                  <Badge
                    colorScheme={getCategoryColorScheme(expense.category)}
                    borderRadius="full"
                    px={2}
                    py={0.5}
                  >
                    {expense.category}
                  </Badge>
                  
                  <Text fontSize="sm" color="gray.500">
                    {new Date(expense.date).toLocaleDateString('pt-BR')}
                  </Text>
                  
                  {expense.installments && (
                    <Badge colorScheme="purple" borderRadius="full">
                      {expense.installment_number}/{expense.installments}
                    </Badge>
                  )}
                </HStack>
              </VStack>

              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<Icon as={MdMoreVert} />}
                  variant="ghost"
                  size="sm"
                  borderRadius="full"
                />
                <MenuList>
                  <MenuItem
                    icon={<Icon as={MdDelete} />}
                    onClick={() => handleDelete(expense.id!, !!expense.installments)}
                    color="red.500"
                  >
                    Excluir
                  </MenuItem>
                  {expense.installments && (
                    <MenuItem
                      icon={<Icon as={MdDeleteSweep} />}
                      onClick={() => handleDelete(expense.id!, true)}
                      color="red.500"
                    >
                      Excluir todas as parcelas
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </HStack>
          </CardBody>
        </Card>
      ))}
      
      {isLoading && (
        <Center py={8}>
          <Spinner size="lg" color="blue.500" />
        </Center>
      )}
      
      {!isLoading && expenses.length === 0 && (
        <Card borderRadius="xl" bg="gray.50">
          <CardBody>
            <Center py={8}>
              <VStack spacing={4}>
                <Icon as={MdReceiptLong} boxSize={12} color="gray.400" />
                <Text color="gray.500" textAlign="center">
                  Nenhuma despesa registrada neste mês
                </Text>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}
