"use client";

import { useMemo, useState } from "react";
export interface APICwlMember {
    name:string
    tag:string
}

export function useCwlMemberSearch(members: APICwlMember[] = []) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return members;

    // Bersihkan karakter '#' jika user mencari berdasarkan tag dengan/tanpa tanda '#'
    const cleanQuery = query.startsWith("#") ? query.slice(1) : query;

    return members.filter((member) => {
      const memberNameMatch = member.name.toLowerCase().includes(query);
      const cleanMemberTag = member.tag.toLowerCase().replace("#", "");
      const memberTagMatch = cleanMemberTag.includes(cleanQuery);

      return memberNameMatch || memberTagMatch;
    });
  }, [members, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredMembers,
    totalCount: members.length,
    filteredCount: filteredMembers.length,
  };
}
