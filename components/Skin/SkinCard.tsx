"use client"
import Skin from "@/components/Skin/Skin";

export default function SkinCard({name, skinPath}:{name: string, skinPath: string}){
    const saveSkin = () => {
        const canvas = document.createElement("canvas") as HTMLCanvasElement; // Получаем элемент canvas
        if (canvas) {
            // Создаем новый объект Image для загрузки изображения по URL
            const img = new Image();
            img.src = skinPath; // Замените на путь к изображению скина (64x64)

            img.onload = () => {
                // Получаем контекст канваса
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    // Устанавливаем размер канваса 64x64
                    canvas.width = 64;
                    canvas.height = 64;

                    // Рисуем изображение на канвасе с заданным размером
                    ctx.drawImage(img, 0, 0, 64, 64);

                    // Создаем ссылку для скачивания
                    const link = document.createElement("a");
                    link.href = canvas.toDataURL("image/png"); // Получаем изображение из canvas в формате PNG
                    link.download = "skin.png"; // Имя файла для скачивания
                    link.click(); // Имитируем клик для скачивания
                }
            };
        }
    };

    return <div className="flex flex-col bg-gray-800 bg-opacity-25 w-[190px] p-2 rounded">
        <Skin skin={skinPath} width={150} height={300}/>
        <hr className="w-10/12 mx-auto border-b-2 rounded"/>
        <p className="text-center text-xl font-semibold text-cyan-100 underline" onClick={saveSkin}>{name}</p>
    </div>
}