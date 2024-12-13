import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    blue: {
      50: '#EBF8FF',
      100: '#BEE3F8',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#4299E1',
      500: '#3182CE',
      600: '#2B6CB0',
      700: '#2C5282',
      800: '#2A4365',
      900: '#1A365D',
    },
    expense: {
      50: '#FFE5E5',
      100: '#FFB8B8',
      500: '#E53E3E',
      600: '#C53030',
    },
    income: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      500: '#38A169',
      600: '#2F855A',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'lg',
      },
      variants: {
        solid: (props: any) => {
          const colorScheme = props.colorScheme || 'blue'
          return {
            bg: `${colorScheme}.500`,
            color: 'white',
            _hover: {
              bg: `${colorScheme}.600`,
              _disabled: {
                bg: `${colorScheme}.300`,
              },
            },
            _active: {
              bg: `${colorScheme}.700`,
            },
            _disabled: {
              bg: `${colorScheme}.300`,
              opacity: 0.6,
              cursor: 'not-allowed',
            },
          }
        },
        outline: (props: any) => {
          const colorScheme = props.colorScheme || 'blue'
          return {
            border: '2px solid',
            borderColor: `${colorScheme}.500`,
            color: `${colorScheme}.500`,
            _hover: {
              bg: `${colorScheme}.50`,
            },
          }
        },
        ghost: (props: any) => {
          const colorScheme = props.colorScheme || 'blue'
          return {
            color: `${colorScheme}.500`,
            _hover: {
              bg: `${colorScheme}.50`,
            },
          }
        },
        link: (props: any) => {
          const colorScheme = props.colorScheme || 'blue'
          return {
            color: `${colorScheme}.500`,
            _hover: {
              textDecoration: 'underline',
            },
          }
        },
      },
      defaultProps: {
        size: 'lg',
        variant: 'solid',
        colorScheme: 'blue',
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: 'lg',
            bg: 'white',
            borderWidth: '2px',
            _focus: {
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
        size: 'lg',
      },
    },
    IconButton: {
      baseStyle: {
        borderRadius: 'xl',
      },
      defaultProps: {
        colorScheme: 'brand',
        variant: 'solid',
      },
    },
    Tab: {
      variants: {
        enclosed: {
          tab: {
            _selected: {
              color: 'brand.600',
              borderColor: 'brand.500',
              borderBottomColor: 'white',
            },
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          overflow: 'hidden',
          boxShadow: 'xl',
          bg: 'white',
        },
      },
    },
    StatGroup: {
      baseStyle: {
        container: {
          gap: 4,
        },
      },
    },
    Link: {
      baseStyle: {
        color: 'brand.500',
        _hover: {
          textDecoration: 'none',
          color: 'brand.600',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.100',
      },
    },
  },
})

export default theme
