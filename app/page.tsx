import skins from "@/public/skins.json"
import Skin from "@/components/Skin/Skin";
import SkinCard from "@/components/Skin/SkinCard";
export default function Home() {
  return <div className='min-h-screen flex flex-col align-middle justify-center'>
    <p className='text-center h-fit text-white text-5xl font-medium mb-10'>Архив скинов по сезонам Лололошки и не
      только...</p>
    <div className="flex flex-wrap space-x-2 w-full justify-center font-medium text-3xl text-white">
      {Object.values(skins).map((value, key) => {
        return <div key={key} className="bg-gray-800 p-2 rounded-3xl border-2 border-violet-400 hover:scale-110 hover:bg-gray-700 transition ease-in-out delay-50">
          <p>{value.name}</p>
        </div>
      })}
    </div>
  </div>;
}
