'use client'

import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Progress,
  Icon,
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  useColorModeValue,
  Badge,
  Button,
  Collapse,
  Divider,
  List,
  ListItem,
} from '@chakra-ui/react'
import {
  MdHome,
  MdDirections,
  MdLocalHospital,
  MdSchool,
  MdRestaurant,
  MdSpa,
  MdSavings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from 'react-icons/md'
import { useEffect, useState } from 'react'
import { getExpenses } from '../utils/expenses'
import { getIncomes } from '../utils/incomes'

interface CategoryGroup {
  name: string
  emoji: string
  percentage: number
  categories: string[]
  icon: any
  color: string
}

const categoryGroups: CategoryGroup[] = [
  {
    name: 'Despesas Obrigatórias',
    emoji: '🏠',
    percentage: 50,
    categories: ['Moradia', 'Transporte', 'Saúde', 'Educação'],
    icon: MdHome,
    color: 'blue.400'
  },
  {
    name: 'Despesas do Dia a Dia',
    emoji: '🌟',
    percentage: 30,
    categories: ['Lazer', 'Alimentação'],
    icon: MdRestaurant,
    color: 'purple.400'
  },
  {
    name: 'Reserva',
    emoji: '💰',
    percentage: 20,
    categories: ['Investimentos'],
    icon: MdSavings,
    color: 'green.400'
  }
]

interface FinancialDiagnosticsProps {
  currentDate: Date
}

export default function FinancialDiagnostics({ currentDate }: FinancialDiagnosticsProps) {
  const [totalIncome, setTotalIncome] = useState(0)
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({})
  const cardBg = useColorModeValue('white', 'gray.800')

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const startDate = new Date(currentDate)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(currentDate)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)
        endDate.setHours(23, 59, 59, 999)

        const [expensesData, incomesData] = await Promise.all([
          getExpenses(startDate, endDate),
          getIncomes(startDate, endDate)
        ])

        setExpenses(expensesData)
        setTotalIncome(incomesData.reduce((acc, income) => acc + income.amount, 0))
        setIsLoading(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentDate])

  const calculateGroupMetrics = (group: CategoryGroup) => {
    const ideal = (totalIncome * group.percentage) / 100
    const spent = expenses
      .filter(expense => group.categories.includes(expense.category))
      .reduce((acc, expense) => acc + expense.amount, 0)
    const remaining = ideal - spent
    const percentage = ideal > 0 ? (spent / ideal) * 100 : 0

    return { ideal, spent, remaining, percentage }
  }

  const getGroupExpenses = (categories: string[]) => {
    return expenses.filter(expense => categories.includes(expense.category))
  }

  return (
    <Box>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        {categoryGroups.map((group) => {
          const { ideal, spent, remaining, percentage } = calculateGroupMetrics(group)
          const isOverBudget = remaining < 0
          const groupExpenses = getGroupExpenses(group.categories)

          return (
            <GridItem key={group.name}>
              <Card 
                bg={useColorModeValue(`${group.color.split('.')[0]}.50`, `${group.color.split('.')[0]}.900`)} 
                shadow="sm" 
                borderRadius="xl"
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={group.icon} boxSize={6} color={group.color} />
                        <Text fontWeight="bold" fontSize="lg">
                          {group.name} {group.emoji}
                        </Text>
                      </HStack>
                      <Badge
                        colorScheme={isOverBudget ? 'red' : 'green'}
                        borderRadius="full"
                        px={2}
                      >
                        {group.percentage}%
                      </Badge>
                    </HStack>

                    <Box position="relative" h="120px">
                      <CircularProgress
                        value={percentage > 100 ? 100 : percentage}
                        size="120px"
                        thickness="8px"
                        color={isOverBudget ? 'red.400' : group.color}
                        trackColor={useColorModeValue('gray.100', 'gray.700')}
                      >
                        <CircularProgressLabel>
                          <VStack spacing={0}>
                            <Text fontSize="sm" color="gray.500">
                              Usado
                            </Text>
                            <Text fontWeight="bold" fontSize="lg">
                              {percentage.toFixed(0)}%
                            </Text>
                          </VStack>
                        </CircularProgressLabel>
                      </CircularProgress>
                    </Box>

                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">Ideal</Text>
                        <Text fontWeight="semibold">R$ {ideal.toFixed(2)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">Gasto</Text>
                        <Text fontWeight="semibold">R$ {spent.toFixed(2)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.500">Disponível</Text>
                        <Text
                          fontWeight="semibold"
                          color={isOverBudget ? 'red.500' : 'green.500'}
                        >
                          R$ {Math.abs(remaining).toFixed(2)}
                          {isOverBudget ? ' excedido' : ''}
                        </Text>
                      </HStack>
                    </VStack>

                    <Progress
                      value={percentage > 100 ? 100 : percentage}
                      size="sm"
                      colorScheme={isOverBudget ? 'red' : 'green'}
                      borderRadius="full"
                    />

                    <Button
                      size="sm"
                      variant="ghost"
                      rightIcon={<Icon as={openGroups[group.name] ? MdKeyboardArrowUp : MdKeyboardArrowDown} />}
                      onClick={() => toggleGroup(group.name)}
                      color={group.color}
                    >
                      {openGroups[group.name] ? 'Ocultar' : 'Detalhar'} Lançamentos
                    </Button>

                    <Collapse in={openGroups[group.name]} animateOpacity>
                      <VStack align="stretch" spacing={2} pt={2}>
                        <Divider />
                        {groupExpenses.length > 0 ? (
                          <List spacing={2}>
                            {groupExpenses.map((expense, index) => (
                              <ListItem key={index}>
                                <HStack justify="space-between">
                                  <Text fontSize="sm">{expense.description}</Text>
                                  <Text fontSize="sm" fontWeight="semibold">
                                    R$ {expense.amount.toFixed(2)}
                                  </Text>
                                </HStack>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Text fontSize="sm" color="gray.500" textAlign="center">
                            Nenhum lançamento encontrado
                          </Text>
                        )}
                      </VStack>
                    </Collapse>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          )
        })}
      </Grid>
    </Box>
  )
}
