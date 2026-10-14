import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiPlus, FiSearch, FiSun, FiMoon, FiTrash2, FiEdit2, FiInbox, FiCalendar, FiGrid, FiTarget, FiX, FiArrowUpRight } from "react-icons/fi";
import "./App.css";

const starterTasks = [
  { id: "starter-1", title: "Plan my week", category: "Personal", priority: "High", due: "Today", completed: false },
  { id: "starter-2", title: "Finish React practice", category: "Study", priority: "Medium", due: "Today", completed: false },
  { id: "starter-3", title: "Reply to important emails", category: "Work", priority: "Low", due: "Tomorrow", completed: true },
];

function readTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem("taskflow-tasks") || "null");
    if (Array.isArray(saved)) return saved.map((t) => ({
      id: t.id || crypto.randomUUID(),
      title: t.title || t.todo || "Untitled task",
      category: t.category || "Personal",
      priority: t.priority || "Medium",
      due: t.due || "Today",
      completed: Boolean(t.completed ?? t.isCompleted),
    }));
    const old = JSON.parse(localStorage.getItem("todos") || "null");
    if (Array.isArray(old)) return old.map((t) => ({
      id: t.id || crypto.randomUUID(),
      title: t.todo || "Untitled task",
      category: "Personal",
      priority: "Medium",
      due: "Today",
      completed: Boolean(t.isCompleted),
    }));
  } catch { /* use starter tasks if saved data is invalid */ }
  return starterTasks;
}

