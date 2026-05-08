import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { UserPlus, GraduationCap, Mail, CreditCard } from 'lucide-react';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [novoAluno, setNovoAluno] = useState({
    name: '',
    email: '',
    cpf: '',
    class_id: ''
  });

  const carregarDados = async () => {
    const [resAlunos, resTurmas] = await Promise.all([
      fetch("http://localhost:8080/api/students"),
      fetch("http://localhost:8080/api/classes")
    ]);
    setAlunos(await resAlunos.json());
    setTurmas(await resTurmas.json());
  };

  useEffect(() => { carregarDados(); }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8080/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoAluno)
    });
    if (response.ok) {
      setNovoAluno({ name: '', email: '', cpf: '', class_id: '' });
      carregarDados();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Secretaria Acadêmica</h1>
          <p className="text-slate-500 mt-1">Matrícula e gestão de alunos.</p>
        </header>

        <section className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-500" /> Nova Matrícula
          </h2>
          <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input 
              type="text" placeholder="Nome Completo" className="p-2 border rounded-lg text-sm"
              value={novoAluno.name} onChange={(e) => setNovoAluno({...novoAluno, name: e.target.value})} required
            />
            <input 
              type="email" placeholder="E-mail" className="p-2 border rounded-lg text-sm"
              value={novoAluno.email} onChange={(e) => setNovoAluno({...novoAluno, email: e.target.value})} required
            />
            <input 
              type="text" placeholder="CPF" className="p-2 border rounded-lg text-sm"
              value={novoAluno.cpf} onChange={(e) => setNovoAluno({...novoAluno, cpf: e.target.value})} required
            />
            <select 
              className="p-2 border rounded-lg text-sm"
              value={novoAluno.class_id} onChange={(e) => setNovoAluno({...novoAluno, class_id: Number(e.target.value)})} required
            >
              <option value="">Selecione a Turma</option>
              {turmas.map(t => (
                <option key={t.ID} value={t.ID}>{t.name} ({t.course?.name})</option>
              ))}
            </select>
            <button type="submit" className="bg-indigo-600 text-white rounded-lg py-2 font-bold hover:bg-indigo-700 transition-all">
              Matricular
            </button>
          </form>
        </section>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-sm">
                <th className="py-4 font-semibold">Aluno</th>
                <th className="py-4 font-semibold">CPF</th>
                <th className="py-4 font-semibold">Turma / Curso</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.ID} className="border-b border-slate-50">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{aluno.name}</span>
                      <span className="text-xs text-slate-400">{aluno.email}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-600">{aluno.cpf}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">{aluno.class?.name}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{aluno.class?.course?.name}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}