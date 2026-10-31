import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Loading = () => {

  const {nextUrl} = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!nextUrl) return

    const timeoutId = window.setTimeout(() => {
      navigate(`/${nextUrl}`, { replace: true })
    }, 8000)

    return () => window.clearTimeout(timeoutId)
  }, [navigate, nextUrl])


  return (
    <div className='flex justify-center items-center h-[80vh]'>
      <div className=' animate-spin  rounded-full h-14 w-14 border-2 border-t-primary'>
      </div>
    </div>
  )
}

export default Loading