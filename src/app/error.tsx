"use client";

export default function ErrorPage({ unstable_retry }: { unstable_retry: () => void }) {
  return <main className="mx-auto max-w-xl px-6 py-24 text-center">
    <h1 className="font-serif text-2xl">Die Seite konnte gerade nicht geladen werden.</h1>
    <p className="my-5">Bitte versuchen Sie es erneut oder kontaktieren Sie uns unter info@bärenstuben.de.</p>
    <button onClick={unstable_retry} className="rounded-lg bg-primary px-5 py-3 text-white">Erneut versuchen</button>
  </main>;
}
