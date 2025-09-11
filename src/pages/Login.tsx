import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="text-destructive text-sm">{error}</div>
                )}

                <div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </div>
                    ) : (
                      isLogin ? 'Sign in' : 'Create account'
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError(null)
                    }}
                    variant="link"
                    className="text-sm"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : 'Already have an account? Sign in'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </Layout>
  )
}
