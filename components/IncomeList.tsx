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
} from '@chakra-ui/react'
import {
  MdDelete,
  MdWork,
  MdBusinessCenter,
  MdAttachMoney,
  MdHome,
  MdCardGiftcard,
  MdMore,
  MdMoreVert,
  MdReceiptLong,
} from 'react-icons/md'
import { Income, getIncomes, deleteIncome } from '../utils/incomes'
import { useRef, useState, useEffect } from 'react'

interface IncomeListProps {
  currentDate: Date
}

const categoryIcons = {
  'Salário': MdWork,
  'Freelance': MdBusinessCenter,
  'Investimentos': MdAttachMoney,
  'Aluguel': MdHome,
  'Bônus': MdCardGiftcard,
  'Outros': MdMore,
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Salário':
      return 'green.500'
    case 'Freelance':
      return 'blue.500'
    case 'Investimentos':
      return 'yellow.500'
    case 'Aluguel':
      return 'red.500'
    case 'Bônus':
      return 'purple.500'
    default:
      return 'gray.500'
  }
}

export default function IncomeList({ currentDate }: IncomeListProps) {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const toastIdRef = useRef<string>()

  useEffect(() => {
    fetchIncomes()
  }, [currentDate])

  const fetchIncomes = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      const startDate = new Date(currentDate)
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(currentDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0)
      endDate.setHours(23, 59, 59, 999)

      const data = await getIncomes(startDate, endDate)
      setIncomes(data)
      
      if (toastIdRef.current) {
        toast.close(toastIdRef.current)
        toastIdRef.current = undefined
      }
    } catch (error) {
      if (!toastIdRef.current) {
        toastIdRef.current = toast({
          title: 'Erro ao carregar entradas',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteIncome(id)
      toast({
        title: 'Entrada excluída com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir entrada',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      {incomes.map((income) => (
        <Card
          key={income.id}
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
                bg={getCategoryColor(income.category)}
                color="white"
              >
                <Icon as={categoryIcons[income.category] || MdMore} boxSize={5} />
              </Center>
              
              <VStack flex={1} align="start" spacing={1}>
                <HStack w="100%" justify="space-between">
                  <Text fontWeight="semibold" fontSize="md">
                    {income.description}
                  </Text>
                  <Text color="green.500" fontWeight="bold">
                    R$ {income.amount.toFixed(2)}
                  </Text>
                </HStack>
                
                <HStack spacing={4}>
                  <Badge
                    colorScheme="green"
                    borderRadius="full"
                    px={2}
                    py={0.5}
                  >
                    {income.category}
                  </Badge>
                  
                  <Text fontSize="sm" color="gray.500">
                    {new Date(income.date).toLocaleDateString('pt-BR')}
                  </Text>
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
                    onClick={() => handleDelete(income.id!)}
                    color="red.500"
                  >
                    Excluir
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </CardBody>
        </Card>
      ))}
      
      {isLoading && (
        <Center py={8}>
          <Spinner size="lg" color="green.500" />
        </Center>
      )}
      
      {!isLoading && incomes.length === 0 && (
        <Card borderRadius="xl" bg="gray.50">
          <CardBody>
            <Center py={8}>
              <VStack spacing={4}>
                <Icon as={MdReceiptLong} boxSize={12} color="gray.400" />
                <Text color="gray.500" textAlign="center">
                  Nenhuma entrada registrada neste mês
                </Text>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}
