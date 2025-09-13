import React, { useState, useCallback } from 'react'
import { sanitizeText, sanitizeEmail, validators, rateLimiter } from '@/utils/security'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle } from 'lucide-react'

interface SecureFormProps {
  onSubmit: (data: Record<string, string>) => Promise<void>
  fields: FormField[]
  submitText?: string
  className?: string
}

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'url'
  required?: boolean
  placeholder?: string
}

interface FormErrors {
  [key: string]: string[]
}

export const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  fields,
  submitText = 'Submit',
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rateLimitError, setRateLimitError] = useState<string>('')

  const validateField = useCallback((field: FormField, value: string): string[] => {
    const fieldErrors: string[] = []

    // Required field validation
    if (field.required && !value.trim()) {
      fieldErrors.push(`${field.label} is required`)
      return fieldErrors
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !field.required) {
      return fieldErrors
    }

    // Type-specific validation
    switch (field.type) {
      case 'email':
        if (!validators.email(value)) {
          fieldErrors.push('Please enter a valid email address')
        }
        break
      
      case 'password':
        const passwordValidation = validators.password(value)
        if (!passwordValidation.valid) {
          fieldErrors.push(...passwordValidation.errors)
        }
        break
      
      case 'url':
        if (!validators.url(value)) {
          fieldErrors.push('Please enter a valid URL')
        }
        break
      
      case 'text':
        if (value.length > 1000) {
          fieldErrors.push('Text is too long (maximum 1000 characters)')
        }
        break
    }

    return fieldErrors
  }, [])

  const handleInputChange = useCallback((fieldName: string, field: FormField) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      let sanitizedValue: string

      // Sanitize based on field type
      switch (field.type) {
        case 'email':
          sanitizedValue = sanitizeEmail(rawValue)
          break
        case 'text':
        case 'password':
          sanitizedValue = sanitizeText(rawValue)
          break
        case 'url':
          sanitizedValue = rawValue // URL sanitization happens on validation
          break
        default:
          sanitizedValue = sanitizeText(rawValue)
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: sanitizedValue
      }))

      // Clear field errors when user starts typing
      if (errors[fieldName]) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: []
        }))
      }
    }, [errors])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setRateLimitError('')

    // Rate limiting check
    const userIdentifier = 'form-submission' // In real app, use user ID or IP
    if (!rateLimiter.isAllowed(userIdentifier)) {
      setRateLimitError('Too many requests. Please wait before submitting again.')
      return
    }

    // Validate all fields
    const newErrors: FormErrors = {}
    let hasErrors = false

    fields.forEach(field => {
      const value = formData[field.name] || ''
      const fieldErrors = validateField(field, value)
      
      if (fieldErrors.length > 0) {
        newErrors[field.name] = fieldErrors
        hasErrors = true
      }
    })

    setErrors(newErrors)

    if (hasErrors) {
      return
    }

    // Submit form
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      // Handle submission error (could set a general error state)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, fields, onSubmit, validateField])

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {rateLimitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{rateLimitError}</AlertDescription>
        </Alert>
      )}

      {fields.map(field => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          
          <Input
            id={field.name}
            name={field.name}
            type={field.type}
            value={formData[field.name] || ''}
            onChange={handleInputChange(field.name, field)}
            placeholder={field.placeholder}
            className={errors[field.name]?.length ? 'border-destructive' : ''}
            aria-describedby={errors[field.name]?.length ? `${field.name}-error` : undefined}
          />
          
          {errors[field.name]?.length > 0 && (
            <div id={`${field.name}-error`} className="space-y-1">
              {errors[field.name].map((error, index) => (
                <p key={index} className="text-sm text-destructive">
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : submitText}
      </Button>
    </form>
  )
}
