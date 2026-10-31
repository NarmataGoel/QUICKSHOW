import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import isoTimeFormat from '../lib/isoTimeFormat'
import { dateFormat } from '../lib/dateFormat'
import { useAppContext } from '../context/AppContext'

const MyBooking = () => {
  const currency = import.meta.env.VITE_CURRENCY || '$'
  const { axios, getToken, user } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadBookings = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const token = await getToken()
        const { data } = await axios.get('/api/user/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!data.success) {
          throw new Error(data.message || 'Could not load bookings.')
        }
        if (active) {
          setBookings(data.bookings)
        }
      } catch (error) {
        console.error(error)
        toast.error(error.response?.data?.message || error.message || 'Could not load bookings.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadBookings()
    return () => {
      active = false
    }
  }, [user, getToken, axios])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <BlurCircle top='100px' left='100px' />
      <BlurCircle bottom='0px' left='600px' />
      <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>

      {bookings.filter(item => item.show?.movie).map(item => (
        <div
          key={item._id}
          className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'
        >
          <div className='flex flex-col md:flex-row'>
            <img
              src={item.show.movie.poster_path}
              alt=""
              className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded-md'
            />
            <div className='flex flex-col p-4'>
              <p className='text-lg font-semibold'>{item.show.movie.title}</p>
              <p className='text-gray-400 text-sm'>
                {isoTimeFormat(item.show.movie.runtime)}
              </p>
              <p className='text-gray-400 text-sm mt-auto'>
                {dateFormat(item.show.showDateTime)}
              </p>
            </div>
          </div>
          <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
            <div className='flex items-center gap-4'>
              <p className='text-2xl font-semibold mb-3'>
                {currency}{item.amount}
              </p>
              {!item.isPaid ? (
                <button className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'>
                  Pay Now
                </button>
              ) : (
                <span className='mb-3 text-sm text-green-400'>Paid</span>
              )}
            </div>
            <div className='text-sm'>
              <p>
                <span className='text-gray-400'>Total Tickets:</span>{' '}
                {item.bookedSeats.length}
              </p>
              <p>
                <span className='text-gray-400'>Seat Number:</span>{' '}
                {item.bookedSeats.join(', ')}
              </p>
            </div>
          </div>
        </div>
      ))}
      {bookings.length === 0 && (
        <p className='text-gray-400'>You have no bookings yet.</p>
      )}
    </div>
  )
}

export default MyBooking
