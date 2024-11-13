import { useState } from 'react'
import './App.css'
import {Turnstile} from '@marsidev/react-turnstile';
import axios from 'axios';

function App() {
  const [email,setEmail] = useState<string>("")
  const [otp,setOtp] = useState<string>("")
  const [newPassword,setNewPassword] = useState<string>("")
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const handleSubmit = () =>{
    if(!turnstileToken){
      alert("Please complete the captcha")
      return
    }
    axios.post("http://localhost:3000/reset-password",{
      email:email,
      otp:otp,
      newPassword:newPassword,
      token:turnstileToken
    }).then((res)=>{
      console.log(res.data);
      alert(res.data.message)
    }).catch((err)=>{
      console.log(err);
      alert(err.response.data.message)
    })

  }


  return (
    <div className="bg-gray-100 h-screen flex justify-center items-center">
      
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reset Password</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" placeholder="your.email@example.com" className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
            <input type="text" name="otp" id="otp" placeholder="Enter OTP" className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" onChange={(e) => setOtp(e.target.value)} />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" name="newPassword" id="newPassword" placeholder="Enter new password" className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <Turnstile
            siteKey="0x4AAAAAAAz8xAkI3kKwnVz8"
            onSuccess={(token: string) => setTurnstileToken(token)}
          />
          <button type="button" onClick={handleSubmit} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Reset Password</button>
        </form>
      </div>
    </div>
  )
}

export default App
