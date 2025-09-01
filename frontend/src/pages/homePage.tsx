import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/userContext.tsx";

interface INotes {
  _id: string;
  title: string;
  content: string;
  User: string; // Keep this as is, but check backend consistency
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotesResponse {
  message: string;
  notes: INotes[];
}

interface NewNote {
  title: string;
  content: string;
}

function HomePage() {
  const [notes, setNotes] = useState<INotes[]>([]);
  const [note, setNote] = useState<NewNote>({ title: "", content: "" });
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user, logout } = useAuth();

  console.log("Manual check:", {
    token: localStorage.getItem("token"),
    user: localStorage.getItem("user"),
    persist: localStorage.getItem("persist")
  });

  const getNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      // console.log("Token: ", token); 

      const response = await axios.get<NotesResponse>("http://localhost:8000/home/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      // console.log("Notes: ", response.data);
      setNotes(response.data.notes || []);
    } catch (error: any) {
      console.error("Failed to fetch notes:", error.response?.data || error.message);
      setError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!note.title.trim() && !note.content.trim()) {
      setError("Please enter a title or content");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post<INotes>(
        "http://localhost:8000/home/addNote",
        {
          title: note.title,
          content: note.content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      setNotes((prev) => [...prev, response.data]);
      setNote({ title: "", content: "" });
      setShowCreateNote(false);
    } catch (error: any) {
      console.error("Failed to add note:", error.response?.data || error.message);
      setError("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(`http://localhost:8000/home/deleteNote/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (error: any) {
      console.error("Failed to delete note:", error.response?.data || error.message);
      setError("Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
  };

  useEffect(() => {
    if (token) {
      console.log("Token available, fetching notes..."); // Debug log
      getNotes();
    }
  }, [token, note, setNote]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout (matches your image) */}
      <div className="lg:hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-blue-500 text-sm font-medium hover:text-blue-600"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Card */}
        <div className="m-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome, {user?.name || "Jonas Kahnwald"} !
            </h2>
            <p className="text-sm text-gray-600">
              Email: {user?.email || "xxxxxx@xxxx.com"}
            </p>
          </div>
        </div>

        {/* Create Note Button */}
        <div className="mx-4 mb-4">
          <button
            onClick={() => setShowCreateNote(!showCreateNote)}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-4 px-6 rounded-xl text-base font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Create Note
          </button>
        </div>

        {/* Create Note Form */}
        {showCreateNote && (
          <div className="bg-white mx-4 mb-4 p-4 rounded-xl shadow-sm">
            <input
              type="text"
              placeholder="Note title..."
              value={note.title}
              onChange={(e) => setNote((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg text-base mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Write your note content..."
              value={note.content}
              onChange={(e) => setNote((prev) => ({ ...prev, content: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg text-base mb-4 min-h-[100px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              <button
                onClick={addNote}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Note'}
              </button>
              <button
                onClick={() => {
                  setShowCreateNote(false);
                  setNote({ title: "", content: "" });
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Notes Section */}
        <div className="mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>

          {loading && notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No notes yet. Create your first note!</p>
            </div>
          ) : (
            <div className="space-y-3 pb-6">
              {notes.map((n, index) => (
                <div
                  key={n._id}
                  className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-start"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="font-medium text-gray-900 mb-1">
                      {n.title || `Note ${index + 1}`}
                    </div>
                    {n.content && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {n.content}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteNote(n._id)}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Delete note"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="text-blue-500 font-medium hover:text-blue-600"
            >
              Sign Out
            </button>
          </div>

          {/* Welcome Section */}
          <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome, {user?.name || "Jonas Kahnwald"} !
            </h2>
            <p className="text-gray-600">
              Email: {user?.email || "xxxxxx@xxxx.com"}
            </p>
          </div>

          {/* Create Note Section */}
          <div className="mb-8">
            <button
              onClick={() => setShowCreateNote(!showCreateNote)}
              disabled={loading}
              className="bg-blue-500 text-white py-4 px-8 rounded-xl text-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Create Note
            </button>
          </div>

          {/* Create Note Form */}
          {showCreateNote && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h3 className="text-lg font-semibold mb-4">Create New Note</h3>
              <input
                type="text"
                placeholder="Note title..."
                value={note.title}
                onChange={(e) => setNote((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-lg text-base mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Write your note content..."
                value={note.content}
                onChange={(e) => setNote((prev) => ({ ...prev, content: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-lg text-base mb-4 min-h-[120px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-4">
                <button
                  onClick={addNote}
                  disabled={loading}
                  className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Note'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateNote(false);
                    setNote({ title: "", content: "" });
                  }}
                  className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Notes Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Notes</h3>

            {loading && notes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No notes yet. Create your first note!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.map((n, index) => (
                  <div
                    key={n._id}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {n.title || `Note ${index + 1}`}
                      </h4>
                      <button
                        onClick={() => deleteNote(n._id)}
                        disabled={loading}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete note"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    {n.content && (
                      <p className="text-gray-600 text-sm line-clamp-4">
                        {n.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;