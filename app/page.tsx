import skins from "@/public/skins.json"
import Link from "next/link";
export default function Home() {
  return <div className='min-h-screen flex flex-col align-middle justify-center'>
    <p className='text-center h-fit text-white text-5xl font-medium mb-10'>Архив скинов по сезонам Лололошки и не
      только...</p>
    <div className="flex flex-wrap space-x-2 w-full justify-center font-medium text-3xl text-white">
      {Object.entries(skins).map((value, key) => {
        return <div key={key} className="bg-gray-800 p-2 rounded-3xl border-2 border-violet-400 hover:scale-110 hover:bg-gray-700 transition ease-in-out delay-50">
          <Link href={"/skinlist/"+value[0]}>{value[1].name}</Link>
        </div>
      })}
    </div>
  </div>;
}
