import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Mail, Lock, Hash, UserPlus } from 'lucide-react';

export default function Admin() {
  const [novoUsuario, setNovoUsuario] = useState({
    funcionario_id: '',
    email: '',
    password: ''
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8081/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...novoUsuario,
            funcionario_id: Number(novoUsuario.funcionario_id)
        })
      });

      if (response.ok) {
        alert("Funcionário habilitado para acesso!");
        setNovoUsuario({ funcionario_id: '', email: '', password: '' });
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <header className="mb-10 text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-indigo-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Painel de Controle</h1>
            <p className="text-slate-500 mt-1">Gerencie as credenciais de acesso dos funcionários.</p>
          </header>

          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus size={24} className="text-indigo-500" /> Cadastrar Novo Usuário
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Hash size={16} /> ID do Funcionário
                </label>
                <input 
                  type="number" 
                  placeholder="Ex: 1001"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={novoUsuario.funcionario_id}
                  onChange={(e) => setNovoUsuario({...novoUsuario, funcionario_id: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Mail size={16} /> E-mail Corporativo
                </label>
                <input 
                  type="email" 
                  placeholder="funcionario@techadvance.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Lock size={16} /> Senha Temporária
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  value={novoUsuario.password}
                  onChange={(e) => setNovoUsuario({...novoUsuario, password: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-4"
              >
                Ativar Acesso
              </button>
            </form>
          </section>

          <footer className="mt-8 text-center text-slate-400 text-sm italic">
            O funcionário poderá alterar essa senha no primeiro acesso.
          </footer>
        </div>
      </main>
    </div>
  );
}