'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2 } from 'lucide-react'

interface BillingUser {
  id: string
  username: string
  name: string
  role: string
  createdAt: string
}

export default function BillingUsersPage() {
  const [users, setUsers] = useState<BillingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<BillingUser | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/billing')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load billing users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setFormData({ name: '', username: '', password: '' })
    setDialogOpen(true)
  }

  const handleEdit = (user: BillingUser) => {
    setSelectedUser(user)
    setFormData({ name: user.name, username: user.username, password: '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.username) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!selectedUser && !formData.password) {
      toast.error('Password is required for new users')
      return
    }

    try {
      if (selectedUser) {
        // Update existing user
        const response = await fetch(`/api/admin/billing/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            username: formData.username,
            ...(formData.password && { password: formData.password })
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update user')
        }

        toast.success('Billing user updated successfully')
      } else {
        // Create new user
        const response = await fetch('/api/admin/billing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            username: formData.username,
            password: formData.password
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create user')
        }

        toast.success('Billing user created successfully')
      }

      setDialogOpen(false)
      await fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
      console.error(error)
    }
  }

  const handleDeleteClick = (user: BillingUser) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/billing/${selectedUser.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      toast.success('Billing user deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      await fetchUsers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Users</h1>
          <p className="text-gray-500">Manage billing department staff accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Billing User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUser ? 'Edit' : 'Add'} Billing User</DialogTitle>
              <DialogDescription>
                {selectedUser
                  ? 'Update billing staff credentials. Leave password blank to keep current.'
                  : 'Create a new billing user account and set a login password'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="password">
                  Password {selectedUser && '(optional - leave blank to keep current)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={selectedUser ? 'Leave blank to keep current password' : 'Enter password'}
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {selectedUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No billing users found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="gap-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user)}
                      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Billing User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selectedUser?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
