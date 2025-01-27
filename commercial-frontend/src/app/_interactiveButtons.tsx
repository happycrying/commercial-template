"use client";
import { Button } from "@/components/Button/Button";
import { redirect } from "next/navigation";
import React, { useCallback } from "react";

const InteractiveButtonsNoMemo = () => {
  const onLoginButtonClick = useCallback(() => {
    redirect("/dashboard");
  }, []);

  return (
    <>
      <Button variant={"OUTLINE"} onClick={onLoginButtonClick}>
        Login
      </Button>
      or
      <Button variant={"FILLED"}>Create an account</Button>
    </>
  );
};

export const InteractiveButtons = React.memo(InteractiveButtonsNoMemo);
