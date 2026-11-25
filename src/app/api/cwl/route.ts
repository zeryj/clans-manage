import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { APIClanMember } from "@/lib/type";
import { normalizeTag } from "@/lib/type";

const DATA_PATH = path.join(process.cwd(), "src", "lib", "data.json");

// Structure: Setiap clan di ClanList.data punya field CWL.data
interface ClanCwlItem {
  id: number;
  name: string;
  tag: string;
  logo: string;
  CWL?: {
    data: APIClanMember[];
  };
}

interface DataJson {
  ClanList: {
    data: ClanCwlItem[];
  };
}

async function readData(): Promise<DataJson> {
  const file = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(file);
}

async function writeData(data: DataJson) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clanTag = searchParams.get("clanTag");

    const data = await readData();

    if (clanTag) {
      const normalizedInput = normalizeTag(clanTag);
      const clan = data.ClanList.data.find(
        (c) => normalizeTag(c.tag) === normalizedInput,
      );
      return Response.json(clan?.CWL?.data ?? []);
    }

    // Ambil CWL data dari setiap clan dan gabungkan
    const cwlData = data.ClanList.data.flatMap((clan) => clan.CWL?.data ?? []);
    return Response.json(cwlData);
  } catch {
    return Response.json({ error: "Gagal membaca data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Payload can be: { clanTag: string, members: APIClanMember[] } or APIClanMember[] (fallback)
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

    const data = await readData();

    if (clanTag) {
      const normalizedClanTag = normalizeTag(clanTag);
      const clan = data.ClanList.data.find(
        (c) => normalizeTag(c.tag) === normalizedClanTag,
      );

      if (!clan) {
        return Response.json(
          { error: "Clan tidak ditemukan" },
          { status: 404 },
        );
      }

      if (!clan.CWL) {
        clan.CWL = { data: [] };
      }

      const existing = clan.CWL.data ?? [];
      const existingTags = new Set(existing.map((m) => normalizeTag(m.tag)));
      const newMembers = members.filter(
        (m) => m.tag && !existingTags.has(normalizeTag(m.tag)),
      );

      clan.CWL.data = [...existing, ...newMembers];
      await writeData(data);

      return Response.json({
        success: true,
        added: newMembers.length,
        total: clan.CWL.data.length,
        members: clan.CWL.data,
      });
    }

    // Fallback jika tidak ada clanTag: tambahkan ke clan pertama
    if (data.ClanList.data.length > 0) {
      const targetClan = data.ClanList.data[0];
      if (!targetClan.CWL) {
        targetClan.CWL = { data: [] };
      }
      const existing = targetClan.CWL.data ?? [];
      const existingTags = new Set(existing.map((m) => normalizeTag(m.tag)));
      const newMembers = members.filter(
        (m) => m.tag && !existingTags.has(normalizeTag(m.tag)),
      );
      targetClan.CWL.data = [...existing, ...newMembers];
      await writeData(data);

      return Response.json({
        success: true,
        added: newMembers.length,
        total: targetClan.CWL.data.length,
        members: targetClan.CWL.data,
      });
    }

    return Response.json({ error: "Clan tidak ditemukan" }, { status: 404 });
  } catch {
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
    const data = await readData();

    if (clanTag) {
      const normalizedClanTag = normalizeTag(clanTag);
      const clan = data.ClanList.data.find(
        (c) => normalizeTag(c.tag) === normalizedClanTag,
      );

      if (clan?.CWL?.data) {
        clan.CWL.data = clan.CWL.data.filter(
          (m) => normalizeTag(m.tag) !== normalizedMemberTag,
        );
      }
    } else {
      // Hapus member dari semua clan jika clanTag tidak dispesifikasikan
      for (const clan of data.ClanList.data) {
        if (clan.CWL?.data) {
          clan.CWL.data = clan.CWL.data.filter(
            (m) => normalizeTag(m.tag) !== normalizedMemberTag,
          );
        }
      }
    }

    await writeData(data);

    return Response.json({
      success: true,
      removed: 1,
    });
  } catch {
    return Response.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
