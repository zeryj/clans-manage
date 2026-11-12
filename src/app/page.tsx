import Clan from "@/containers/Clan";

export default async function Home() {
  return (
    <div className="">
      <div className="container max-w-7xl mx-auto px-4 py-4 gap-2 flex flex-col">
        <Clan />
      </div>
    </div>
  );
}
