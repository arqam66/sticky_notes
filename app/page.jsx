"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, Trash2, Edit, Save, Pin, PinOff, Copy, Sparkles, Moon, Sun } from "lucide-react"
import confetti from "canvas-confetti"

export default function NotesApp() {
  const [notes, setNotes] = useState([])
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState("")
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [voiceError, setVoiceError] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [gradients] = useState([
    "linear-gradient(135deg, #FFDE59, #FFB830)",
    "linear-gradient(135deg, #A0E7E5, #4ECDC4)",
    "linear-gradient(135deg, #FFAEBC, #FF8FAB)",
    "linear-gradient(135deg, #B4F8C8, #8BE9A8)",
    "linear-gradient(135deg, #FBE7C6, #F9D29D)",
    "linear-gradient(135deg, #A0C4FF, #7B9FFF)",
    "linear-gradient(135deg, #E0C3FC, #D4A5FF)",
  ])
  const recognitionRef = useRef(null)

  // Load notes and preferences from localStorage on initial render
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }

    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Setup speech recognition
  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        try {
          recognitionRef.current = new SpeechRecognition()
          recognitionRef.current.continuous = true
          recognitionRef.current.interimResults = true

          recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map((result) => result[0])
              .map((result) => result.transcript)
              .join("")

            setInputText(transcript)
          }

          recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error", event.error)
            setVoiceError(`Error: ${event.error}`)
            setIsRecording(false)
          }

          recognitionRef.current.onend = () => {
            setIsRecording(false)
          }
        } catch (error) {
          console.error("Error initializing speech recognition:", error)
          setVoiceSupported(false)
          setVoiceError("Failed to initialize speech recognition")
        }
      } else {
        setVoiceSupported(false)
        setVoiceError("Speech recognition not supported in this browser")
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.error("Error stopping recognition:", e)
        }
      }
    }
  }, [])

  const toggleRecording = () => {
    if (!voiceSupported) {
      alert("Speech recognition is not supported in your browser. Try using Chrome.")
      return
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop()
      } catch (e) {
        console.error("Error stopping recognition:", e)
      }
    } else {
      setVoiceError("")
      try {
        recognitionRef.current?.start()
      } catch (e) {
        console.error("Error starting recognition:", e)
        setVoiceError("Failed to start recording. Make sure microphone permissions are granted.")
      }
    }
    setIsRecording(!isRecording)
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const addNote = () => {
    if (inputText.trim() !== "") {
      const newNote = {
        id: Date.now(),
        text: inputText,
        gradient: gradients[Math.floor(Math.random() * gradients.length)],
        date: new Date().toLocaleString(),
        pinned: false,
        rotation: Math.random() * 6 - 3, // Random rotation between -3 and 3 degrees
      }
      setNotes([newNote, ...notes])
      setInputText("")
      triggerConfetti()
    }
  }

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const startEditing = (note) => {
    setEditingId(note.id)
    setEditText(note.text)
  }

  const saveEdit = () => {
    if (editText.trim() !== "") {
      setNotes(
        notes.map((note) =>
          note.id === editingId ? { ...note, text: editText, date: `${note.date} (edited)` } : note,
        ),
      )
      setEditingId(null)
      setEditText("")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const togglePin = (id) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)))
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Note copied to clipboard!")
      },
      (err) => {
        console.error("Could not copy text: ", err)
      },
    )
  }

  // Sort notes: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.id - a.id // Newest first
  })

  const pinnedNotes = sortedNotes.filter((note) => note.pinned)
  const unpinnedNotes = sortedNotes.filter((note) => !note.pinned)

  // Helper function to join classnames (replacing the cn utility)
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
  }

  return (
    <div
      className={classNames(
        "min-h-screen transition-colors duration-300",
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-blue-50 to-purple-50",
      )}
    >
      {/* Header */}
      <div
        className={classNames(
          "py-8 px-4 text-center",
          darkMode ? "bg-gray-800" : "bg-gradient-to-r from-blue-400 to-purple-500",
        )}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white drop-shadow-md">✨ Sticky Notes ✨</h1>
        <p className="text-white/80 max-w-md mx-auto">
          Capture your thoughts, ideas, and reminders in colorful digital sticky notes
        </p>
        <button
          className={classNames(
            "absolute top-4 right-4 rounded-full p-2",
            "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30",
            "transition-colors duration-200",
          )}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Note count */}
        <div className={classNames("flex justify-center mb-8", darkMode ? "text-white" : "text-gray-800")}>
          <p className="text-sm opacity-70">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
            {pinnedNotes.length > 0 && ` (${pinnedNotes.length} pinned)`}
          </p>
        </div>

        {/* Input area */}
        <div
          className={classNames(
            "rounded-lg shadow-lg p-6 mb-10 max-w-2xl mx-auto transform transition-all duration-300 hover:shadow-xl",
            darkMode ? "bg-gray-800 border border-gray-700" : "bg-white",
          )}
        >
          <textarea
            className={classNames(
              "w-full p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] mb-4 transition-colors",
              darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-50 border border-gray-200",
            )}
            placeholder="Take a note..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              <button
                className={classNames(
                  "px-3 py-2 rounded-md flex items-center gap-2 transition-colors",
                  darkMode ? "bg-gray-700 text-white" : "border border-gray-300 bg-white",
                  isRecording && "bg-red-500 text-white border-red-600",
                )}
                onClick={toggleRecording}
                disabled={!voiceSupported}
              >
                <Mic className="h-4 w-4" />
                {isRecording ? "Stop Recording" : "Voice Note"}
              </button>
              {voiceError && <p className="text-red-500 text-xs mt-1">{voiceError}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">{inputText.length} characters</span>
              <button
                className="px-3 py-2 rounded-md flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-colors"
                onClick={addNote}
              >
                <Sparkles className="h-4 w-4" />
                Create Note
              </button>
            </div>
          </div>
        </div>

        {/* Notes grid */}
        {notes.length === 0 ? (
          <div className={classNames("text-center py-10", darkMode ? "text-gray-400" : "text-gray-500")}>
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
            <p>Create your first note to get started!</p>
          </div>
        ) : (
          <div className="notes-masonry">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                className={classNames(
                  "note-card rounded-lg shadow-lg p-5 break-words transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                  note.pinned && "ring-2 ring-yellow-400 ring-offset-2",
                )}
                style={{
                  background: note.gradient,
                  transform: `rotate(${note.rotation}deg)`,
                }}
              >
                <div className="flex flex-col h-full">
                  {editingId === note.id ? (
                    // Edit mode
                    <>
                      <textarea
                        className="w-full p-3 border border-gray-400 rounded bg-white/90 min-h-[120px] mb-2 shadow-inner"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          className="px-2 py-1 text-sm rounded-md bg-white/70 hover:bg-white border border-gray-300"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-2 py-1 text-sm rounded-md flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          onClick={saveEdit}
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </button>
                      </div>
                    </>
                  ) : (
                    // View mode
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <button
                          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/10"
                          onClick={() => togglePin(note.id)}
                        >
                          {note.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                        </button>
                        <div className="flex gap-1">
                          <button
                            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/10"
                            onClick={() => copyToClipboard(note.text)}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <p className="whitespace-pre-wrap mb-4 text-gray-800">{note.text}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/10">
                        <small className="text-xs opacity-70">{note.date}</small>
                        <div className="flex gap-1">
                          <button
                            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/10"
                            onClick={() => startEditing(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/10"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

