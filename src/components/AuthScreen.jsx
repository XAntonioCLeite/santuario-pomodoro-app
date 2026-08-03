// Autor: Antônio Costa Leite
// Tela de Autenticação de Usuário e Login Social (O Santuário)

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { auth } from '../utils/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

// Minimal vector outlines
const IconEnvelope = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5.04c1.78 0 3.37.61 4.62 1.8l3.44-3.44C17.97 1.39 15.22 0 12 0 7.37 0 3.4 2.66 1.48 6.54l4.13 3.2C6.59 7.24 9.07 5.04 12 5.04z" fill="#DB4437" stroke="none" />
    <path d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.71z" fill="#4285F4" stroke="none" />
    <path d="M5.61 14.26c-.24-.73-.38-1.51-.38-2.26s.14-1.53.38-2.26L1.48 6.54C.53 8.45 0 10.17 0 12s.53 3.55 1.48 5.46l4.13-3.2z" fill="#F4B400" stroke="none" />
    <path d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.5 1.18-4.23 1.18-2.93 0-5.41-2.2-6.39-4.7l-4.13 3.2C3.4 21.34 7.37 24 12 24z" fill="#0F9D58" stroke="none" />
  </svg>
);

const AuthScreen = () => {
  const { 
    state, 
    clearAuthError, 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGooglePopup, 
    loginWithGoogleRedirect, 
    loginAnonymously, 
    sendPasswordReset 
  } = useApp();
  
  // Tabs: 'email-login', 'phone-login', 'register'
  const [activeFormTab, setActiveFormTab] = useState('email-login');
  
  // Form variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone auth variables
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [phoneStep, setPhoneStep] = useState(1); // 1: input phone, 2: input SMS OTP code
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Status alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isResetRequested, setIsResetRequested] = useState(false);

  // Inicializa recaptcha para autenticação
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (activeFormTab === 'register') {
      const res = await registerWithEmail(email, password);
      if (!res.success) {
        if (res.error.includes('email-already-in-use')) {
          setErrorMsg('Este e-mail já está cadastrado.');
        } else {
          setErrorMsg('Erro no cadastro: ' + res.error);
        }
      }
    } else {
      const res = await loginWithEmail(email, password);
      if (!res.success) {
        setErrorMsg('E-mail ou senha incorretos.');
      }
    }
  };

  const handleSendSms = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phoneNumber.trim()) {
      setErrorMsg('Por favor, informe o número de telefone com DDI (Ex: +5511999999999)');
      return;
    }

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber.trim(), appVerifier);
      setConfirmationResult(confirmation);
      setPhoneStep(2);
      setSuccessMsg('Código SMS enviado com sucesso.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Falha ao enviar SMS: ' + err.message);
    }
  };

  const handleVerifySms = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!smsCode.trim()) {
      setErrorMsg('Informe o código SMS de 6 dígitos.');
      return;
    }

    try {
      await confirmationResult.confirm(smsCode.trim());
      setSuccessMsg('Login por celular efetuado!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Código SMS incorreto ou expirado: ' + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    clearAuthError();
    
    try {
      const res = await loginWithGooglePopup();
      if (!res.success) {
        if (Capacitor.isNativePlatform()) {
          const errMsg = 'Erro no login nativo: ' + res.error + '. Lembre-se de anexar o arquivo google-services.json e cadastrar a chave SHA-1.';
          setErrorMsg(errMsg);
          window.alert(errMsg);
        } else {
          console.warn("Popup authentication failed, falling back to redirect...");
          loginWithGoogleRedirect();
        }
      }
    } catch (e) {
      if (Capacitor.isNativePlatform()) {
        const errMsg = 'Erro no login nativo: ' + e.message;
        setErrorMsg(errMsg);
        window.alert(errMsg);
      } else {
        console.warn("Popup blocked or rejected. Redirecting...", e);
        loginWithGoogleRedirect();
      }
    }
  };

  const handleAnonymousLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    clearAuthError();
    const res = await loginAnonymously();
    if (!res.success) {
      setErrorMsg('Erro ao entrar como convidado: ' + res.error);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email.trim()) {
      setErrorMsg('Informe seu e-mail para receber as instruções de recuperação.');
      return;
    }
    const res = await sendPasswordReset(email.trim());
    if (res.success) {
      setSuccessMsg('E-mail de redefinição enviado com sucesso.');
      setIsResetRequested(false);
    } else {
      setErrorMsg('Erro ao enviar e-mail: ' + res.error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      background: 'var(--bg-gradient)'
    }}>
      
      {/* Invisible Recaptcha Hook anchor */}
      <div id="recaptcha-container"></div>

      {/* Header Info */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)' }}>O Santuário</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
          Gerenciador inteligente de estudos e foco cognitivo.
        </p>
      </div>

      {/* Main card */}
      <div className="neumorphic-card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Auth form tab togglers */}
        {!isResetRequested && (
          <div style={{
            display: 'flex',
            background: 'var(--bg-primary)',
            boxShadow: 'var(--shadow-inset)',
            padding: '5px',
            borderRadius: '14px',
            gap: '2px'
          }}>
            <button
              onClick={() => { setActiveFormTab('email-login'); setErrorMsg(''); setSuccessMsg(''); setIsResetRequested(false); }}
              className={`neumorphic-btn ${activeFormTab === 'email-login' ? 'active' : ''}`}
              style={{ flex: 1, padding: '8px', fontSize: '0.75rem', border: 'none', borderRadius: '10px' }}
            >
              E-mail
            </button>
            <button
              onClick={() => { setActiveFormTab('phone-login'); setErrorMsg(''); setSuccessMsg(''); setIsResetRequested(false); }}
              className={`neumorphic-btn ${activeFormTab === 'phone-login' ? 'active' : ''}`}
              style={{ flex: 1, padding: '8px', fontSize: '0.75rem', border: 'none', borderRadius: '10px' }}
            >
              Celular
            </button>
            <button
              onClick={() => { setActiveFormTab('register'); setErrorMsg(''); setSuccessMsg(''); setIsResetRequested(false); }}
              className={`neumorphic-btn ${activeFormTab === 'register' ? 'active' : ''}`}
              style={{ flex: 1, padding: '8px', fontSize: '0.75rem', border: 'none', borderRadius: '10px' }}
            >
              Criar Conta
            </button>
          </div>
        )}

        {isResetRequested ? (
          /* PASSWORD RESET FORM */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', textAlign: 'center' }}>Recuperar Acesso</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'center' }}>
                Enviaremos um link de redefinição de senha para o e-mail informado.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '44px' }}
                  required
                />
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                  <IconEnvelope />
                </div>
              </div>
            </div>
            <button type="button" onClick={handlePasswordReset} className="neumorphic-btn accent-btn" style={{ padding: '12px', borderRadius: '12px' }}>
              Enviar Link
            </button>
            <button 
              type="button" 
              onClick={() => { setIsResetRequested(false); setErrorMsg(''); setSuccessMsg(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', textAlign: 'center' }}
            >
              Voltar ao login
            </button>
          </div>
        ) : activeFormTab === 'phone-login' ? (
          /* PHONE AUTH FORM */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {phoneStep === 1 ? (
              <form onSubmit={handleSendSms} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', textAlign: 'center' }}>Acesso com Celular</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'center' }}>
                    Acesso rápido via código SMS sem necessidade de senha.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Número de Telefone</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      placeholder="Ex: +5511999999999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '44px' }}
                      required
                    />
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                      <IconPhone />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Inclua o DDI (+55) e o DDD.</span>
                </div>
                <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '12px', borderRadius: '12px' }}>
                  Enviar Código SMS
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifySms} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', textAlign: 'center' }}>Confirmar SMS</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'center' }}>
                    Digite o código de 6 dígitos enviado para {phoneNumber}.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Código SMS</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="Ex: 123456"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '44px' }}
                      required
                    />
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                      <IconLock />
                    </div>
                  </div>
                </div>
                <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '12px', borderRadius: '12px' }}>
                  Verificar Código
                </button>
                <button 
                  type="button" 
                  onClick={() => { setPhoneStep(1); setSmsCode(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', textAlign: 'center' }}
                >
                  Mudar número de telefone
                </button>
              </form>
            )}
          </div>
        ) : (
          /* EMAIL / PASSWORD LOGIN OR REGISTER FORM */
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '44px' }}
                  required
                />
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                  <IconEnvelope />
                </div>
              </div>
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Senha</label>
                {activeFormTab !== 'register' && (
                  <button 
                    type="button" 
                    onClick={() => { setIsResetRequested(true); setErrorMsg(''); setSuccessMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '44px' }}
                  required
                />
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', display: 'flex' }}>
                  <IconLock />
                </div>
              </div>
            </div>

            <button type="submit" className="neumorphic-btn accent-btn" style={{ padding: '12px', borderRadius: '12px', width: '100%', fontSize: '0.9rem', marginTop: '6px' }}>
              {activeFormTab === 'register' ? 'Registrar Conta' : 'Entrar'}
            </button>
          </form>
        )}

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.04)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ou acessar via</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.04)' }} />
        </div>

        {/* Access buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Google Access */}
          <button 
            onClick={handleGoogleLogin} 
            className="neumorphic-btn" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '12px', 
              background: 'var(--panel-bg)',
              boxShadow: 'var(--shadow-flat)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '0.85rem'
            }}
          >
            <IconGoogle />
            <span>Entrar com o Google</span>
          </button>

          {/* Guest (Anonymous) Access */}
          <button 
            onClick={handleAnonymousLogin} 
            className="neumorphic-btn" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '12px', 
              background: 'var(--panel-bg)',
              boxShadow: 'var(--shadow-flat)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              border: '1px dashed rgba(0,0,0,0.1)'
            }}
          >
            Entrar como Convidado (Anônimo)
          </button>
        </div>

        {/* Alerts display */}
        {(errorMsg || state.authError) && (
          <div style={{
            fontSize: '0.8rem',
            color: '#c75e43',
            textAlign: 'center',
            fontWeight: '600',
            lineHeight: '1.4'
          }}>
            {errorMsg || state.authError}
          </div>
        )}

        {successMsg && (
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--accent-color)',
            textAlign: 'center',
            fontWeight: '600',
            lineHeight: '1.4'
          }}>
            {successMsg}
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthScreen;
