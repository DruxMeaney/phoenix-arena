"use client";

import { useState, useEffect, useCallback } from "react";

function adminFetch(url: string, options: RequestInit = {}) {
  const pass = typeof window !== "undefined" ? sessionStorage.getItem("phoenix_admin_pass") || "" : "";
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": pass,
      ...(options.headers || {}),
    },
  });
}

type ViewMode = "list" | "form";

const typeOptions = [
  { value: "credit_pack", label: "Pack de Creditos" },
  { value: "name_change", label: "Cambio de Nombre" },
  { value: "record_reset", label: "Reset de Record" },
  { value: "badge", label: "Insignia / Badge" },
  { value: "title", label: "Titulo Especial" },
  { value: "skin", label: "Skin / Tema" },
  { value: "avatar_frame", label: "Marco de Avatar" },
  { value: "banner", label: "Banner de Perfil" },
  { value: "boost_xp", label: "Boost de XP" },
  { value: "tournament_pass", label: "Pase de Torneo" },
  { value: "vip_membership", label: "Membresia VIP" },
  { value: "emote", label: "Emote / Animacion" },
];

const emptyForm = {
  slug: "",
  type: "credit_pack",
  name: "",
  description: "",
  price: "",
  credits: "",
  imageUrl: "",
  sortOrder: "0",
};

export default function AdminStore() {
  const [view, setView] = useState<ViewMode>("list");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminFetch("/api/admin/store");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setItems(data.items || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const isEdit = !!editingItem;
      const payload = {
        ...form,
        price: Number(form.price),
        credits: Number(form.credits),
        sortOrder: Number(form.sortOrder),
        ...(isEdit ? { id: editingItem._id || editingItem.id } : {}),
      };

      const res = await adminFetch("/api/admin/store", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error al ${isEdit ? "actualizar" : "crear"} producto`);
      }

      setMessage({ type: "success", text: isEdit ? "Producto actualizado" : "Producto creado" });
      setView("list");
      setEditingItem(null);
      setForm({ ...emptyForm });
      fetchItems();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: any) => {
    try {
      const res = await adminFetch("/api/admin/store", {
        method: "PUT",
        body: JSON.stringify({
          id: item._id || item.id,
          isActive: !item.isActive,
        }),
      });
      if (!res.ok) throw new Error("Error al cambiar estado");
      fetchItems();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      slug: item.slug || "",
      type: item.type || "credit_pack",
      name: item.name || "",
      description: item.description || "",
      price: String(item.price || ""),
      credits: String(item.credits || ""),
      imageUrl: item.imageUrl || "",
      sortOrder: String(item.sortOrder || 0),
    });
    setView("form");
    setMessage({ type: "", text: "" });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface-2 rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-surface border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button onClick={fetchItems} className="px-4 py-2 bg-surface-2 border border-border text-muted rounded-lg text-sm hover:text-foreground transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  // Create / Edit form
  if (view === "form") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setView("list"); setEditingItem(null); setForm({ ...emptyForm }); }} className="px-3 py-1.5 bg-surface-2 border border-border text-muted rounded-lg text-xs hover:text-foreground transition-colors">
            &larr; Volver
          </button>
          <h2 className="text-lg font-bold text-foreground">{editingItem ? "Editar Producto" : "Crear Producto"}</h2>
        </div>

        {message.text && (
          <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-muted mb-1.5">Slug</label>
              <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="credit-pack-100" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500">
                {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Nombre</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pack 100 Creditos" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Precio ($)</label>
              <input type="number" required min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="9.99" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Creditos</label>
              <input type="number" min={0} value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} placeholder="100" className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Orden</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1.5">URL Imagen</label>
              <input type="text" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted mb-1.5">Descripcion</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Descripcion del producto..." className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-red-500 resize-none" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50">
            {saving ? "Guardando..." : editingItem ? "Actualizar Producto" : "Crear Producto"}
          </button>
        </form>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-foreground">Tienda</h2>
        <button
          onClick={() => { setView("form"); setEditingItem(null); setForm({ ...emptyForm }); setMessage({ type: "", text: "" }); }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Crear Producto
        </button>
      </div>

      {message.text && (
        <div className={`rounded-xl px-4 py-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message.text}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-muted text-sm">No hay productos en la tienda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2/50 text-left text-xs text-muted uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Nombre</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Creditos</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Orden</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={item._id || item.id || i} className="border-b border-border/50 hover:bg-surface-2/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-muted text-xs">{typeOptions.find((t) => t.value === item.type)?.label || item.type}</td>
                  <td className="px-4 py-3 text-foreground">${item.price}</td>
                  <td className="px-4 py-3 text-muted">{item.credits || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {item.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{item.sortOrder || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-2.5 py-1 rounded-md bg-surface-2 border border-border text-muted hover:text-foreground text-xs transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleActive(item)}
                        className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${item.isActive ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"}`}
                      >
                        {item.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
