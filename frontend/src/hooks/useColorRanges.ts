import { useState, useEffect } from "react";
import axios from "axios";
import type { ColorRange } from "@/constant/colorRangeData";

export const useColorRanges = () => {
  const [colorRanges, setColorRanges] = useState<ColorRange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [colorRangeToDelete, setColorRangeToDelete] = useState<number | null>(null);
  const [currentColorRange, setCurrentColorRange] = useState<ColorRange | null>(null);


  const fetchColorRanges = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8080/colorranges");
      if (response.status !== 200 && response.status !== 201) throw new Error("Failed to fetch color ranges");
      setColorRanges((response.data || []) as ColorRange[]);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (colorRange: ColorRange) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/admin/colorranges",
        colorRange,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (response.status !== 200 && response.status !== 201) throw new Error("Failed to create color range");
      await fetchColorRanges();
      setIsCreateDialogOpen(false);
      setCurrentColorRange(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  const handleUpdate = async (colorRange: ColorRange) => {
    if (!colorRange || !colorRange.ID) return;
    try {
      const response = await axios.put(
        `http://localhost:8080/admin/colorranges/${colorRange.ID}`,
        colorRange,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (response.status !== 200 && response.status !== 201) throw new Error("Failed to update color range");
      await fetchColorRanges();
      setIsEditDialogOpen(false);
      setCurrentColorRange(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    if (!colorRangeToDelete) return;
    try {
      const response = await axios.delete(
        `http://localhost:8080/admin/colorranges/${colorRangeToDelete}`,
        {
          withCredentials: true,
        }
      );
      if (response.status !== 200 && response.status !== 204) throw new Error("Failed to delete color range");
      await fetchColorRanges();
      setIsConfirmDialogOpen(false);
      setColorRangeToDelete(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchColorRanges();
  }, []);

  return {
    colorRanges,
    isLoading,
    error,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    colorRangeToDelete,
    setColorRangeToDelete,
    currentColorRange,
    setCurrentColorRange,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
