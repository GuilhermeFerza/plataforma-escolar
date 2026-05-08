import Sidebar from '../components/Sidebar';
import { Plus, Search, Filter } from 'lucide-react';

const coursesMock = [
  { id: 1, name: 'Desenvolvimento Web Fullstack', category: 'Programação', duration: '120h', students: 28, maxStudents: 30 },
  { id: 2, name: 'Redes de Computadores', category: 'Infraestrutura', duration: '80h', students: 20, maxStudents: 20 },
  { id: 3, name: 'Design de Interface (UI/UX)', category: 'Design', duration: '60h', students: 15, maxStudents: 25 },
];

export default function Courses() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Cursos Técnicos</h1>
            <p className="text-slate-500">Gerencie o catálogo e a ocupação das turmas.</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
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
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
            Filtros
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-semibold">Curso</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold">Carga Horária</th>
                <th className="px-6 py-4 font-semibold">Ocupação</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coursesMock.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{course.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold uppercase">
                      {course.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{course.duration}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[80px]">
                        <div 
                          className={`h-full rounded-full ${course.students >= course.maxStudents ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${(course.students / course.maxStudents) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {course.students}/{course.maxStudents}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 font-bold text-sm hover:underline">Ver Detalhes</button>
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