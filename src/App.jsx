import { useEffect, useState } from "react";

const API_BASE = "/api";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [meta, setMeta] = useState({
    show_due_date_banner: false,
    task_priority_label: "medium",
  });

  const loadTasks = () => {
    fetch(`${API_BASE}/tasks`)
      .then((r) => r.json())
      .then(setTasks);
  };

  const loadMeta = () => {
    // Values here are controlled live by CloudBees Unify feature flags,
    // read through the backend's /api/meta endpoint.
    fetch(`${API_BASE}/meta`)
      .then((r) => r.json())
      .then(setMeta);
  };

  useEffect(() => {
    loadTasks();
    loadMeta();
  }, []);

  const addTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(() => {
      setTitle("");
      loadTasks();
    });
  };

  const toggleDone = (task) => {
    fetch(`${API_BASE}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    }).then(loadTasks);
  };

  const removeTask = (task) => {
    fetch(`${API_BASE}/tasks/${task.id}`, { method: "DELETE" }).then(loadTasks);
  };

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>TaskFlow</h1>

      {meta.show_due_date_banner && (
        <div
          style={{
            background: "#fff3cd",
            padding: "0.5rem 1rem",
            marginBottom: "1rem",
            borderRadius: 4,
          }}
        >
          Reminder: this banner is controlled live from CloudBees Unify.
        </div>
      )}

      <form onSubmit={addTask} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0" }}
          >
            <input type="checkbox" checked={task.done} onChange={() => toggleDone(task)} />
            <span style={{ flex: 1, textDecoration: task.done ? "line-through" : "none" }}>
              {task.title}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#888" }}>{meta.task_priority_label}</span>
            <button onClick={() => removeTask(task)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
