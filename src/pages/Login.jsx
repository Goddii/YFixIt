import { useState } from "react";
import { Link, use, useNavigate } from "react-router-dom";


export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate


    function handleSubmit(e) {
        e.preventDefault();
        setError('')

        // Basic Validation
        if (!email || !password) {
            setError('Please fill in all fields')
            return;

        }

        // TODO (Replace with real flask api call)
        // now simulating login to redirect home
        console.log('Login attempt: ', {email,password});
        alert('Login comming soon after backend connect');
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-[#f7f3ed] flex items-center justify-center px-4">
            
        </div>
    )
}