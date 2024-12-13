'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from '../contexts/AuthContext'
import theme from '../theme'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ChakraProvider>
    </CacheProvider>
  )
}
