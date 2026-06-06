import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";



export default function Signup() {
    const [searchParams] = useSearchParams();

    //select role if coming from hero buttons
    const [role, setRole] = useState(searchParams.get("role") || "buyer");

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('')
    const navigate = useNavigate();

    function handleChange(e) {
        setForm({...form, [e.target.name]: e.target.value});
    }

    function handleSubmit(e) {
        e.preventDefault();
        setError('')

        const {name, email, phone, password, confirmPassword} = form

        if (!name || !email || !phone || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return;
        }

        if (password.length < 6) {
            setError('Password must be atleast 6 characters')
            return;
        }

        //Todo replace with flask post /api/auth/signup
        console.log('Signup:', {role, ...form});
        alert('Account created as ${role}! Backend connect')
        navigate('/')
    }

    

}