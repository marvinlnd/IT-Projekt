
// src/MedicationCalendar.jsx
import { useState, useEffect } from "react";

// Stunden und Wochentage
const HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00"
];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const ICONS = { pill: "💊", injection: "💉", drop: "💧" };
const COMPLETE_EMOJI = "✅";

export default function MedicationCalendar({ patientId }) {
  const [plan, setPlan] = useState({});
  const [selected, setSelected] = useState(null); // { day, entry }
  const [modal, setModal] = useState({ open: false, day: null, time: null });
  const [form, setForm] = useState({ text: "", type: "pill" });

  // Beispiel-Patienteninfo
  const [patientInfo] = useState({
    name: "Max Mustermann",
    dob: "12.05.1970",
    imageUrl: "/images/patient.pn"
  });

  useEffect(() => {
    fetch(`http://localhost:3001/api/patients/${patientId}/plan`)
      .then((r) => r.json())
      .then(setPlan);
  }, [patientId]);

  const requireSelection = () => {
    if (!selected) {
      alert("Bitte zuerst einen Eintrag auswählen!");
      return false;
    }
    return true;
  };

  const addEntry = () => {
    const { day, time } = modal;
    fetch(`http://localhost:3001/api/patients/${patientId}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, time, ...form })
    })
    .then(r => r.json())
    .then(newEntry => {
      setPlan(p => ({ ...p, [day]: [...p[day], newEntry] }));
      setModal({ open: false, day: null, time: null });
      setForm({ text: "", type: "pill" });
    });
  };

  const toggleEntry = (entryId) => {
    fetch(
      `http://localhost:3001/api/patients/${patientId}/plan/${entryId}`,
      { method: "PATCH" }
    )
    .then(r => r.json())
    .then(updated => {
      setPlan(p => {
        const newPlan = {};
        DAYS.forEach(d => {
          newPlan[d] = p[d].map(e => e.id === entryId ? updated : e);
        });
        return newPlan;
      });
      if (selected?.entry.id === updated.id) {
        setSelected({ day: selected.day, entry: updated });
      }
    });
  };

  const deleteEntry = (entryId) => {
    setPlan(p => {
      const newPlan = {};
      DAYS.forEach(d => {
        newPlan[d] = p[d].filter(e => e.id !== entryId);
      });
      return newPlan;
    });
    setSelected(null);
  };

  const handleComplete = () => { if (!requireSelection()) return; if (!selected.entry.completed) toggleEntry(selected.entry.id); };
  const handleUndo = () => { if (!requireSelection()) return; if (selected.entry.completed) toggleEntry(selected.entry.id); };
  const handleDelete = () => { if (!requireSelection()) return; deleteEntry(selected.entry.id); };

  return (
    <div className="p-4 flex">
      {/* Main Calendar + Controls */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Medikations‑Kalender</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="p-2 border bg-gray-100">Hour</th>
                {DAYS.map(d => <th key={d} className="p-2 border bg-gray-100">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(time => (
                <tr key={time}>
                  <td className="p-2 border font-medium">{time}</td>
                  {DAYS.map(day => {
                    const entries = plan[day]?.filter(e => e.time === time) || [];
                    const entry = entries[0] || null;
                    return (
                      <td key={day} className="p-2 border align-top">
                        {entry && (
                          <div
                            onClick={() => setSelected({ day, entry })}
                            className={`mb-1 p-1 rounded cursor-pointer ${
                              selected?.entry.id === entry.id ? "bg-blue-100" : ""
                            }`}
                          >
                            <span className="text-xl mr-1 align-middle">{ICONS[entry.type]}</span>
                            <span className={`align-middle ${entry.completed ? "line-through text-gray-500" : ""}`}>
                              {entry.text}
                            </span>
                            {entry.completed && <span className="ml-2 align-middle">{COMPLETE_EMOJI}</span>}
                          </div>
                        )}
                        {!entry && (
                          <button
                            onClick={() => setModal({ open: true, day, time })}
                            className="mt-1 text-blue-500 hover:underline text-sm"
                          >+ Eintrag</button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Globale Buttons */}
        <div className="mt-4 flex space-x-2">
          <button onClick={handleComplete} className="px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded">Complete</button>
          <button onClick={handleUndo}     className="px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded">Undo</button>
          <button onClick={handleDelete}   className="px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded">Delete</button>
        </div>
      </div>

      {/* Right Side Panel: Patient Info */}
      <div className="w-64 ml-6 p-4 bg-white border rounded-lg">
        <img
          src={patientInfo.imageUrl}
          alt="Patient"
          className="w-full h-32 object-cover rounded-md mb-4"
        />
        <h2 className="text-lg font-semibold mb-2">{patientInfo.name}</h2>
        <p className="text-gray-600">Geburtsdatum:</p>
        <p className="text-gray-800 font-medium">{patientInfo.dob}</p>
      </div>

      {/* Modal zum Hinzufügen */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Neu für {modal.day}, {modal.time}</h2>
            <label className="block mb-2">
              <span>Text</span>
              <input
                type="text"
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                className="mt-1 w-full border p-1 rounded"
              />
            </label>
            <label className="block mb-4">
              <span>Type</span>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="mt-1 w-full border p-1 rounded"
              >
                <option value="pill">Pille</option>
                <option value="injection">Spritze</option>
                <option value="drop">Tropfen</option>
              </select>
            </label>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModal({ open: false, day: null, time: null })}
                className="px-4 py-2 border rounded"
              >Abbrechen</button>
              <button
                onClick={addEntry}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >Hinzufügen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

