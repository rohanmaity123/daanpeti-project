import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate} from 'react-router-dom';


export default function Register() {
	const navigate = useNavigate();
	return (
		<>
			<Helmet>
				<title> Registration</title>
			</Helmet>

			<h1>Sign Up</h1>
			<button onClick={() => { navigate('/login') }} className="textLink">Login</button>
		</>
	);
}
