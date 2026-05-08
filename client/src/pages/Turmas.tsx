import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { PlusCircle } from 'lucide-react';

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [novaTurma, setNovaTurma] = useState({
    name: '',
    course_id: ''
  });
  useEffect(() => {
    fetch("http://localhost:8080/api/classes")
      .then(res => res.json())
      .then(data => setTurmas(data))
      .catch(err => console.error(err));

    fetch("http://localhost:8080/api/courses")
      .then(res => res.json())
      .then(data => setCursos(data))
      .catch(err => console.error(err));
  }, []);

  const handleAddClass = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch("http://localhost:8080/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaTurma)
    });

    if (response.ok) {
      setNovaTurma({ name: '', course_id: '' });
      const res = await fetch("http://localhost:8080/api/classes");
      const data = await res.json();
      setTurmas(data);
    }
  } catch (err) {
    console.error("Erro ao salvar turma:", err);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Turmas</h1>
          <p className="text-slate-500 mt-1">Vincule turmas aos seus cursos ativos.</p>
        </header>

        {/* Formulário de Cadastro de Turma */}
        <section className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-500" /> Nova Turma
          </h2>
          <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" placeholder="Nome da Turma (Ex: Turma A)" 
              className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={novaTurma.name}
              onChange={(e) => setNovaTurma({...novaTurma, name: e.target.value})}
              required
            />
            
            <select 
              className="p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={novaTurma.course_id}
              onChange={(e) => setNovaTurma({...novaTurma, course_id: Number(e.target.value)})}
              required
            >
              <option value="">Selecione um Curso</option>
              {cursos.map(curso => (
                <option key={curso.ID} value={curso.ID}>{curso.name}</option>
              ))}
            </select>

            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 font-bold hover:bg-blue-700 transition-all">
              Criar Turma
            </button>
          </form>
        </section>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-sm">
                <th className="py-4 font-semibold">ID</th>
                <th className="py-4 font-semibold">Turma</th>
                <th className="py-4 font-semibold">Curso Vinculado</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((turma) => (
                <tr key={turma.ID} className="border-b border-slate-50 text-slate-800">
                  <td className="py-4 text-sm font-bold">#{turma.ID}</td>
                  <td className="py-4 text-sm">{turma.name}</td>
                  <td className="py-4 text-sm">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      {turma.course?.name || "Sem curso"}
                    </span>
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