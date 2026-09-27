"use client";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
const chakraSystem=createSystem(defaultConfig);
export function AppProviders({children}:{children:ReactNode}){const [queryClient]=useState(()=>new QueryClient({defaultOptions:{queries:{staleTime:30_000,refetchOnWindowFocus:false}}}));return <ChakraProvider value={chakraSystem}><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></ChakraProvider>}
