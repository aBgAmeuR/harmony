"use client";

import { useTransition } from "react";
import { signIn } from "@repo/auth/actions";
import { Button } from "@repo/ui/button";
import { LoaderCircle } from "lucide-react";

export const GetDemoBtn = () => {
  const [isTransition, transition] = useTransition();

  const onClick = () => {
    transition(async () => {
      await signIn("credentials", {
        username: "demo",
        password: "demo",
        redirect: true,
        redirectTo: "/settings/about",
      });
    });
  };

  return (
    <Button
      onClick={onClick}
      variant="link"
      className="p-0 text-spotifygreen"
      data-testid="get-demo-btn"
      disabled={isTransition}
    >
      {isTransition ? (
        <LoaderCircle
          className="-ms-1 me-2 animate-spin"
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
      ) : null}
      Get a demo of Harmony
    </Button>
  );
};
