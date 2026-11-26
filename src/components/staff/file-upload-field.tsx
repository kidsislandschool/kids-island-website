"use client";

import { useState } from "react";
import { UploadInput } from "@/components/admin/upload-input";
import { AdminField } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export function FileUploadField({
  name,
  label,
  kind = "file",
  required = false,
  help,
  uploadEndpoint = "/api/admin/uploads",
}: {
  name: string;
  label: string;
  kind?: "image" | "file";
  required?: boolean;
  help?: string;
  uploadEndpoint?: string;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleChange = (url: string | null) => {
    setValue(url);
    if (url) setError("");
    const hiddenInput = document.getElementById(`${name}-hidden`) as HTMLInputElement;
    if (hiddenInput) hiddenInput.value = url ?? "";
  };

  return (
    <AdminField label={label} htmlFor={name} required={required} help={help} error={error}>
      <UploadInput
        id={name}
        kind={kind}
        value={value}
        onChange={handleChange}
        uploadEndpoint={uploadEndpoint}
      />
      <input
        id={`${name}-hidden`}
        type="hidden"
        name={name}
        value={value ?? ""}
      />
    </AdminField>
  );
}