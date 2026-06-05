import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Search, Filter } from 'lucide-react';
import NewCourseModal from '../components/NewCourseModal';

export default function Courses() {
  const [cursos, setCursos] = useState([]);
  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const carregarCursos = async (termo = "") => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/courses?=${termo}`, {
        headers:{
          "Authorization": token
        }
      });
      
      const data = await response.json();
      setCursos(data);
    } catch (err) {
      console.error("Erro ao carregar cursos:", err);
    }
  };

  useEffect(() => {
    carregarCursos(busca);
  }, [busca]);

  const handleSuccess = () => {
    setIsModalOpen(false);
    carregarCursos(busca);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Cursos Técnicos</h1>
            <p className="text-slate-500">Gerencie o catálogo e a ocupação das turmas.</p>
          </div>
          <button
            onClick={()=> setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20">
            <Plus size={20} />
            Novo Curso
          </button>
        </header>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar curso..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
            Filtrar
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-slate-400 text-sm font-semibold">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Duração</th>
                <th className="px-6 py-4">Alunos</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((curso: any) => (
                <tr key={curso.ID} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-slate-400">#{curso.ID}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{curso.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                      {curso.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{curso.duration}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {(curso.classes || []).reduce((acc: number, turma: any) => 
                      acc + (turma.students?.length || 0), 0
                    )} / {curso.max_students}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <NewCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}