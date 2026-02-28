import { useState } from "react";

const GradeForm = ({ onSubmit }) => {
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  return (
    <form
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ marks, feedback });
      }}
    >
      <input
        type="number"
        placeholder="Marks"
        value={marks}
        onChange={(e) => setMarks(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
      />
      <textarea
        placeholder="Feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
      />
      <button className="rounded-lg bg-brand-500 px-3 py-2 font-semibold text-white">Save Grade</button>
    </form>
  );
};

export default GradeForm;