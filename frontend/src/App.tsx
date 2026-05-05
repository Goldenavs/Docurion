import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

function App() {
  const [connectionStatus, setConnectionStatus] = useState("Testing...")

  useEffect(() => {
    async function testConnection() {
      // Try to fetch projects (it will be empty, but that's a successful check!)
      const { data, error } = await supabase.from('projects').select('*')
      
      if (error) {
        setConnectionStatus("Connection Failed: " + error.message)
      } else {
        setConnectionStatus("Connected to Supabase! Projects found: " + data.length)
      }
    }
    testConnection()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">{connectionStatus}</h1>
    </div>
  )
}

export default App