"use client";

import { useState } from "react";
import CwlMemberPopup from "@/containers/CwlMemberPopup";
import type { APIClanMember } from "@/lib/type";

interface CwlMemberManagerProps {
  members: APIClanMember[];
  clanTag?: string;
  onUpdate?: () => void;
}

export default function CwlMemberManager({
  members,
  clanTag,
  onUpdate,
}: CwlMemberManagerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 p-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-[#12244F] border border-[#2c4176] rounded-md text-sm font-semibold text-white transition hover:bg-[#18316b]"
      >
        Tambah ke CWL
      </button>
      <CwlMemberPopup
        members={members}
        clanTag={clanTag}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={onUpdate}
      />
    </div>
  );
}
