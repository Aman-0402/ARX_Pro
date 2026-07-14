import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getResourceConfig } from "@/config/adminResources";
import { useApiData } from "@/hooks/useApiData";
import { api } from "@/lib/api";

export default function ResourceListPage() {
  const { resource } = useParams<{ resource: string }>();
  const navigate = useNavigate();
  const config = resource ? getResourceConfig(resource) : undefined;
  const items = useApiData<Record<string, unknown>[]>(config ? config.endpoint : null);

  if (!config) {
    return <div className="p-8">Unknown resource.</div>;
  }

  async function handleDelete(id: number) {
    if (!config) return;
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    await api.delete(`${config.endpoint}${id}/`);
    navigate(0);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl">{config.label}</h1>
        {!config.readOnly && (
          <Link to={`/admin/${config.key}/new`} className="btn-primary">
            <Plus size={16} />
            New
          </Link>
        )}
      </div>

      {items.loading && <p className="text-gray-500">Loading...</p>}
      {items.error && <p className="text-red-500">{items.error}</p>}
      {items.data && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                {config.columns.map((column) => (
                  <th key={column} className="px-4 py-3 capitalize">
                    {column.replace(/_/g, " ")}
                  </th>
                ))}
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.data.map((item) => (
                <tr key={String(item.id)} className="border-b last:border-0">
                  {config.columns.map((column) => (
                    <td key={column} className="px-4 py-3">
                      {String(item[column] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3 flex gap-3">
                    {!config.readOnly && (
                      <Link to={`/admin/${config.key}/${item.id}`}>
                        <Pencil size={16} className="text-gray-400 hover:text-gold-400" />
                      </Link>
                    )}
                    <button type="button" onClick={() => handleDelete(item.id as number)}>
                      <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.data.length === 0 && (
            <p className="text-center text-gray-400 py-8">No items yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
