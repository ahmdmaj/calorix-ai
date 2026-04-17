'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from '@/components/logo'
import { apiClient } from '@/lib/api'

interface AuthFormProps {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const isLogin = mode === 'login'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const { name, email, password } = formData
      
      if (isLogin) {
        await apiClient('/auth/login', { 
          method: 'POST', 
          body: JSON.stringify({ email, password }) 
        })
      } else {
        await apiClient('/auth/register', { 
          method: 'POST', 
          body: JSON.stringify({ name, email, password }) 
        })
      }
      
      router.push('/chat')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Logo size="lg" />
          <h1 className="mt-6 text-2xl font-semibold text-foreground">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin
              ? 'Sign in to continue tracking your calories'
              : 'Start your health journey today'}
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-500 mb-4 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 bg-input border-border pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-accent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              href={isLogin ? '/register' : '/login'}
              className="font-medium text-foreground hover:text-accent transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="#" className="underline hover:text-foreground transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
