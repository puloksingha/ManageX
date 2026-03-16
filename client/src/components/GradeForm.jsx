import { useState } from "react";

const GradeForm = ({ onSubmit }) => {
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/85"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await onSubmit({ marks, feedback });
          setMarks("");
          setFeedback("");
        } finally {
          setSaving(false);
        }
      }}
    >
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Marks</label>
        <input
          type="number"
          min="0"
          placeholder="Enter marks"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
          required
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Feedback</label>
        <textarea
          placeholder="Write feedback for the student"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
          required
        />
      </div>
      <button
        className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Grade"}
      </button>
    </form>
  );
};

export default GradeForm;
