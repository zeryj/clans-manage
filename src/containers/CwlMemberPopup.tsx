"use client";

import { useState } from "react";
import type { APIClanMember } from "@/lib/type";

interface CwlMemberPopupProps {
  members: APIClanMember[];
  open: boolean;
  onClose: () => void;
}

export default function CwlMemberPopup({
  members,
  open,
  onClose,
}: CwlMemberPopupProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleSelect = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };



  const handleSave = async () => {
    if (selectedTags.length === 0) return;
    setSaving(true);
    try {
      const selectedMembers = members.filter((m) =>
        selectedTags.includes(m.tag),
      );
      const res = await fetch("/api/cwl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedMembers),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      onClose();
      setSelectedTags([]);
    } catch {
      alert("Gagal menyimpan ke CWL.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm "
      onClick={onClose}
    >
      <div
        className="bg-[#12244F] border border-[#2c4176] rounded-lg p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl m-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            Pilih Member untuk CWL
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-zinc-400">
            Terpilih: {selectedTags.length} member
          </span>
          <button
            onClick={handleSave}
            disabled={selectedTags.length === 0 || saving}
            className="px-4 py-2 bg-[#12244F] border border-[#2c4176] rounded-md disabled:text-zinc-500 text-white text-sm font-medium transition"
          >
            {saving ? "Menyimpan..." : "Simpan ke CWL"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {members.map((member) => {
            // Cek apakah member ini sedang dipilih
            const isSelected = selectedTags.includes(member.tag);

            return (
              <div
                key={member.tag}
                className={`flex items-center justify-between p-2 rounded border-b-2 transition-all duration-300 ease-in-out cursor-pointer group
                    ${
                      isSelected
                        ? "border-blue-500" 
                        : "border-transparent hover:bg-[#253d77]"
                    }
                  `}
                onClick={() => toggleSelect(member.tag)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(member.tag);
                    }}
                    className="w-4 h-4 rounded border-[#2c4176] text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${isSelected ? "text-blue-100" : "text-white"}`}>
                      {member.name}
                    </p>
                    <p className={`text-xs font-mono transition-colors duration-300 ${isSelected ? "text-blue-300" : "text-zinc-400"}`}>
                      {member.tag}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {members.length === 0 && (
          <div className="py-8 text-center text-sm text-zinc-400">
            Tidak ada member clan.
          </div>
        )}
      </div>
    </div>
  );
}
