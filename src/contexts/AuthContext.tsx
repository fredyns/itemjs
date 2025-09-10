import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, authApi } from '../lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token')
        if (storedToken) {
          setToken(storedToken)
          const { user } = await authApi.me()
          setUser(user)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('auth_token', response.token)
    } catch (error) {
      throw new Error('Login failed', { cause: error })
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const response = await authApi.register(email, password)
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('auth_token', response.token)
    } catch (error) {
      throw new Error('Registration failed', { cause: error })
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
