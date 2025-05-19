"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getRecipes } from "@/lib/meal-planner";
import type { Recipe } from "@/types/meal-planner";

type UserDataContextType = {
    recipes: Recipe[];
    loading: boolean;
    error: string | null;
    refreshRecipes: () => Promise<void>;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const { recipes: data, error } = await getRecipes({
                pageSize: 1000 // A high number to get all recipes at once
            });

            if (error) {
                setError(error);
                console.error("Error fetching recipes:", error);
            } else if (data) {
                setRecipes(data);
                setError(null);
            }
        } catch (err: any) {
            setError(err.message || "An error occurred fetching recipes");
            console.error("Error fetching recipes:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchRecipes();
    }, []);

    const refreshRecipes = async () => {
        await fetchRecipes();
    };

    return (
        <UserDataContext.Provider value={{ recipes, loading, error, refreshRecipes }}>
            {children}
        </UserDataContext.Provider>
    );
}

export function useUserData() {
    const context = useContext(UserDataContext);
    if (context === undefined) {
        throw new Error("useUserData must be used within a UserDataProvider");
    }
    return context;
} 