'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Link,
  useToast,
} from '@chakra-ui/react'
import { MdEmail, MdLock } from 'react-icons/md'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp } = useAuth()
  const toast = useToast()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (error: any) {
      // Erros já são tratados no AuthContext
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="md" mx="auto" py={12} px={4}>
      <Card bg="white" shadow="lg" borderRadius="xl">
        <CardBody p={8}>
          <form onSubmit={handleAuth}>
            <Stack spacing={6}>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={2}>
                {isSignUp ? 'Criar conta' : 'Entrar'}
              </Text>
              
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  size="lg"
                  bg="white"
                  borderWidth={2}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  size="lg"
                  bg="white"
                  borderWidth={2}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                height="56px"
                fontSize="lg"
                isLoading={loading}
                loadingText={isSignUp ? 'Criando conta...' : 'Entrando...'}
                bg="blue.500"
                color="white"
                _hover={{ bg: 'blue.600' }}
                _active={{ bg: 'blue.700' }}
                boxShadow="md"
              >
                {isSignUp ? 'Criar conta' : 'Entrar'}
              </Button>

              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                isDisabled={loading}
                color="blue.500"
                fontSize="md"
              >
                {isSignUp
                  ? 'Já tem uma conta? Entre aqui'
                  : 'Não tem uma conta? Crie aqui'}
              </Button>
            </Stack>
          </form>
        </CardBody>
      </Card>
    </Box>
  )
}
