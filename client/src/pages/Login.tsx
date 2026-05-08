import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && password) {
      try {
        const response = await fetch("http://localhost:8081/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
        
          localStorage.setItem("token", data.token);
          
          localStorage.setItem("user", JSON.stringify(data.user));

          console.log("Login realizado com sucesso pelo servidor!");
          navigate('/dashboard'); 
        } else {
          alert("E-mail ou senha incorretos. Tente novamente.");
        }
      } catch (error) {
        console.error("Erro ao conectar no servidor:", error);
        alert("Erro ao conectar no servidor. Verifique se o Go está rodando.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg mb-4">
            <School size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">TechAdvance</h1>
          <p className="text-slate-500 mt-2 font-medium">Portal do Aluno & Admin</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form className="space-y-5" onSubmit={handleLogin}>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 ml-1">E-mail</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="aluno@techadvance.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 ml-1">Senha</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="group relative flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-500/25"
            >
              Entrar no sistema
              <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          © 2024 TechAdvance Institute. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}