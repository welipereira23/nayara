'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Spinner,
  Center,
  Flex,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  IconButton,
  useColorModeValue,
  Heading,
  Progress,
  Grid,
  GridItem,
  Button,
  SimpleGrid
} from '@chakra-ui/react'
import { MdTrendingUp, MdTrendingDown, MdAdd, MdChevronLeft, MdChevronRight, MdCalendarToday, MdInsights } from 'react-icons/md'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'
import IncomeForm from '../components/IncomeForm'
import IncomeList from '../components/IncomeList'
import FinancialDiagnostics from '../components/FinancialDiagnostics'
import { useAuth } from '../contexts/AuthContext'
import { getExpenses } from '../utils/expenses'
import { getIncomes } from '../utils/incomes'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Home() {
  const { isOpen: isExpenseOpen, onOpen: onExpenseOpen, onClose: onExpenseClose } = useDisclosure()
  const { isOpen: isIncomeOpen, onOpen: onIncomeOpen, onClose: onIncomeClose } = useDisclosure()
  const { user } = useAuth()
  const [expenseKey, setExpenseKey] = useState(0)
  const [incomeKey, setIncomeKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [tabIndex, setTabIndex] = useState(0)
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalIncome, setTotalIncome] = useState(0)
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const startDate = new Date(currentDate)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(currentDate)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)
        endDate.setHours(23, 59, 59, 999)

        const [expenses, incomes] = await Promise.all([
          getExpenses(startDate, endDate),
          getIncomes(startDate, endDate)
        ])

        setTotalExpenses(expenses.reduce((acc, expense) => acc + expense.amount, 0))
        setTotalIncome(incomes.reduce((acc, income) => acc + income.amount, 0))
        setIsLoading(false)
      } catch (error) {
        console.error('Erro ao carregar totais:', error)
        setIsLoading(false)
      }
    }

    fetchTotals()
  }, [currentDate, expenseKey, incomeKey])

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(prevDate.getMonth() + 1)
      return newDate
    })
  }

  const handleExpenseAdded = () => {
    setExpenseKey(prev => prev + 1)
    onExpenseClose()
  }

  const handleIncomeAdded = () => {
    setIncomeKey(prev => prev + 1)
    onIncomeClose()
  }

  if (!user) {
    return null
  }

  const expenseForm = <ExpenseForm onExpenseAdded={handleExpenseAdded} />
  const incomeForm = <IncomeForm onIncomeAdded={handleIncomeAdded} />

  return (
    <Box minH="100vh" bg="gray.50">
      <Container 
        maxW="container.xl" 
        py={{ base: 4, md: 8 }} 
        px={{ base: 2, md: 4 }}
      >
        {/* Header com Data e Navegação */}
        <HStack 
          mb={{ base: 4, md: 6 }} 
          justify="space-between" 
          align="center"
          bg="white"
          p={3}
          borderRadius="xl"
          shadow="sm"
        >
          <IconButton
            aria-label="Mês anterior"
            icon={<MdChevronLeft />}
            onClick={handlePreviousMonth}
            variant="ghost"
            size={{ base: "sm", md: "md" }}
          />
          <Text 
            fontSize={{ base: "lg", md: "xl" }} 
            fontWeight="bold"
            textAlign="center"
          >
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
          </Text>
          <IconButton
            aria-label="Próximo mês"
            icon={<MdChevronRight />}
            onClick={handleNextMonth}
            variant="ghost"
            size={{ base: "sm", md: "md" }}
          />
        </HStack>

        {/* Cards Principais */}
        <VStack spacing={{ base: 4, md: 6 }} w="full">
          {/* Card de Resumo Financeiro */}
          <Card
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            overflow="hidden"
            transition="all 0.2s"
            w="full"
          >
            <CardBody p={{ base: 3, md: 5 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Heading size={{ base: "md", md: "md" }} color="gray.700">Resumo do Mês</Heading>
                <SimpleGrid columns={{ base: 2, md: 2 }} spacing={{ base: 2, md: 4 }}>
                  <Box 
                    p={{ base: 3, md: 4 }} 
                    bg="red.50" 
                    borderRadius="lg"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <VStack align="stretch" spacing={1}>
                      <HStack justify="space-between">
                        <Text color="red.600" fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Saídas</Text>
                        <Icon as={MdTrendingDown} color="red.500" />
                      </HStack>
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="red.600">
                        R$ {totalExpenses.toFixed(2)}
                      </Text>
                      <Button
                        leftIcon={<MdAdd />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => setIsExpenseFormOpen(true)}
                        fontSize={{ base: "xs", md: "sm" }}
                      >
                        Adicionar
                      </Button>
                    </VStack>
                  </Box>
                  <Box 
                    p={{ base: 3, md: 4 }} 
                    bg="green.50" 
                    borderRadius="lg"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <VStack align="stretch" spacing={1}>
                      <HStack justify="space-between">
                        <Text color="green.600" fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Entradas</Text>
                        <Icon as={MdTrendingUp} color="green.500" />
                      </HStack>
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="green.600">
                        R$ {totalIncome.toFixed(2)}
                      </Text>
                      <Button
                        leftIcon={<MdAdd />}
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        onClick={() => setIsIncomeFormOpen(true)}
                        fontSize={{ base: "xs", md: "sm" }}
                      >
                        Adicionar
                      </Button>
                    </VStack>
                  </Box>
                </SimpleGrid>
                <Box 
                  p={{ base: 3, md: 4 }} 
                  bg="blue.50" 
                  borderRadius="lg"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                  transition="all 0.2s"
                >
                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text color="blue.600" fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>Saldo</Text>
                      <Icon 
                        as={totalIncome - totalExpenses >= 0 ? MdTrendingUp : MdTrendingDown} 
                        color={totalIncome - totalExpenses >= 0 ? "green.500" : "red.500"} 
                      />
                    </HStack>
                    <Text 
                      fontSize={{ base: "xl", md: "2xl" }} 
                      fontWeight="bold" 
                      color={totalIncome - totalExpenses >= 0 ? "green.600" : "red.600"}
                    >
                      R$ {(totalIncome - totalExpenses).toFixed(2)}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Card de Diagnóstico Rápido */}
          <Card
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            overflow="hidden"
            transition="all 0.2s"
            w="full"
          >
            <CardBody p={{ base: 3, md: 5 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Heading size={{ base: "md", md: "md" }} color="gray.700">Diagnóstico Financeiro</Heading>
                <FinancialDiagnostics currentDate={currentDate} />
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Tabs com Listas Detalhadas */}
        <Box mt={{ base: 4, md: 6 }}>
          <Tabs 
            index={tabIndex} 
            onChange={setTabIndex} 
            variant="enclosed"
            colorScheme="blue"
          >
            <TabList 
              bg="white" 
              p={2} 
              borderRadius="xl" 
              shadow="sm"
              display="flex"
              justifyContent="space-between"
            >
              <Tab 
                flex={1} 
                _selected={{ 
                  bg: 'red.500', 
                  color: 'white',
                  shadow: 'md'
                }}
                borderRadius="lg"
              >
                <Icon as={MdTrendingDown} mr={2} />
                Saídas
              </Tab>
              <Tab 
                flex={1}
                _selected={{ 
                  bg: 'green.500', 
                  color: 'white',
                  shadow: 'md'
                }}
                borderRadius="lg"
              >
                <Icon as={MdTrendingUp} mr={2} />
                Entradas
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                {/* Card de resumo financeiro */}
                <Card mb={4} borderRadius="xl" bg="red.500" color="white">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Total de Saídas</Text>
                        <Heading size="md">R$ {totalExpenses.toFixed(2)}</Heading>
                      </HStack>
                      <Progress 
                        value={75} 
                        size="sm" 
                        colorScheme="red" 
                        bg="red.400"
                        borderRadius="full"
                      />
                    </VStack>
                  </CardBody>
                </Card>
                {isMobile ? (
                  <>
                    <Drawer isOpen={isExpenseFormOpen} placement="right" onClose={() => setIsExpenseFormOpen(false)} size="full">
                      <DrawerOverlay />
                      <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Nova Despesa</DrawerHeader>
                        <DrawerBody>
                          {expenseForm}
                        </DrawerBody>
                      </DrawerContent>
                    </Drawer>
                    <Box key={expenseKey}>
                      <ExpenseList currentDate={currentDate} />
                    </Box>
                  </>
                ) : (
                  <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={6}>
                    <GridItem>
                      <Box position="sticky" top="20px">
                        {expenseForm}
                      </Box>
                    </GridItem>
                    <GridItem>
                      <Box key={expenseKey}>
                        <ExpenseList currentDate={currentDate} />
                      </Box>
                    </GridItem>
                  </Grid>
                )}
              </TabPanel>

              <TabPanel px={0}>
                {/* Card de resumo financeiro */}
                <Card mb={4} borderRadius="xl" bg="green.500" color="white">
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Total de Entradas</Text>
                        <Heading size="md">R$ {totalIncome.toFixed(2)}</Heading>
                      </HStack>
                      <Progress 
                        value={100} 
                        size="sm" 
                        colorScheme="green" 
                        bg="green.400"
                        borderRadius="full"
                      />
                    </VStack>
                  </CardBody>
                </Card>
                {isMobile ? (
                  <>
                    <Drawer isOpen={isIncomeFormOpen} placement="right" onClose={() => setIsIncomeFormOpen(false)} size="full">
                      <DrawerOverlay />
                      <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Nova Entrada</DrawerHeader>
                        <DrawerBody>
                          {incomeForm}
                        </DrawerBody>
                      </DrawerContent>
                    </Drawer>
                    <Box key={incomeKey}>
                      <IncomeList currentDate={currentDate} />
                    </Box>
                  </>
                ) : (
                  <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={6}>
                    <GridItem>
                      <Box position="sticky" top="20px">
                        {incomeForm}
                      </Box>
                    </GridItem>
                    <GridItem>
                      <Box key={incomeKey}>
                        <IncomeList currentDate={currentDate} />
                      </Box>
                    </GridItem>
                  </Grid>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>

      {/* Drawers de Formulários */}
      <Drawer isOpen={isExpenseFormOpen} placement="right" onClose={() => setIsExpenseFormOpen(false)} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Nova Despesa</DrawerHeader>
          <DrawerBody>
            {expenseForm}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Drawer isOpen={isIncomeFormOpen} placement="right" onClose={() => setIsIncomeFormOpen(false)} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Nova Entrada</DrawerHeader>
          <DrawerBody>
            {incomeForm}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
