import { Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Browse from './pages/Browse.jsx';
import ListingDetail from './pages/ListingDetail.jsx'

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element= {<Login/>}/>
      <Route path='/signup' element={<Signup/>} /> 
      <Route path='/browse' element = {<Browse/>} />
      <Route path='/listing/:id' element={<ListingDetail/>}/>
    </Routes>
  )
}