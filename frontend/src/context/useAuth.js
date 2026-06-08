import { useContext } from 'react'
import { AuthContext } from './AuthContext.jsx'

const useAuth = () => useContext(AuthContext)

export default useAuth