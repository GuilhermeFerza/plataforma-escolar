import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [novaTurma, setNovaTurma] = useState({
    name: '',
    course_id: ''
  });

  const carregarTurmas = () => {
    fetch("http://localhost:8080/api/classes")
      .then(response => response.json())
      .then(data => setTurmas(data))
      .catch(err => console.error("Erro ao carregar:", err));

    fetch("http://localhost:8080/api/courses")
      .then(response => response.json())
      .then(data => setCursos(data))
      .catch(err => console.error("Erro ao carregar:", err));
  };



  useEffect(() => {
    carregarTurmas();
  }, []);

  const handleAddClass = async (e) => {
  e.preventDefault();

  const url = editandoId
    ? `http://localhost:8080/api/classes/${editandoId}`
    : "http://localhost:8080/api/classes";
  
  const metodo = editandoId ? "PUT" : "POST"

  try {
    const response = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaTurma)
    });

    if (response.ok) {
      setNovaTurma({ name: '', course_id: '' });
      setEditandoId(null);
      carregarTurmas();
    }
  } catch (err) {
    console.error("Erro ao salvar turma:", err);
  }
};

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta turma?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/classes/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          carregarTurmas();
        }
      } catch (err) {
        console.error("Erro ao deletar:", err);
      }
    }
  };

  const [editandoId, setEditandoId] = useState(null); 

  const preencherEdicao = (turma) => {
    setEditandoId(turma.ID);
    setNovaTurma({
      name: turma.name,
      course_id: turma.course_id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Turmas</h1>
          <p className="text-slate-500 mt-1">Vincule turmas aos seus cursos ativos.</p>
        </header>

        <section className="mb-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-500" /> 
            {editandoId ? 'Editar Turma' : 'Nova Turma'}
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

            <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 font-bold hover:bg-blue-700 transition-all cursor-pointer">
              {editandoId ? 'Salvar Alterações' : 'Criar Turma'}
            </button>
            
            {editandoId && (
              <button 
                type="button" 
                onClick={() => { setEditandoId(null); setNovaTurma({name: '', course_id: ''}); }}
                className="text-slate-500 text-sm underline"
              >
                Cancelar
              </button>
            )}
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
                  <td className="py-4 text-sm flex gap-2">
                      <button 
                        onClick={() => handleDelete(turma.ID)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Excluir turma"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => preencherEdicao(turma)} 
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Editar turma"
                      >
                        <Pencil size={18} />
                      </button>
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