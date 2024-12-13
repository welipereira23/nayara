'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useToast } from '@chakra-ui/react'

interface AuthContextType {
  user: User | null
  session: Session | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const toast = useToast()

  useEffect(() => {
    const setData = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        
        if (error) throw error
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session) {
          if (pathname === '/auth') {
            router.push('/')
          }
        } else {
          if (pathname !== '/auth') {
            router.push('/auth')
          }
        }
      } catch (error: any) {
        toast({
          title: 'Erro ao verificar autenticação',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    setData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session) {
        if (pathname === '/auth') {
          router.push('/')
        }
      } else {
        router.push('/auth')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router, toast])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error: any) {
      toast({
        title: 'Erro ao entrar',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      toast({
        title: 'Cadastro realizado!',
        description: 'Verifique seu email para confirmar o cadastro.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      throw error
    }
  }

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        router.push('/auth')
      } catch (error: any) {
        toast({
          title: 'Erro ao sair',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        throw error
      }
    },
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
