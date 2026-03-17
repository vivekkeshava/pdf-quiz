import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Quiz History — PDF Quiz Generator" };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Cap at 50, newest first (P-1A decision)
  const records = await prisma.quizRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, fileName: true, pageCount: true, createdAt: true },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-4">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Quiz History</h1>
            <p className="text-slate-400 mt-1">Your recent quizzes</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm transition-colors"
          >
            New quiz
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="bg-white/8 border border-white/15 rounded-2xl p-12 text-center">
            <p className="text-slate-400 text-lg mb-2">No quizzes yet</p>
            <p className="text-slate-500 text-sm">
              Upload a PDF on the home page to generate your first quiz.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {records.map((r) => (
              <li
                key={r.id}
                className="bg-white/8 border border-white/15 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{r.fileName}</p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {r.pageCount} {r.pageCount === 1 ? "page" : "pages"} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="shrink-0 text-slate-500 text-xs font-mono">
                  #{r.id.slice(-6)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {records.length === 50 && (
          <p className="text-center text-slate-600 text-xs mt-6">
            Showing your 50 most recent quizzes
          </p>
        )}
      </div>
    </main>
  );
}
