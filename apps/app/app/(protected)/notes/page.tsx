import { getNotes } from "@/actions/get-notes";
import { Navbar } from "../../../components/navbar";

export default async function NotesPage() {
  console.log("NotesPage: Component rendering");

  const result = await getNotes();
  console.log("NotesPage: getNotes result:", result);

  if (result.success && result.data) {
    console.log("User's notes:", result.data);
    return (
      <div className="p-4">
        <h1 className="mb-4 font-bold text-2xl">Notes</h1>
        <Navbar />
        {result.data.length === 0 ? (
          <p>No notes found</p>
        ) : (
          <div>
            <p className="mb-2">Found {result.data.length} note(s)</p>
            <pre className="overflow-auto rounded bg-gray-100 p-4 dark:bg-gray-800">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  console.error("Failed to fetch notes:", result.error);
  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-2xl">Notes</h1>
      <Navbar />
      <p className="text-red-500">Error: {result.error}</p>
    </div>
  );
}
