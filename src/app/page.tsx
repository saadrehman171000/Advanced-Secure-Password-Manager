'use client'

import { useEffect, useState } from 'react'
import { Trash2, Edit, Eye, EyeOff, Plus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Password {
  id: number
  website: string
  username: string
  password: string
}

export default function PasswordManager() {
  const [passwords, setPasswords] = useState<Password[]>([])
  const [newPassword, setNewPassword] = useState({ website: '', username: '', password: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    fetchPasswords()
  }, [])

  const fetchPasswords = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/password')
      if (!response.ok) {
        throw new Error('Failed to fetch passwords')
      }
      const data = await response.json()
      setPasswords(data)
    } catch (error) {
      console.error('Error fetching passwords:', error)
      // You might want to set an error state here and display it to the user
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewPassword(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const url = editingId !== null ? `/api/password?id=${editingId}` : '/api/password'
      const method = editingId !== null ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPassword),
      })
      if (!response.ok) {
        throw new Error('Failed to save password')
      }
      await fetchPasswords() // Refresh the password list
      setNewPassword({ website: '', username: '', password: '' })
      setEditingId(null)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving password:', error)
      // You might want to set an error state here and display it to the user
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (id: number) => {
    const passwordToEdit = passwords.find(p => p.id === id)
    if (passwordToEdit) {
      setNewPassword(passwordToEdit)
      setEditingId(id)
      setIsModalOpen(true)
    }
  }

  const handleDelete = async (id: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/password?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete password')
      }
      await fetchPasswords() // Refresh the password list
    } catch (error) {
      console.error('Error deleting password:', error)
      // You might want to set an error state here and display it to the user
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (id: number) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div>
      {isLoading ? (
        <div className='flex justify-center items-start h-64'>
          <Loader2 className='animate-spin w-8 h-8' />
        </div>
      ) : (
        <div className="mx-auto p-4 max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Password Manager</h1>
            <button
              onClick={() => {
                setNewPassword({ website: '', username: '', password: '' })
                setEditingId(null)
                setIsModalOpen(true)
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Password
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {passwords.map(pw => (
                  <tr key={pw.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{pw.website}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pw.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={showPassword[pw.id] ? '' : 'filter blur-sm'}>
                          {pw.password}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(pw.id)}
                          className="ml-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out"
                          aria-label={showPassword[pw.id] ? "Hide password" : "Show password"}
                        >
                          {showPassword[pw.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(pw.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2 focus:outline-none focus:text-indigo-900 transition duration-150 ease-in-out"
                        aria-label="Edit password"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pw.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:text-red-900 transition duration-150 ease-in-out"
                        aria-label="Delete password"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingId !== null ? 'Edit Password' : 'Add New Password'}
                  </h3>
                  <form onSubmit={handleSubmit} className="mt-2 text-left">
                    <div className="mb-4">
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                      <Input
                        type="text"
                        id="website"
                        name="website"
                        value={newPassword.website}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                      <Input
                        type="text"
                        id="username"
                        name="username"
                        value={newPassword.username}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        value={newPassword.password}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:shadow-outline transition duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                      >
                        {editingId !== null ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}