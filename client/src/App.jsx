import React from 'react'
import Navbar from './components/Navbar'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Movies from './pages/Movies'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBooking from './pages/MyBooking'
import Favorite from './pages/Favorite'
import toaster, { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import { useAppContext } from './context/AppContext.jsx'
import { SignIn } from '@clerk/react'
import Loading from './components/Loading.jsx'

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  const {user, isAdmin,isAdminLoading } = useAppContext()



  return (
    <>
    <Toaster/>
     {/* # to show small notification messages to users without reloading the page. */}
     { !isAdminRoute && <Navbar/> }
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path='/movies' element={<Movies/>} />
         <Route path='/movies/:id' element={<MovieDetails/>} />
         <Route path='/movies/:id/:date' element={<SeatLayout/>} />
           <Route path='/my-bookings' element={<MyBooking/>} />
           <Route path='/loading/:nextUrl' element={<Loading/>} />


            <Route path='/favorite' element={<Favorite/>} />

            <Route path='/admin/*' element={
              !user ? (
                <div className='min-h-screen flex justify-center items-center'>
                  <SignIn fallbackRedirectUrl={'/admin'} />
                </div>
              ) : isAdminLoading || isAdmin === null ? (
          <Loading />
    ) : isAdmin ? (
      <Layout />
    ) : (
      <Navigate to='/' replace />
    )
            }>
            <Route index element={<Dashboard />} />
            <Route path='add-shows' element={<AddShows />}  />
            <Route path='list-shows' element= {<ListShows/>}  />
            <Route path='list-bookings' element= {<ListBookings />}  />

             </Route>
      </Routes>
      { !isAdminRoute && <Footer/> }
    </>
  )
}

export default App
