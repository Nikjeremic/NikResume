import { useState } from 'react'
import { Button } from 'primereact/button'
import { Password } from 'primereact/password'
import './Admin.css'

type AdminLoginProps = {
  onLogin: (password: string) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin2024') {
      onLogin(password)
      setError('')
    } else {
      setError('Invalid password')
      setPassword('')
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1>Admin Panel</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              className="form-input"
              placeholder="Enter admin password"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <Button type="submit" label="Login" className="admin-btn" />
        </form>
      </div>
    </div>
  )
}

