import Image from "next/image";
import Link from "next/link";
import ListClan from "@/lib/data.json";

interface ClanDisplayItem {
  id: number;
  tag: string;
  logo: string;
  name: string;
}

export default function Clan() {
  const clans: ClanDisplayItem[] = ListClan.ClanList.data;

  return (
    <div className="flex flex-col gap-2">
      {clans.map((item) => (
        <Link
          href={`/clans/${item.tag}/`}
          key={item.tag}
          className="flex h-fit border border-[#2c4176] gap-2 p-2 rounded-lg bg-[#12244F] hover:bg-[#18316b] transition"
        >
          <div className="flex items-center gap-3">
            <Image
              src={item.logo}
              alt={`logo ${item.name}`}
              width={50}
              height={50}
            />
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-zinc-400 font-mono">
                #{item.tag} | Tap to see more{" "}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
