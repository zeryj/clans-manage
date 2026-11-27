import { supabase } from "@/lib/supabase";
import type { APIClanMember } from "@/lib/type";
import { normalizeTag } from "@/lib/type";

function mapDbMemberToApi(row: any): APIClanMember {
  return {
    tag: row.tag,
    name: row.name,
    townHallLevel: row.town_hall_level,
    role: row.role,
    expLevel: row.exp_level,
    trophies: row.trophies,
    clanName: row.clan_name,
  } as APIClanMember;
}

async function findClanByTag(clanTag: string) {
  const cleanTag = normalizeTag(clanTag).replace(/^#/, "");
  const { data: clans, error } = await supabase
    .from("clans")
    .select("id, name, tag");

  if (error || !clans) return null;

  return (
    clans.find((c) => normalizeTag(c.tag).replace(/^#/, "") === cleanTag) ??
    null
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clanTag = searchParams.get("clanTag");

    if (clanTag) {
      const clan = await findClanByTag(clanTag);
      if (!clan) {
        return Response.json([]);
      }

      const { data, error } = await supabase
        .from("cwl_members")
        .select("*")
        .eq("clan_id", clan.id);

      if (error) throw error;

      return Response.json((data ?? []).map(mapDbMemberToApi));
    }

    const { data, error } = await supabase.from("cwl_members").select("*");
    if (error) throw error;

    return Response.json((data ?? []).map(mapDbMemberToApi));
  } catch (err) {
    console.error("GET CWL Error:", err);
    return Response.json({ error: "Gagal membaca data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let clanTag: string | undefined;
    let members: APIClanMember[] = [];

    if (Array.isArray(body)) {
      members = body;
    } else if (body && Array.isArray(body.members)) {
      clanTag = body.clanTag;
      members = body.members;
    } else {
      return Response.json({ error: "Payload tidak valid" }, { status: 400 });
    }

    let targetClan: { id: number; name: string; tag: string } | null = null;

    if (clanTag) {
      targetClan = await findClanByTag(clanTag);
    } else {
      const { data: firstClans } = await supabase
        .from("clans")
        .select("id, name, tag")
        .order("id", { ascending: true })
        .limit(1);

      targetClan = firstClans?.[0] ?? null;
    }

    if (!targetClan) {
      return Response.json({ error: "Clan tidak ditemukan" }, { status: 404 });
    }

    const { data: existingRows, error: fetchError } = await supabase
      .from("cwl_members")
      .select("*")
      .eq("clan_id", targetClan.id);

    if (fetchError) throw fetchError;

    const existing = existingRows ?? [];
    const existingTags = new Set(existing.map((m) => normalizeTag(m.tag)));

    const newMembers = members.filter(
      (m) => m.tag && !existingTags.has(normalizeTag(m.tag)),
    );

    if (newMembers.length > 0) {
      const rowsToInsert = newMembers.map((m) => ({
        tag: normalizeTag(m.tag),
        clan_id: targetClan!.id,
        name: m.name,
        town_hall_level: m.townHallLevel ?? 0,
        role: m.role ?? "member",
        exp_level: m.expLevel ?? 0,
        trophies: m.trophies ?? 0,
        clan_name: m.clanName ?? targetClan!.name,
      }));

      const { error: insertError } = await supabase
        .from("cwl_members")
        .insert(rowsToInsert);

      if (insertError) throw insertError;
    }

    const { data: updatedRows } = await supabase
      .from("cwl_members")
      .select("*")
      .eq("clan_id", targetClan.id);

    const formattedMembers = (updatedRows ?? []).map(mapDbMemberToApi);

    return Response.json({
      success: true,
      added: newMembers.length,
      total: formattedMembers.length,
      members: formattedMembers,
    });
  } catch (err) {
    console.error("POST CWL Error:", err);
    return Response.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { clanTag, tag } = await req.json();
    if (!tag) {
      return Response.json(
        { error: "Tag member tidak valid" },
        { status: 400 },
      );
    }

    const normalizedMemberTag = normalizeTag(tag);

    if (clanTag) {
      const clan = await findClanByTag(clanTag);
      if (clan) {
        const { error } = await supabase
          .from("cwl_members")
          .delete()
          .eq("clan_id", clan.id)
          .eq("tag", normalizedMemberTag);

        if (error) throw error;
      }
    } else {
      const { error } = await supabase
        .from("cwl_members")
        .delete()
        .eq("tag", normalizedMemberTag);

      if (error) throw error;
    }

    return Response.json({
      success: true,
      removed: 1,
    });
  } catch (err) {
    console.error("DELETE CWL Error:", err);
    return Response.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
