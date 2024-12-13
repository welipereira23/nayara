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
  IconButton,
  Card,
  CardBody,
  CardHeader,
  Heading,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Switch,
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { MdMic, MdAttachMoney, MdCategory, MdToday, MdDescription } from 'react-icons/md'
import { saveExpense, CATEGORIES } from '../utils/expenses'

export default function ExpenseForm({ onExpenseAdded }: { onExpenseAdded?: () => void }) {
  const router = useRouter()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isInstallment, setIsInstallment] = useState(false)
  const [installments, setInstallments] = useState(1)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await saveExpense({
        date,
        description: isInstallment 
          ? `${description} (${installments}x de ${formatCurrency(parseFloat(amount))})`
          : description,
        amount: parseFloat(amount),
        category,
        installments: isInstallment ? installments : 1,
      })

      toast({
        title: 'Despesa salva com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Limpa o formulário
      setDate(new Date().toISOString().split('T')[0])
      setDescription('')
      setAmount('')
      setCategory('')
      setIsInstallment(false)
      setInstallments(1)

      // Notifica o componente pai antes de redirecionar
      if (onExpenseAdded) {
        onExpenseAdded()
      }

      // Pequeno delay antes de redirecionar para garantir que a atualização ocorra
      setTimeout(() => {
        router.push('/')
      }, 100)
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar despesa',
        description: error.message || 'Ocorreu um erro ao salvar a despesa',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = 'pt-BR'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setDescription(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
        toast({
          title: 'Erro no reconhecimento de voz',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } else {
      toast({
        title: 'Reconhecimento de voz não suportado',
        description: 'Seu navegador não suporta esta funcionalidade',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <Heading size="md">Nova Despesa</Heading>
      </CardHeader>
      <CardBody>
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Data</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdToday color="gray.300" />
                </InputLeftElement>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  bg="white"
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Descrição</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdDescription color="gray.300" />
                </InputLeftElement>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Digite ou fale a descrição"
                  bg="white"
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Usar voz"
                    icon={<MdMic />}
                    onClick={startListening}
                    isLoading={isListening}
                    colorScheme={isListening ? 'red' : 'gray'}
                    size="sm"
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Valor</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdAttachMoney color="gray.300" />
                </InputLeftElement>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  bg="white"
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <FormLabel mb="0">Parcelado?</FormLabel>
                <Switch
                  colorScheme="brand"
                  isChecked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                />
              </HStack>
            </FormControl>

            {isInstallment && (
              <FormControl>
                <FormLabel>Número de Parcelas</FormLabel>
                <NumberInput
                  min={2}
                  max={48}
                  value={installments}
                  onChange={(_, value) => setInstallments(value)}
                >
                  <NumberInputField bg="white" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                {amount && (
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    {installments}x de {formatCurrency(parseFloat(amount))} = {formatCurrency(parseFloat(amount) * installments)}
                  </Text>
                )}
              </FormControl>
            )}

            <FormControl isRequired>
              <FormLabel>Categoria</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MdCategory color="gray.300" />
                </InputLeftElement>
                <Select
                  placeholder="Selecione uma categoria"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  bg="white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="red"
              size="lg"
              width="100%"
              isLoading={loading}
              loadingText="Salvando..."
              mb={4}
            >
              Registrar Despesa
            </Button>
          </VStack>
        </Box>
      </CardBody>
    </Card>
  )
}