function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState("Medium");
  const [due, setDue] = useState("Today");
  const [filter, setFilter] = useState("All tasks");
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesQuery = task.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === "All tasks" ||
      (filter === "Today" && task.due === "Today" && !task.completed) ||
      (filter === "Upcoming" && task.due !== "Today" && !task.completed) ||
      (filter === "Completed" && task.completed);
    return matchesQuery && matchesFilter;
  }), [tasks, query, filter]);

  function submitTask(e) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    if (editingId) {
      setTasks((current) => current.map((t) => t.id === editingId ? { ...t, title: cleanTitle, category, priority, due } : t));
      setEditingId(null);
    } else {
      setTasks((current) => [{ id: crypto.randomUUID(), title: cleanTitle, category, priority, due, completed: false }, ...current]);
    }
    setTitle("");
    setCategory("Personal");
    setPriority("Medium");
    setDue("Today");
  }

  function editTask(task) {
    setTitle(task.title);
    setCategory(task.category);
    setPriority(task.priority);
    setDue(task.due);
    setEditingId(task.id);
    document.querySelector(".task-input")?.focus();
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setCategory("Personal");
    setPriority("Medium");
    setDue("Today");
  }

  const navItems = [
    { label: "All tasks", icon: <FiGrid />, count: tasks.length },
    { label: "Today", icon: <FiCalendar />, count: activeTasks.filter(t => t.due === "Today").length },
    { label: "Upcoming", icon: <FiInbox />, count: activeTasks.filter(t => t.due !== "Today").length },
    { label: "Completed", icon: <FiCheck />, count: completedTasks.length },
  ];

  const progress = tasks.length ? Math.round(completedTasks.length / tasks.length * 100) : 0;

  return (
    <main className={`app-shell ${dark ? "dark-mode" : ""}`}>
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="TaskFlow home">
          <span className="brand-mark"><FiCheck /></span>
          <span>task<span>flow</span><small>MAKE SPACE FOR WHAT MATTERS</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Task filters">
          {navItems.map((item) => (
            <button key={item.label} className={`nav-item ${filter === item.label ? "selected" : ""}`} onClick={() => setFilter(item.label)}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span><span className="nav-count">{item.count}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-goal">
            <div className="goal-icon"><FiTarget /></div>
            <p className="goal-title">Small steps add up.</p>
            <p className="goal-copy">You’ve completed <strong>{completedTasks.length}</strong> {completedTasks.length === 1 ? "task" : "tasks"}. Keep your momentum going!</p>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            <div className="progress-meta"><span>YOUR PROGRESS</span><strong>{progress}%</strong></div>
          </div>
          <button className="theme-toggle" onClick={() => setDark(!dark)}><span className="theme-icon">{dark ? <FiSun /> : <FiMoon />}</span>{dark ? "Switch to light mode" : "Switch to dark mode"}</button>
          <div className="profile">
            <div className="avatar">H</div><div><strong>My workspace</strong><span>Personal planner</span></div><FiArrowUpRight className="profile-arrow" />
          </div>
        </div>
      </aside>

      <section className="main-panel" id="home">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>{filter}</strong></div>
          <div className="topbar-right"><span className="today-pill"><span className="status-dot" /> YOUR DAY, YOUR WAY</span><div className="top-avatar">H</div></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><p className="eyebrow">YOUR PERSONAL SPACE</p><h1>Make today <em>count.</em></h1><p className="welcome-subtitle">A little progress each day adds up to big results.</p></div>
            <div className="date-card"><span className="date-spark">✳</span><div><strong>{new Date().toLocaleDateString("en-US", { weekday: "long" })}</strong><span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span></div></div>
          </section>

          <section className="stats-grid" aria-label="Task summary">
            <article className="stat-card stat-total"><div className="stat-top"><span>Total tasks</span><span className="stat-icon"><FiGrid /></span></div><div className="stat-number">{tasks.length.toString().padStart(2, "0")}</div><div className="stat-foot">Everything on your list</div></article>
            <article className="stat-card stat-active"><div className="stat-top"><span>In progress</span><span className="stat-icon"><FiTarget /></span></div><div className="stat-number">{activeTasks.length.toString().padStart(2, "0")}</div><div className="stat-foot"><span className="tiny-dot" />Ready for your next step</div></article>
            <article className="stat-card stat-done"><div className="stat-top"><span>Completed</span><span className="stat-icon"><FiCheck /></span></div><div className="stat-number">{completedTasks.length.toString().padStart(2, "0")}</div><div className="stat-foot">{progress}% of your tasks finished</div></article>
          </section>

          <section className="content-grid">
            <div className="tasks-panel">
              <div className="section-heading"><div><p className="eyebrow">STAY ON TRACK</p><h2>{filter === "All tasks" ? "Your task list" : filter}</h2></div><span className="task-total">{visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"}</span></div>
              <div className="search-box"><FiSearch /><input aria-label="Search tasks" placeholder="Search your tasks..." value={query} onChange={(e) => setQuery(e.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><FiX /></button>}</div>
              <div className="task-list">
                {visibleTasks.length === 0 ? <div className="empty-state"><span className="empty-icon"><FiCheck /></span><strong>Nothing on this list yet</strong><p>Add a task or try another filter.</p></div> :
                  visibleTasks.map((task) => (
                    <article className={`task-row ${task.completed ? "is-complete" : ""}`} key={task.id}>
                      <button className={`check-button ${task.completed ? "checked" : ""}`} aria-label={task.completed ? "Mark task incomplete" : "Complete task"} onClick={() => setTasks(current => current.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}>{task.completed && <FiCheck />}</button>
                      <div className="task-details"><strong>{task.title}</strong><div className="task-meta"><span className={`category-tag ${task.category.toLowerCase()}`}>{task.category}</span><span className={`priority ${task.priority.toLowerCase()}`}><i />{task.priority} priority</span><span className="due-label">{task.due}</span></div></div>
                      <div className="task-actions"><button aria-label="Edit task" onClick={() => editTask(task)}><FiEdit2 /></button><button aria-label="Delete task" onClick={() => setTasks(current => current.filter(t => t.id !== task.id))}><FiTrash2 /></button></div>
                    </article>
                  ))
                }
              </div>
              <div className="list-footer"><span><span className="footer-dot" /> Saved automatically on this device</span><span>{completedTasks.length} done <b>·</b> {activeTasks.length} left</span></div>
            </div>

            <aside className="create-panel">
              <div className="create-heading"><span className="create-icon"><FiPlus /></span><div><p className="eyebrow">{editingId ? "MAKE AN UPDATE" : "A FRESH START"}</p><h2>{editingId ? "Edit task" : "Add a task"}</h2></div></div>
              <p className="form-intro">Get it out of your head and onto your list.</p>
              <form onSubmit={submitTask}>
                <label htmlFor="task-title">Task name</label>
                <input id="task-title" className="task-input" placeholder="e.g. Learn something new" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
                <label htmlFor="task-category">Category</label>
                <select id="task-category" value={category} onChange={(e) => setCategory(e.target.value)}><option>Personal</option><option>Work</option><option>Study</option><option>Health</option></select>
                <div className="form-two-col"><div><label htmlFor="task-priority">Priority</label><select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></div><div><label htmlFor="task-due">When</label><select id="task-due" value={due} onChange={(e) => setDue(e.target.value)}><option>Today</option><option>Tomorrow</option><option>This week</option><option>Someday</option></select></div></div>
                <button className="submit-button" type="submit"><FiPlus /> {editingId ? "Save changes" : "Add to my list"}</button>
                {editingId && <button className="cancel-button" type="button" onClick={cancelEdit}>Cancel editing</button>}
              </form>
              <div className="gentle-reminder"><span>✦</span><p><strong>A gentle reminder</strong> You don’t have to do it all at once. Just start with one thing.</p></div>
            </aside>
          </section>
          <footer className="page-footer"><span>MADE FOR A MORE MINDFUL DAY</span><span>One thing at a time <b>✳</b></span></footer>
        </div>
      </section>
    </main>
  );
}

export default App;
