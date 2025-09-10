import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'
import { ShowItem } from '../../pages/ShowItem'
import { Login } from '../../pages/Login'

export const Route = createFileRoute('/items/$slug')({
  component: ItemDetail,
})

function ItemDetail() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return <ShowItem />
}
