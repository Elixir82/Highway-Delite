import './App.css'
import {BrowserRouter as Router, Route, Routes} from "react-router"
import PrivateRoute from './privateRoutes';
import LoginPage from './pages/loginPage'
import SignUpPage from './pages/signUpPage';
import HomePage from './pages/homePage';

// function DebugAuth() {
//   const { user, token } = useAuth();
  
//   useEffect(() => {
//     console.log("Current auth state:", { user, token });
//     console.log("LocalStorage contents:", {
//       token: localStorage.getItem("token"),
//       user: localStorage.getItem("user"),
//       persist: localStorage.getItem("persist")
//     });
//   }, [user, token]);
  
//   return null;
// }

function App() {
  
  return (
    <Router>
        
        {/* <DebugAuth /> */}
        
        <Routes>
          <Route path='/login' element={<LoginPage/>} />
          <Route path='/signup' element={<SignUpPage/>} />
          <Route
            path='/' element={
              <PrivateRoute>
                <HomePage/>
              </PrivateRoute>
            }
          />
        </Routes> 
    </Router>
  )
}

export default App