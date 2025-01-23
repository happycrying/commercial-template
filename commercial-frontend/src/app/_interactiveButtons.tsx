"use client";
import { Button } from "@/components/Button/Button";
import { redirect } from "next/navigation";

export const InteractiveButtons = () => {
  return (
    <>
      <Button variant={"OUTLINE"} onClick={() => redirect("/dashboard")}>
        Login
      </Button>
      or
      <Button variant={"FILLED"}>Create an account</Button>
    </>
  );
};
