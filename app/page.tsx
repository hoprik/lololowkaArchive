import skins from "@/public/skins.json";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <div className="min-h-[95vh] flex flex-col items-center justify-center bg-gray-900 px-4">
                <div className="text-center">
                    <p className="text-white text-5xl font-medium mb-10">
                        Архив скинов по сезонам Лололошки и не только...
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center font-medium text-3xl text-white">
                        {Object.entries(skins).map(([key, value]) => (
                            <div
                                key={key}
                                className="bg-gray-800 px-4 py-2 rounded-3xl border-2 border-violet-400 hover:scale-110 hover:bg-gray-700 transition ease-in-out delay-50"
                            >
                                <Link href={`/skinlist/${key}`}>{value.name}</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <footer className="mt-2 text-center text-gray-400 text-sm w-full">
                Made by <a href="https://t.me/hoprik">@hoprik</a>. Skins by <a href="https://t.me/skinlololowka">Скины по сезонам Лололошки</a>
            </footer>
        </>
    );
}
