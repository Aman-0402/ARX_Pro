import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getResourceConfig, type FieldConfig } from "@/config/adminResources";
import { api } from "@/lib/api";

type FormValues = Record<string, string | number | boolean>;

function defaultValueFor(field: FieldConfig): string | number | boolean {
  if (field.type === "checkbox") return false;
  if (field.type === "number") return 0;
  return "";
}

export default function ResourceFormPage() {
  const { resource, id } = useParams<{ resource: string; id?: string }>();
  const navigate = useNavigate();
  const config = resource ? getResourceConfig(resource) : undefined;
  const isEditing = Boolean(id);

  const [values, setValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!config) return;
    if (!isEditing) {
      const initial: FormValues = {};
      config.fields.forEach((field) => {
        initial[field.name] = defaultValueFor(field);
      });
      setValues(initial);
      return;
    }
    api
      .get<FormValues>(`${config.endpoint}${id}/`)
      .then((response) => {
        setValues(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("Failed to load this item. It may have been deleted.");
        setLoading(false);
      });
  }, [config, id, isEditing]);

  if (!config) return <div className="p-8">Unknown resource.</div>;
  if (loading) return <div className="p-8">Loading...</div>;
  if (loadError) return <div className="p-8 text-red-500">{loadError}</div>;

  function updateField(name: string, value: string | number | boolean) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!config) return;
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      if (isEditing) {
        await api.put(`${config.endpoint}${id}/`, values);
      } else {
        await api.post(config.endpoint, values);
      }
      navigate(`/admin/${config.key}`);
    } catch (err) {
      const data =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: unknown } }).response?.data
          : undefined;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setFieldErrors(data as Record<string, string[]>);
      } else {
        setError("Failed to save. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-bold text-2xl mb-6">
        {isEditing ? `Edit ${config.label}` : `New ${config.label}`}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl p-8 shadow-sm">
        {config.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                required={field.required}
                rows={4}
                value={String(values[field.name] ?? "")}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={Boolean(values[field.name])}
                onChange={(e) => updateField(field.name, e.target.checked)}
              />
            ) : field.type === "number" ? (
              <input
                type="number"
                required={field.required}
                value={Number(values[field.name] ?? 0)}
                onChange={(e) => updateField(field.name, Number(e.target.value))}
                className="border rounded px-3 py-2 w-full"
              />
            ) : field.type === "datetime" ? (
              <input
                type="datetime-local"
                required={field.required}
                value={String(values[field.name] ?? "")}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            ) : (
              <input
                type="text"
                required={field.required}
                value={String(values[field.name] ?? "")}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            )}
            {fieldErrors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors[field.name].join(" ")}</p>
            )}
          </div>
        ))}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
