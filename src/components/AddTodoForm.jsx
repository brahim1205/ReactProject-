import { useState, useRef } from "react";
import { todoService } from "../services/todoService.js";

const AddTodoForm = ({ onTodoAdded, currentUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("Moyenne");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  // Champs pour les tâches planifiées
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
      alert('Impossible d\'accéder au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const cancelAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const now = new Date();
    const baseData = {
      title: input.trim(),
      description: description?.trim() || undefined,
      priority: priority,
      status: isScheduled ? "pending" : "in_progress", // Tâches planifiées commencent en attente
      createdAt: now.toISOString(),
      day: now.toLocaleDateString('fr-FR', { weekday: 'long' }),
      date: now.toLocaleDateString('fr-FR'),
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      completedAt: null,
      userId: currentUser?.id || 1,
      createdBy: currentUser?.name || "Utilisateur"
    };

    if (isScheduled && startDate && startTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      baseData.startDateTime = startDateTime.toISOString();
    }

    if (isScheduled && endDate && endTime) {
      const endDateTime = new Date(`${endDate}T${endTime}`);
      baseData.endDateTime = endDateTime.toISOString();
    }

    try {
      let createdTodo;
      if (audioBlob && imageFile) {
        const form = new FormData();
        Object.entries(baseData).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, String(v));
        });
        form.append('image', imageFile);
        form.append('audio', audioBlob, 'audio.webm');
        createdTodo = await todoService.createTodoWithMedia(form);
      } else if (audioBlob) {
        const form = new FormData();
        Object.entries(baseData).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, String(v));
        });
        form.append('audio', audioBlob, 'audio.webm');
        createdTodo = await todoService.createTodoWithAudio(form);
      } else if (imageFile) {
        const form = new FormData();
        Object.entries(baseData).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, String(v));
        });
        form.append('image', imageFile);
        createdTodo = await todoService.createTodoWithImage(form);
      } else {
        createdTodo = await todoService.createTodo(baseData);
      }

      setInput("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      setAudioBlob(null);
      setAudioUrl(null);
      setPriority("Moyenne");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setIsScheduled(false);
      setShowForm(false);

      onTodoAdded(createdTodo);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de la création de la tâche. Veuillez réessayer.");
    }
  };

  if (!showForm) {
    return (
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-lg"
        >
          ➕ Ajouter une tâche
        </button>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <input
              id="todo-title"
              name="todo-title"
              type="text"
              className="input input-bordered w-full"
              placeholder="Titre de la tâche *"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
              aria-label="Titre de la tâche"
              autoComplete="off"
            />
            <textarea
              id="todo-description"
              name="todo-description"
              className="textarea textarea-bordered w-full min-h-20"
              placeholder="Description (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Description de la tâche"
              autoComplete="off"
            />
            <select
              id="todo-priority"
              name="todo-priority"
              className="select select-bordered w-full"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              aria-label="Sélectionner la priorité de la tâche"
            >
              <option value="Basse"> Basse</option>
              <option value="Moyenne"> Moyenne</option>
              <option value="Urgente"> Urgente</option>
            </select>

            {/* Section Planification */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Tâche planifiée</span>
                <input
                  id="scheduled-task"
                  name="scheduled-task"
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  aria-label="Marquer la tâche comme planifiée"
                />
              </label>
            </div>

            {isScheduled && (
              <div className="space-y-3 p-3 bg-base-200 rounded-lg">
                <h4 className="font-medium text-sm">Période de validité</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">
                      <span className="label-text text-xs">Date de début</span>
                    </label>
                    <input
                      id="start-date"
                      name="start-date"
                      type="date"
                      className="input input-bordered input-sm w-full"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      aria-label="Date de début de la tâche planifiée"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text text-xs">Heure de début</span>
                    </label>
                    <input
                      id="start-time"
                      name="start-time"
                      type="time"
                      className="input input-bordered input-sm w-full"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      aria-label="Heure de début de la tâche planifiée"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">
                      <span className="label-text text-xs">Date de fin</span>
                    </label>
                    <input
                      id="end-date"
                      name="end-date"
                      type="date"
                      className="input input-bordered input-sm w-full"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      aria-label="Date de fin de la tâche planifiée"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text text-xs">Heure de fin</span>
                    </label>
                    <input
                      id="end-time"
                      name="end-time"
                      type="time"
                      className="input input-bordered input-sm w-full"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      aria-label="Heure de fin de la tâche planifiée"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Image (optionnel)</div>
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-full h-24 object-cover rounded" />
            ) : (
              <div className="w-full h-24 border-2 border-dashed rounded flex items-center justify-center text-xs opacity-60">
                📷
              </div>
            )}
            <input
              id="todo-image"
              name="todo-image"
              type="file"
              accept="image/*"
              className="file-input file-input-bordered file-input-sm w-full"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                setImagePreview(file ? URL.createObjectURL(file) : null);
              }}
              aria-label="Sélectionner une image pour la tâche"
            />

            <div className="text-sm font-medium">Audio (optionnel)</div>
            {audioUrl ? (
              <div className="space-y-2">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/webm" />
                </audio>
                <button
                  type="button"
                  onClick={cancelAudio}
                  className="btn btn-ghost btn-xs text-error"
                >
                  🗑️ Supprimer l'audio
                </button>
              </div>
            ) : (
              <div className="w-full h-12 border-2 border-dashed rounded flex items-center justify-center text-xs opacity-60">
                🎤
              </div>
            )}
            <div className="flex gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  🎤 Enregistrer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="btn btn-error btn-sm flex-1"
                >
                  ⏹️ Arrêter
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-sm flex-1"
                disabled={!input.trim()}
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-ghost btn-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTodoForm;