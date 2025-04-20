import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [taskTitle, setTaskTitle] = useState("")
  const [tareas, setTareas] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        cargarTareasDelUsuario(user.id)
      }
    })
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) alert(error.message)
    else {
      setUser(data.user)
      cargarTareasDelUsuario(data.user.id)
    }
  }

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) alert(error.message)
    else alert("Revisa tu correo para confirmar (si aplica)")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTareas([])
  }

  const cargarTareasDelUsuario = async (userId) => {
    const { data: tareas, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.error("Error al cargar tareas:", error.message)
    } else {
      setTareas(tareas)
    }
  }

  const handleAddTask = async () => {
    const { error } = await supabase.from("tasks").insert({
      title: taskTitle,
      user_id: user.id,  // Asociamos la tarea con el user_id del usuario autenticado
      completed: false  // Asignamos un valor inicial a "completed"
    })
    if (error) {
      alert("Error al guardar tarea: " + error.message)
    } else {
      alert("Tarea guardada correctamente")
      setTaskTitle("")
      cargarTareasDelUsuario(user.id) // Recargar las tareas del usuario
    }
  }

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)

    if (error) {
      alert("Error al eliminar tarea: " + error.message)
    } else {
      alert("Tarea eliminada correctamente")
      cargarTareasDelUsuario(user.id) // Recargar las tareas después de eliminar
    }
  }

  const handleUpdateCompleted = async (taskId, completed) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", taskId)

    if (error) {
      alert("Error al actualizar tarea: " + error.message)
    } else {
      cargarTareasDelUsuario(user.id) // Recargar las tareas después de actualizar
    }
  }

  if (!user) {
    return (
      <div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Iniciar sesión</button>
        </form>
        <button onClick={handleSignup}>Registrarse</button>
      </div>
    )
  }

  return (
    <div>
      <h2>Hola {user.email}</h2>

      <input
        type="text"
        placeholder="Nueva tarea"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
      />
      <button onClick={handleAddTask}>Agregar tarea</button>

      {tareas.length > 0 && (
        <ul>
          {tareas.map((tarea) => (
            <li key={tarea.id}>
              {tarea.title}{" "}
              <label>
                Completada
                <input
                  type="checkbox"
                  checked={tarea.completed}
                  onChange={() =>
                    handleUpdateCompleted(tarea.id, !tarea.completed)
                  }
                />
              </label>
              <button onClick={() => handleDeleteTask(tarea.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  )
}

export default App
