'use client'

import { useState, useEffect } from 'react'
import { Trash2, Edit, Eye, EyeOff, Plus, Loader2, RefreshCw, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'

interface Password {
  id: number
  website: string
  username: string
  password: string
}

export function PasswordManagerComponent() {
  const [passwords, setPasswords] = useState<Password[]>([])
  const [newPassword, setNewPassword] = useState({ website: '', username: '', password: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showWelcome, setShowWelcome] = useState(true)

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
      await fetchPasswords()
      setNewPassword({ website: '', username: '', password: '' })
      setEditingId(null)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving password:', error)
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
      await fetchPasswords()
    } catch (error) {
      console.error('Error deleting password:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (id: number) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const generateRandomPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|:;<>,.?~"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setNewPassword(prev => ({ ...prev, password }))
  }

  const filteredPasswords = passwords.filter(pw =>
    pw.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pw.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (showWelcome) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white"
      >
        <Lock className="w-24 h-24 mb-8" />
        <h1 className="text-4xl font-bold mb-4">Welcome to SecureVault</h1>
        <p className="text-xl mb-8">Your trusted password manager</p>
        <Button
          size="lg"
          onClick={() => setShowWelcome(false)}
          className="bg-white text-blue-600 hover:bg-blue-100 transition-colors duration-300"
        >
          Get Started
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-8 max-w-5xl"
    >
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">SecureVault</h1>
      
      <div className="mb-8 flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search passwords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs shadow-md transition-shadow duration-300 hover:shadow-lg"
        />
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setNewPassword({ website: '', username: '', password: '' })
                setEditingId(null)
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Password
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId !== null ? 'Edit Password' : 'Add New Password'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={newPassword.website}
                  onChange={handleInputChange}
                  required
                  className="shadow-sm"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={newPassword.username}
                  onChange={handleInputChange}
                  required
                  className="shadow-sm"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="flex">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newPassword.password}
                    onChange={handleInputChange}
                    required
                    className="flex-grow shadow-sm"
                  />
                  <Button
                    type="button"
                    onClick={generateRandomPassword}
                    className="ml-2 bg-green-500 hover:bg-green-600 text-white transition-colors duration-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300">
                  {editingId !== null ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='animate-spin w-8 h-8 text-blue-500' />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Website</TableHead>
                <TableHead className="font-semibold text-gray-700">Username</TableHead>
                <TableHead className="font-semibold text-gray-700">Password</TableHead>
                <TableHead className="font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredPasswords.map(pw => (
                  <motion.tr
                    key={pw.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TableCell>{pw.website}</TableCell>
                    <TableCell>{pw.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={`transition-all duration-300 ${showPassword[pw.id] ? '' : 'filter blur-sm'}`}>
                          {pw.password}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(pw.id)}
                          className="ml-2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                        >
                          {showPassword[pw.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pw.id)}
                        className="text-blue-500 hover:text-blue-700 transition-colors duration-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pw.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </motion.div>
      )}
    </motion.div>
  )
}