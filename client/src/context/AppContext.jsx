import { createContext, useCallback, useContext, useEffect, useState } from "react";import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// used to send HTTP requests from your frontend to a backend or another API.

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const AppContext  = createContext();

export const AppProvider = ({children}) =>{
    const [isAdmin,setAdmin] = useState(null);
    const [isAdminLoading, setIsAdminLoading] = useState(true);
    const [shows,setShows] = useState([])
    const [favoriteMovies,setFavoriteMovies ] = useState([]);
    const {user}= useUser();
    const {getToken}= useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const fetchIsAdmin = useCallback(async ()=>{
        setAdmin(null);
        setIsAdminLoading(true);
        try{
            const token = await getToken();
            if(!token){
                throw new Error('Unable to get an authentication token');
            }
            const {data}= await axios.get('/api/admin/is-admin',
                {headers:{ Authorization: `Bearer ${token}`}, timeout: 10000}
            );
            const adminAccess = data.success === true && data.isAdmin === true;
            setAdmin(adminAccess);
            if(!adminAccess){
                toast.error('You are not authorized to access admin dashboard');
            }
        }catch(error){
            console.error(error);
            setAdmin(false);
            toast.error('Unable to verify admin access');
        }finally{
            setIsAdminLoading(false);
        }
    }, [getToken])

    const fetchShows = async () =>{
        try{
            const {data} = await axios.get('/api/show/all')
            if(data.success){
                setShows(data.shows)
            }else{
                toast.error(data.message)
            }

        }catch(error){
            console.error(error);
        }

    }

    const fetchFavoriteMovies = async () =>{
        try{
            const token = await getToken();
            const {data} = await axios.get('/api/user/favorites',
                {headers:{Authorization :`Bearer ${ token}`}})

            
            if(data.success){
                setFavoriteMovies(data.movies)
            }else{
                toast.error(data.message)
            }

        }catch(error){
            console.error(error);
        }

    }

    

    useEffect(()=>{
      fetchShows()
    },[])


    useEffect(() => {
        if(user){
            fetchFavoriteMovies()
        }else {
            setAdmin(null);
            setIsAdminLoading(false);
        }
    }, [user])

    useEffect(() => {
        if(user && location.pathname.startsWith('/admin')){
            fetchIsAdmin()
        }
    }, [user, location.pathname, fetchIsAdmin])




    const value = { axios,
        fetchIsAdmin,
        user,getToken , navigate,
        isAdmin,shows , favoriteMovies ,
        fetchFavoriteMovies , fetchShows, isAdminLoading
    }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}



// useContext() do?
// It allows a component to access the data provided by AppContext.Provider
export const useAppContext = ()=>  useContext(AppContext)