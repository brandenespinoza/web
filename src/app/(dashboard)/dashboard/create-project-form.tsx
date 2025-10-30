"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";

import {
  createProjectAction,
  createProjectInitialState,
  type ProjectFormState,
} from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Create project"}
    </button>
  );
}

export function CreateProjectForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState<ProjectFormState, FormData>(
    createProjectAction,
    createProjectInitialState(),
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Start a new project</h2>
        <p className="text-sm text-slate-500">
          Projects are private by default. You can toggle visibility once you are ready to publish.
        </p>
      </div>
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-slate-800">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={160}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-base text-slate-900 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="My Electric Longboard Build"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="summary" className="text-sm font-medium text-slate-800">
          Summary <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-base text-slate-900 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Capture the essence of this project in a couple of sentences."
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="tags" className="text-sm font-medium text-slate-800">
          Tags <span className="text-slate-400">(comma separated, up to 10)</span>
        </label>
        <input
          id="tags"
          name="tags"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-base text-slate-900 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="woodworking, robotics, personal"
        />
      </div>
      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-800">Visibility</span>
        <div className="flex items-center gap-4 pt-1 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="PRIVATE" defaultChecked className="h-4 w-4" />
            Private
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="visibility" value="PUBLIC" className="h-4 w-4" />
            Public
          </label>
        </div>
      </div>
      {state.status === "error" ? (
        <p className="text-sm text-rose-500">{state.message}</p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm text-emerald-600">{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
