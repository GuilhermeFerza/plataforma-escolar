import { LayoutDashboard, BookOpen, Users, Calendar, MessageSquare, LogOut, Shield } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const userString = localStorage.getItem("user");
  let userRole = "";

  if(userString){
    try{
      const userObj = JSON.parse(userString);
      userRole = userObj.role;
    } catch(e){
      console.error("Erro ao parsear o usuário do localStorage:", e);
    }
  }


  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Cursos', path: '/cursos' },
    { icon: Users, label: 'Turmas', path: '/turmas' },
    { icon: Calendar, label: 'Agendamentos', path: '/agendamentos' },
    { icon: MessageSquare, label: 'Mensagens', path: '/mensagens' },
    { icon: Users, label: 'Alunos', path: '/alunos' },
  ];

  if (userRole === 'admin'){
    menuItems.push({ icon: Shield, label: 'Painel Admin', path: '/admin' });
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-blue-600 tracking-tight">TechAdvance</h2>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gestão Acadêmica</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                ${isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700' 
                }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium text-sm"
        >
          <LogOut size={20} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}