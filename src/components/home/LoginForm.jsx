import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/homepage/loginform.css';
import { msalInstance, initializeMsalInstance } from '../../config/msalConfig';
import { InteractionType } from '@azure/msal-browser';
import { loginForm, resetPassword, loginWithMicrosoft } from '../../service/LoginForm';
import logo from '../../img/logo.png'
import { Helmet } from 'react-helmet';
import Lottie from 'lottie-react';
import loadingAnimation from '../../svg/loading.json'

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('')
  const [error, setError] = useState('');
  const [forgotPassword, setForgotPassWord] = useState(false)
  const [isSendPassword, setIsSendPassword] = useState(false)
  const [isLoadingSendEmail, setIsLoadingSendEmail] = useState(false)
  const [isLoadingResendEmail, setIsLoadingResendEmail] = useState(false)
  const [countdown, setCountdown] = useState(0);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if(localStorage.getItem("session")) {
      navigate('/')
    }
  }, [])

  const handleTogglePassword = () => {
    setForgotPassWord(!forgotPassword)
  }
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResendPassword = async (e) => {
    e.preventDefault();
    setIsLoadingSendEmail(true)
    try {
      const data = await resetPassword(email)
      if (data) {
        setIsSendPassword(true)
        setIsLoadingSendEmail(false)
        setIsLoadingResendEmail(true)
        setCountdown(15)
      }
      console.log(data)
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    let timer;
    if (isLoadingResendEmail && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsLoadingResendEmail(false);
    }
    return () => clearTimeout(timer);
  }, [isLoadingResendEmail, countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("")
    setIsLoadingLogin(true)
  
    try {
      const data = await loginForm(username, password);
      setError("")
      if(data && data.status === 200) {
        localStorage.setItem("session", JSON.stringify(data.data.data.session_id))
        localStorage.setItem("username", data.data.username)
        localStorage.setItem("role", data.data.role)
        localStorage.setItem("userid", data.data.user_id)
        localStorage.setItem('session_manager', JSON.stringify({
          session_id: data.data.data.session_id,
          end_time: data.data.data.end_time,
          user_id: data.data.user_id
        }));
        navigate('/')
      }

    } catch (error) {
      console.error('Error logging in:', error);
      setError("Wrong Username or Password")
      setIsLoadingLogin(false)
    }
  };

  useEffect(() => {
    initializeMsalInstance();
  }, []);

  const handleMicrosoftLogin = async () => {
    setIsLoadingLogin(true)
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["user.read"],
        prompt: "select_account"
      });

      console.log('Microsoft login response:', loginResponse);
      try {
        const loginResponse2 = await loginWithMicrosoft(loginResponse.account.localAccountId, loginResponse.account.username)
        console.log(loginResponse2)
        setIsLoadingLogin(false)
        if(loginResponse2 && loginResponse2.status === 200) {
          localStorage.setItem("session", JSON.stringify(loginResponse2.data.session_id))
          localStorage.setItem("username", loginResponse2.data.username)
          localStorage.setItem("role", loginResponse2.data.role)
          localStorage.setItem("userid", loginResponse2.data.user_id)
          localStorage.setItem('session_manager', JSON.stringify({
            session_id: loginResponse2.data.session_id,
            end_time: loginResponse2.data.data.end_time,
            user_id: loginResponse2.data.data.user_id
          }));
          navigate('/')
        }
      } catch (e) {
        console.log(e)
      }
      // Handle successful login
      // You can send the loginResponse.accessToken to your backend if needed
    } catch (error) {
      console.error('Microsoft login error:', error);
      setError('Microsoft login failed');
      setIsLoadingLogin(false)
    }
  };

  return (
    <div className='login-body'>
      <Helmet>
        <title>NotebookVPI - Login</title>
      </Helmet>
      <div className={`${isLoadingLogin ? 'loading': ''} login-container ${forgotPassword ? 'disable' : ''}`}>
         <div className='logo-container'>
          <img
              src={logo}
              alt="Petrovietnam Logo"
              className="logo"
            />
         </div>
              <div className={`login-form-container ${forgotPassword ? 'disable' : ''}`}>
                <form className="login-form" onSubmit={handleSubmit}>

                  <div className={`login-form-normal `}>
                    <h2>NotebookVPI Login</h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="input-group">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    {/* <div className="input-group">
                      <label htmlFor="password">Password</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div> */}
                     <div className="input-group" style={{ position: 'relative' }}>
                      <label htmlFor="password">Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ paddingRight: '2.5rem' }} // Space for the icon
                      />
                      <i
                        className={`show-password-input fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}
                        onClick={togglePasswordVisibility}
                      ></i>
                    </div>
                    <p onClick={handleTogglePassword} className='forgot-password-button'>Forgot Password?</p>
                    <button
                       type="submit"
                       disabled={isLoadingLogin}
                       className={`login-button ${isLoadingLogin ? 'loading' : ''}`}
                       >
                        <p >
                        {isLoadingLogin ? (<Lottie
                          animationData={loadingAnimation}
                          loop
                          autoPlay
                          style={{
                            width: 18,
                            height: 18,
                          }}
                        />) : (null)}
                        &nbsp;
                        Login
                        </p>
                        
                       </button>
                    <div className='line-split-login'></div>
                    <button className='button-login-microsoft' type="button" onClick={handleMicrosoftLogin}>
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjR8068a50hnJwYx1pzj6iG5VsKAcFz4732w&s" alt="" />
                      Sign in with Microsoft
                    </button>
                  </div>
                </form>
               <form onSubmit={handleResendPassword} className={`login-form-forgot ${forgotPassword ? 'disable' : ''}`}>
                <h2>Reset Password</h2>
                  <div>
                  
                  {!isSendPassword ? (
                  <div className="forgot-password-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                     type="email"
                      id="email"
                      name="email"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>
                  ) : (
                  <p>A new password will be sent to you by email, please check your email (spam).</p>
                  )}
                  <div className="forgot-password-actions">
                    <span onClick={handleTogglePassword} className={`back-to-login ${isSendPassword ? 'success' : ''}`} >Back to Login</span>
                    <button className={`send-password ${isSendPassword ? 'disable' : ''} ${isLoadingSendEmail ? 'loading' : ''}`} type="submit" >
                      
                      {isLoadingSendEmail ? (
                        <span>
                        Sending.. &nbsp; <i class="fa-solid fa-circle-notch fa-spin"/></span>
                      ) : (
                        <span>
                          Reset Password 
                        </span>
                      )}
                      </button>
                      
                </div>
                {isSendPassword ? (
                          <span onClick={(() => (setIsSendPassword(false)))} className={`back-to-login back-send ${isLoadingResendEmail ? 'disable' : ''}`} >Resend Password ({countdown})</span>
                      ) : (null)}
                  </div>
              </form>
              </div>
      </div>
    </div>
  );
};

export default LoginForm;