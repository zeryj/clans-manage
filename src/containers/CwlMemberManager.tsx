"use client";

import { useState } from "react";
import type { APIClanMember } from "@/lib/type";
import CwlMemberPopup from "@/containers/CwlMemberPopup";

interface CwlMemberManagerProps {
  members: APIClanMember[];
}

export default function CwlMemberManager({ members }: CwlMemberManagerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 p-4">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-[#12244F] border border-[#2c4176] rounded-md text-sm font-semibold text-white transition"
      >
        Tambah ke CWL
      </button>
      <CwlMemberPopup
        members={members}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
