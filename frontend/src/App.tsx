import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Login, Home, Leaderboard } from './components'
import AuthComponent from "./components/AuthComponent"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/login' element={<AuthComponent show={false} children={<Login />} /> }/>
          <Route path='/' element={<AuthComponent show={true} children={<Home />} /> }/>
          <Route path='/leaderboard' element={<AuthComponent show={true} children={<Leaderboard />} /> }/>
        </Routes>
      </Router>
    </>
  )
}

export default App
