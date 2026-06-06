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

    func

}