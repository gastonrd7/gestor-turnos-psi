"use client";

import { useEffect } from "react";
import TurnosSection from "../components/TurnosSection";
import { useAppDispatch } from "@/store";
import { loadInitial } from "@/store/sessionsSlice";

export default function TurnosPage() {
  const dispatch = useAppDispatch();
  // asegurar datos de profesionales para mostrar nombres
  useEffect(() => { dispatch(loadInitial()); }, [dispatch]);

  return <TurnosSection />;
}
