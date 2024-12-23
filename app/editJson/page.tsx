"use client"
import { useState, useEffect } from "react";

// Тип для данных с сезонами
interface Skin {
    name: string;
    path: string;
}

interface Season {
    name: string;
    type: string;
    skins: Skin[];
}

// Тип для всего jsonData с индексом
interface JsonData {
    [key: string]: Season;  // Позволяет динамически добавлять сезоны с любым ключом
}

const initialJson: JsonData = {
    neggen: {
        name: "Новое поколение",
        type: "season",
        skins: [
            {
                name: "Варнер",
                path: "Варнер.png",
            },
        ],
    },
};

const EditorPage = () => {
    const [jsonData, setJsonData] = useState<JsonData>(initialJson);
    const [newSeasonName, setNewSeasonName] = useState("");
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Добавление нового сезона
    const addNewSeason = () => {
        const newSeasonId = `season_${Date.now()}`;
        const newSeason: Season = {
            name: newSeasonName,
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

            const newSkins = Array.from(files).map((file) => {
                const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, ""); // Убираем расширение
                return {
                    name: fileNameWithoutExtension, // Имя скина - имя файла без расширения
                    path: file.name, // Путь к файлу (можно изменить на путь в хранилище)
                };
            });

            // Добавление скинов в существующий сезон
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

    // Переключение темной/светлой темы
    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
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

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-8 transition-all`}>
            <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded shadow-lg w-full max-w-3xl">
                <h1 className="text-2xl font-bold mb-6">Редактор сезонов и скинов</h1>

                {/* Переключатель темы */}
                <div className="mb-6">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 bg-blue-500 text-white rounded w-full"
                    >
                        {isDarkMode ? "Светлая тема" : "Темная тема"}
                    </button>
                </div>

                {/* Добавление нового сезона */}
                <div className="mb-6">
                    <h2 className="text-xl mb-2">Добавить новый сезон</h2>
                    <input
                        type="text"
                        value={newSeasonName}
                        onChange={(e) => setNewSeasonName(e.target.value)}
                        className="p-2 border border-gray-300 rounded mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Название сезона"
                    />
                    <button
                        onClick={addNewSeason}
                        className="bg-blue-500 text-white p-2 rounded w-full"
                    >
                        Добавить сезон
                    </button>
                </div>

                {/* Список сезонов */}
                {Object.keys(jsonData).map((seasonId) => {
                    if (seasonId.startsWith("season_")) {
                        return (
                            <div key={seasonId} className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    <input
                                        type="text"
                                        value={jsonData[seasonId].name}
                                        onChange={(e) => handleSeasonNameChange(seasonId, e.target.value)}
                                        className="p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                </h3>

                                {/* Загрузка скинов */}
                                <div className="mb-4">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, seasonId)}
                                        className="p-2 border border-gray-300 rounded mb-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                    {isFileLoading && <p>Загрузка...</p>}
                                </div>

                                {/* Список скинов сезона */}
                                <div>
                                    {jsonData[seasonId].skins.map((skin, skinIndex) => (
                                        <div key={skinIndex} className="flex justify-between mb-2">
                                            <input
                                                type="text"
                                                value={skin.name}
                                                onChange={(e) => handleSkinNameChange(seasonId, skinIndex, e.target.value)}
                                                className="p-2 border border-gray-300 rounded mb-2 w-1/2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
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
                        className="bg-gray-500 text-white p-2 rounded w-full"
                    >
                        Сохранить JSON
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;
