"use client"
import { useState } from "react";

interface Skin {
    name: string;
    path: string;
    slim?: boolean;
}

interface Season {
    name: string;
    type: string;
    skins: Skin[];
}

interface JsonData {
    [key: string]: Season;
}

const initialJson: JsonData = {
};

const EditorPage = () => {
    const [jsonData, setJsonData] = useState<JsonData>(initialJson);
    const [newSeasonName, setNewSeasonName] = useState("");
    const [isFileLoading, setIsFileLoading] = useState(false);

    // Загрузка JSON из файла
    const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const parsed: JsonData = JSON.parse(text);
                    // Нормализуем: если у скинов нет поля slim, добавляем false
                    const normalized: JsonData = {};
                    Object.keys(parsed).forEach((seasonId) => {
                        const season = parsed[seasonId];
                        const skinsWithSlim = season.skins.map((skin) => ({
                            name: skin.name,
                            path: skin.path,
                            slim: (skin.slim ?? false),
                        }));
                        normalized[seasonId] = {
                            ...season,
                            skins: skinsWithSlim,
                        };
                    });
                    setJsonData(normalized);
                } catch (err) {
                    console.error("Ошибка при чтении JSON:", err);
                }
            };
            reader.readAsText(file);
        }
    };

    // Добавление нового сезона
    const addNewSeason = () => {
        if (!newSeasonName.trim()) return;
        const newSeasonId = `season_${Date.now()}`;
        const newSeason: Season = {
            name: newSeasonName.trim(),
            type: "season",
            skins: [],
        };
        setJsonData((prevData) => ({
            ...prevData,
            [newSeasonId]: newSeason,
        }));
        setNewSeasonName("");
    };

    // Добавление скинов из файлов
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, seasonId: string) => {
        const files = event.target.files;
        if (files) {
            setIsFileLoading(true);
            const newSkins: Skin[] = Array.from(files).map((file) => {
                const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
                return {
                    name: fileNameWithoutExtension,
                    path: file.name,
                    slim: false,
                };
            });
            setJsonData((prevData) => {
                const season = prevData[seasonId];
                return {
                    ...prevData,
                    [seasonId]: {
                        ...season,
                        skins: [...season.skins, ...newSkins],
                    },
                };
            });
            setIsFileLoading(false);
        }
    };

    // Сохранение JSON
    const saveJson = () => {
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
            type: "application/json",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "seasons.json";
        link.click();
    };

    // Редактирование названия сезона
    const handleSeasonNameChange = (seasonId: string, newName: string) => {
        setJsonData((prevData) => {
            const season = prevData[seasonId];
            return {
                ...prevData,
                [seasonId]: {
                    ...season,
                    name: newName,
                },
            };
        });
    };

    // Редактирование названия скина
    const handleSkinNameChange = (seasonId: string, skinIndex: number, newName: string) => {
        setJsonData((prevData) => {
            const season = prevData[seasonId];
            const updatedSkins = [...season.skins];
            updatedSkins[skinIndex] = {
                ...updatedSkins[skinIndex],
                name: newName,
            };
            return {
                ...prevData,
                [seasonId]: {
                    ...season,
                    skins: updatedSkins,
                },
            };
        });
    };

    // Переключение флага slim у скина
    const handleSkinSlimChange = (seasonId: string, skinIndex: number) => {
        setJsonData((prevData) => {
            const season = prevData[seasonId];
            const updatedSkins = [...season.skins];
            const currentSlim = updatedSkins[skinIndex].slim ?? false;
            updatedSkins[skinIndex] = {
                ...updatedSkins[skinIndex],
                slim: !currentSlim,
            };
            return {
                ...prevData,
                [seasonId]: {
                    ...season,
                    skins: updatedSkins,
                },
            };
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-8 transition-all">
            <div className="bg-gray-800 text-white p-6 rounded shadow-lg w-full max-w-3xl">
                <h1 className="text-2xl font-bold mb-6">Редактор сезонов и скинов</h1>

                {/* Загрузка JSON */}
                <div className="mb-6">
                    <h2 className="text-xl mb-2">Загрузить JSON</h2>
                    <input
                        type="file"
                        accept="application/json"
                        onChange={handleJsonUpload}
                        className="p-2 border border-gray-600 rounded mb-2 w-full bg-gray-700 text-white"
                    />
                </div>

                {/* Добавление нового сезона */}
                <div className="mb-6">
                    <h2 className="text-xl mb-2">Добавить новый сезон</h2>
                    <input
                        type="text"
                        value={newSeasonName}
                        onChange={(e) => setNewSeasonName(e.target.value)}
                        className="p-2 border border-gray-600 rounded mb-2 w-full bg-gray-700 text-white"
                        placeholder="Название сезона"
                    />
                    <button
                        onClick={addNewSeason}
                        className="bg-blue-600 text-white p-2 rounded w-full"
                    >
                        Добавить сезон
                    </button>
                </div>

                {/* Список сезонов */}
                {Object.keys(jsonData).map((seasonId) => {
                    if (seasonId.startsWith("season_") || seasonId === "neggen") {
                        return (
                            <div key={seasonId} className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    <input
                                        type="text"
                                        value={jsonData[seasonId].name}
                                        onChange={(e) => handleSeasonNameChange(seasonId, e.target.value)}
                                        className="p-2 border border-gray-600 rounded w-full bg-gray-700 text-white"
                                    />
                                </h3>

                                {/* Загрузка скинов */}
                                <div className="mb-4">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, seasonId)}
                                        className="p-2 border border-gray-600 rounded mb-2 w-full bg-gray-700 text-white"
                                    />
                                    {isFileLoading && <p>Загрузка...</p>}
                                </div>

                                {/* Список скинов сезона */}
                                <div>
                                    {jsonData[seasonId].skins.map((skin, skinIndex) => (
                                        <div key={skinIndex} className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={skin.name}
                                                    onChange={(e) =>
                                                        handleSkinNameChange(seasonId, skinIndex, e.target.value)
                                                    }
                                                    className="p-2 border border-gray-600 rounded w-1/2 bg-gray-700 text-white"
                                                />
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={skin.slim ?? false}
                                                        onChange={() => handleSkinSlimChange(seasonId, skinIndex)}
                                                        className="mr-1"
                                                    />
                                                    Slim
                                                </label>
                                            </div>
                                            <span>{skin.path}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}

                {/* Кнопка сохранения */}
                <div className="mt-6">
                    <button
                        onClick={saveJson}
                        className="bg-gray-600 text-white p-2 rounded w-full"
                    >
                        Сохранить JSON
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;
