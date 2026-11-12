import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { APIClanMember } from "@/lib/type";
import { normalizeTag } from "@/lib/type";

const DATA_PATH = path.join(process.cwd(), "src", "lib", "data.json");

// Struktur: Setiap clan di ClanList.data memiliki field CWL.data
interface ClanCwlItem {
  id: number;
  name: string;
  tag: string;
  logo: string;
  CWL: {
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

// Cari indeks clan di ClanList.data berdasarkan tag
function findClanIndex(data: DataJson, clanTag: string): number {
  const normalizedInput = normalizeTag(clanTag);
  return data.ClanList.data.findIndex((clan) =>
    normalizeTag(clan.tag) === normalizedInput
  );
}

export async function GET() {
  try {
    const { searchParams } = new URL(encodeURI(""));
    const clanTag = searchParams.get("clanTag");

    const data = await readData();

    if (clanTag) {
      // Return member untuk clan tertentu
      const clanIndex = findClanIndex(data, clanTag);
      if (clanIndex >= 0) {
        const cwlMembers = data.ClanList.data[clanIndex].CWL?.data ?? [];
        return Response.json(cwlMembers);
      }
      return Response.json([]); // Clan tidak ditemukan
    }

    // Jika tidak ada clanTag, return semua member CWL dari semua clan
    const allCwl = data.ClanList.data.flatMap((clan) => clan.CWL?.data ?? []);
    return Response.json(allCwl);
  } catch {
    return Response.json({ error: "Gagal membaca data" }, { status: 500 });
  }
}