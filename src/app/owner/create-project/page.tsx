"use client";
import { PrivateLayout } from "@/layouts";
import CreateProjectForm from "./components/CreateProjectForm";
import ViewCard from "./components/ViewCard";
import { useState } from "react";

export default function CreateProjectPage() {
  const [projectName, setProjectName] = useState("");

  return (
    <PrivateLayout>
      <div className="flex justify-center gap-6 mt-7">
        <CreateProjectForm onNameChange={setProjectName} />
        <div className="w-full max-w-2xl">
          <ViewCard projectName={projectName} />
        </div>
      </div>
    </PrivateLayout>
  );
}
